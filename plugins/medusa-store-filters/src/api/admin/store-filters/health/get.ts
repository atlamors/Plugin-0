import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { getPool } from "../../../../utils/db"

export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  const pool = getPool()
  if (!pool) return res.json({ last_scan: null, last_index: null, pending_jobs: 0 })
  const { rows: idx } = await pool.query(`SELECT max(updated_at) AS last_index FROM store_filters_facet_index`)
  res.json({ last_scan: null, last_index: idx[0]?.last_index ?? null, pending_jobs: 0 })
}


