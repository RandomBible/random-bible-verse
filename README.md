# Random Bible Verse

[![npm version](https://img.shields.io/npm/v/random-bible-verse)](https://www.npmjs.com/package/random-bible-verse)
[![npm downloads](https://img.shields.io/npm/dm/random-bible-verse)](https://www.npmjs.com/package/random-bible-verse)
[![bundle size](https://img.shields.io/bundlejs/size/random-bible-verse)](https://bundlejs.com/?q=random-bible-verse)
[![license](https://img.shields.io/npm/l/random-bible-verse)](LICENSE)

A Bible verse of the day widget for church websites, ministry pages and blogs. Use it as a
copy-and-paste embed, a web component or a React component.

<img src="https://random-bible.com/widget-styles/bible-verse-widget-window-800.webp" width="640" alt="Window style Bible verse widget in a youth ministry blog post: the verse in white over a misty mountain photo">

- **Six layouts**, from a photo card to a corner button, plus the original card.
- **Verse of the day**: every visitor sees the same verse on a given date, the one
  [random-bible.com](https://random-bible.com/) shows. A random verse per visit is one option away.
- **Three public-domain translations**: KJV, WEB and ASV.
- **Light, dark or automatic theme**, four accent presets or any hex color.
- **Isolated**: drawn in a Shadow DOM, so your CSS can't break it and it can't touch your page.
- **No dependencies.** TypeScript types included. React is optional.

Try every option in the
[Bible verse widget customizer](https://random-bible.com/bible-verse-widget/), which also writes
the embed code for you.

## Contents

- [Quick start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Layouts](#layouts)
- [Options](#options)
- [How the verse of the day works](#how-the-verse-of-the-day-works)
- [API](#api)
- [Styling](#styling)
- [Accessibility](#accessibility)
- [Network, privacy and CSP](#network-privacy-and-csp)
- [Browser support](#browser-support)
- [Development](#development)
- [Contributing](#contributing)
- [Security](#security)
- [Changelog](#changelog)
- [License](#license)

## Quick start

Paste this into any page that accepts HTML (WordPress, Wix, Squarespace, Webflow, Ghost or plain
HTML):

```html
<div class="random-bible-verse" data-style="window" data-theme="auto">
  <a slot="credit" href="https://random-bible.com/">random-bible.com</a>
</div>
<script src="https://random-bible.com/widget.js" async></script>
```

The script draws every `.random-bible-verse` container on the page, so one script tag serves
several widgets. No build step and no account are needed.

## Installation

```sh
npm install random-bible-verse
```

The package is ESM only. Bundlers and ES modules import it directly; CommonJS code can
`require()` it on Node.js 20.19, 22.12 or later. React is an optional peer dependency, used only
by `random-bible-verse/react`.

Without a bundler, load the module from a CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/random-bible-verse/dist/index.js"></script>
```

## Usage

### Web component

Importing the package registers `<random-bible-verse>`:

```js
import 'random-bible-verse';
```

```html
<random-bible-verse layout="poster" theme="auto" accent="clay">
  <a slot="credit" href="https://random-bible.com/">random-bible.com</a>
</random-bible-verse>
```

Its attributes are the [options](#options). Changing an attribute restyles the widget in place.

### JavaScript

```js
import { mount, destroy } from 'random-bible-verse';

const el = document.querySelector('#verse');
mount(el, { layout: 'today', theme: 'dark', translation: 'web' });

// New options restyle the widget and keep the verse on screen.
mount(el, { layout: 'today', theme: 'dark', translation: 'web', accent: 'plum' });

destroy(el);
```

### React

```jsx
import { BibleVerse } from 'random-bible-verse/react';

export function Sidebar() {
  return <BibleVerse layout="today" theme="auto" />;
}
```

The component is marked `'use client'`, so it works in Next.js App Router pages as well as Remix,
Astro and other frameworks that render React on the server. Props that aren't options, such as
`className` or `id`, go to the wrapping `div`.

On the server it renders that `div` with the credit link and a minimum height for the chosen
layout. The minimum is the height of the layout's shortest verse, so a longer verse still grows the
widget when it draws, and the credit link shows as plain text until the script runs. The floating
layout reserves no height because it sits in the corner of the page.

## Layouts

| Layout     | Description                                                              |
| ---------- | ------------------------------------------------------------------------ |
| (none)     | The original card, kept for embeds made before the layouts existed      |
| `window`   | The verse on a photo                                                     |
| `quiet`    | No card: the verse between two thin lines, in your page's text color     |
| `today`    | A compact card for a sidebar                                             |
| `calendar` | A tear-off date; visitors can flip back up to 30 days                    |
| `poster`   | Large type on a card filled with your accent color                       |
| `floating` | A "Verse for today" button in the corner of the page that opens the verse |

<table>
  <tr>
    <td><img src="https://random-bible.com/widget-styles/bible-verse-widget-quiet-800.webp" width="400" alt="Quiet style Bible verse widget in a parish newsletter, set in the newsletter's own serif font between two thin lines"></td>
    <td><img src="https://random-bible.com/widget-styles/bible-verse-widget-today-800.webp" width="400" alt="Today style Bible verse widget in the sidebar of a pastor's blog, above the service times"></td>
  </tr>
  <tr>
    <td><img src="https://random-bible.com/widget-styles/bible-verse-widget-calendar-800.webp" width="400" alt="Calendar style Bible verse widget on a devotional website: the date on the left and the verse of the day beside it"></td>
    <td><img src="https://random-bible.com/widget-styles/bible-verse-widget-poster-800.webp" width="400" alt="Poster style Bible verse widget in a small group guide: the verse in large white type on a clay-colored card"></td>
  </tr>
  <tr>
    <td colspan="2"><img src="https://random-bible.com/widget-styles/bible-verse-widget-floating-800.webp" width="400" alt="Floating style Bible verse widget on a church podcast page, opened from the corner button"></td>
  </tr>
</table>

Every layout is shown live, in light and dark, on the
[widget page](https://random-bible.com/bible-verse-widget/).

## Options

All options are optional. The embed reads them from data attributes on the container. The npm
package takes the same options, without the `data-` prefix and with `data-style` named `layout`, as
`mount()` options, `<random-bible-verse>` attributes and `<BibleVerse>` props. An unknown value
falls back to the default and an out-of-range number is clamped.

| Option        | Embed attribute    | Values                                           | Default                    |
| ------------- | ------------------ | ------------------------------------------------ | -------------------------- |
| `layout`      | `data-style`       | window, quiet, today, calendar, poster, floating | the original card          |
| `translation` | `data-translation` | kjv, web, asv                                    | kjv                        |
| `theme`       | `data-theme`       | light, dark, auto                                | light                      |
| `accent`      | `data-accent`      | teal, clay, indigo, plum, `#rgb`, `#rrggbb`      | teal; gold on the card     |
| `font`        | `data-font`        | serif, sans, site                                | serif                      |
| `corners`     | `data-corners`     | round, soft, square                              | round                      |
| `mode`        | `data-mode`        | daily, random                                    | daily                      |
| `align`       | `data-align`       | center, left                                     | center                     |
| `size`        | `data-size`        | sm, md, lg                                       | md                         |
| `width`       | `data-width`       | 200 to 1200 (px)                                 | from `size`                |
| `text`        | `data-text`        | 10 to 48 (px)                                    | from `size`                |
| `photo`       | `data-photo`       | an `http(s)` image URL                           | the random-bible.com photo |
| `position`    | `data-position`    | right, left                                      | right                      |
| `inline`      | `data-inline`      | true, false                                      | false                      |

- **theme**: `auto` follows the visitor's system setting and switches live. Quiet ignores the theme
  and matches the text color of the page around it.
- **accent**: colors the reference, the quote mark and the focus ring, and fills the Poster card.
  In the six layouts a custom color is darkened or lightened as needed to keep text readable; the
  original card uses it as given.
- **font**: `site` uses the font of the element the widget sits in.
- **corners**: no effect on Quiet or the original card.
- **mode**: `daily` shows the [verse of the day](#how-the-verse-of-the-day-works); `random` draws a
  new verse on each visit. Calendar is always daily and the original card always random.
- **align**: no effect on Floating.
- **width**, **text**: exact sizes for a fixed-width column; each overrides its half of `size`.
- **photo**: Window only.
- **position**, **inline**: Floating only. `inline` draws the button and its card in the page flow
  instead of the corner, for previews and editors. On the web component `inline` is a boolean
  attribute.

A page shows one floating button: when several widgets use the floating layout, only the first one
is drawn.

## How the verse of the day works

In `daily` mode the verse comes from a fixed rotation through the same hand-picked pool that
random-bible.com uses. It changes at midnight in the visitor's time zone: two visitors on the same
date see the same verse, while visitors in different time zones can see different verses at the
same moment. Reloading the page doesn't change it; the New verse button draws a random one.

## API

### `mount(el: HTMLElement, options?: BibleVerseOptions): void`

Draws the widget into `el`. The verse loads asynchronously. Calling `mount()` again on the same
element restyles it in place and keeps the verse on screen unless `layout`, `mode` or
`translation` changes. Each call replaces the previous options; they are not merged.

### `destroy(el: HTMLElement): void`

Removes what `mount()` drew and forgets the element's state. It is safe to call before the verse
has loaded, and the element can be mounted again.

### `<random-bible-verse>`

Registered on import. It mounts when added to the page and is destroyed when removed. Moving it
within the page keeps its verse.

### `defineElement(name?: string): void`

Registers the element under another tag name, for pages where `random-bible-verse` is taken.

### `RandomBibleVerseElement`

The class behind the element, for subclassing.

### `OPTION_NAMES`

The option names in the order of the table above. They are also the element's observed
attributes.

### `BibleVerse` from `random-bible-verse/react`

Takes the options as props, plus any `div` attributes except `children`. It mounts after the first
render, updates in place when an option changes and is destroyed on unmount.

### Types

The package exports `BibleVerseOptions` and `Layout`; `random-bible-verse/react` exports
`BibleVerseProps`. `HTMLElementTagNameMap` includes `random-bible-verse`, so
`document.querySelector('random-bible-verse')` is typed.

## Styling

The widget's look is set through the options only. It draws inside a Shadow DOM, so page CSS can't
reach it, and it exposes no CSS parts or custom properties.

The credit link is the one part that stays in your page's markup, where it renders like any other
link.

## Accessibility

- The verse is a `blockquote` with a `cite` for the reference.
- Icon buttons have accessible names: New verse, Share this verse, Previous day, Next day, Close.
- The floating card is a labelled dialog that Esc closes. On phones it opens as a bottom sheet and
  keeps keyboard focus inside until it is closed.
- Focus stays on the control you used when the widget redraws.
- In the six layouts at the default sizes, text is at least 14px, tap targets at least 44px and
  text contrast at least 4.5:1, in both themes and with any accent. This is tested across every
  layout, theme, accent, font and corner style at widths from 200 to 900px. Quiet uses your page's
  text color, so its contrast follows your page. A `text` value below 14 makes the verse smaller
  than 14px.

## Network, privacy and CSP

When a page with the widget opens, the visitor's browser requests:

| Request                                                 | When                                   |
| ------------------------------------------------------- | -------------------------------------- |
| `https://random-bible.com/widget.js`                    | The embed only                         |
| `https://random-bible.com/data/pool-<translation>.json` | Once per page and translation          |
| `https://random-bible.com/widget-photo.webp`            | The Window layout, unless `photo` is set |

These requests carry what a browser always sends: IP address, user agent and referring page. The
widget sets no cookies and loads no other scripts.

If the verses can't load, the six layouts show a built-in verse (1 Peter 5:7) and the original card
leaves the container's own content in place.

On a site with a Content Security Policy, allow:

| Directive     | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| `script-src`  | `https://random-bible.com`, for the embed                              |
| `connect-src` | `https://random-bible.com`                                             |
| `img-src`     | `https://random-bible.com`, or the host of your `photo`                |
| `style-src`   | nothing extra for the six layouts; `'unsafe-inline'` for the original card |

## Browser support

| Part                | Requires                                                                     |
| ------------------- | ---------------------------------------------------------------------------- |
| The six layouts     | Shadow DOM; without it, a browser gets the original card                     |
| Narrow-column fit   | Container queries (Chrome 105, Safari 16, Firefox 110); older browsers keep the wide arrangement |
| The embed script    | ES5 with `fetch` and `Promise`; Internet Explorer is not supported           |
| The npm package     | ES2020, ES modules and custom elements                                       |

## Development

The package has no dependencies. With Node.js 20 or later:

```sh
npm run build
```

This writes `dist/`:

| File                         | Contents                                          |
| ---------------------------- | ------------------------------------------------- |
| `index.js`, `index.d.ts`     | The ES module: `mount()`, `destroy()`, the element |
| `react.js`, `react.d.ts`     | The React component                               |
| `widget.js`                  | The embed script                                  |
| `widget-photo.webp`          | The default Window photo                          |

`src/core.js` is the widget itself; the build puts it inside the embed script (`src/embed.js`) and
the ES module (`src/index.js`).

## Contributing

Bug reports and ideas are welcome in
[Issues](https://github.com/RandomBible/random-bible-verse/issues). Before working on a change,
please open an issue so we can agree on the approach.

## Security

Please report vulnerabilities privately, as described in [SECURITY.md](SECURITY.md), not in a
public issue.

## Changelog

Releases follow [semantic versioning](https://semver.org/); before 1.0 a minor version may still
change the API. Every change is listed in [CHANGELOG.md](CHANGELOG.md). Each release is published
to npm from GitHub Actions with
[provenance](https://docs.npmjs.com/generating-provenance-statements), which links the package to
the commit it was built from.

## License

[MIT](LICENSE) © Random Bible.

The verse texts come from public-domain translations: the King James Version, the World English
Bible and the American Standard Version.
