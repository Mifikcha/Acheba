import test, { describe } from "node:test"
import assert from "node:assert/strict"
import type { AudioTrack } from "../study-player.tracks"
import {
  AudioPlayerController,
  formatAudioTime,
  resolveAudioSource,
} from "./study-player-controller"

class FakeAudio extends EventTarget {
  src = ""
  preload = ""
  volume = 1
  currentTime = 0
  duration = 240
  paused = true

  load() {}

  async play() {
    this.paused = false
    this.dispatchEvent(new Event("play"))
  }

  pause() {
    if (this.paused) return
    this.paused = true
    this.dispatchEvent(new Event("pause"))
  }
}

const tracks: AudioTrack[] = [
  { id: "one", title: "One", src: "/static/audio/one.mp3", source: "builtin" },
  { id: "two", title: "Two", src: "/static/audio/two.mp3", source: "builtin" },
]

describe("study player helpers", () => {
  test("formats known and unknown durations", () => {
    assert.equal(formatAudioTime(134.9), "02:14")
    assert.equal(formatAudioTime(Number.NaN), "--:--")
  })

  test("resolves production base paths without changing external sources", () => {
    assert.equal(
      resolveAudioSource("/static/audio/rain.mp3", "/Acheba"),
      "/Acheba/static/audio/rain.mp3",
    )
    assert.equal(
      resolveAudioSource("https://example.com/rain.mp3", "/Acheba"),
      "https://example.com/rain.mp3",
    )
  })
})

describe("AudioPlayerController", () => {
  test("keeps playback state while moving through the queue", async () => {
    const audio = new FakeAudio()
    const player = new AudioPlayerController(tracks, audio as unknown as HTMLAudioElement)

    await player.play()
    player.next()

    assert.equal(player.snapshot.currentTrackId, "two")
    assert.equal(player.snapshot.isPlaying, true)
    assert.match(audio.src, /two\.mp3$/)
  })

  test("restarts the current track before selecting the previous one", () => {
    const audio = new FakeAudio()
    const player = new AudioPlayerController(tracks, audio as unknown as HTMLAudioElement)
    audio.currentTime = 8

    player.previous()

    assert.equal(player.snapshot.currentTrackId, "one")
    assert.equal(player.snapshot.currentTime, 0)
  })
})
