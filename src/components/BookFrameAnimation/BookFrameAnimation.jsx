import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import './BookFrameAnimation.css'

/**
 * BookFrameAnimation
 * ──────────────────
 * Draws an image sequence onto a <canvas>. It knows nothing about scrolling:
 * the parent calls `setProgress(0 → 1)` (from a GSAP ScrollTrigger) and this
 * component picks and paints the matching frame.
 *
 * Why this stays fast:
 *  • No React state — everything lives in a ref, so scrolling never re-renders.
 *  • Paints are batched into requestAnimationFrame; at most one paint per display frame,
 *    and only when the position (or size) actually changed. Neighbouring frames cross-fade.
 *  • Frames load in a coarse-to-fine order, so the whole range is scrubbable early;
 *    if a frame isn't ready yet, the nearest loaded one is drawn (no blank flashes).
 *  • The vignette that blends the frame into the page is pre-rendered once per resize.
 *  • On unmount, pending loads are cancelled and all images are released.
 *
 * Props
 *  frames          string[]   URLs, in order
 *  focus           {x,y,w,h}  region of the frame (fractions) that must stay visible
 *  insets          (w,h,layout) => {top,right,bottom,left}  space to keep clear, px
 *  frameStep       number     use every Nth frame (e.g. 2 on phones)
 *  background      string     page colour the frame fades into
 *  initialBatch    number     how many frames count as "ready" for the preloader
 *  maxUpscale      number     largest allowed enlargement of the source, in device pixels
 *  onLoadProgress  (0..1) => void
 *  onReady         () => void
 */
const BookFrameAnimation = forwardRef(function BookFrameAnimation(
  {
    frames,
    focus = { x: 0, y: 0, w: 1, h: 1 },
    insets,
    frameStep = 1,
    background = '#0B0B0C',
    nativeWidth = 1280,
    nativeHeight = 720,
    initialBatch = 24,
    maxUpscale = Infinity,
    onLoadProgress,
    onReady,
    className = '',
  },
  ref
) {
  const canvasRef = useRef(null)

  // All mutable animation state — deliberately outside React.
  const s = useRef({
    list: [],          // frame URLs actually used (after frameStep)
    images: [],        // HTMLImageElement | undefined
    loaded: [],        // boolean per frame
    target: 0,         // fractional frame position requested by scroll
    drawn: -1,         // position last painted
    dirty: true,       // force a repaint (resize etc.)
    raf: 0,
    ctx: null,
    vignette: null,    // offscreen canvas
    rect: null,        // where the frame is drawn {x,y,w,h} in device px
    cancelled: false,
  }).current

  // Keep latest callbacks without re-running effects.
  const cb = useRef({ onLoadProgress, onReady, insets })
  cb.current = { onLoadProgress, onReady, insets }

  /* ───────────── Painting ───────────── */

  // Ask for a paint on the next animation frame (coalesces many scroll events).
  const schedule = () => {
    if (!s.raf) s.raf = requestAnimationFrame(paint)
  }

  // Nearest loaded frame to `i` — so a fast scroll never shows a gap.
  const nearestLoaded = (i) => {
    if (s.loaded[i]) return i
    for (let d = 1; d < s.list.length; d++) {
      if (s.loaded[i - d]) return i - d
      if (s.loaded[i + d]) return i + d
    }
    return -1
  }

  const paint = () => {
    s.raf = 0
    const { ctx } = s
    if (!ctx || !s.rect) return
    if (s.target === s.drawn && !s.dirty) return // nothing changed
    const base = Math.floor(s.target)
    const index = nearestLoaded(base)
    if (index === -1) return

    const canvas = ctx.canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const { x, y, w, h } = s.rect
    ctx.drawImage(s.images[index], x, y, w, h)
    // Cross-fade into the next frame by the fractional part of the position:
    // playback reads as continuous motion instead of discrete steps.
    const next = base + 1
    const mix = s.target - base
    if (mix > 0.01 && next !== index && s.loaded[next]) {
      ctx.globalAlpha = mix
      ctx.drawImage(s.images[next], x, y, w, h)
      ctx.globalAlpha = 1
    }
    // The vignette erases the frame's edges to transparency, so the page's
    // starfield shows around the book instead of a flat backdrop.
    if (s.vignette) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.drawImage(s.vignette, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }

    s.drawn = s.loaded[base] ? s.target : -1 // repaint once the real frame arrives
    s.dirty = false
  }

  /* ───────────── Layout ─────────────
   * Scale the frame so the `focus` region fits inside the free area
   * (canvas minus insets), then centre the focus region in that area.
   * The aspect ratio is always preserved — the image is never stretched.
   */
  const layout = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    if (!cssW || !cssH) return

    // Cap DPR at 2: sharper than 1, without 9× the pixels of a 3× phone.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)

    const first = s.images.find((img, i) => img && s.loaded[i])
    const iw = first?.naturalWidth || nativeWidth
    const ih = first?.naturalHeight || nativeHeight

    const pad = cb.current.insets?.(cssW, cssH) ?? { top: 0, right: 0, bottom: 0, left: 0 }
    const boxW = Math.max(cssW - pad.left - pad.right, 50)
    const boxH = Math.max(cssH - pad.top - pad.bottom, 50)

    // Fit the focus region, but never enlarge the source past `maxUpscale` device pixels.
    const scale = Math.min(boxW / (focus.w * iw), boxH / (focus.h * ih), maxUpscale / dpr)
    const w = iw * scale
    const h = ih * scale
    const focusCx = (focus.x + focus.w / 2) * w
    const focusCy = (focus.y + focus.h / 2) * h
    const x = pad.left + boxW / 2 - focusCx
    const y = pad.top + boxH / 2 - focusCy

    s.rect = { x: x * dpr, y: y * dpr, w: w * dpr, h: h * dpr }
    s.ctx = canvas.getContext('2d', { alpha: true })
    s.ctx.imageSmoothingEnabled = true
    s.ctx.imageSmoothingQuality = 'high'
    s.vignette = buildVignette(canvas.width, canvas.height, s.rect, background)
    s.dirty = true
    schedule()
  }

  /* ───────────── Public API (used by the GSAP timeline) ───────────── */
  useImperativeHandle(ref, () => ({
    setProgress(p) {
      const clamped = Math.min(Math.max(p, 0), 1)
      const pos = clamped * (s.list.length - 1)
      if (Math.abs(pos - s.target) > 0.002) {
        s.target = pos
        schedule()
      }
    },
    get frameCount() {
      return s.list.length
    },
    get canvas() {
      return canvasRef.current
    },
  }))

  /* ───────────── Loading ───────────── */
  useEffect(() => {
    s.cancelled = false

    // Apply frameStep, but always keep the last frame (the closed book).
    const list = frames.filter((_, i) => i % frameStep === 0)
    if (frames.length && list[list.length - 1] !== frames[frames.length - 1]) {
      list.push(frames[frames.length - 1])
    }
    s.list = list
    s.images = new Array(list.length)
    s.loaded = new Array(list.length).fill(false)
    s.target = 0
    s.drawn = -1

    const order = loadOrder(list.length)
    const batch = Math.min(initialBatch, list.length)
    let done = 0
    let readyFired = false
    let cursor = 0
    const CONCURRENCY = 6

    const loadOne = (i) =>
      new Promise((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.src = list[i]
        s.images[i] = img
        // decode() resolves once the bitmap is ready to paint — no jank on first draw.
        const finish = () => {
          if (s.cancelled) return resolve()
          s.loaded[i] = true
          if (i === 0 || done === 0) layout() // first image → real dimensions
          done++
          if (!readyFired) {
            cb.current.onLoadProgress?.(Math.min(done / batch, 1))
            if (done >= batch) {
              readyFired = true
              cb.current.onReady?.()
            }
          }
          // Repaint if a stand-in is on screen, or this is one of the two frames being blended.
          if (s.drawn === -1 || Math.abs(i - s.target) < 1.5) {
            s.dirty = true
            schedule()
          }
          resolve()
        }
        img.decode().then(finish, () => {
          // decode() can reject for valid images in some browsers; fall back to onload.
          if (img.complete && img.naturalWidth) finish()
          else if (img.complete) { done++; resolve() } // broken file — skip it
          else {
            img.onload = finish
            img.onerror = () => { done++; resolve() }
          }
        })
      })

    // Small worker pool: N parallel requests, pulled from the priority order.
    const worker = async () => {
      while (!s.cancelled && cursor < order.length) {
        await loadOne(order[cursor++])
      }
    }
    for (let k = 0; k < CONCURRENCY; k++) worker()

    if (!list.length) cb.current.onReady?.()

    return () => {
      // Cancel and release everything to avoid leaks.
      s.cancelled = true
      cancelAnimationFrame(s.raf)
      s.raf = 0
      s.images.forEach((img) => {
        if (img) {
          img.onload = img.onerror = null
          img.src = ''
        }
      })
      s.images = []
      s.loaded = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, frameStep])

  /* ───────────── Resize ───────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    let t = 0
    const ro = new ResizeObserver(() => {
      // Debounce slightly: mobile URL bars fire many resizes in a row.
      cancelAnimationFrame(t)
      t = requestAnimationFrame(layout)
    })
    ro.observe(canvas)
    layout()
    return () => {
      ro.disconnect()
      cancelAnimationFrame(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} className={`book-canvas ${className}`} aria-hidden="true" />
})

export default BookFrameAnimation

/* ───────────── Helpers ───────────── */

/**
 * Coarse-to-fine load order: first & last frame, then every 32nd, 16th, 8th…
 * After only a handful of requests the entire scroll range has a close frame.
 */
function loadOrder(n) {
  if (!n) return []
  const seen = new Uint8Array(n)
  const order = []
  const push = (i) => {
    if (i >= 0 && i < n && !seen[i]) {
      seen[i] = 1
      order.push(i)
    }
  }
  push(0)
  push(n - 1)
  for (let step = 32; step >= 1; step = step >> 1) {
    for (let i = 0; i < n; i += step) push(i)
  }
  return order
}

/**
 * Pre-rendered vignette mask that dissolves the frame's own backdrop away
 * (drawn with destination-out) — so the book floats in the page's starfield, with no visible frame edge.
 */
function buildVignette(width, height, rect, color) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const g = c.getContext('2d')
  const rgb = hexToRgb(color)
  const a = (alpha) => `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`

  // Elliptical falloff centred on the frame.
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h * 0.48
  const rx = rect.w * 0.52
  const ry = rect.h * 0.66
  const sy = ry / rx
  g.save()
  g.translate(cx, cy)
  g.scale(1, sy)
  const radial = g.createRadialGradient(0, 0, 0, 0, 0, rx)
  radial.addColorStop(0, a(0))
  radial.addColorStop(0.7, a(0))
  radial.addColorStop(0.86, a(0.45))
  radial.addColorStop(0.96, a(0.92))
  radial.addColorStop(1, a(1))
  g.fillStyle = radial
  // Fill the whole canvas (in the scaled space); beyond the radius the last stop
  // (solid page colour) extends outward, hiding everything outside the frame.
  g.fillRect(-width * 4, -(height * 4) / sy, width * 8, (height * 8) / sy)
  g.restore()

  // Feather all four edges of the frame so no hard line is ever visible,
  // then paint solid page colour everywhere outside it.
  const edge = (x0, y0, x1, y1, rx0, ry0, rw, rh) => {
    const lg = g.createLinearGradient(x0, y0, x1, y1)
    lg.addColorStop(0, a(1))
    lg.addColorStop(0.35, a(0.7))
    lg.addColorStop(1, a(0))
    g.fillStyle = lg
    g.fillRect(rx0, ry0, rw, rh)
  }
  const { x, y, w, h } = rect
  const fx = w * 0.05
  edge(x, 0, x + fx, 0, x, y, fx, h)                       // left
  edge(x + w, 0, x + w - fx, 0, x + w - fx, y, fx, h)      // right
  edge(0, y, 0, y + h * 0.1, x, y, w, h * 0.1)             // top
  edge(0, y + h, 0, y + h * 0.78, x, y + h * 0.78, w, h * 0.22) // bottom (lit floor)

  g.fillStyle = a(1)
  g.fillRect(0, 0, width, Math.max(y, 0) + 1)              // above
  g.fillRect(0, y + h - 1, width, height)                  // below
  g.fillRect(0, 0, Math.max(x, 0) + 1, height)             // left of
  g.fillRect(x + w - 1, 0, width, height)                  // right of

  return c
}

function hexToRgb(hex) {
  const v = hex.replace('#', '')
  const n = parseInt(v.length === 3 ? v.replace(/./g, '$&$&') : v, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
