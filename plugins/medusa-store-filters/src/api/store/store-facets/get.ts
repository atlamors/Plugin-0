import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { getPool } from "../../../utils/db"
import crypto from "crypto"

// Basic MVP: filter by category_id/collection_id not implemented here, stub only
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const pool = getPool()
  if (!pool) return res.json({ products: [], facet_counts: {}, applied_filters: {}, page: 1, limit: 24, total: 0 })

  const limit = Math.min(parseInt((req.query.limit as string) || "24"), 100)
  const page = Math.max(parseInt((req.query.page as string) || "1"), 1)
  const offset = (page - 1) * limit

  // Parse filters[key]=values
  const filters: Record<string, string[]> = {}
  for (const [k, v] of Object.entries(req.query)) {
    if (k.startsWith("filters[")) {
      const key = k.slice(8, -1)
      const vals = Array.isArray(v) ? (v as string[]) : [(v as string)]
      filters[key] = vals
    }
  }

  // Build where jsonb predicates
  const where: string[] = []
  const params: any[] = []
  let p = 1
  for (const [k, vals] of Object.entries(filters)) {
    params.push(k, vals)
    where.push(`facets ? $${p} AND (facets -> $${p}) ?| $${p + 1}`)
    p += 2
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

  // Simple in-memory cache via global This (process-local); replace with Redis later
  const cacheKey = crypto.createHash("sha1").update(JSON.stringify({ where, params, page, limit })).digest("hex")
  ;(globalThis as any).__store_facets_cache = (globalThis as any).__store_facets_cache || new Map<string, any>()
  const cache = (globalThis as any).__store_facets_cache as Map<string, any>
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return res.json(cached.value)
  }
  const { rows } = await pool.query(
    `SELECT id::text, product_id FROM store_filters_facet_index ${whereSql} ORDER BY updated_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params
  )

  // counts per facet (naive: limit to a few common keys)
  const facetCounts: Record<string, Record<string, number>> = {}
  const countKeys = Object.keys(filters)
  for (const k of countKeys) {
    const { rows: countRows } = await pool.query(
      `SELECT jsonb_array_elements_text(facets -> $1) AS val, COUNT(*)::int AS count
       FROM store_filters_facet_index ${whereSql}
       GROUP BY val`,
      [k, ...params]
    )
    facetCounts[k] = Object.fromEntries(countRows.map((r: any) => [r.val, r.count]))
  }

  const payload = {
    products: rows.map((r: any) => r.product_id),
    facet_counts: facetCounts,
    applied_filters: filters,
    page,
    limit,
    total: 0,
  }
  cache.set(cacheKey, { value: payload, expires: Date.now() + 60_000 })
  res.json(payload)
}


