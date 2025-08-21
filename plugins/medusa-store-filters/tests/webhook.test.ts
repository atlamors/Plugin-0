import { describe, it, expect } from "vitest"
import crypto from "node:crypto"
import { POST as webhook } from "../src/api/admin/store-filters/webhooks/provider/route"

function sign(body: any, secret: string) {
  const payload = JSON.stringify(body)
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

function makeRes() {
  let status = 200
  let body: any
  return {
    status: (s: number) => {
      status = s
      return {
        json: (b: any) => {
          body = b
          return { status, body }
        },
      }
    },
    json: (b: any) => {
      body = b
      return { status, body }
    },
    get result() {
      return { status, body }
    },
  }
}

describe("webhook verify & idempotency", () => {
  it("rejects invalid signature", async () => {
    const res = makeRes()
    const out = await webhook({ headers: {}, body: {} } as any, res as any)
    expect((out as any).status).toBe(401)
  })

  it("accepts valid signature then rejects replay", async () => {
    process.env.STORE_FILTERS_WEBHOOK_SECRET = "secret"
    const body = { ok: true }
    const headers = {
      "x-signature": sign(body, "secret"),
      "x-idempotency-key": "abc",
    } as any
    const first = makeRes()
    await webhook({ headers, body } as any, first as any)
    expect((first as any).result.status).toBe(200)
    const second = makeRes()
    await webhook({ headers, body } as any, second as any)
    expect((second as any).result.status).toBe(409)
  })
})


