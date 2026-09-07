import type { StudentProfileProvider, StudentUser } from "./system-console.types"

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
