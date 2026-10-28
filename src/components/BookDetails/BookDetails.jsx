import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BOOK, ACCENTS } from '../../config/book.config'
import './BookDetails.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Book details — editorial two-column spread.
 * The cover rises out of the story (parallax), then floats gently.
 * Text arrives in a staggered cascade as the section enters.
 */
export default function BookDetails() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      // Staggered entrance for every text element marked [data-reveal].
      gsap.from('[data-reveal]', {
        autoAlpha: 0,
        y: 40,
        filter: 'blur(8px)',
        duration: 1.3,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: ref.current, start: 'top 68%', once: true },
      })

      // Cover: arrives larger and blurred, settles into place.
      gsap.from('.details__cover', {
        autoAlpha: 0,
        scale: 1.08,
        y: 60,
        filter: 'blur(14px)',
        duration: 1.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true },
      })

      // Endless, barely-there float — sine easing, no bounce.
      gsap.to('.details__float', { y: -14, duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })

      // Scroll parallax (desktop/tablet only; on phones the column is stacked).
      mm.add('(min-width: 768px)', () => {
        gsap.fromTo(
          '.details__cover-wrap',
          { yPercent: 8 },
          {
            yPercent: -8,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        )
      })
    }, ref)
    return () => {
      mm.revert()
      ctx.revert()
    }
  }, [])

  return (
    <section id="details" ref={ref} className="details">
      <div className="details__grid">
        <div className="details__cover-wrap">
          <div className="details__float">
            <figure className="details__cover">
              <img src={BOOK.cover} alt={`${BOOK.title} — ${BOOK.subtitle}, cover`} width="796" height="1176" loading="lazy" decoding="async" />
            </figure>
          </div>
          <span className="details__glow" aria-hidden="true" />
        </div>

        <div className="details__body">
          <p className="eyebrow" data-reveal>The Book</p>

          <h2 className="details__title" data-reveal>
            {BOOK.title}
            <span className="details__subtitle">{BOOK.subtitle}</span>
          </h2>

          <div className="details__dots" data-reveal aria-hidden="true">
            {ACCENTS.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </div>

          <p className="details__desc" data-reveal>
            {BOOK.description}
          </p>

          <dl className="details__meta">
            {BOOK.publication.map((row) => (
              <div key={row.label} className="details__row" data-reveal>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
