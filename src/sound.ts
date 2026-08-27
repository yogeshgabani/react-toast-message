const cache = new Map<string, HTMLAudioElement>();

/** Plays (or replays, from the start) the audio at `url`. Best-effort: browsers
 *  can refuse autoplay before any user gesture, so a rejected play() is
 *  swallowed rather than surfaced as an error. */
export function playSound(url: string, volume = 1) {
  if (typeof Audio === "undefined") return;
  let audio = cache.get(url);
  if (!audio) {
    audio = new Audio(url);
    cache.set(url, audio);
  }
  audio.volume = Math.min(1, Math.max(0, volume));
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}
