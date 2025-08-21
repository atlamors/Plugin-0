import { getPool } from "./db"
import { logger } from "./observability/logger"

export async function bootstrapPluginDb(): Promise<void> {
  const pool = getPool()
  if (!pool) {
    logger.warn("DATABASE_URL not set or pg not installed; skipping DB bootstrap")
    return
  }

  // Ensure settings and license tables exist for template consistency
  await pool.query(
    `CREATE TABLE IF NOT EXISTS store_filters_settings (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
  )

  await pool.query(
    `CREATE TABLE IF NOT EXISTS store_filters_license (
      id TEXT PRIMARY KEY,
      license_key TEXT NULL,
      status TEXT NULL
    )`
  )

  // filter_config table
  await pool.query(
    `CREATE TABLE IF NOT EXISTS store_filters_filter_config (
      id UUID PRIMARY KEY,
      facet_key TEXT UNIQUE NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('option','attribute','org')),
      enabled BOOLEAN NOT NULL DEFAULT false,
      display_type TEXT NOT NULL DEFAULT 'categorical' CHECK (display_type IN ('categorical','range','boolean','swatch')),
      label_override TEXT NULL,
      unit TEXT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
  )

  // facet_index table
  await pool.query(
    `CREATE TABLE IF NOT EXISTS store_filters_facet_index (
      id UUID PRIMARY KEY,
      product_id TEXT NOT NULL,
      region_id TEXT NULL,
      sales_channel_id TEXT NULL,
      facets JSONB NOT NULL DEFAULT '{}'::jsonb,
      price_min NUMERIC NULL,
      price_max NUMERIC NULL,
      in_stock BOOLEAN NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
  )

  // Indexes
  await pool.query(
    `CREATE INDEX IF NOT EXISTS store_filters_facet_index_product_id_idx ON store_filters_facet_index (product_id)`
  )
  await pool.query(
    `CREATE INDEX IF NOT EXISTS store_filters_facet_index_facets_idx ON store_filters_facet_index USING GIN (facets jsonb_path_ops)`
  )

  logger.info("Store Filters DB bootstrap completed")
}


