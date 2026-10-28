import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SIGNALS, ACCENTS } from '../../config/book.config'
import './Signals.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Signals — two endless rows of the book's themes, drifting in opposite directions.
 * Scroll speed feeds the marquee: a fast scroll accelerates and skews the type,
 * then it eases back to a slow drift. Feels physical, like momentum.
 */
export default function Signals() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray('.signals__track')
      const loops = rows.map((track, i) =>
        gsap.fromTo(
          track,
          { xPercent: i % 2 ? -50 : 0 },
          { xPercent: i % 2 ? 0 : -50, duration: 48, ease: 'none', repeat: -1 }
        )
      )
      if (reduced) {
        loops.forEach((l) => l.pause())
        return
      }

      const skew = gsap.quickTo('.signals__row', 'skewX', { duration: 0.6, ease: 'power3' })
      const settle = gsap.delayedCall(0.12, () => skew(0)).pause()
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity()
          const boost = 1 + Math.min(Math.abs(v) / 180, 7)
          loops.forEach((l) => {
            l.timeScale(boost)
            gsap.to(l, { timeScale: 1, duration: 1.2, ease: 'power2.out', overwrite: true })
          })
          skew(gsap.utils.clamp(-12, 12, v / -220))
          // onUpdate stops firing when scrolling stops — settle the skew then.
          settle.restart(true)
        },
        onLeave: () => skew(0),
        onLeaveBack: () => skew(0),
      })

      // The band rises and opens up as it enters.
      gsap.from('.signals__row', {
        yPercent: 40,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  const row = (outline) =>
    [...SIGNALS, ...SIGNALS].map((word, i) => (
      <span key={i} className={`signals__item ${outline ? 'is-outline' : ''}`}>
        {word}
        <i style={{ '--c': ACCENTS[i % ACCENTS.length] }} />
      </span>
    ))

  return (
    <section className="signals" ref={ref} aria-label={`Themes: ${SIGNALS.join(', ')}`}>
      <div className="signals__row" aria-hidden="true">
        <div className="signals__track">{row(false)}</div>
      </div>
      <div className="signals__row" aria-hidden="true">
        <div className="signals__track">{row(true)}</div>
      </div>
    </section>
  )
}
