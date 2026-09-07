import type { StudentProfileProvider, StudentUser } from "./system-console.types"

type ConsoleSurfaceInteraction = {
  button: number
  pointerType: string
  hasSelection: boolean
  clickedInteractive: boolean
  clickedScrollbar: boolean
}

export function shouldFocusPromptFromSurface({
  button,
  pointerType,
  hasSelection,
  clickedInteractive,
  clickedScrollbar,
}: ConsoleSurfaceInteraction): boolean {
  return (
    button === 0 &&
    pointerType !== "touch" &&
    !hasSelection &&
    !clickedInteractive &&
    !clickedScrollbar
  )
}

export function createShellIdentity(
  mode: StudentProfileProvider["mode"],
  user: StudentUser | null,
): { user: string; prompt: string; profile: "connected" | "none" } {
  const shellUser = user?.id.trim() || mode
  return {
    user: shellUser,
    prompt: `hnd:\\${shellUser}>`,
    profile: user ? "connected" : "none",
  }
}
