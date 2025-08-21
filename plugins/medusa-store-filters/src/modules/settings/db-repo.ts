import type { StoreFiltersSettings } from "./entity"
import { getPool } from "../../utils/db"

export class SettingsDbRepository {
  async read(): Promise<StoreFiltersSettings | undefined> {
    const pool = getPool()
    if (!pool) return undefined
    const { rows } = await pool.query("SELECT id, data, updated_at FROM store_filters_settings WHERE id = 'store-filters' LIMIT 1")
    if (!rows.length) return undefined
    const row = rows[0]
    return { id: row.id, data: row.data, updatedAt: row.updated_at }
  }

  async write(settings: StoreFiltersSettings): Promise<void> {
    const pool = getPool()
    if (!pool) return
    await pool.query(
      `INSERT INTO store_filters_settings (id, data, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
      [settings.id, settings.data, settings.updatedAt]
    )
  }
}



