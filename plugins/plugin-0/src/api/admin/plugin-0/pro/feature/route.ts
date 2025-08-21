import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { getLicense } from "utils/state"
import { hasFeature } from "modules/licensing/gate"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { status } = await getLicense()
  if (!hasFeature(status, "pro")) {
    return res.status(403).json({ code: "forbidden", message: "Pro license required" })
  }
  res.json({ ok: true, feature: "pro-only" })
}


