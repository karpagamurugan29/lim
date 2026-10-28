import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BOOK } from '../../config/book.config'
import { scrollTo } from '../../lib/smoothScroll'
import './Navigation.css'

const ICONS = {
  // Open book
  story: 'M3 5.5c2.8-1 5.6-1 9 1 3.4-2 6.2-2 9-1V19c-2.8-1-5.6-1-9 1-3.4-2-6.2-2-9-1zM12 6.5V20',
  // Closed book / cover
  details: 'M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM4 18a2 2 0 0 1 2-2h12',
  // Ringed planet
  worlds: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM3.5 15.5c-1.6 2 .1 3 4 2.2 3.3-.7 7.4-2.6 10.6-4.9 3.6-2.6 4.6-4.9 2.4-5.4',
  // Four-point star
  about: 'M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z',
}

// `tab` is the shorter label used by the phone tab bar.
const LINKS = [
  { id: 'story', label: 'Story', tab: 'Story' },
  { id: 'details', label: 'Details', tab: 'Book' },
  { id: 'worlds', label: 'Worlds', tab: 'Worlds' },
  { id: 'about', label: 'About', tab: 'About' },
]

/**
 * Scroll to a section. Pinned sections' DOM positions are unreliable while pinned,
 * so we ask ScrollTrigger for their real start instead.
 */
export function scrollToSection(id) {
  const st = ScrollTrigger.getById(id)
  const el = document.getElementById(id)
  const top = st ? st.start : el ? el.getBoundingClientRect().top + window.scrollY : 0
  scrollTo(top)
}

/**
 * Top bar (all sizes) + app-style bottom tab bar (phones).
 * Everything scroll-driven is applied with classes and styles — scrolling never re-renders.
 */
export default function Navigation() {
  const navRef = useRef(null)
  const tabsRef = useRef(null)

  // Frosted top bar once the page moves; a reading-progress hairline along its edge.
  useEffect(() => {
    const bar = navRef.current.querySelector('.nav__progress')
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        navRef.current?.classList.toggle('is-scrolled', self.scroll() > 40)
        bar.style.transform = `scaleX(${self.progress})`
      },
    })
    return () => st.kill()
  }, [])

  // Highlight the tab of the section in view: the last section whose
  // top has passed 55% of the screen. Measured live, so pinned sections can't confuse it.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id))
    let current = -1
    const update = () => {
      const line = window.innerHeight * 0.55
      let i = 0
      sections.forEach((el, k) => {
        if (el && el.getBoundingClientRect().top <= line) i = k
      })
      if (i === current) return
      current = i
      tabsRef.current?.style.setProperty('--active', i)
      document.querySelectorAll('[data-nav-index]').forEach((el) => {
        el.classList.toggle('is-active', Number(el.dataset.navIndex) === i)
      })
    }
    update()
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update })
    return () => st.kill()
  }, [])

  const go = (id) => (e) => {
    e.preventDefault()
    scrollToSection(id)
  }

  return (
    <>
      <header ref={navRef} className="nav">
        <a href="#story" className="nav__brand" onClick={go('story')} aria-label={`${BOOK.title} — home`}>
          <span className="nav__mark">{BOOK.title}</span>
          <span className="nav__by">{BOOK.author}</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
              {l.label}
            </a>
          ))}
        </nav>

        <span className="nav__progress" aria-hidden="true" />
      </header>

      <nav ref={tabsRef} className="tabbar" aria-label="Sections">
        <span className="tabbar__pill" aria-hidden="true" />
        {LINKS.map((l, i) => (
          <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} className="tabbar__tab" data-nav-index={i}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d={ICONS[l.id]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{l.tab}</span>
          </a>
        ))}
      </nav>
    </>
  )
}
