import type { LicenseStatus } from "./stub"
import { getPool } from "../../utils/db"

export type PersistedLicense = { key?: string; status?: LicenseStatus }

export class LicenseDbRepository {
  async read(): Promise<PersistedLicense | undefined> {
    const pool = getPool()
    if (!pool) return undefined
    const { rows } = await pool.query("SELECT id, license_key, status FROM plugin0_license WHERE id = 'plugin-0' LIMIT 1")
    if (!rows.length) return undefined
    const row = rows[0]
    return { key: row.license_key || undefined, status: row.status || undefined }
  }

  async write(license: PersistedLicense): Promise<void> {
    const pool = getPool()
    if (!pool) return
    await pool.query(
      `INSERT INTO plugin0_license (id, license_key, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET license_key = EXCLUDED.license_key, status = EXCLUDED.status`,
      ["plugin-0", license.key ?? null, license.status ?? null]
    )
  }
}



