import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { enqueueTelemetry, flushTelemetry } from "../../../../utils/observability/telemetry"
import { getOptions } from "../../../../utils/state"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const opts = getOptions()
  if (!opts?.telemetryEnabled) {
    return res.json({ ok: true, flushed: 0, message: "telemetry disabled" })
  }
  const events = (req.body as Array<{ type: string; payload?: Record<string, unknown> }>) ?? []
  for (const e of events) {
    enqueueTelemetry({ type: e.type, payload: e.payload })
  }
  const flushed = await flushTelemetry()
  res.json({ ok: true, flushed })
}


