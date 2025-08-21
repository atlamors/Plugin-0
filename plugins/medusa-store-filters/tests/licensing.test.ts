import { describe, it, expect } from "vitest"
import { verifyLicenseStub } from "../src/modules/licensing/stub"

describe("verifyLicenseStub", () => {
  it("returns free tier when no key", async () => {
    const res = await verifyLicenseStub()
    expect(res.tier).toBe("free")
    expect(res.state).toBe("valid")
  })

  it("returns pro when key starts with pro_", async () => {
    const res = await verifyLicenseStub("pro_123")
    expect(res.tier).toBe("pro")
    expect(res.state).toBe("valid")
  })

  it("returns invalid when key is unknown", async () => {
    const res = await verifyLicenseStub("bad")
    expect(res.state).toBe("invalid")
  })
})


