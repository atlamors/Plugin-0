import { describe, it, expect } from "vitest"
import { GET, PUT } from "../src/api/admin/store-filters/settings/route"

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

describe("settings api", () => {
  it("GET returns defaults", async () => {
    const res = makeRes()
    await GET({ path: "/admin/store-filters/settings" } as any, res as any)
    expect((res as any).result.status).toBe(200)
  })

  it("PUT rejects invalid payload (bad type)", async () => {
    const res = makeRes()
    await PUT({ body: { general: { enabled: "nope" } } } as any, res as any)
    expect((res as any).result.status).toBe(400)
  })
})


