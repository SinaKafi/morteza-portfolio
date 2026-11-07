/**
 * Shared motion constants.
 *
 * The page has one physical language: an instrument with mass. Controls answer
 * the pointer through a stiff, damped spring, the career figure leans a couple
 * of degrees, and its rows fall under gravity before settling. Keeping the
 * numbers here is what makes those three surfaces feel like the same material.
 */

/** Stiff and light: the control follows the pointer, then returns. */
export const SPRING_MAGNET = {
  stiffness: 180,
  damping: 20,
  mass: 0.6,
} as const;

/** Softer and heavier: the panel carries mass, so it lags and settles slowly. */
export const SPRING_TILT = { stiffness: 90, damping: 18, mass: 0.9 } as const;

/** The panel turns towards the pointer by this much and no more. */
export const TILT_DEGREES = 5;

/** Rows fall from above their rest position; deeper rows fall further. */
export const FALL = {
  baseDistance: 40,
  distanceStep: 8,
  /** Seconds for the shortest fall, including its rebound. */
  baseDuration: 0.72,
  /** Seconds between rows leaving the top. */
  stagger: 0.035,
} as const;
