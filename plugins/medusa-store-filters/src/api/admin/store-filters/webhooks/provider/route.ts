import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import crypto from "node:crypto"

const seenIds = new Set<string>()

function verifySignature(payload: string, secret?: string, signature?: string): boolean {
  if (!secret || !signature) return false
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secret = process.env.STORE_FILTERS_WEBHOOK_SECRET
  const signature = req.headers["x-signature"] as string | undefined
  const eventId = (req.headers["x-idempotency-key"] as string | undefined) || (req.headers["idempotency-key"] as string | undefined)
  const payload = JSON.stringify(req.body ?? {})
  if (!verifySignature(payload, secret, signature)) {
    return res.status(401).json({ code: "invalid_signature", message: "Invalid signature" })
  }
  if (eventId) {
    if (seenIds.has(eventId)) {
      return res.status(409).json({ code: "replay_detected", message: "Duplicate event" })
    }
    seenIds.add(eventId)
  }
  res.json({ ok: true })
}


