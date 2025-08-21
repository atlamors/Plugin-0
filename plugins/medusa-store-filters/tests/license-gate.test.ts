import { describe, it, expect } from "vitest"
import { hasFeature } from "../src/modules/licensing/gate"

describe("hasFeature gate", () => {
  it("blocks when no status", () => {
    expect(hasFeature(undefined, "pro")).toBe(false)
  })
  it("allows pro when valid", () => {
    expect(
      hasFeature(
        {
          tier: "pro",
          features: ["pro"],
          state: "valid",
          lastVerifiedAt: new Date().toISOString(),
        } as any,
        "pro"
      )
    ).toBe(true)
  })
  it("blocks when expired", () => {
    expect(
      hasFeature(
        {
          tier: "pro",
          features: ["pro"],
          state: "expired",
          lastVerifiedAt: new Date().toISOString(),
        } as any,
        "pro"
      )
    ).toBe(false)
  })
})



