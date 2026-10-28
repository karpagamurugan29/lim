import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lenis } from '../../lib/smoothScroll'
import './Starfield.css'

/**
 * Starfield
 * ─────────
 * A fixed, full-screen 3D star volume behind every section.
 *  • Stars live in real 3D space and are perspective-projected, so near stars
 *    move faster and glow larger than far ones (true parallax, not layers).
 *  • Scroll velocity (from Lenis) pushes the camera through the volume:
 *    a fast flick stretches stars into warp streaks, then they settle.
 *  • Star colours follow real stellar temperatures (blue-white → white → warm).
 *  • Occasional shooting stars; the pointer tilts the camera slightly.
 * Pauses while the pinned story covers the screen and when the tab is hidden.
 */
const TINTS = ['205,225,255', '235,242,255', '255,255,255', '255,240,220', '170,205,255']
const DEPTH = 1600

export default function Starfield() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0, h = 0, dpr = 1, raf = 0
    let stars = []
    let speed = 0                  // camera speed along z, eased toward scroll velocity
    const cam = { x: 0, y: 0, tx: 0, ty: 0 }
    const meteors = []
    let nextMeteor = performance.now() + 3000

    const spawn = (s, z = Math.random() * DEPTH) => {
      s.x = (Math.random() - 0.5) * w * 2.4
      s.y = (Math.random() - 0.5) * h * 2.4
      s.z = z
      s.pz = z
      s.size = Math.random() ** 3 * 1.8 + 0.35
      s.tint = TINTS[(Math.random() * TINTS.length) | 0]
      s.tw = Math.random() * Math.PI * 2
      s.tws = 0.6 + Math.random() * 2.2
      return s
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min((w * h) / 3200, 520))
      stars = Array.from({ length: count }, () => spawn({}))
    }

    // Perspective projection; nearer stars shift more with the pointer (parallax).
    const FOCAL = DEPTH * 0.45
    const project = (x, y, z) => {
      const k = FOCAL / Math.max(z, 1)
      const near = 1 - z / DEPTH
      return [w / 2 + x * k - cam.x * 40 * near, h / 2 + y * k - cam.y * 40 * near]
    }

    const story = () => ScrollTrigger.getById('story')

    const draw = (now) => {
      raf = requestAnimationFrame(draw)

      // Skip work while the pinned story canvas covers the whole viewport.
      const st = story()
      if (st && st.isActive && st.progress < 0.96) return

      const v = lenis ? lenis.velocity : 0
      const target = 0.35 + Math.min(Math.abs(v), 60) * 1.1
      speed += (target - speed) * 0.06
      cam.x += (cam.tx - cam.x) * 0.04
      cam.y += (cam.ty - cam.y) * 0.04
      const t = now / 1000
      const streak = speed > 4

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      for (const s of stars) {
        s.pz = s.z
        s.z -= speed * (v < 0 ? -1 : 1)
        if (s.z < 1) spawn(s, DEPTH)
        else if (s.z > DEPTH) spawn(s, 1 + Math.random() * 40)

        const [x, y] = project(s.x, s.y, s.z)
        if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue

        const near = 1 - s.z / DEPTH
        const twinkle = 0.65 + 0.35 * Math.sin(t * s.tws + s.tw)
        const alpha = Math.min(1, near * near * 1.6 + 0.08) * twinkle
        const r = s.size * (0.4 + near * 1.6)

        if (streak) {
          const [px, py] = project(s.x, s.y, s.pz)
          ctx.strokeStyle = `rgba(${s.tint},${alpha})`
          ctx.lineWidth = r
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(x, y)
          ctx.stroke()
        } else {
          ctx.fillStyle = `rgba(${s.tint},${alpha})`
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
          // Bright, near stars get a soft halo and a faint diffraction cross.
          if (r > 1.6) {
            ctx.fillStyle = `rgba(${s.tint},${alpha * 0.12})`
            ctx.beginPath()
            ctx.arc(x, y, r * 4, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = `rgba(${s.tint},${alpha * 0.35})`
            ctx.fillRect(x - r * 6, y - 0.4, r * 12, 0.8)
            ctx.fillRect(x - 0.4, y - r * 6, 0.8, r * 12)
          }
        }
      }

      // Shooting stars.
      if (now > nextMeteor) {
        nextMeteor = now + 4000 + Math.random() * 7000
        const fromLeft = Math.random() < 0.5
        meteors.push({
          x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
          y: Math.random() * h * 0.4,
          vx: (fromLeft ? 1 : -1) * (9 + Math.random() * 6),
          vy: 3 + Math.random() * 3,
          life: 1,
        })
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.x += m.vx
        m.y += m.vy
        m.life -= 0.014
        if (m.life <= 0) { meteors.splice(i, 1); continue }
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14)
        g.addColorStop(0, `rgba(230,244,255,${m.life})`)
        g.addColorStop(1, 'rgba(143,211,255,0)')
        ctx.strokeStyle = g
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'
    }

    const onPointer = (e) => {
      cam.tx = (e.clientX / w - 0.5) * 2
      cam.ty = (e.clientY / h - 0.5) * 2
    }
    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduced) raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    if (reduced) {
      // One still frame — a calm sky, no motion.
      speed = 0
      draw(0)
      cancelAnimationFrame(raf)
    } else {
      raf = requestAnimationFrame(draw)
    }

    // Nebula clouds drift very slowly — depth behind the stars.
    const drift = reduced
      ? null
      : gsap.to('.cosmos__nebula', {
          xPercent: (i) => (i % 2 ? -8 : 8),
          yPercent: (i) => (i % 2 ? 6 : -6),
          rotate: (i) => (i % 2 ? -10 : 10),
          duration: 26,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: 4,
        })

    return () => {
      cancelAnimationFrame(raf)
      drift?.kill()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div className="cosmos" aria-hidden="true">
      <span className="cosmos__nebula cosmos__nebula--a" />
      <span className="cosmos__nebula cosmos__nebula--b" />
      <span className="cosmos__nebula cosmos__nebula--c" />
      <canvas ref={ref} className="cosmos__stars" />
    </div>
  )
}
