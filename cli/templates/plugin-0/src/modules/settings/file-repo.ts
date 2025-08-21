import fs from "node:fs"
import path from "node:path"
import type { Plugin0Settings } from "./entity"

const DATA_DIR = path.join(process.cwd(), ".data", "plugin-0")
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json")

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export class SettingsFileRepository {
  read(): Plugin0Settings | undefined {
    try {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf8")
      return JSON.parse(raw) as Plugin0Settings
    } catch {
      return undefined
    }
  }

  write(settings: Plugin0Settings): void {
    ensureDir()
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
  }
}



