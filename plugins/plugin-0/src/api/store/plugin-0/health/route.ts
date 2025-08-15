import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { logger } from "../../../../utils/observability/logger"
import { ensureCorrelation } from "../../../../utils/correlation"
import { getOptions } from "../../../../utils/state"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  ensureCorrelation(req, res)
  logger.info({ path: req.path, scope: "store" }, "plugin-0 healthcheck")
  const opts = getOptions()
  const origin = (req.headers?.origin as string) || ""
  const allow = opts?.corsOrigins?.length ? (opts.corsOrigins.includes(origin) ? origin : "null") : "*"
  res.setHeader("Vary", "Origin")
  res.setHeader("Access-Control-Allow-Origin", allow)
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  res.json({ status: "ok", plugin: "plugin-0", timestamp: new Date().toISOString() })
}

