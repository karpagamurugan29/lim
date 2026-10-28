/**
 * BOOK CONTENT — every piece of copy on the site lives here.
 * Fields marked  ✎  are placeholders: replace them with the real details.
 */
import cover from '../assets/images/book-cover.webp'

export const BOOK = {
  title: 'LIM',
  subtitle: 'At the Limits of Reality',
  author: 'Sharadh Jaitra',
  category: 'Science Fiction · Anthology',
  tagline: 'A sci-fi anthology series',
  cover,

  // ✎ Replace with the real blurb
  description:
    'Four worlds. Four impossible questions. LIM gathers stories that live at the edge of what we know — where memory bends, machines dream, and the line between the possible and the real begins to blur.',

  // ✎ Short paragraph under the large "More than a book." statement
  about:
    'Each story in LIM begins with a question we were never supposed to ask — and follows it to the edge of the possible. Read them in order, or let one find you.',

  // ✎ Replace with the real publication details
  publication: [
    { label: 'Author', value: 'Sharadh Jaitra' },
    { label: 'Genre', value: 'Science Fiction Anthology' },
    { label: 'Format', value: 'Hardcover · eBook' },
    { label: 'Publisher', value: 'Publisher name' },
    { label: 'Published', value: '2026' },
    { label: 'ISBN', value: '000-0-00-000000-0' },
  ],

  // ✎ Where "Explore the Book" goes
  ctaHref: '#details',
}

/**
 * The four cover roundels — used sparingly as accents.
 * Sampled from the cover artwork.
 */
export const ACCENTS = ['#7FC9A0', '#E5B94A', '#E89AB8', '#3FC3E6']

/**
 * STORY BEATS — text revealed during the pinned book animation.
 * `start` / `end` are positions in the pinned scroll (0 → 1).
 * Tune them to line up with the moments in your frame sequence.
 * `side` is used on desktop only (tablet/mobile use a bottom band).
 */
export const STORY_BEATS = [
  // Frame timing (67 frames): 1–17 closed/turning, 18–22 opening, 23–52 pages turning, 53–58 closing, 59–67 closed.
  { label: 'I — The Cover',     text: 'Every universe begins as a closed door.',     start: 0.06, end: 0.22, side: 'left' },
  { label: 'II — The Threshold', text: 'Lift the cover. Leave the familiar behind.', start: 0.24, end: 0.36, side: 'right' },
  { label: 'III — The Worlds',   text: 'Four worlds. Four impossible questions.',     start: 0.39, end: 0.54, side: 'left' },
  { label: 'IV — The Pages',    text: 'Each page bends what you believed was real.', start: 0.57, end: 0.73, side: 'right' },
  { label: 'V — The Close',      text: 'Close the book. The questions stay open.',    start: 0.77, end: 0.95, side: 'left' },
]
