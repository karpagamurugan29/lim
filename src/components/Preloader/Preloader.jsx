import { forwardRef, useImperativeHandle, useRef } from 'react'
import { gsap } from 'gsap'
import { BOOK } from '../../config/book.config'
import './Preloader.css'

/**
 * Minimal preloader shown while the first batch of frames decodes.
 * Controlled imperatively (progress / hide) so loading never re-renders the app.
 */
const Preloader = forwardRef(function Preloader(_, ref) {
  const root = useRef(null)
  const fill = useRef(null)
  const hidden = useRef(false)

  useImperativeHandle(ref, () => ({
    progress(p) {
      if (fill.current) gsap.to(fill.current, { scaleX: p, duration: 0.4, ease: 'power2.out', overwrite: true })
    },
    hide() {
      if (hidden.current || !root.current) return
      hidden.current = true
      gsap
        .timeline()
        .to(fill.current, { scaleX: 1, duration: 0.3, ease: 'power2.out', overwrite: true })
        .to(root.current.children, { autoAlpha: 0, y: -12, duration: 0.6, ease: 'power2.in', stagger: 0.05 })
        .to(root.current, { autoAlpha: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.2')
        .set(root.current, { display: 'none' })
    },
  }))

  return (
    <div ref={root} className="preloader" role="status" aria-label="Loading">
      <span className="preloader__mark">{BOOK.title}</span>
      <span className="preloader__bar">
        <span ref={fill} className="preloader__fill" />
      </span>
    </div>
  )
})

export default Preloader
