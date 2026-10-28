import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BOOK } from '../../config/book.config'
import { scrollToSection } from '../Navigation'
import './FinalCTA.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Final frame. Minimal: one line, one button, the book at the centre.
 * The section "lands" — headline letters settle, the book rises into place,
 * and the soft light behind it opens up as the reader arrives.
 */
export default function FinalCTA() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 60%', once: true },
        defaults: { ease: 'power3.out' },
      })
      tl.from('.cta__char', { yPercent: 100, autoAlpha: 0, filter: 'blur(6px)', duration: 1.2, stagger: 0.035 })
        .from('.cta__book', { y: 80, autoAlpha: 0, scale: 0.94, duration: 1.8, ease: 'expo.out' }, 0.3)
        .from('.cta__actions > *', { y: 20, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.8)

      // Light behind the book swells as the section scrolls fully into view.
      gsap.fromTo(
        '.cta__halo',
        { scale: 0.6, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'center center', scrub: true },
        }
      )

      gsap.to('.cta__book-float', { y: -12, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, ref)
    return () => ctx.revert()
  }, [])

  const onCta = (e) => {
    if (BOOK.ctaHref.startsWith('#')) {
      e.preventDefault()
      scrollToSection(BOOK.ctaHref.slice(1))
    }
  }

  const headline = 'Turn the page.'

  return (
    <section className="cta" ref={ref}>
      <h2 className="cta__title" aria-label={headline}>
        {headline.split('').map((ch, i) => (
          <span key={i} className="cta__char-mask" aria-hidden="true">
            <span className="cta__char">{ch === ' ' ? ' ' : ch}</span>
          </span>
        ))}
      </h2>

      <div className="cta__book">
        <span className="cta__halo" aria-hidden="true" />
        <div className="cta__book-float">
          <img src={BOOK.cover} alt="" width="796" height="1176" loading="lazy" decoding="async" />
        </div>
      </div>

      <div className="cta__actions">
        <a className="btn" href={BOOK.ctaHref} onClick={onCta}>
          <span className="btn__label">Explore the Book</span>
          <span className="btn__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 12h15m-5-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
          </span>
        </a>
        <p className="cta__note">
          {BOOK.title} — {BOOK.subtitle}
        </p>
      </div>

      <footer className="cta__footer">
        <span>© {new Date().getFullYear()} {BOOK.author}</span>
        <span>{BOOK.tagline}</span>
      </footer>
    </section>
  )
}
