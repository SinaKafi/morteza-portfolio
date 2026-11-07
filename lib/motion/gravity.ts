/**
 * A ball dropped from rest, with a small rebound.
 *
 * GSAP eases a row from its fall height to rest, and this curve returns 0 to 1
 * the way a real fall does: accelerating under gravity, then one or two
 * rebounds of rapidly shrinking height. Restitution is deliberately low, so the
 * figure reads as an instrument settling, not a toy bouncing.
 *
 * A fall from height h takes T = sqrt(2h/g). A rebound to r·h takes 2T·sqrt(r),
 * the next one 2T·r, and so on, so the whole motion is a geometric series. That
 * is why the curve is shaped rather than guessed.
 */
const RESTITUTION = 0.16;
const ROOT = Math.sqrt(RESTITUTION);
/** Total rebound time, in units of the first fall. */
const TAIL = (2 * ROOT) / (1 - ROOT);

export function gravityFall(progress: number): number {
  const t = Math.max(0, Math.min(1, progress)) * (1 + TAIL);

  // The fall: height falls away with the square of time.
  if (t <= 1) return t * t;

  // Then the rebounds, each one shorter than the last.
  let start = 1;
  let duration = 2 * ROOT;
  let apex = RESTITUTION;
  let guard = 0;
  while (t > start + duration && guard < 12) {
    start += duration;
    duration *= ROOT;
    apex *= RESTITUTION;
    guard += 1;
  }

  const phase = Math.min(1, Math.max(0, (t - start) / duration));
  // Height of a rebound follows a parabola through its apex at phase 0.5.
  return 1 - apex * 4 * phase * (1 - phase);
}
