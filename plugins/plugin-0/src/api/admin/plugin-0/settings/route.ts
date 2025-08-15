import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { SettingsService, SettingsSchema } from "../../../../modules/settings/service"
import { logger } from "../../../../utils/observability/logger"

const settings = new SettingsService()

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  logger.info({ path: req.path }, "plugin-0 get settings")
  const data = await settings.get()
  res.json(data)
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  logger.info({ path: req.path }, "plugin-0 put settings")
  try {
    const parsed = SettingsSchema.parse(req.body ?? {})
    const data = await settings.upsert(parsed)
    res.json(data)
  } catch (e: any) {
    res.status(400).json({ code: "invalid_settings", message: e?.message || "Invalid payload" })
  }
}


