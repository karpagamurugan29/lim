/**
 * ─────────────────────────────────────────────────────────────
 *  FRAME CONFIGURATION — the one place to change the animation
 * ─────────────────────────────────────────────────────────────
 *
 *  HOW TO ADD YOUR FRAMES
 *  Drop every frame into  /src/assets/frames/  — that's it.
 *  They're discovered automatically and sorted by the LAST number
 *  in the file name, so all of these work:
 *     frame-001.jpg       … frame-050.jpg
 *     frame-001.webp      … frame-240.webp
 *
 *  Frame 1 should be the closed book; the sequence then opens,
 *  turns pages, and closes again on the last frame.
 *
 *  Prefer .webp or .avif (see README for a one-line conversion).
 *  If a folder contains the same frame in two formats, keep only one.
 */

// Vite resolves this at build time into hashed, cache-friendly URLs.
const discovered = import.meta.glob(
  '../assets/frames/*.{webp,avif,jpg,jpeg,png}',
  { eager: true, query: '?url', import: 'default' }
)

const lastNumber = (path) => {
  const match = path.match(/(\d+)(?!.*\d)/)
  return match ? parseInt(match[1], 10) : 0
}

const AUTO_FRAMES = Object.keys(discovered)
  .sort((a, b) => lastNumber(a) - lastNumber(b))
  .map((key) => discovered[key])

/**
 *  OPTIONAL: hard-code the list instead (e.g. frames served from /public
 *  or a CDN). Leave as null to use the auto-discovered frames above.
 *
 *  export const MANUAL_FRAMES = Array.from({ length: 240 }, (_, i) =>
 *    `/frames/frame-${String(i + 1).padStart(3, '0')}.webp`)
 */
const MANUAL_FRAMES = null

export const FRAMES = MANUAL_FRAMES ?? AUTO_FRAMES

export const FRAME_CONFIG = {
  /** Native size of your frames — used for layout before the first image loads. */
  nativeWidth: 1280,
  nativeHeight: 720,

  /**
   * The "important region" of each frame, as fractions of the frame.
   * The canvas is scaled so this box always fits on screen — so the book
   * (including the wider open spread) is never cropped, on any device.
   * Widen `w` if your open book reaches further toward the edges.
   */
  focus: { x: 0.06, y: 0.04, w: 0.88, h: 0.92 },

  /** On phones, use every Nth frame. The sequence is only 50 frames, so keep them all. */
  mobileFrameStep: 1,

  /** Length of the pinned story, in viewport heights. More = slower, more cinematic. */
  scrollLength: 7,

  /** Scrub smoothing in seconds. Removes stepping between frames on wheel/trackpad. */
  scrub: 0.5,

  /**
   * Where the frame sequence plays inside the pinned scroll (0 → 1).
   * The small holds at each end keep the closed book on screen a moment longer.
   */
  playFrom: 0.04,
  playTo: 0.96,

  /** Must match the page background so the frame dissolves into it. */
  background: '#01050A',

  /** Initial batch preloaded before the page reveals (the rest stream in). */
  initialBatch: 20,
}

/**
 * Space reserved around the book on each layout, in CSS pixels.
 * On desktop the side bands hold the story text, so the book can never
 * collide with it. On tablet/mobile the text lives in a bottom band.
 */
export const STAGE_INSETS = {
  desktop: (w, h) => {
    const side = Math.min(Math.max(w * 0.26, 280), 400)
    // Top band leaves room for the hero headline above the book.
    return { top: Math.max(h * 0.2, 160), bottom: Math.max(h * 0.12, 84), left: side, right: side }
  },
  tablet: (w, h) => ({ top: 150, bottom: Math.max(h * 0.24, 200), left: 32, right: 32 }),
  mobile: (w, h) => ({ top: 64, bottom: Math.max(h * 0.34, 230), left: 4, right: 4 }),
}

export const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1099px)',
}
