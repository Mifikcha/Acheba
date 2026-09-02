import type { CommandCategory } from "./system-console.types"

const sectionLabels: Record<CommandCategory, string> = {
  SYSTEM: "[SYS]",
  INTERFACE: "[UI]",
  STUDY: "[STUDY]",
  PROFILE: "[PROFILE]",
  NAVIGATION: "[NAV]",
  FUN: "[FUN]",
}

export const consoleSectionLabel = (category: string): string =>
  sectionLabels[category as CommandCategory] ?? `[${category}]`

export const formatConsoleTimestamp = (date: Date): string =>
  [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":")
