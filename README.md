# Design Point Studio

Static site built from the DPS Figma comps. Plain HTML, CSS and JavaScript — no framework, no build step, no dependencies.

## Running it

Opening `index.html` straight off disk works — the layout, images and hero video all render. But browsers refuse to load ES modules over `file://`, so the slider, mobile menu, accordion, scroll reveals and form validation stay inert until the folder is served:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>.

## Structure

```
index.html            Home
about.html            About
projects.html         Projects grid
project-details.html  Single project (Amalilia Nile Cruise)
archive.html          Blog listing
archive-details.html  Single post
dps-archive.html      DPS Archive listing
dps-archive-item.html Single archive item
careers.html          Careers + application form
contact.html          Contact + enquiry form

css/reset.css         normalisation, focus rings, reduced-motion guard
css/tokens.css        @font-face + every colour, size, duration and easing
css/base.css          typography, layout primitives, the split heading, reveal
css/components.css    header, nav, buttons, media, cards, forms, footer
css/pages.css         per-page sections

js/nav.js             dropdown, mobile overlay, focus trap, scroll states
js/hero-video.js      pauses the hero video under reduced motion
js/zoom.js            pointer-tracking zoom on the archive item photo
js/reveal.js          IntersectionObserver reveals
js/ui.js              accordion, carousel, load more, form validation
js/main.js            entry point

img/                  photography
fonts/                drop the Sainte Colombe woff2 files here
```

## Fonts

Headings are **Sainte Colombe**, body copy is **Helvetica Neue**. Sainte Colombe is a licensed retail face and is not included. Add these two files:

```
fonts/SainteColombe-Regular.woff2
fonts/SainteColombe-Italic.woff2
```

The `@font-face` rules in `css/tokens.css` already point at those exact names, so the site picks them up with no other change. Until then the stack falls back to Didot → Bodoni MT → Georgia, which holds the same high-contrast character but is noticeably wider — expect line breaks in display headings to shift once the real face is in.

## Design tokens

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#08313C` | nav, headings, body copy on light |
| `--oxblood` | `#60140A` | footer band, buttons, links, accents |
| `--off-white` | `#FCFCFC` | page background |
| `--cream` | `#EFE4D8` | About ethos panel, Careers left panel |
| `--panel` | `#E3D8CD` | form cards |

Nothing is hard-coded — change a token and it propagates.

## The two things worth knowing

**The split heading.** The design's signature is a two-face heading: line one in Helvetica Neue caps, line two in Sainte Colombe italic caps. It's one component, reused on seven headings:

```html
<h2 class="split-head split-head--stack">
  <span class="split-head__a">Be part of something</span>
  <em class="split-head__b">meaningful</em>
</h2>
```

**The header has two variants.** Same markup, one modifier:

- `.site-header--over` — transparent, sits on the hero (home, about, project details, contact)
- `.site-header--solid` — off-white with a hairline (projects, archive, archive details, careers)

The `--over` variant turns solid once a sentinel at the foot of the hero passes behind the bar. Both variants hide on scroll down and return on scroll up. The current page is marked by swapping the link to Sainte Colombe italic rather than changing its colour; a hidden pseudo-element reserves the italic width so the row doesn't shift.

## Home page

The home page runs on the real studio assets:

- **Hero** — `video/home-hero.mp4`, autoplaying muted and looped, with `img/home-hero-poster.jpg` behind it. Under `prefers-reduced-motion: reduce` the video pauses and the poster stands in. If autoplay is blocked by the browser, the poster also stands in.
- **About section** — a four-project gallery at four different sizes, measured off the design: `.insp--a` 280×351 (the only upright, 0.80), `--b` 331×297 (1.116), `--c` 441×305 (1.446, the largest), `--d` 298×271 (1.102). The grid is two halves; each figure carries its own width and left offset as a percentage of its half, so the whole arrangement scales as one piece. Left: The Green Residence (`about-2`), The Heritage House (`slide-3`, **placeholder** — the real photo hasn't been supplied). Right: Down Town (`about-1`), The Courtyard House (`post-chair`). The `✦ INSPIRATION ✦` label and the bold paragraph sit in one block that rests at the section's vertical centre (`align-self: center` across both grid rows) and is pinned with `position: sticky` at `top: calc(50vh - 3.5em)`, so it holds the middle of the screen while the photographs scroll past. Note `grid-template-rows: auto auto` on the grid — without it, `grid-row: 1 / -1` collapses to the first row alone and the block centres in the top half of the section instead of the whole of it. Where a photograph passes beneath them, `mix-blend-mode: exclusion` keeps the words legible: the paragraph is set in white so it renders near-black on the page and light over a dark photograph, and the label's mid-grey holds its tone against either. The paragraph runs at `line-height: 1.28`.

  Beside each project photograph, on the inner side and sitting on its baseline, is the **inspiration source** — `.insp__source`, a 154px square holding the stone, planting or carving the project came from. On hover it scales to 1.69 from its outer bottom corner, so it opens into the empty middle of the section. It is a transform, so nothing reflows and the row keeps its height.

  The four project photographs themselves have **no hover state** and no captions: they hold their sizes and stay still.

  All four source images (`insp-src-1` … `-4`) are **placeholders**, cropped out of photography already in the project. Replace them with the studio's real inspiration shots — same filenames, and update the `width`/`height` attributes.

- **Project type stack** — four full-viewport panels (Residential Projects, Commercial Projects, Installations, Events) sitting directly after the about section. Each panel is `position: sticky; top: 0`, so the next one rides up and covers the one before it instead of pushing it away. Pure CSS, no JavaScript. Each panel holds the screen alone for `--dwell` (25svh) of scrolling before the next covers it — change that one value on `.stack` to make the sequence quicker or slower.
- **Featured tiles** — `proj-amalilia`, `proj-glc-cdw`, `proj-palm-hills` (individual projects, below the type stack).
- **Collaboration** — `collab-scenehome`, `collab-suez`.
- **Archive** — `post-stairs`, `post-gff`, `post-chair`, shared with the archive pages.

The four type panels reuse `slide-1` … `slide-4`. Swap an image or retitle a panel by editing its `<a class="stack__panel">` block in `index.html`; adding a fifth type is one more block.

## Images — read this before going live

The **home page** now uses supplied originals. Everything else — About, Projects, Project Details, Archive, Careers, Contact — is still cropped out of the Figma PNG exports, with two consequences:

1. **Resolution is capped** at whatever the comps contained. Fine for review, not for production.
2. **Two images are substitutes.** The Contact background and the About "Experience" background had UI baked over the photo in the comps, so both borrow clean interiors from the Project Details export. Swap them for the intended shots.

Crops that sat under baked-in captions were trimmed, so a few tiles are shorter than the originals. Replacing an image only means dropping a file with the same name into `img/` — the `width`/`height` attributes in the markup should be updated to match, since they're there to prevent layout shift.

## Typography notes

The three featured project names on the home page (`.featured__grid .tile__name`) are set in Helvetica Neue Light at up to 34px. The nine tiles on the Projects page keep Helvetica Neue at their smaller size — 45px would wrap badly in a 470px tile. Change `.tile__name` itself rather than the `.featured__grid` override if you want them to match.

## Buttons

At rest a button is a solid cream panel with oxblood italic type. On hover the panel retracts downwards (`scaleY` from a bottom origin), the type flips to cream, and an arrow slides out beside the label — taken frame by frame from the prototype recording, over `--dur-btn` (520ms).

Three custom properties on `.btn` carry the colours, so a new variant is three lines:

```css
.btn--light { --btn-fill: var(--cream); --btn-ink: var(--oxblood); --btn-ink-hover: var(--on-dark); }
```

On a light page there is nothing behind the panel to reveal, so `.btn--oxblood` runs the same vertical wipe in reverse — the panel arrives rather than leaves. Keyboard focus triggers the identical state, and the arrow is a CSS mask on `::after`, so no markup carries it.

## Project tiles

Hovering a tile closes a brand-coloured frame in around the photo over `--dur-tile` (620ms) on `--ease-settle`. It is a `border` animated from `0` to `clamp(9px, 1vw, 15px)`, so the photo is pushed inwards rather than covered, and the tile keeps its footprint in the grid. The photo sits at `scale(1.045)` at rest and eases back to `1` on the same curve, so the frame and the image read as one movement inwards rather than a colour appearing.

Note the `.js .tile.reveal` rule: the tiles also carry `.reveal`, whose `transition` shorthand is more specific and would otherwise replace the tile's own, making the frame snap on instead of close. Any component that combines `.reveal` with its own hover transition needs the same treatment. The five brand accents cycle across the grid with `:nth-child(5n + k)`:

```css
--accent-maroon:   #581B10;
--accent-navy:     #15303B;
--accent-blue:     #C1CDDE;
--accent-charcoal: #433E3A;
--accent-cream:    #EDE4D9;
```

To pin a specific colour to a specific project instead of letting it cycle, set `--tile-accent` on that tile.

## Journal cards

Titles are set in Helvetica Neue Light (`font-weight: 300`) and stay plain. The hover underline sits on `READ MORE` instead, since that is the button — it also fires on `:focus-within`, so keyboard users get the same cue. The same rules drive the three cards on the home page and the grid on the Journal page.

## DPS Archive

Three pieces:

- **The band on the home page** (`.archive-band`) sits below the Journal cards: a full-bleed image, 634px tall, with `DPS ARCHIVE` bottom-left and `EXPLORE NOW →` bottom-right. The whole band is the link.
- **The listing** (`dps-archive.html`) reuses `.projects-grid` and `.tile` unchanged, so the grid, the 470×573 tiles and the brand-colour hover frame are identical to the Projects page by construction rather than by copying values.
- **The item** (`dps-archive-item.html`) is a two-column layout: the photograph left, then title, description, a dimensions table and the buy link. `BUY NOW` carries `target="_blank" rel="noopener noreferrer"` — the purchase happens on the seller's site, not here.

### The zoom

`js/zoom.js` drives it. Pointer in scales the photo to 2.4 and sets `transform-origin` from the cursor, so moving around pans the enlarged image; only `transform` is transitioned, never the origin, so panning tracks the cursor while the scale eases in once. A click holds the zoom and a second click releases — that is what touch and keyboard need, since neither has hover. `Enter`/`Space` open it from the centre, `Escape` always lets go, and the whole thing is skipped under `prefers-reduced-motion`.

## Ethos carousel

Four photographs on the About page, each paired with its own paragraph; the arrows move both together and loop. The paragraphs are stacked in a single grid cell (`.ethos__paras > p { grid-area: 1 / 1 }`), so the panel is as tall as the longest of them and nothing shifts as they change. `initCarousel` reads `[data-carousel-media] img` and `[data-carousel-text] > *` from the shared `[data-carousel]` stage, so adding a fifth slide is one image plus one paragraph.

## Forms

Both forms validate on the client and then stop — there is no backend. `js/ui.js` calls `preventDefault`, shows inline errors on the required fields, and prints a success line. Point them at an endpoint when you have one.

## Browser behaviour

- Motion is `transform`/`opacity` only, and everything is disabled under `prefers-reduced-motion: reduce`.
- Keyboard: focus rings are styled, the dropdown and mobile menu trap focus and close on `Escape`, and the skip link is the first tab stop.
- Checked at 390px, 768px and 1512px with no horizontal overflow.
