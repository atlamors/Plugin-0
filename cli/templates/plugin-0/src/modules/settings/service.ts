import { z } from "zod"
import type { Plugin0Settings } from "./entity"
import { SettingsFileRepository } from "./file-repo"
import { SettingsDbRepository } from "./db-repo"

export const SettingsSchema = z.object({
  general: z
    .object({
      enabled: z.boolean().default(true),
    })
    .default({}),
  license: z.object({}).default({}),
})

export type SettingsInput = z.input<typeof SettingsSchema>
export type Settings = z.output<typeof SettingsSchema>

const fileRepo = new SettingsFileRepository()
const dbRepo = new SettingsDbRepository()
let settingsStore: Plugin0Settings | undefined

export class SettingsService {
  async get(): Promise<Settings> {
    if (!settingsStore) {
      const fromDb = await dbRepo.read()
      const fromDisk = fromDb ?? fileRepo.read()
      if (fromDisk) settingsStore = fromDisk
    }
    return SettingsSchema.parse(settingsStore?.data ?? {})
  }

  async upsert(input: SettingsInput): Promise<Settings> {
    const data = SettingsSchema.parse(input)
    settingsStore = {
      id: "plugin-0",
      data,
      updatedAt: new Date().toISOString(),
    }
    await dbRepo.write(settingsStore)
    try {
      fileRepo.write(settingsStore)
    } catch {}
    return data
  }
}


