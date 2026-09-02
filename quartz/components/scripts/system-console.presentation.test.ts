import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { consoleSectionLabel, formatConsoleTimestamp } from "./system-console.presentation"

describe("system console presentation", () => {
  it("uses compact terminal labels without changing command categories", () => {
    assert.equal(consoleSectionLabel("SYSTEM"), "[SYS]")
    assert.equal(consoleSectionLabel("INTERFACE"), "[UI]")
    assert.equal(consoleSectionLabel("STUDY"), "[STUDY]")
    assert.equal(consoleSectionLabel("PROFILE"), "[PROFILE]")
    assert.equal(consoleSectionLabel("NAVIGATION"), "[NAV]")
  })

  it("formats quiet command-history timestamps with fixed-width fields", () => {
    assert.equal(formatConsoleTimestamp(new Date(2026, 8, 2, 9, 4, 7)), "09:04:07")
  })
})
