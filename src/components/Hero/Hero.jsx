import { BOOK } from '../../config/book.config'
import './Hero.css'

/**
 * Hero — the opening frame of the story.
 * It is rendered *inside* the pinned story stage, layered over the canvas,
 * so the closed book on screen is the very first frame of the scroll animation
 * (one continuous shot, no cut between "hero" and "story").
 * Its intro and exit are driven by StorySection's timelines.
 */
export default function Hero() {
  return (
    <div className="hero" data-hero>
      <div className="hero__top">
        <p className="hero__kicker" data-hero-line>
          {BOOK.tagline} <span className="hero__sep">·</span> {BOOK.author}
        </p>
        <h1 className="hero__title" data-hero-line>
          Some books are read. <em>This one is entered.</em>
        </h1>
      </div>

      <div className="hero__scroll" data-hero-line>
        <span>Scroll to explore</span>
        <i className="hero__scroll-line" aria-hidden="true" />
      </div>
    </div>
  )
}
