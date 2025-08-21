import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { logger } from "../../../../utils/observability/logger"
import { ensureCorrelation } from "../../../../utils/correlation"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  ensureCorrelation(req, res)
  logger.info({ path: req.path, scope: "admin" }, "store-filters healthcheck")
  res.json({ ok: true, plugin: "store-filters", timestamp: new Date().toISOString() })
}


