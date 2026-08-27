/** Best-effort: the Vibration API is desktop/iOS-Safari-unsupported and can
 *  throw without a recent user gesture, so failures are swallowed. */
export function vibrateDevice(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignored — see above
  }
}
