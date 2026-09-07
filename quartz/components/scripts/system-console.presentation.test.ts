import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createShellIdentity } from "./system-console.presentation"

describe("system console presentation", () => {
  it("builds the guest prompt from profile mode", () => {
    assert.deepEqual(createShellIdentity("guest", null), {
      user: "guest",
      prompt: "hnd:\\guest>",
      profile: "none",
    })
  })

  it("uses the connected profile id in the shell path", () => {
    assert.deepEqual(createShellIdentity("student", { id: "sergey", displayName: "Сергей" }), {
      user: "sergey",
      prompt: "hnd:\\sergey>",
      profile: "connected",
    })
  })
})
