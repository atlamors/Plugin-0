import { randomUUID } from "crypto"
import { getPool } from "../../utils/db"
import type { FacetIndexRow, FilterConfig } from "./entities"

export class FiltersDbRepository {
  async listConfigs(): Promise<FilterConfig[]> {
    const pool = getPool()
    if (!pool) return []
    const { rows } = await pool.query(
      `SELECT id::text, facet_key, kind, enabled, display_type, label_override, unit, sort_order, created_at, updated_at
       FROM store_filters_filter_config
       ORDER BY sort_order ASC, facet_key ASC`
    )
    return rows
  }

  async upsertConfig(input: Partial<FilterConfig> & { facet_key: string; kind: FilterConfig["kind"] }): Promise<FilterConfig | undefined> {
    const pool = getPool()
    if (!pool) return undefined
    const id = input.id ?? randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO store_filters_filter_config (id, facet_key, kind, enabled, display_type, label_override, unit, sort_order)
       VALUES ($1, $2, $3, COALESCE($4,false), COALESCE($5,'categorical'), $6, $7, COALESCE($8,0))
       ON CONFLICT (facet_key) DO UPDATE SET
         kind = EXCLUDED.kind,
         enabled = COALESCE(EXCLUDED.enabled, store_filters_filter_config.enabled),
         display_type = COALESCE(EXCLUDED.display_type, store_filters_filter_config.display_type),
         label_override = EXCLUDED.label_override,
         unit = EXCLUDED.unit,
         sort_order = COALESCE(EXCLUDED.sort_order, store_filters_filter_config.sort_order),
         updated_at = now()
       RETURNING id::text, facet_key, kind, enabled, display_type, label_override, unit, sort_order, created_at, updated_at`,
      [id, input.facet_key, input.kind, input.enabled ?? null, input.display_type ?? null, input.label_override ?? null, input.unit ?? null, input.sort_order ?? null]
    )
    return rows[0]
  }

  async updateConfigById(id: string, updates: Partial<FilterConfig>): Promise<FilterConfig | undefined> {
    const pool = getPool()
    if (!pool) return undefined
    const { rows } = await pool.query(
      `UPDATE store_filters_filter_config SET
         enabled = COALESCE($2, enabled),
         display_type = COALESCE($3, display_type),
         label_override = COALESCE($4, label_override),
         unit = COALESCE($5, unit),
         sort_order = COALESCE($6, sort_order),
         updated_at = now()
       WHERE id = $1
       RETURNING id::text, facet_key, kind, enabled, display_type, label_override, unit, sort_order, created_at, updated_at`,
      [id, updates.enabled ?? null, updates.display_type ?? null, updates.label_override ?? null, updates.unit ?? null, updates.sort_order ?? null]
    )
    return rows[0]
  }

  async writeFacetIndexRow(row: Omit<FacetIndexRow, "created_at" | "updated_at">): Promise<FacetIndexRow | undefined> {
    const pool = getPool()
    if (!pool) return undefined
    const id = row.id ?? randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO store_filters_facet_index (id, product_id, region_id, sales_channel_id, facets, price_min, price_max, in_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         product_id = EXCLUDED.product_id,
         region_id = EXCLUDED.region_id,
         sales_channel_id = EXCLUDED.sales_channel_id,
         facets = EXCLUDED.facets,
         price_min = EXCLUDED.price_min,
         price_max = EXCLUDED.price_max,
         in_stock = EXCLUDED.in_stock,
         updated_at = now()
       RETURNING id::text, product_id, region_id, sales_channel_id, facets, price_min::text, price_max::text, in_stock, created_at, updated_at`,
      [id, row.product_id, row.region_id, row.sales_channel_id, row.facets, row.price_min, row.price_max, row.in_stock]
    )
    return rows[0]
  }
}


