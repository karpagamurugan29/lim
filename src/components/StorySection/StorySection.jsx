import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BookFrameAnimation from '../BookFrameAnimation'
import Hero from '../Hero'
import { FRAMES, FRAME_CONFIG, STAGE_INSETS, BREAKPOINTS } from '../../config/frames.config'
import { STORY_BEATS, ACCENTS, BOOK } from '../../config/book.config'
import './StorySection.css'

gsap.registerPlugin(ScrollTrigger)

const currentLayout = () => {
  if (window.matchMedia(BREAKPOINTS.mobile).matches) return 'mobile'
  if (window.matchMedia(BREAKPOINTS.tablet).matches) return 'tablet'
  return 'desktop'
}

// Insets are recalculated on every resize, so rotating a tablet just works.
const insetsFor = (w, h) => STAGE_INSETS[currentLayout()](w, h)

// If no frames were added yet, fall back to the cover so the page still works.
const FRAME_LIST = FRAMES.length ? FRAMES : [BOOK.cover]

/**
 * StorySection
 * ────────────
 * One pinned, full-screen stage. A single scrubbed GSAP timeline drives:
 *   1. the canvas frame sequence (via BookFrameAnimation.setProgress)
 *   2. the hero exit
 *   3. each story beat's fade / rise / un-blur, in and out
 *   4. the hand-off into the next section
 * Because everything shares one timeline, text can never drift out of sync with the book.
 */
export default function StorySection({ onLoadProgress, onReady }) {
  const sectionRef = useRef(null)
  const animRef = useRef(null)
  const introPlayed = useRef(false)

  // Decided once per load: phones decode half the frames.
  const frameStep = useMemo(
    () => (window.matchMedia(BREAKPOINTS.mobile).matches ? FRAME_CONFIG.mobileFrameStep : 1),
    []
  )

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hidden until the preloader hands over.
      gsap.set('[data-hero-line]', { autoAlpha: 0, y: 24 })
      gsap.set('.story__stage-inner', { autoAlpha: 0, scale: 1.06 })
      gsap.set('.beat', { autoAlpha: 0 })

      const proxy = { p: 0 }
      const bar = gsap.quickSetter('.story__progress-fill', 'scaleX')
      const counter = sectionRef.current.querySelector('.story__count-current')
      let lastBeat = -1

      /* ── Master timeline ──
       * Timeline time 0 → 1 maps exactly to the pinned scroll distance,
       * so every `position` below is a scroll fraction (same units as STORY_BEATS).
       */
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'story',
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * FRAME_CONFIG.scrollLength}`,
          pin: true,
          // scrub: N  → the playhead eases toward the scroll position over N seconds.
          // This is what turns discrete wheel ticks into smooth, continuous frame playback.
          scrub: FRAME_CONFIG.scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            bar(self.progress)
            const beat = STORY_BEATS.findIndex((b) => self.progress < b.end)
            const n = beat === -1 ? STORY_BEATS.length : beat + 1
            if (n !== lastBeat && counter) {
              counter.textContent = String(n).padStart(2, '0')
              lastBeat = n
            }
          },
        },
      })

      // Lock total duration to 1 so positions == scroll fractions.
      tl.set({}, {}, 1)

      // 1 ─ Frame sequence. A plain number is tweened; the canvas reads it.
      tl.to(
        proxy,
        {
          p: 1,
          duration: FRAME_CONFIG.playTo - FRAME_CONFIG.playFrom,
          onUpdate: () => animRef.current?.setProgress(proxy.p),
        },
        FRAME_CONFIG.playFrom
      )

      // 2 ─ Hero drifts up and dissolves as the first scroll begins.
      tl.to('[data-hero]', { autoAlpha: 0, y: -50, filter: 'blur(8px)', duration: 0.06, ease: 'power1.in' }, 0.005)
      tl.fromTo('.story__chrome', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.05)

      // 3 ─ Story beats: rise + un-blur in, lift + blur out.
      const FADE = 0.035
      STORY_BEATS.forEach((beat, i) => {
        const el = `.beat[data-index="${i}"]`
        tl.fromTo(
          el,
          { autoAlpha: 0, y: 36, filter: 'blur(10px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: FADE, ease: 'power2.out' },
          beat.start
        )
        tl.fromTo(
          `${el} .beat__rule`,
          { scaleX: 0 },
          { scaleX: 1, duration: FADE * 1.5, ease: 'power2.out' },
          beat.start + FADE * 0.3
        )
        tl.to(
          el,
          { autoAlpha: 0, y: -30, filter: 'blur(8px)', duration: FADE, ease: 'power2.in' },
          beat.end - FADE
        )
      })

      // 4 ─ Hand-off: the stage recedes as the details section approaches.
      tl.to('.story__chrome', { autoAlpha: 0, duration: 0.03 }, 0.965)
      // A page-coloured curtain (not opacity on the canvas) so no edge can show.
      tl.fromTo('.story__curtain', { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.04, ease: 'power1.in' }, 0.96)
    }, sectionRef)

    // gsap.context().revert() kills this ScrollTrigger + timeline and restores inline styles.
    return () => ctx.revert()
  }, [])

  // Cinematic entrance, played once when the first frames are decoded.
  const handleReady = () => {
    onReady?.()
    if (introPlayed.current) return
    introPlayed.current = true
    gsap
      .timeline({ delay: 0.35 })
      .to('.story__stage-inner', { autoAlpha: 1, scale: 1, duration: 2.2, ease: 'expo.out' })
      .to('[data-hero-line]', { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.14, ease: 'power3.out' }, 0.5)
  }

  return (
    <section id="story" ref={sectionRef} className="story" aria-label="The story of the book">
      <div className="story__stage">
        <div className="story__stage-inner">
          <BookFrameAnimation
            ref={animRef}
            frames={FRAME_LIST}
            frameStep={frameStep}
            focus={FRAMES.length ? FRAME_CONFIG.focus : { x: 0, y: 0, w: 1, h: 1 }}
            insets={insetsFor}
            background={FRAME_CONFIG.background}
            nativeWidth={FRAME_CONFIG.nativeWidth}
            nativeHeight={FRAME_CONFIG.nativeHeight}
            initialBatch={FRAME_CONFIG.initialBatch}
            onLoadProgress={onLoadProgress}
            onReady={handleReady}
          />
        </div>
        <div className="story__curtain" aria-hidden="true" />
      </div>

      <Hero />

      {/* Story beats — positioned in reserved bands that the book never enters */}
      <div className="story__beats">
        {STORY_BEATS.map((beat, i) => (
          <div key={i} className="beat" data-index={i} data-side={beat.side}>
            <span className="beat__label" style={{ '--beat-accent': ACCENTS[i % ACCENTS.length] }}>
              {beat.label}
            </span>
            <i className="beat__rule" aria-hidden="true" />
            <p className="beat__text">{beat.text}</p>
          </div>
        ))}
      </div>

      {/* Chapter progress */}
      <div className="story__chrome" aria-hidden="true">
        <span className="story__count">
          <span className="story__count-current">01</span>
          <span className="story__count-total"> / {String(STORY_BEATS.length).padStart(2, '0')}</span>
        </span>
        <span className="story__progress">
          <span className="story__progress-fill" />
        </span>
      </div>
    </section>
  )
}
