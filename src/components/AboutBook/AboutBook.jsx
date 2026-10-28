import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BOOK } from '../../config/book.config'
import './AboutBook.css'

gsap.registerPlugin(ScrollTrigger)

// Each inner array is one line; words are animated individually.
const LINES = [
  ['More', 'than', 'a', 'book.'],
  ['A', 'journey', 'through', 'ideas,'],
  ['stories', 'and', '<em>imagination.</em>'],
]

const BODY = BOOK.about

/**
 * Large editorial statement. Words are revealed with a scrubbed stagger,
 * so the sentence "writes itself" as the reader scrolls — then holds.
 */
export default function AboutBook() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Words: rise from below a mask, un-blur, brighten — tied to scroll.
      gsap.fromTo(
        '.about__word-inner',
        { yPercent: 110, opacity: 0, filter: 'blur(6px)' },
        {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: '.about__statement', start: 'top 82%', end: 'bottom 55%', scrub: 0.8 },
        }
      )

      gsap.from('.about__aside > *', {
        autoAlpha: 0,
        y: 30,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about__aside', start: 'top 85%', once: true },
      })

      // Quiet horizontal drift on the oversized backdrop numeral (parallax).
      gsap.fromTo(
        '.about__ghost',
        { xPercent: 6 },
        {
          xPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={ref} className="about">
      <span className="about__ghost" aria-hidden="true">LIM</span>

      <p className="eyebrow about__eyebrow">About the book</p>

      <h2 className="about__statement" aria-label="More than a book. A journey through ideas, stories and imagination.">
        {LINES.map((line, i) => (
          <span key={i} className="about__line" aria-hidden="true">
            {line.map((word, j) => (
              <span key={j} className="about__word">
                <span className="about__word-inner" dangerouslySetInnerHTML={{ __html: word }} />
              </span>
            ))}
          </span>
        ))}
      </h2>

      <div className="about__aside">
        <span className="about__rule" />
        <p>{BODY}</p>
      </div>
    </section>
  )
}
