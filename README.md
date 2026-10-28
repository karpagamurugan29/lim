# LIM — At the Limits of Reality

A cinematic, scroll-driven book launch site. React + GSAP ScrollTrigger + HTML Canvas.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
```

## 1. Add your frames (the only required step)

Copy your whole frame sequence into:

```
src/assets/frames/
```

That's it — frames are discovered automatically and ordered by the **last number in the file name**
(`ezgif-frame-001.jpg … ezgif-frame-240.jpg` works as-is). The folder currently holds one frame
(`ezgif-frame-240.jpg`) as a placeholder, so the site runs before you add the rest.

Expected sequence: frame 1 closed → opening → pages turning → closing → last frame closed.

### Recommended: convert to WebP first
JPG works, but WebP is ~30–50% smaller. With ffmpeg, straight from your source video:

```bash
ffmpeg -i book.mp4 -vf "scale=1280:-2" -c:v libwebp -quality 78 src/assets/frames/frame-%03d.webp
```

…or from existing JPGs (with `cwebp` installed):

```bash
for f in src/assets/frames/*.jpg; do cwebp -q 78 "$f" -o "${f%.jpg}.webp" && rm "$f"; done
```

Keep only one format in the folder. 1280px wide is plenty — the canvas is never wider than the screen.

## 2. Tune the animation — `src/config/frames.config.js`

| Setting | What it does |
|---|---|
| `scrollLength` | Length of the pinned story in viewport heights (default 6). Higher = slower. |
| `scrub` | Smoothing in seconds between scroll and frame (default 0.9). |
| `playFrom` / `playTo` | Where in the pinned scroll the frames play; the gaps hold the closed book. |
| `focus` | The part of each frame that must always be visible (fractions). If your open spread is wider than ~60% of the frame, increase `w` and lower `x`. |
| `mobileFrameStep` | Phones load every Nth frame (default 2) to save memory. |
| `STAGE_INSETS` | Space kept clear around the book per breakpoint — this is what keeps text off the book. |
| `MANUAL_FRAMES` | Use an explicit URL list instead of the folder (e.g. frames on a CDN or in `/public`). |

## 3. Content — `src/config/book.config.js`

Title, author, description, publication details, CTA link, and the five **story beats**.
Each beat has `start`/`end` (0–1 positions in the pinned scroll): nudge them so each line appears
exactly when your frames reach that moment. Fields marked ✎ are placeholders.

## How it works

- **`BookFrameAnimation`** — a canvas component with an imperative `setProgress(0–1)` API.
  No React state; paints are batched with `requestAnimationFrame` and only happen when the frame
  index changes. Frames load coarse-to-fine (first, last, every 32nd, 16th…) so the whole range is
  scrubbable almost immediately; a not-yet-loaded frame falls back to the nearest loaded one.
  A pre-rendered vignette dissolves the frame's studio backdrop into the page background.
  Images are released and loads cancelled on unmount.
- **`StorySection`** — one pinned stage, one scrubbed GSAP timeline whose duration is exactly 1,
  so every position equals a scroll fraction. That single timeline drives the frames, the hero exit,
  every text beat and the hand-off, so nothing can drift out of sync.
- **`Hero`** sits inside the pinned stage: the closed book in the hero *is* frame 1 — one continuous shot.
- All GSAP work lives in `gsap.context()`; `ctx.revert()` on unmount kills every ScrollTrigger.

```
src/
  components/  BookFrameAnimation  Hero  StorySection  BookDetails  AboutBook  FinalCTA  Navigation  Preloader
  config/      frames.config.js  book.config.js
  assets/      frames/  images/book-cover.webp
  styles/      global.css
```
