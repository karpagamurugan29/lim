import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TRANSMISSION } from '../../config/book.config'
import './Transmission.css'

gsap.registerPlugin(ScrollTrigger)

const GLYPHS = '01<>/\\[]{}#*+=-_ΛΣΔΩΞ░▒▓'
const SCRAMBLE = 10 // characters ahead of the reveal that are still "noise"

/**
 * Transmission
 * ────────────
 * A pinned signal panel. As the reader scrolls, a passage decodes itself left to right:
 * dim text → a band of shifting glyphs → bright, readable words.
 * Glyphs are drawn in a ::after overlay, so the real text never reflows.
 */
export default function Transmission() {
  const ref = useRef(null)

  // Split into words (so lines wrap cleanly) and characters (so each can decode).
  const words = useMemo(() => {
    let n = 0
    return TRANSMISSION.text.split(' ').map((word) => [...word].map((ch) => ({ ch, i: n++ })))
  }, [])
  const total = words.reduce((a, w) => a + w.length, 0)

  useLayoutEffect(() => {
    const root = ref.current
    const chars = [...root.querySelectorAll('.tx__c')]
    const state = new Array(chars.length).fill(0) // 0 dim · 1 scrambling · 2 decoded
    const coords = root.querySelector('[data-coords]')
    const pct = root.querySelector('[data-pct]')
    const bars = [...root.querySelectorAll('.tx__bars i')]

    const render = (p) => {
      const head = p * (chars.length + SCRAMBLE)
      for (let i = 0; i < chars.length; i++) {
        const next = i < head - SCRAMBLE ? 2 : i < head ? 1 : 0
        if (next === 1) chars[i].dataset.g = GLYPHS[(Math.random() * GLYPHS.length) | 0]
        if (next !== state[i]) {
          chars[i].className = `tx__c is-${next === 2 ? 'on' : next === 1 ? 'scr' : 'off'}`
          state[i] = next
        }
      }
      if (pct) pct.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`
      if (coords) {
        const ra = (14.66 + p * 2.31).toFixed(3)
        const dec = (-60.83 + p * 4.17).toFixed(3)
        coords.textContent = `RA ${ra}h · DEC ${dec}°`
      }
      const lit = Math.round(p * bars.length)
      bars.forEach((b, i) => b.classList.toggle('is-lit', i < lit))
    }

    const ctx = gsap.context(() => {
      render(0)
      // Desktop pins the panel while it decodes; phones decode as it scrolls past (no empty pinned screens).
      const phone = window.matchMedia('(max-width: 767px)').matches
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: phone ? 'top 80%' : 'top top',
          refreshPriority: 1,
          end: phone ? 'bottom 55%' : () => `+=${window.innerHeight * 1.6}`,
          pin: !phone,
          scrub: 0.4,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(Math.min(self.progress / 0.85, 1)),
        },
      })
      tl.fromTo('.tx__panel', { scale: 0.94, autoAlpha: 0.4 }, { scale: 1, autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, 0)
        .fromTo('.tx__scan', { yPercent: -100 }, { yPercent: 100, duration: 1, ease: 'none' }, 0)
        .fromTo('.tx__source', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.85)
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="tx" ref={ref} aria-label="An excerpt from the book">
      <div className="tx__panel">
        <span className="tx__scan" aria-hidden="true" />
        <span className="tx__corner tx__corner--tl" aria-hidden="true" />
        <span className="tx__corner tx__corner--tr" aria-hidden="true" />
        <span className="tx__corner tx__corner--bl" aria-hidden="true" />
        <span className="tx__corner tx__corner--br" aria-hidden="true" />

        <header className="tx__head" aria-hidden="true">
          <span className="tx__live"><i /> {TRANSMISSION.label}</span>
          <span className="tx__bars">
            {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ height: `${30 + i * 6}%` }} />)}
          </span>
        </header>

        <div className="tx__radar" aria-hidden="true">
          <span className="tx__sweep" />
        </div>

        <blockquote className="tx__text" aria-label={TRANSMISSION.text}>
          {words.map((word, wi) => (
            <span key={wi} className="tx__w" aria-hidden="true">
              {word.map(({ ch, i }) => (
                <span key={i} className="tx__c is-off">{ch}</span>
              ))}
            </span>
          ))}
        </blockquote>

        <footer className="tx__foot" aria-hidden="true">
          <span data-coords>RA 14.660h · DEC -60.830°</span>
          <span>Decoded <b data-pct>000%</b> · {total} chars</span>
        </footer>

        <p className="tx__source">— {TRANSMISSION.source}</p>
      </div>
    </section>
  )
}
