import fs from "node:fs"
import path from "node:path"
import type { LicenseStatus } from "./stub"

const DATA_DIR = path.join(process.cwd(), ".data", "plugin-0")
const LICENSE_FILE = path.join(DATA_DIR, "license.json")

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export type PersistedLicense = {
  key?: string
  status?: LicenseStatus
}

export class LicenseFileRepository {
  read(): PersistedLicense | undefined {
    try {
      const raw = fs.readFileSync(LICENSE_FILE, "utf8")
      return JSON.parse(raw) as PersistedLicense
    } catch {
      return undefined
    }
  }

  write(license: PersistedLicense): void {
    ensureDir()
    fs.writeFileSync(LICENSE_FILE, JSON.stringify(license, null, 2))
  }
}



