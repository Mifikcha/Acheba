import type { AudioTrack } from "../study-player.tracks"

export type RepeatMode = "off" | "one"

export type StudyPlayerState = {
  currentTrackId: string
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  repeat: RepeatMode
  expanded: boolean
  error: string | null
}

type PersistedState = Pick<StudyPlayerState, "currentTrackId" | "currentTime" | "volume" | "repeat">

const STORAGE_KEY = "hopes-study-player-v1"

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--"
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)
    .toString()
    .padStart(2, "0")}:${(whole % 60).toString().padStart(2, "0")}`
}

export function resolveAudioSource(src: string, basePath = ""): string {
  if (!src.startsWith("/")) return src
  const prefix = basePath === "/" ? "" : basePath.replace(/\/$/, "")
  return `${prefix}${src}`
}

export class AudioPlayerController {
  private readonly listeners = new Set<(state: StudyPlayerState) => void>()
  private readonly audio: HTMLAudioElement
  private state: StudyPlayerState
  private pendingTime = 0
  private lastPersistedSecond = -1

  constructor(
    private readonly tracks: AudioTrack[],
    audio: HTMLAudioElement = new Audio(),
  ) {
    if (tracks.length === 0) throw new Error("Study player requires at least one track")

    this.audio = audio
    const restored = this.restore()
    const currentTrackId = tracks.some((track) => track.id === restored?.currentTrackId)
      ? restored!.currentTrackId
      : tracks[0].id

    this.state = {
      currentTrackId,
      isPlaying: false,
      currentTime: Math.max(0, restored?.currentTime ?? 0),
      duration: 0,
      volume: clamp(restored?.volume ?? 0.72, 0, 1),
      repeat: restored?.repeat === "one" ? "one" : "off",
      expanded: false,
      error: null,
    }
    this.pendingTime = this.state.currentTime
    this.audio.volume = this.state.volume
    this.bindAudioEvents()
    this.loadCurrentTrack()
  }

  get tracksList(): readonly AudioTrack[] {
    return this.tracks
  }

  get snapshot(): StudyPlayerState {
    return { ...this.state }
  }

  get currentTrack(): AudioTrack {
    return this.tracks.find((track) => track.id === this.state.currentTrackId) ?? this.tracks[0]
  }

  subscribe(listener: (state: StudyPlayerState) => void): () => void {
    this.listeners.add(listener)
    listener(this.snapshot)
    return () => this.listeners.delete(listener)
  }

  async toggle(): Promise<void> {
    if (this.audio.paused) await this.play()
    else this.audio.pause()
  }

  async play(): Promise<void> {
    try {
      await this.audio.play()
      this.update({ isPlaying: true, error: null })
    } catch {
      this.update({ isPlaying: false, error: "Track unavailable" })
    }
  }

  pause(): void {
    this.audio.pause()
  }

  previous(): void {
    if (Math.max(this.audio.currentTime, this.state.currentTime) > 3) {
      this.seek(0)
      return
    }
    this.selectByOffset(-1)
  }

  next(): void {
    this.selectByOffset(1)
  }

  selectTrack(id: string): void {
    if (!this.tracks.some((track) => track.id === id) || id === this.state.currentTrackId) return
    const shouldResume = this.state.isPlaying
    this.audio.pause()
    this.update({
      currentTrackId: id,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      error: null,
    })
    this.pendingTime = 0
    this.persist()
    this.loadCurrentTrack()
    if (shouldResume) void this.play()
  }

  seek(seconds: number): void {
    const duration = Number.isFinite(this.audio.duration)
      ? this.audio.duration
      : this.state.duration
    const target = clamp(seconds, 0, duration || 0)
    try {
      this.audio.currentTime = target
    } catch {
      this.pendingTime = target
    }
    this.update({ currentTime: target })
    this.persist()
  }

  setVolume(volume: number): void {
    const nextVolume = clamp(volume, 0, 1)
    this.audio.volume = nextVolume
    this.update({ volume: nextVolume })
    this.persist()
  }

  toggleRepeat(): void {
    this.update({ repeat: this.state.repeat === "one" ? "off" : "one" })
    this.persist()
  }

  setExpanded(expanded: boolean): void {
    this.update({ expanded })
  }

  private bindAudioEvents(): void {
    this.audio.addEventListener("loadedmetadata", () => {
      const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0
      const restoredTime = duration
        ? clamp(this.pendingTime, 0, Math.max(0, duration - 0.25))
        : this.pendingTime
      if (restoredTime > 0) {
        try {
          this.audio.currentTime = restoredTime
        } catch {}
      }
      this.update({
        duration,
        currentTime: this.audio.currentTime || restoredTime,
        error: null,
      })
    })

    this.audio.addEventListener("durationchange", () => {
      if (Number.isFinite(this.audio.duration)) this.update({ duration: this.audio.duration })
    })

    this.audio.addEventListener("timeupdate", () => {
      const currentTime = this.audio.currentTime || 0
      this.update({ currentTime })
      const second = Math.floor(currentTime)
      if (second !== this.lastPersistedSecond && second % 2 === 0) {
        this.lastPersistedSecond = second
        this.persist()
      }
    })

    this.audio.addEventListener("play", () => this.update({ isPlaying: true, error: null }))
    this.audio.addEventListener("pause", () => {
      this.update({ isPlaying: false })
      this.persist()
    })
    this.audio.addEventListener("error", () =>
      this.update({ isPlaying: false, error: "Track unavailable" }),
    )
    this.audio.addEventListener("ended", () => {
      if (this.state.repeat === "one") {
        this.seek(0)
        void this.play()
      } else {
        this.selectByOffset(1, true)
      }
    })
  }

  private selectByOffset(offset: number, forcePlay = this.state.isPlaying): void {
    const index = this.tracks.findIndex((track) => track.id === this.state.currentTrackId)
    const nextIndex = (index + offset + this.tracks.length) % this.tracks.length
    const nextId = this.tracks[nextIndex].id
    this.audio.pause()
    this.update({
      currentTrackId: nextId,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      error: null,
    })
    this.pendingTime = 0
    this.persist()
    this.loadCurrentTrack()
    if (forcePlay) void this.play()
  }

  private loadCurrentTrack(): void {
    const basePath = typeof document === "undefined" ? "" : (document.body?.dataset.basepath ?? "")
    this.audio.src = resolveAudioSource(this.currentTrack.src, basePath)
    this.audio.preload = "metadata"
    this.audio.load()
  }

  private update(patch: Partial<StudyPlayerState>): void {
    this.state = { ...this.state, ...patch }
    const snapshot = this.snapshot
    this.listeners.forEach((listener) => listener(snapshot))
  }

  private restore(): PersistedState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as PersistedState) : null
    } catch {
      return null
    }
  }

  private persist(): void {
    try {
      const persisted: PersistedState = {
        currentTrackId: this.state.currentTrackId,
        currentTime: this.state.currentTime,
        volume: this.state.volume,
        repeat: this.state.repeat,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    } catch {}
  }
}
