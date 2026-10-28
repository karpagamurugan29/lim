import { useCallback, useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navigation from './components/Navigation'
import StorySection from './components/StorySection'
import BookDetails from './components/BookDetails'
import AboutBook from './components/AboutBook'
import FinalCTA from './components/FinalCTA'
import Preloader from './components/Preloader'
import Starfield from './components/Starfield'
import Worlds from './components/Worlds'
import Signals from './components/Signals'
import Transmission from './components/Transmission'
import { scrollTo, stopScroll, startScroll } from './lib/smoothScroll'

/**
 * Page order — one continuous shot:
 *   [Story: hero → open → read → close]  →  Details  →  Worlds  →  Signals
 *   →  Transmission  →  About  →  Turn the page.
 * A fixed starfield sits behind every section.
 */
export default function App() {
  const loader = useRef(null)

  useEffect(() => {
    // Always start at the closed book.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    scrollTo(0, { immediate: true })
    stopScroll()
    document.documentElement.classList.add('is-loading')

    // Never hold the visitor hostage on a slow connection.
    const failsafe = setTimeout(() => reveal(), 7000)

    // Fonts change line heights → recompute trigger positions once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => clearTimeout(failsafe)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reveal = useCallback(() => {
    document.documentElement.classList.remove('is-loading')
    startScroll()
    loader.current?.hide()
    ScrollTrigger.refresh()
  }, [])

  const onLoadProgress = useCallback((p) => loader.current?.progress(p), [])

  return (
    <>
      <Preloader ref={loader} />
      <Starfield />
      <Navigation />
      <main>
        <StorySection onLoadProgress={onLoadProgress} onReady={reveal} />
        <BookDetails />
        <Worlds />
        <Signals />
        <Transmission />
        <AboutBook />
        <FinalCTA />
      </main>
    </>
  )
}
