import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BOOK } from '../../config/book.config'
import { scrollTo, stopScroll, startScroll } from '../../lib/smoothScroll'
import './Navigation.css'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'story', label: 'Story' },
  { id: 'details', label: 'Details' },
]

/**
 * Scroll to a section. The story section is pinned, so its DOM position
 * is unreliable while pinned — we ask ScrollTrigger for its real start instead.
 */
export function scrollToSection(id) {
  const st = ScrollTrigger.getById(id)
  const el = document.getElementById(id)
  const top = st ? st.start : el ? el.getBoundingClientRect().top + window.scrollY : 0
  scrollTo(top)
}

export default function Navigation() {
  const navRef = useRef(null)
  const [open, setOpen] = useState(false)

  // Transparent at the top; a soft frosted bar once the page moves.
  // Toggled with a class (no React state) so scrolling never re-renders.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => navRef.current?.classList.toggle('is-scrolled', self.scroll() > 40),
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    open ? stopScroll() : startScroll()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    scrollToSection(id)
  }

  return (
    <header ref={navRef} className={`nav ${open ? 'is-open' : ''}`}>
      <a href="#story" className="nav__brand" onClick={go('story')} aria-label={`${BOOK.title} — home`}>
        <span className="nav__mark">{BOOK.title}</span>
        <span className="nav__by">{BOOK.author}</span>
      </a>

      <nav className="nav__links" aria-label="Primary">
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={go(l.id)}>
            {l.label}
          </a>
        ))}
      </nav>

      <button
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="nav-sheet"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>

      <div id="nav-sheet" className="nav__sheet" aria-hidden={!open}>
        {LINKS.map((l, i) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            onClick={go(l.id)}
            tabIndex={open ? 0 : -1}
            style={{ '--i': i }}
          >
            <span className="nav__sheet-num">0{i + 1}</span>
            {l.label}
          </a>
        ))}
      </div>
    </header>
  )
}
