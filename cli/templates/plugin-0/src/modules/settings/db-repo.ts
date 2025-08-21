import type { Plugin0Settings } from "./entity"
import { getPool } from "../../utils/db"

export class SettingsDbRepository {
  async read(): Promise<Plugin0Settings | undefined> {
    const pool = getPool()
    if (!pool) return undefined
    const { rows } = await pool.query("SELECT id, data, updated_at FROM plugin0_settings WHERE id = 'plugin-0' LIMIT 1")
    if (!rows.length) return undefined
    const row = rows[0]
    return { id: row.id, data: row.data, updatedAt: row.updated_at }
  }

  async write(settings: Plugin0Settings): Promise<void> {
    const pool = getPool()
    if (!pool) return
    await pool.query(
      `INSERT INTO plugin0_settings (id, data, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
      [settings.id, settings.data, settings.updatedAt]
    )
  }
}



