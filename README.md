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

## Cursor

The pointer is the brand star, inlined as an SVG data URI in `css/tokens.css`: `#60140A` by default and `#EFE4D8` over anything marked `data-nav="dark"`, in two sizes — 18px normally, 26px on anything clickable. Pure CSS, reusing the same `data-nav` marks the header tone uses, so there is no JavaScript and no lag behind the pointer.

A light panel sitting inside a dark section (the contact form on its cream card) carries `data-nav="light"`, which hands the oxblood star back. Those rules are placed after the dark ones because both have the same specificity and source order decides.

Text fields keep the caret and the zoomable archive photograph keeps `zoom-in`. Every value ends in `, auto`, so a browser that cannot render an SVG cursor falls back to the normal arrow.

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
- **About section** — a scatter of eleven photographs around `✦ INSPIRATION ✦`. Sizes run in tiers rather than eleven arbitrary values: one anchor at 230×290, three mid at 190×240, three small at 150×190, two tiny squares at 110×110, and two landscape (190×145, 150×110). Mostly upright, two landscape, and the gaps between them are deliberately uneven. Above 760px they are placed absolutely by percentage inside a box of fixed proportion (`aspect-ratio: 1444 / 1033`) so the composition scales as one piece; below 760px it becomes two columns with the title between.

  **Arrival:** one `IntersectionObserver` on the grid fires when the section scrolls into view — not on load — and each photograph fades up from `translateY(26px)` on its own `--reveal-delay`, 90ms apart, in an order chosen so neighbours never land together. The title follows at 1090ms.

  **Hover:** the photograph scales to 1.16 over 460ms on `--ease-settle`, from its own centre so it opens out in place rather than drifting, and lifts to `z-index: 2` so it clears its neighbours. That transform sits on `.insp .media` rather than the figure, so it is free of the entry transform and its stagger delay — otherwise a hover would wait out the photograph's arrival offset before responding. `:focus-visible` gets the same.

- **Project type stack** — four full-viewport panels (Residential Projects, Commercial Projects, Installations, Events) sitting directly after the about section. Each panel is `position: sticky; top: 0`, so the next one rides up and covers the one before it instead of pushing it away. Pure CSS, no JavaScript. Panels are `100svh - var(--peek)` tall and sit flush, so the one below always shows through the strip left at the foot of the screen — the reader can see another category is coming. `--peek` is 12svh on `.stack`; raising it shows more of the next panel, lowering it less.

  All four panel titles are single words now (Residential, Commercial, Installations, Events) in Helvetica Neue Light, tracked at `-.012em`. `DISCOVER NOW` is Helvetica Neue Light in caps, with the rule beneath it appearing only on hover or keyboard focus.
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

The whole site runs at **weight 300** — `body` sets it, so headings, labels, body copy, navigation and form fields are all Helvetica Neue Light. The Sainte Colombe italic halves of the split headings are untouched.

One thing deliberately stays heavier and should not be swept into a find-and-replace: `CONTACT` in the navigation (`.nav-link--strong`, 700).


The three featured project names on the home page (`.featured__grid .tile__name`) are set in Helvetica Neue Light at up to 34px. The nine tiles on the Projects page keep Helvetica Neue at their smaller size — 45px would wrap badly in a 470px tile. Change `.tile__name` itself rather than the `.featured__grid` override if you want them to match.

## Buttons

`.btn` is the one button on the site — Helvetica Neue Light 18px, `.5em 1.3em` padding, `.05em` tracking. It is used on the About hero, the About CTA band, Careers and Contact, and all four render identically. Change it here and every button follows.

Two things look like buttons but are not `.btn`, and were left alone: `BUY NOW` on the archive item page (`.buy`, a full-width oxblood block) and the `TYPE` control on Projects (`.filter__button`, a listbox trigger).

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

## About page, values taken from Figma

Read from the design file, not estimated:

| | |
|---|---|
| `ABOUT US` | 100px, white — `ABOUT` Helvetica Neue **Thin** at -0.96px, `US` Sainte Colombe Light Italic |
| Hero standfirst | Helvetica Light **25px** on 32px leading (the file draws it at 36px; 25px is the client's call) |
| `OUR STORY` | Helvetica Light 45px + Sainte Colombe Light Italic 45px, no tracking |
| Story heading | Helvetica Light 53px on 46px at -1.59px, then `Culture & Craft` in Sainte Colombe Light Italic 56px on 51px at -5.6px |
| Story copy | Helvetica Light 25px on 25px, -1px, black |
| `OUR CORE VALUES:` | Helvetica Light 45px at -2.25px + Sainte Colombe Light Italic 45px at -3.15px |
| Value number | Sainte Colombe **Medium** 35px (40px in the file) |
| Value name | Sainte Colombe Light Italic 38px (44px in the file) |
| Value copy | Helvetica Light 22px, black (25px in the file) |

The core values were scaled down from the file at the client's request; the ethos title and carousel copy and the buttons all run Helvetica Light 25px for the same reason.
| `FOUNDERS` | Sainte Colombe Light Italic 45px, -3.15px |
| Founders standfirst | Helvetica Light 24px on 25px, -0.72px, uppercase |
| Founder name / role | Helvetica Regular 35px at -1.75px / Helvetica Light 35px at -1.05px |

Columns in the core values rows land at 35 (number), 113 (name), 505 (photograph, 322 wide) and 885 (copy, 592 wide) inside the 1442 content width.

### The core values photograph

`js/values.js` cross-fades it. The photograph sits in `.values__track`, which is absolutely positioned and spans the whole list so the rows keep their columns; the photograph itself is `position: sticky` inside that track. Only `opacity` changes, so nothing in the layout moves while the section scrolls — which is the whole point of the effect.

Which value is current is decided by distance: whichever value's box is closest to the middle of the pinned photograph wins. An IntersectionObserver cannot do this, because several values are on screen at once and it has no way to say which one the photograph is beside. Below 900px the photograph is hidden and the values stack.

## Values taken from Figma

These came from the design file via the Figma connector, not estimated:

| | |
|---|---|
| Page title (`PROJECTS`, `NEXT PROJECTS`) | Helvetica Neue Light 45px, #08313C, no extra tracking |
| Project tile name | Helvetica Neue Light 47px, 43px leading, -1.88px tracking, 23px from the left, 39px from the foot |
| Filter control | 306 × 72 in the file; built smaller at 230 × 52 at the client's request |
| Project grid | 470 × 573 tiles, 17px column gap |
| Project page title | 70px (the file has it in Sainte Colombe; it is Helvetica Light here at the client's request) |

### Project details, from the design file

| | |
|---|---|
| "About project" | Helvetica Neue **Regular** 26px, #08313C — not the oxblood small-caps eyebrow used elsewhere |
| "A Dialogue Between" | Helvetica Neue Light 47px, 98.8% leading, -1.88px |
| "Form & Function" | Sainte Colombe Light Italic 48px, 1.125 leading, -0.96px |
| Copy column | Helvetica Neue Light 21px on 26px, black, 713px wide, 122px gutter, 20px between paragraphs |
| Standfirst | Helvetica Neue Light 34px on 37px, -0.34px, black, 1199px column centred on the page but **left-aligned** |

## Projects filter

`js/filter.js` drives the TYPE control on the Projects page. It is a listbox rather than a native `<select>` so it can be styled to the design, with arrow keys, Escape, and a live region announcing the count.

Each tile carries `data-type`; filtering sets `hidden` on the rest and `.projects-grid .tile[hidden] { display: none }` closes the gap. The control reads `?type=` from the URL on load and rewrites it on change, so the category links in the navigation (`projects.html?type=residential` and so on) land pre-filtered and a filtered view can be linked or reloaded. Without JavaScript nothing is hidden and all nine projects show.

**The type assigned to each project is my guess** — Residential, Commercial, Events & Installments or On Progress — set in `projects.html` on each tile. Correct them there.

## Forms

Both forms validate on the client and then stop — there is no backend. `js/ui.js` calls `preventDefault`, shows inline errors on the required fields, and prints a success line. Point them at an endpoint when you have one.

## Browser behaviour

- Motion is `transform`/`opacity` only, and everything is disabled under `prefers-reduced-motion: reduce`.
- Keyboard: focus rings are styled, the dropdown and mobile menu trap focus and close on `Escape`, and the skip link is the first tab stop.
- Checked at 390px, 768px and 1512px with no horizontal overflow.
