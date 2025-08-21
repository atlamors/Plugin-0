import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import crypto from "node:crypto"

export function ensureCorrelation(req: MedusaRequest, res: MedusaResponse) {
  const headers = (req as any).headers || {}
  const requestId = (headers["x-request-id"] as string) || crypto.randomUUID()
  const traceId = (headers["x-trace-id"] as string) || crypto.randomUUID()
  res.setHeader("x-request-id", requestId)
  res.setHeader("x-trace-id", traceId)
  return { requestId, traceId }
}


