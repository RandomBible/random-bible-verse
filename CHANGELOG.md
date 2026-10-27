# Changelog

All notable changes to `random-bible-verse` are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[semantic versioning](https://semver.org/).

## Unreleased

First npm release.

### Added

- `mount(el, options)` and `destroy(el)` for drawing the widget into any element.
- The `<random-bible-verse>` custom element, registered on import, and `defineElement(name)` for
  another tag name.
- `BibleVerse`, a React component in `random-bible-verse/react` that renders on the server.
- TypeScript types for the options, the element and the React props.
- `OPTION_NAMES`, the list of option names.
- `random-bible-verse/widget.js`, the same embed script random-bible.com serves.
