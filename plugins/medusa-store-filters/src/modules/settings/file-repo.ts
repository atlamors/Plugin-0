import fs from "node:fs"
import path from "node:path"
import type { StoreFiltersSettings } from "./entity"

const DATA_DIR = path.join(process.cwd(), ".data", "store-filters")
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json")

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export class SettingsFileRepository {
  read(): StoreFiltersSettings | undefined {
    try {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf8")
      return JSON.parse(raw) as StoreFiltersSettings
    } catch {
      return undefined
    }
  }

  write(settings: StoreFiltersSettings): void {
    ensureDir()
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
  }
}



