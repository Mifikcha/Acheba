import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createShellIdentity, shouldFocusPromptFromSurface } from "./system-console.presentation"

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

  it("returns focus to the prompt for a plain desktop surface click", () => {
    assert.equal(
      shouldFocusPromptFromSurface({
        button: 0,
        pointerType: "mouse",
        hasSelection: false,
        clickedInteractive: false,
        clickedScrollbar: false,
      }),
      true,
    )
  })

  it("preserves selection, controls, scrollbars, touch and non-primary clicks", () => {
    const interaction = {
      button: 0,
      pointerType: "mouse",
      hasSelection: false,
      clickedInteractive: false,
      clickedScrollbar: false,
    }

    assert.equal(shouldFocusPromptFromSurface({ ...interaction, hasSelection: true }), false)
    assert.equal(shouldFocusPromptFromSurface({ ...interaction, clickedInteractive: true }), false)
    assert.equal(shouldFocusPromptFromSurface({ ...interaction, clickedScrollbar: true }), false)
    assert.equal(shouldFocusPromptFromSurface({ ...interaction, pointerType: "touch" }), false)
    assert.equal(shouldFocusPromptFromSurface({ ...interaction, button: 1 }), false)
  })
})
