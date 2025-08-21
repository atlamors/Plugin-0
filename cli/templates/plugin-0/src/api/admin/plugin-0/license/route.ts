import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { verifyLicenseStub } from "../../../../modules/licensing/stub"
import { hasFeature } from "../../../../modules/licensing/gate"
import { getLicense, setLicense } from "../../../../utils/state"
import { logger } from "../../../../utils/observability/logger"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  logger.info({ path: req.path }, "plugin-0 get license")
  const { key, status } = await getLicense()
  const current = status ?? (await verifyLicenseStub(key))
  res.json({ licenseKey: key ? "***" : undefined, status: current, hasPro: hasFeature(current, "pro") })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  logger.info({ path: req.path }, "plugin-0 post license")
  const input = (req.body as { licenseKey?: string }) ?? {}
  const status = await verifyLicenseStub(input.licenseKey)
  setLicense(input.licenseKey, status)
  res.json({ ok: true, status })
}


