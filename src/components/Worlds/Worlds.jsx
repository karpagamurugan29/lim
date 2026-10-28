import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WORLDS, ACCENTS } from '../../config/book.config'
import './Worlds.css'

gsap.registerPlugin(ScrollTrigger)

const pad = (n) => String(n).padStart(2, '0')

/**
 * The Four Worlds
 * ───────────────
 * Desktop: the section pins and the reader travels sideways through four
 * planets — each roundel from the cover, lit in its own colour.
 *   • the track moves with scroll (scrubbed, so it glides)
 *   • each planet drifts and rotates against the track (parallax depth)
 *   • text arrives as its world slides into view
 * Tablet/mobile: a vertical sequence with the same reveals.
 */
export default function Worlds() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const root = ref.current
    const mm = gsap.matchMedia()
    const q = (sel) => root.querySelectorAll(sel)

    mm.add('(min-width: 1100px)', () => {
      const track = root.querySelector('.worlds__track')
      const bar = gsap.quickSetter(root.querySelector('.worlds__progress-fill'), 'scaleX')
      const count = root.querySelector('.worlds__count-current')
      const dist = () => track.scrollWidth - window.innerWidth

      const travel = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          id: 'worlds',
          trigger: root.querySelector('.worlds__pin'),
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            bar(self.progress)
            if (count) count.textContent = pad(Math.min(WORLDS.length, Math.floor(self.progress * WORLDS.length) + 1))
          },
        },
      })

      q('.world').forEach((panel) => {
        const st = { trigger: panel, containerAnimation: travel, scrub: true }
        gsap.fromTo(
          panel.querySelector('.world__planet'),
          { xPercent: 14, rotate: -18, scale: 0.82 },
          { xPercent: -14, rotate: 18, scale: 1.04, ease: 'none', scrollTrigger: { ...st, start: 'left right', end: 'right left' } }
        )
        gsap.fromTo(
          panel.querySelector('.world__num'),
          { xPercent: -30 },
          { xPercent: 30, ease: 'none', scrollTrigger: { ...st, start: 'left right', end: 'right left' } }
        )
        gsap.fromTo(
          panel.querySelectorAll('[data-w]'),
          { autoAlpha: 0, y: 50, filter: 'blur(10px)' },
          {
            autoAlpha: 1, y: 0, filter: 'blur(0px)', stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { ...st, start: 'left 80%', end: 'left 35%' },
          }
        )
      })
    })

    mm.add('(max-width: 1099px)', () => {
      q('.world').forEach((panel) => {
        gsap.from(panel.querySelector('.world__planet'), {
          autoAlpha: 0, scale: 0.7, rotate: -25, duration: 1.6, ease: 'expo.out',
          scrollTrigger: { trigger: panel, start: 'top 80%', once: true },
        })
        gsap.from(panel.querySelectorAll('[data-w]'), {
          autoAlpha: 0, y: 36, filter: 'blur(8px)', duration: 1.1, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: panel, start: 'top 70%', once: true },
        })
      })
    })

    // Intro text, all sizes.
    const intro = gsap.from(q('.worlds__intro [data-reveal]'), {
      autoAlpha: 0, y: 40, filter: 'blur(8px)', duration: 1.3, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: root, start: 'top 70%', once: true },
    })

    return () => {
      intro.scrollTrigger?.kill()
      intro.kill()
      mm.revert()
    }
  }, [])

  // Cursor-following light on each world (CSS variables, no re-render).
  const onMove = (e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section id="worlds" ref={ref} className="worlds" aria-label="The four worlds">
      <div className="worlds__pin">
        <div className="worlds__track">
          <header className="worlds__intro">
            <p className="eyebrow" data-reveal>The Anthology</p>
            <h2 className="worlds__title" data-reveal>
              Four worlds.
              <br />
              <em>One edge.</em>
            </h2>
            <p className="worlds__lede" data-reveal>
              Every story in LIM is a separate universe, with its own rules and its own impossible question.
              Travel through them.
            </p>
            <span className="worlds__hint" data-reveal aria-hidden="true">
              Scroll to travel <i />
            </span>
          </header>

          {WORLDS.map((world, i) => (
            <article
              key={world.title}
              className="world"
              style={{ '--c': ACCENTS[i % ACCENTS.length] }}
              onPointerMove={onMove}
            >
              <span className="world__num" aria-hidden="true">{pad(i + 1)}</span>

              <div className="world__visual">
                <div className="world__planet">
                  <span className="world__orbit world__orbit--a" aria-hidden="true"><i /></span>
                  <span className="world__orbit world__orbit--b" aria-hidden="true"><i /></span>
                  <span className="world__atmo" aria-hidden="true" />
                  <figure className="world__sphere">
                    <img src={world.image} alt="" width="168" height="168" loading="lazy" decoding="async" />
                  </figure>
                </div>
              </div>

              <div className="world__body">
                <p className="world__index" data-w>
                  World {pad(i + 1)} <span>/ {pad(WORLDS.length)}</span>
                </p>
                <h3 className="world__title" data-w>{world.title}</h3>
                <p className="world__theme" data-w>
                  <i /> {world.theme}
                </p>
                <p className="world__logline" data-w>{world.logline}</p>
                <dl className="world__meta" data-w>
                  {world.meta.map((m) => (
                    <div key={m.label}>
                      <dt>{m.label}</dt>
                      <dd>{m.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
        </div>

        <div className="worlds__chrome" aria-hidden="true">
          <span>
            <span className="worlds__count-current">01</span> / {pad(WORLDS.length)}
          </span>
          <span className="worlds__progress">
            <span className="worlds__progress-fill" />
          </span>
        </div>
      </div>
    </section>
  )
}
