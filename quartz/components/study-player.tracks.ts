export type AudioTrackSource = "builtin" | "user"

export type AudioTrack = {
  id: string
  title: string
  artist?: string
  src: string
  duration?: number
  category?: string
  source: AudioTrackSource
}

const builtinTracks: AudioTrack[] = [
  {
    id: "late-night-orbit",
    title: "Late Night Orbit",
    category: "Study ambience",
    src: "/static/audio/late-night-orbit.mp3",
    source: "builtin",
  },
  {
    id: "quiet-stars",
    title: "Quiet Stars",
    category: "Study ambience",
    src: "/static/audio/quiet-stars.mp3",
    source: "builtin",
  },
  {
    id: "rain",
    title: "Rain",
    category: "Ambient sound",
    src: "/static/audio/rain.mp3",
    source: "builtin",
  },
]

export function getBuiltinTracks(): AudioTrack[] {
  return builtinTracks.map((track) => ({ ...track }))
}

// Future API/auth/storage integration can return user tracks through this seam.
export function getUserTracks(): AudioTrack[] {
  return []
}

export function getAudioTracks(): AudioTrack[] {
  return [...getBuiltinTracks(), ...getUserTracks()]
}
