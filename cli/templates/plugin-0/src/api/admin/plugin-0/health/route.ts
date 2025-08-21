import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { logger } from "../../../../utils/observability/logger"
import { ensureCorrelation } from "../../../../utils/correlation"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  ensureCorrelation(req, res)
  logger.info({ path: req.path, scope: "admin" }, "plugin-0 healthcheck")
  res.json({ ok: true, plugin: "plugin-0", timestamp: new Date().toISOString() })
}

