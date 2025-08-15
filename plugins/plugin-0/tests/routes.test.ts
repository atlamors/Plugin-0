import { describe, it, expect } from "vitest"
import { GET as adminHealth } from "../src/api/admin/plugin-0/health/route"
import { GET as storeHealth } from "../src/api/store/plugin-0/health/route"

function makeRes() {
  const headers: Record<string, string> = {}
  let jsonBody: any
  return {
    setHeader: (k: string, v: string) => {
      headers[k] = v
    },
    getHeader: (k: string) => headers[k],
    json: (body: any) => {
      jsonBody = body
      return { headers, body: jsonBody }
    },
    get result() {
      return { headers, body: jsonBody }
    },
  }
}

describe("health routes", () => {
  it("admin health returns ok", async () => {
    const res = makeRes()
    await adminHealth({ path: "/admin/plugin-0/health", headers: {} } as any, res as any)
    expect((res as any).result.body.ok).toBe(true)
  })
  it("store health returns status ok and cors headers", async () => {
    const res = makeRes()
    await storeHealth({ path: "/store/plugin-0/health", headers: {} } as any, res as any)
    const { headers, body } = (res as any).result
    expect(body.status).toBe("ok")
    expect(headers["Access-Control-Allow-Origin"]).toBe("*")
  })
})


