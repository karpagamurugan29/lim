import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Inertial smooth scrolling (Lenis), driven by GSAP's ticker so ScrollTrigger
 * and the frame sequence update in the same animation frame — no double smoothing,
 * no jitter. Skipped entirely for visitors who prefer reduced motion.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const lenis = reduced
  ? null
  : new Lenis({
      lerp: 0.085,          // lower = silkier, heavier glide
      wheelMultiplier: 0.9,
      smoothWheel: true,
    })

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function scrollTo(top, { immediate = false } = {}) {
  if (lenis) lenis.scrollTo(top, { immediate, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' })
}

export const stopScroll = () => lenis?.stop()
export const startScroll = () => lenis?.start()
