import { describe, it, expect } from "vitest"
import { resolveEffectiveVisibility } from "../src/modules/filters/indexer"

describe("resolveEffectiveVisibility", () => {
  it("inherit uses global", () => {
    expect(resolveEffectiveVisibility("inherit", true)).toBe(true)
    expect(resolveEffectiveVisibility("inherit", false)).toBe(false)
  })
  it("show wins", () => {
    expect(resolveEffectiveVisibility("show", false)).toBe(true)
  })
  it("hide wins", () => {
    expect(resolveEffectiveVisibility("hide", true)).toBe(false)
  })
})


