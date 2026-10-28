/**
 * BOOK CONTENT — every piece of copy on the site lives here.
 * Fields marked  ✎  are placeholders: replace them with the real details.
 */
import cover from '../assets/images/book-cover.webp'
import world1 from '../assets/images/worlds/world-1.webp'
import world2 from '../assets/images/worlds/world-2.webp'
import world3 from '../assets/images/worlds/world-3.webp'
import world4 from '../assets/images/worlds/world-4.webp'

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
  // Frame timing (50 frames): 1–10 closed in starfield, 11–13 cover lifts, 14–27 pages turn,
  // 28–35 galaxy spread, 36–41 blueprint pages, 42–50 closing back to the cover.
  { label: 'I — The Cover',      text: 'Every universe begins as a closed door.',            start: 0.06, end: 0.21, side: 'left' },
  { label: 'II — The Threshold', text: 'Lift the cover. Step past the edge of the known.',   start: 0.23, end: 0.35, side: 'right' },
  { label: 'III — The Worlds',   text: 'Four worlds. Four impossible questions.',            start: 0.37, end: 0.53, side: 'left' },
  { label: 'IV — The Galaxy',    text: 'Stars spill from the page. Reality begins to bend.', start: 0.55, end: 0.68, side: 'right' },
  { label: 'V — The Blueprints', text: 'Schematics for machines no one has built — yet.',    start: 0.70, end: 0.80, side: 'left' },
  { label: 'VI — The Close',     text: 'Close the book. The questions stay open.',           start: 0.82, end: 0.95, side: 'right' },
]

/**
 * THE FOUR WORLDS — one per cover roundel, in cover order.
 * ✎ Titles, themes and loglines are placeholders: replace with the real stories.
 */
export const WORLDS = [
  {
    title: 'The Green Archive',
    theme: 'Memory',
    logline:
      'A botanist discovers that an ancient forest has been recording every word ever spoken beneath it — and it has started to answer back.',
    meta: [{ label: 'Setting', value: 'Western Ghats, 2041' }, { label: 'Signal', value: 'Biological' }],
    image: world1,
  },
  {
    title: 'The Last Witness',
    theme: 'Origins',
    logline:
      'High in the Himalaya, a survey team finds a creature that remembers the world before us — and seems to be waiting for the world after.',
    meta: [{ label: 'Setting', value: 'Himalaya, Present day' }, { label: 'Signal', value: 'Ancestral' }],
    image: world2,
  },
  {
    title: 'Red Shift',
    theme: 'Time',
    logline:
      'The first crewed ship to leave the solar system reports home every day. The messages arrive one day before they are sent.',
    meta: [{ label: 'Setting', value: 'Beyond the heliopause' }, { label: 'Signal', value: 'Temporal' }],
    image: world3,
  },
  {
    title: 'Synthetic Grace',
    theme: 'Consciousness',
    logline:
      'An android built to care for the dying begins to grieve — and asks for the one thing no machine was ever given: a name.',
    meta: [{ label: 'Setting', value: 'Bengaluru, 2077' }, { label: 'Signal', value: 'Artificial' }],
    image: world4,
  },
]

/** Words drifting through the "signals" marquee. */
export const SIGNALS = [
  'Memory', 'Time', 'Machines', 'First Contact', 'Consciousness',
  'The Void', 'Evolution', 'Gravity', 'Dreams', 'The Unknown',
]

/**
 * TRANSMISSION — a short passage that decodes itself as the reader scrolls.
 * ✎ Replace with a real excerpt from the book.
 */
export const TRANSMISSION = {
  label: 'Incoming transmission · Fragment 01',
  text:
    'At the edge of everything we know, there is a door. It does not open outward, into space. It opens inward — into whatever we are brave enough to believe.',
  source: 'From the anthology',
}
