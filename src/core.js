/**
 * The widget itself: config, layouts, rendering and mount. Plain ES5 with no top-level side
 * effects, so the same code runs as the embed script (embed.js) and as the npm module (index.js),
 * and importing it during server rendering is safe. build.mjs inlines it into both.
 */
function createWidget() {
  'use strict';
  var ORIGIN = 'https://random-bible.com';
  // Credit link is campaign-tagged so site analytics can attribute traffic from embeds.
  var SITE_LINK = ORIGIN + '/?utm_source=widget&utm_medium=embed';

  // The public-domain English translations the widget offers.
  var TRANSLATIONS = { kjv: true, web: true, asv: true };
  var DEFAULT_TRANSLATION = 'kjv';

  // Named accent presets. Each carries a deep variant for the cream (light) card and a luminous
  // variant for the navy (dark) card — both meet WCAG AA against their own background, so the
  // reference and credit link stay readable in either theme.
  var ACCENTS = {
    gold: { light: '#8a5d14', dark: '#e7c884' },
    blue: { light: '#1f5fa6', dark: '#7fb4f0' },
    green: { light: '#2f7355', dark: '#76c79e' },
    purple: { light: '#7048b6', dark: '#c0a3ef' },
    rose: { light: '#b23a63', dark: '#f093b3' },
    // The Window-era presets (2026-10). These also carry the soft tint (strip and highlight
    // backgrounds) and the solid fill the Poster style paints its whole card with; the older five
    // derive theirs in accentSet().
    teal: {
      light: '#1b5f57',
      dark: '#6fc2b5',
      tintLight: '#e1efeb',
      tintDark: '#1d3a37',
      fillLight: '#1b5f57',
      fillDark: '#2e7d72',
    },
    clay: {
      light: '#a4481f',
      dark: '#e8916a',
      tintLight: '#f6e6dd',
      tintDark: '#3a2a22',
      fillLight: '#a4481f',
      fillDark: '#b4532a',
    },
    indigo: {
      light: '#3d4e9a',
      dark: '#9aa8e8',
      tintLight: '#e4e7f5',
      tintDark: '#262c45',
      fillLight: '#3d4e9a',
      fillDark: '#4a5bb0',
    },
    plum: {
      light: '#7a3b69',
      dark: '#d69bc6',
      tintLight: '#f2e3ee',
      tintDark: '#3a2635',
      fillLight: '#7a3b69',
      fillDark: '#8c4679',
    },
  };

  /**
   * The six layouts (data-style). No data-style keeps the original card ('card'), so every
   * embed pasted before these existed looks exactly as it did.
   */
  var STYLES = {
    window: true,
    quiet: true,
    today: true,
    calendar: true,
    poster: true,
    floating: true,
  };

  /** data-corners: card radius and small-element radius, in px. Pills and circles never change. */
  var CORNERS = {
    round: { r: 24, s: 12 },
    soft: { r: 10, s: 6 },
    square: { r: 2, s: 2 },
  };

  // Surfaces for the styled layouts (the "Window" palette). The legacy card keeps its own in styles().
  var PALETTES = {
    light: {
      surface: '#ffffff',
      ink: '#121a2b',
      sec: '#3f4859',
      line: 'rgba(18,26,43,0.12)',
      chip: '#e4e7e1',
    },
    dark: {
      surface: '#1a2130',
      ink: '#e9ece6',
      sec: '#a9b1be',
      line: 'rgba(233,236,230,0.14)',
      chip: '#252d3b',
    },
  };

  // Shown when the verse pool cannot be fetched, so a styled embed is never an empty box.
  var FALLBACK_VERSE = {
    ref: '1Pet.5.7',
    text: 'Casting all your care upon him; for he careth for you.',
  };

  var SIZES = {
    sm: { width: '22rem', text: '1rem' },
    md: { width: '30rem', text: '1.15rem' },
    lg: { width: '38rem', text: '1.3rem' },
  };

  // Font stacks are intentionally UNQUOTED. These strings are concatenated into double-quoted
  // `style="..."` attributes via innerHTML, so any quote char inside (even via a formatter
  // flipping the JS string delimiter) would prematurely close the attribute and drop every
  // declaration after it — which silently breaks the card's text colour. Unquoted multi-word
  // family names ("Segoe UI", "Times New Roman") are valid CSS and have no such hazard.
  var SANS = '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif';
  var SERIF = 'Georgia,Times New Roman,serif';

  // OSIS book code -> English display name (66-book canon), to format references locally.
  var BOOKS = {
    Gen: 'Genesis',
    Exod: 'Exodus',
    Lev: 'Leviticus',
    Num: 'Numbers',
    Deut: 'Deuteronomy',
    Josh: 'Joshua',
    Judg: 'Judges',
    Ruth: 'Ruth',
    '1Sam': '1 Samuel',
    '2Sam': '2 Samuel',
    '1Kgs': '1 Kings',
    '2Kgs': '2 Kings',
    '1Chr': '1 Chronicles',
    '2Chr': '2 Chronicles',
    Ezra: 'Ezra',
    Neh: 'Nehemiah',
    Esth: 'Esther',
    Job: 'Job',
    Ps: 'Psalms',
    Prov: 'Proverbs',
    Eccl: 'Ecclesiastes',
    Song: 'Song of Solomon',
    Isa: 'Isaiah',
    Jer: 'Jeremiah',
    Lam: 'Lamentations',
    Ezek: 'Ezekiel',
    Dan: 'Daniel',
    Hos: 'Hosea',
    Joel: 'Joel',
    Amos: 'Amos',
    Obad: 'Obadiah',
    Jonah: 'Jonah',
    Mic: 'Micah',
    Nah: 'Nahum',
    Hab: 'Habakkuk',
    Zeph: 'Zephaniah',
    Hag: 'Haggai',
    Zech: 'Zechariah',
    Mal: 'Malachi',
    Matt: 'Matthew',
    Mark: 'Mark',
    Luke: 'Luke',
    John: 'John',
    Acts: 'Acts',
    Rom: 'Romans',
    '1Cor': '1 Corinthians',
    '2Cor': '2 Corinthians',
    Gal: 'Galatians',
    Eph: 'Ephesians',
    Phil: 'Philippians',
    Col: 'Colossians',
    '1Thess': '1 Thessalonians',
    '2Thess': '2 Thessalonians',
    '1Tim': '1 Timothy',
    '2Tim': '2 Timothy',
    Titus: 'Titus',
    Phlm: 'Philemon',
    Heb: 'Hebrews',
    Jas: 'James',
    '1Pet': '1 Peter',
    '2Pet': '2 Peter',
    '1John': '1 John',
    '2John': '2 John',
    '3John': '3 John',
    Jude: 'Jude',
    Rev: 'Revelation',
  };

  function reference(ref) {
    var m = /^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/.exec(ref);
    if (!m) return ref;
    return (BOOKS[m[1]] || m[1]) + ' ' + m[2] + ':' + m[3];
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /**
   * Resolve an accent value to a safe { light, dark } colour pair, or null to fall back to the
   * theme default. Accepts a preset name or a 3/6-digit hex; anything else is rejected so the
   * value can never break out of the inline `style` attribute it's concatenated into. A custom
   * hex is used as-is in both themes (the embedder owns its contrast in that case).
   */
  function accentColor(raw) {
    if (!raw) return null;
    var v = String(raw).trim();
    var preset = ACCENTS[v.toLowerCase()];
    if (preset) return preset;
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return { light: v, dark: v };
    return null;
  }

  /**
   * Parse a pixel dimension, clamped to [min, max]. Returns null for anything non-numeric so the
   * caller falls back to its preset. Accepts "480" or "480px". Because the result is concatenated
   * into an inline `style` attribute, only a finite number ever reaches the output.
   */
  function pxIn(raw, min, max) {
    if (raw === undefined || raw === null || String(raw).trim() === '') return null;
    var n = parseFloat(String(raw).trim());
    if (!isFinite(n)) return null;
    return Math.min(max, Math.max(min, Math.round(n)));
  }

  /**
   * Read and sanitize one container's settings into a config object: its data attributes, or the
   * options object the npm API keeps on it (same keys, so both go through the same checks).
   */
  function readConfig(el) {
    var d = (el && (el._rbOptions || el.dataset)) || {};
    var tr = String(d.translation || '').toLowerCase();
    var theme = String(d.theme || '').toLowerCase();
    var font = String(d.font || '').toLowerCase();
    var align = String(d.align || '').toLowerCase();
    var size = String(d.size || '').toLowerCase();
    var style = String(d.style || '').toLowerCase();
    var corners = String(d.corners || '').toLowerCase();
    var mode = String(d.mode || '').toLowerCase();
    style = STYLES[style] ? style : 'card';
    return {
      translation: TRANSLATIONS[tr] ? tr : DEFAULT_TRANSLATION,
      theme: theme === 'dark' || theme === 'auto' ? theme : 'light',
      accent: accentColor(d.accent),
      // 'site' borrows the host page's own font (read from the container's parent at render).
      font: font === 'sans' || font === 'site' ? font : 'serif',
      style: style,
      corners: CORNERS[corners] ? corners : 'round',
      // The styled layouts show the verse of the day (the same one the home page shows) unless
      // asked for a random one; the legacy card always drew at random, and still does.
      mode: mode === 'random' || mode === 'daily' ? mode : style === 'card' ? 'random' : 'daily',
      align: align === 'left' ? 'left' : 'center',
      size: SIZES[size] ? size : 'md',
      // Exact pixel overrides for embedders who need the card to fit a specific column. Each one
      // overrides just its half of the `size` preset, so `data-width` alone keeps the preset's
      // text size. Clamped rather than rejected: an out-of-range number is a typo, not an attack,
      // and a card 4px wide is worse than one nudged back into range.
      width: pxIn(d.width, 200, 1200),
      text: pxIn(d.text, 10, 48),
      // data-credit="off" drops the random-bible.com link entirely, slot fallback included. The
      // WordPress plugin needs it: wordpress.org lets a plugin link out only with the admin's opt-in.
      credit: String(d.credit || '').toLowerCase() !== 'off',
      position: String(d.position || '').toLowerCase() === 'left' ? 'left' : 'right',
      inline: String(d.inline || '').toLowerCase() === 'true',
      // Where the Window photo lives. The plugin ships its own copy; http(s) URLs only.
      photo: /^https?:\/\/[^\s"'<>]+$/.test(String(d.photo || ''))
        ? String(d.photo)
        : ORIGIN + '/widget-photo.webp',
    };
  }

  /**
   * Credit slot in the card footer.
   *
   * The embed snippet ships `<a slot="credit" href="https://random-bible.com/">random-bible.com</a>`
   * as a light-DOM child of the container. Slotting it means the anchor is static markup in the
   * host page's served HTML, like any other link on that page, while still rendering inside the
   * card. A link built here in JS, inside the shadow root, would not be in the served HTML.
   *
   * The fallback keeps embeds pasted before the slot existed working: no `[slot=credit]` child,
   * so the slot renders this instead. That one carries UTM params, since it only ever earned
   * referral clicks anyway.
   */
  function creditSlot(S, cfg) {
    if (!cfg.credit) return '';
    return (
      '<slot name="credit" class="rb-credit">' +
      '<a href="' +
      SITE_LINK +
      '" target="_blank" rel="noopener" style="' +
      S.link +
      '">random-bible.com</a>' +
      '</slot>'
    );
  }

  /** Build the inline style strings for a given config (re-evaluated per render for auto theme). */
  function styles(cfg) {
    var isDark = darkTheme(cfg);
    var pal = isDark
      ? { bg: '#161f36', border: '#2a3550', ink: '#f5f1e8', btnBg: '#1e2a47' }
      : { bg: '#faf7f0', border: '#e7e0d3', ink: '#1f2433', btnBg: '#ffffff' };
    var accent = cfg.accent
      ? isDark
        ? cfg.accent.dark
        : cfg.accent.light
      : isDark
        ? '#e7c884'
        : '#8a5d14';
    // The host font goes through safeFont(): it usually arrives quoted ("Playfair Display"), and a
    // quote would close the inline style attribute this is concatenated into.
    var fontFam =
      cfg.font === 'sans' ? SANS : cfg.font === 'site' ? safeFont(cfg.hostFont) || SERIF : SERIF;
    var preset = SIZES[cfg.size] || SIZES.md;
    var size = {
      width: cfg.width ? cfg.width + 'px' : preset.width,
      text: cfg.text ? cfg.text + 'px' : preset.text,
    };
    var justify = cfg.align === 'left' ? 'flex-start' : 'center';
    return {
      card:
        'box-sizing:border-box;max-width:' +
        size.width +
        ';margin:0 auto;padding:1.5rem 1.75rem;background:' +
        pal.bg +
        ';border:1px solid ' +
        pal.border +
        ';border-radius:14px;font-family:' +
        fontFam +
        ';color:' +
        pal.ink +
        ';text-align:' +
        cfg.align +
        ';line-height:1.55;',
      // Carry the colour explicitly (not just inherited from the card) so a host page's own
      // `blockquote { color }` rule can't override the verse text and make it disappear.
      text: 'margin:0 0 0.75rem;font-size:' + size.text + ';color:' + pal.ink + ';',
      ref: 'display:block;font-size:0.95rem;font-style:italic;color:' + accent + ';',
      foot:
        'margin-top:1.1rem;display:flex;align-items:center;justify-content:' +
        justify +
        ';gap:0.75rem;font-family:' +
        SANS +
        ';font-size:0.78rem;',
      link: 'color:' + accent + ';text-decoration:none;',
      btn:
        'cursor:pointer;border:1px solid ' +
        pal.border +
        ';background:' +
        pal.btnBg +
        ';color:' +
        pal.ink +
        ';border-radius:999px;padding:0.25rem 0.7rem;font:inherit;font-size:0.78rem;',
    };
  }

  function pick(pool) {
    return pool && pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }

  /**
   * Get the shadow root the card renders into, creating it once per container. Returns null on
   * the (now very rare) browsers without Shadow DOM, so the caller can fall back to light DOM.
   * `el.shadowRoot` is checked first so a second script load / re-render reuses the same root
   * instead of throwing on a duplicate attachShadow.
   */
  function getRoot(el) {
    if (el.shadowRoot) return el.shadowRoot;
    if (typeof el.attachShadow === 'function') {
      try {
        return el.attachShadow({ mode: 'open' });
      } catch (e) {
        /* fall through to light-DOM fallback */
      }
    }
    return null;
  }

  // Reset injected at the top of the shadow root. The shadow boundary already blocks the host
  // page's selectors and `!important` rules from matching the card, but *inherited* properties
  // (color, font, line-height, letter-spacing, text-transform…) still flow in through the host
  // element. `all:initial` on the wrapper severs that inheritance, giving the card a clean slate
  // the host can't reach; the card then sets everything it needs via its own inline styles.
  var RESET =
    ':host{all:initial;display:block}' +
    '.rb-scope{all:initial;display:block}' +
    '.rb-scope *{box-sizing:border-box}';

  /**
   * Styling for the slotted credit anchor.
   *
   * Slotted nodes live in the host's light DOM, so the host document's own `a {}` rules cascade
   * over anything `::slotted()` sets at equal weight. `!important` is what makes the card's
   * styling stick on a site with opinionated link styles; only a host rule that is itself
   * `!important` beats it. Deliberately a step smaller than the footer text: it is a credit, not
   * a call to action.
   */
  function creditCss(S) {
    var accent = S.link.replace(/^color:/, '').replace(/;.*$/, '');
    return (
      '::slotted(a){color:' +
      accent +
      ' !important;text-decoration:none !important;font-size:0.7rem !important;' +
      'font-family:' +
      SANS +
      ' !important;opacity:0.85}' +
      '::slotted(a:hover){text-decoration:underline !important}'
    );
  }

  function render(el, cfg, pool, verse, focusKey) {
    if (cfg.style === 'card' || !getRoot(el)) return renderCard(el, cfg, pool, verse);
    return renderStyled(el, cfg, pool, verse, focusKey);
  }

  /** The original card (no data-style), unchanged so existing embeds keep their look. */
  function renderCard(el, cfg, pool, verse) {
    verse = verse || pick(pool);
    if (!verse) return;
    // Remember what's showing so a restyle (e.g. live preview) can keep the same verse.
    el._rbVerse = verse;
    el._rbTranslation = cfg.translation;
    var S = styles(cfg);
    var card =
      '<figure class="rb-card" style="' +
      S.card +
      '">' +
      '<blockquote style="' +
      S.text +
      '">“' +
      escapeHtml(verse.text) +
      '”</blockquote>' +
      '<cite style="' +
      S.ref +
      '">' +
      escapeHtml(reference(verse.ref)) +
      '</cite>' +
      '<figcaption style="' +
      S.foot +
      '">' +
      '<button type="button" class="rb-refresh" style="' +
      S.btn +
      '">New verse</button>' +
      creditSlot(S, cfg) +
      '</figcaption></figure>';

    // Render inside the shadow root when available (full isolation); otherwise fall back to the
    // container's light DOM so the card still appears on legacy browsers.
    var root = getRoot(el);
    if (root) {
      if (root.adoptedStyleSheets && root.adoptedStyleSheets.length) root.adoptedStyleSheets = [];
      root.innerHTML =
        '<style>' + RESET + creditCss(S) + '</style><div class="rb-scope">' + card + '</div>';
    } else {
      // No shadow DOM: writing innerHTML would destroy the host's `[slot=credit]` anchor, so
      // detach it first (keeping the live node) and put it back where the slot would have gone.
      // <slot> outside a shadow tree just renders its children, so the fallback shows otherwise.
      var credit = el.querySelector('[slot="credit"]');
      if (credit) credit.remove();
      el.innerHTML = card;
      var holder = el.querySelector('.rb-credit');
      if (credit && holder) holder.parentNode.replaceChild(credit, holder);
      root = el;
    }
    var btn = root.querySelector('.rb-refresh');
    if (btn)
      btn.addEventListener('click', function () {
        render(el, cfg, pool);
      });
  }

  /* ---- Styled layouts (data-style) ------------------------------------------------------------
   *
   * Unlike the legacy card these are drawn with a stylesheet inside the shadow root, not inline
   * styles: they need container queries (each layout reflows on the width of the column it sits
   * in, not the viewport) and :hover/:focus-visible states. Colours, fonts and radii arrive as
   * custom properties set through style.setProperty(), never concatenated into markup, so a
   * host font name or a custom hex can't break out of anything.
   */

  /** Whether this config renders dark (auto follows the visitor's system setting). */
  function darkTheme(cfg) {
    return (
      cfg.theme === 'dark' ||
      (cfg.theme === 'auto' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  }

  function hexRgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function luminance(rgb) {
    var c = rgb.map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  /**
   * Text accent, soft tint and solid fill for a theme. Presets without their own tint/fill (the
   * older five, or a custom hex) derive them: tint = the accent at low alpha, fill = the deep
   * variant. onFill is whichever of white or ink reads on the fill, so a pale custom hex on the
   * Poster still gets legible text.
   */
  function accentSet(cfg, isDark) {
    var a = cfg.accent || ACCENTS.teal;
    var text = isDark ? a.dark : a.light;
    var fill = (isDark ? a.fillDark : a.fillLight) || a.light;
    var tint = isDark ? a.tintDark : a.tintLight;
    if (!tint) {
      var rgb = hexRgb(a.light);
      tint = 'rgba(' + rgb.join(',') + ',' + (isDark ? 0.24 : 0.12) + ')';
    }
    return {
      text: readable(text, isDark),
      tint: tint,
      fill: fill,
      onFill: luminance(hexRgb(fill)) > 0.36 ? '#121a2b' : '#ffffff',
    };
  }

  /**
   * A custom hex is the embedder's choice, but a pale yellow reference line on a white card is
   * unreadable. Mix it toward ink (light theme) or white (dark theme) in small steps until it
   * reaches 5:1 against the card surface, which leaves room for the Calendar date on its tint. The
   * presets already pass 5:1, so they come back as-is.
   */
  function readable(hex, isDark) {
    var surface = luminance(hexRgb(isDark ? PALETTES.dark.surface : PALETTES.light.surface));
    var target = hexRgb(isDark ? '#ffffff' : '#121a2b');
    var rgb = hexRgb(hex);
    for (var i = 0; i <= 10; i++) {
      var mix = rgb.map(function (v, k) {
        return Math.round(v + (target[k] - v) * (i / 10));
      });
      var l = luminance(mix);
      if ((Math.max(l, surface) + 0.05) / (Math.min(l, surface) + 0.05) >= 5) {
        if (i === 0) return hex;
        return (
          '#' +
          mix
            .map(function (v) {
              return ('0' + v.toString(16)).slice(-2);
            })
            .join('')
        );
      }
    }
    return isDark ? '#ffffff' : '#121a2b';
  }

  /** Day number since the epoch for the visitor's local date: the same maths as the home page. */
  function dayNumber(offset) {
    var now = new Date();
    return (
      Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000) +
      (offset || 0)
    );
  }

  function dateFor(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d;
  }

  function fmtDate(d, opts) {
    try {
      return d.toLocaleDateString('en-US', opts);
    } catch (e) {
      return d.toDateString();
    }
  }

  /** /bible/#<book>-<chapter> on the site's reader, for "Read Philippians 4". */
  function chapterLink(ref) {
    var m = /^([1-3]?[A-Za-z]+)\.(\d+)\./.exec(ref);
    if (!m) return null;
    var book = BOOKS[m[1]] || m[1];
    return {
      label: book + ' ' + m[2],
      href:
        ORIGIN +
        '/bible/?utm_source=widget&utm_medium=embed#' +
        book.toLowerCase().replace(/\s+/g, '-') +
        '-' +
        m[2],
    };
  }

  var ICONS = {
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    share: '<path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M7 11H5v10h14V11h-2"/>',
    book: '<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z"/><path d="M20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/>',
    close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    prev: '<path d="m15 6-6 6 6 6"/>',
    next: '<path d="m9 6 6 6-6 6"/>',
  };
  function icon(name) {
    return (
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ICONS[name] +
      '</svg>'
    );
  }
  var QUOTE_MARK =
    '<svg class="rb-glyph" width="36" height="29" viewBox="0 0 40 32" aria-hidden="true"><path fill="currentColor" ' +
    'd="M0 32V19C0 8 6 1.5 16 0l1.6 4C11.4 6 8.6 9.6 8.4 15H16v17zm22 0V19C22 8 28 1.5 38 0l1.6 4C33.4 6 30.6 9.6 30.4 15H38v17z"/></svg>';

  // One stylesheet for every layout. `.rb-scope` is the query container, so the narrow rules fire
  // on the column the embed sits in (a 280px sidebar on a 1440px screen is narrow).
  var STYLED_CSS =
    '.rb-scope{container-type:inline-size;font-family:var(--rb-ui);color:var(--rb-ink);line-height:1.5;' +
    '-webkit-font-smoothing:antialiased}' +
    // Containment would make the scope the containing block for position:fixed, pinning the
    // floating button inside a zero-height box instead of the viewport corner.
    '.rb-scope.rb-floating{container-type:normal}' +
    '.rb-box{box-sizing:border-box;width:100%;max-width:var(--rb-maxw,none);margin:var(--rb-margin,0 auto)}' +
    '.rb-card{background:var(--rb-surface);border:1px solid var(--rb-line);border-radius:var(--rb-r);color:var(--rb-ink)}' +
    '.rb-verse{margin:0;font-family:var(--rb-vf);font-size:var(--rb-vs-o,calc(var(--rb-vs,22px)*var(--rb-scale,1)));' +
    'line-height:1.5;font-weight:400;color:inherit;overflow-wrap:break-word}' +
    '.rb-ref{display:block;margin-top:10px;font:600 15px/1.4 var(--rb-ui);font-style:normal;color:var(--rb-accent)}' +
    '.rb-row{display:flex;align-items:center;justify-content:space-between;gap:8px}' +
    '.rb-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 8px}' +
    '.rb-grow{flex:1 1 0;min-width:0}' +
    '.rb-label{font-size:14px;font-weight:600;color:var(--rb-ink)}' +
    '.rb-chip{padding:4px 10px;border-radius:999px;background:var(--rb-chip);font-size:14px;white-space:nowrap}' +
    '.rb-btn{box-sizing:border-box;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;' +
    'border-radius:999px;border:1px solid var(--rb-line);background:transparent;color:var(--rb-ink);' +
    'font:500 15px/1 var(--rb-ui);cursor:pointer;text-decoration:none;white-space:nowrap}' +
    '.rb-btn:hover{background:var(--rb-chip)}' +
    '.rb-btn--light{background:rgba(255,255,255,0.92);color:#121a2b;border-color:transparent}' +
    '.rb-btn--light:hover{background:#fff}' +
    '.rb-btn--solid{background:var(--rb-ink);color:var(--rb-surface);border-color:var(--rb-ink)}' +
    '.rb-btn--solid:hover{background:var(--rb-ink);opacity:0.9}' +
    '.rb-icon{box-sizing:border-box;width:44px;height:44px;flex:none;display:inline-flex;align-items:center;' +
    'justify-content:center;padding:0;border:0;border-radius:50%;background:var(--rb-chip);color:var(--rb-ink);cursor:pointer}' +
    '.rb-icon:disabled{opacity:0.35;cursor:default}' +
    '.rb-icon--light{background:rgba(255,255,255,0.92);color:#121a2b}' +
    '.rb-link{min-height:44px;padding:0;border:0;background:none;color:var(--rb-ink);font:500 15px/1 var(--rb-ui);cursor:pointer}' +
    '.rb-link:hover{text-decoration:underline;text-underline-offset:4px}' +
    'button:focus-visible,a:focus-visible{outline:2px solid var(--rb-accent);outline-offset:2px}' +
    '.rb-credit a,::slotted(a){display:inline-flex !important;align-items:center !important;min-height:44px !important;' +
    'color:var(--rb-credit) !important;font:14px/1 var(--rb-ui) !important;text-decoration:none !important}' +
    '.rb-credit a:hover,::slotted(a:hover){text-decoration:underline !important}' +
    // Window: the verse on a photo, actions in a glass dock.
    '.rb-win{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:320px;margin:0;' +
    'border-radius:calc(var(--rb-r) + 4px);overflow:hidden;background:#3b4a45;color:#fff}' +
    '.rb-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    // Two layers of shade. The photo itself only gets a light wash, so the picture still reads as a
    // picture; the dark part travels with the text block (its 72px top padding is the ramp), so the
    // verse sits on 4.5:1 or better however tall it wraps, down to a 200px window.
    '.rb-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,14,24,0) 0%,rgba(8,14,24,0.25) 100%)}' +
    '.rb-win__body{position:relative;padding:72px 28px 12px;background:linear-gradient(180deg,rgba(8,14,24,0) 0,' +
    'rgba(8,14,24,0.68) 64px,rgba(8,14,24,0.8) 100%)}' +
    '.rb-win .rb-verse{font-weight:500;line-height:1.4;--rb-vs:24px}' +
    '.rb-win .rb-ref{color:#fff}' +
    // The dock hugs its buttons: stretched to the full width it was a long empty glass bar.
    '.rb-dock{display:inline-flex;max-width:calc(100% + 32px);box-sizing:border-box;align-items:center;gap:8px;' +
    'margin:20px -16px 0;padding:6px;border-radius:999px;' +
    'background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.28);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}' +
    '.rb-dock .rb-grow{display:none}' +
    '.rb-short{display:none}' +
    '.rb-under{display:flex;justify-content:flex-end;padding-right:8px}' +
    '@container (max-width:420px){.rb-win{min-height:340px}.rb-win__body{padding:56px 18px 12px}' +
    '.rb-win .rb-verse{--rb-vs:20px}.rb-dock{margin:16px -6px 0}.rb-long{display:none}.rb-short{display:inline}}' +
    // A sidebar is too narrow for three dock buttons with a label: the chapter link keeps its icon.
    '@container (max-width:310px){.rb-dock .rb-btn{padding:0 12px}.rb-dock .rb-btn span{display:none}}' +
    // Quiet: no card; borrows the host's text colour and sits between hairlines.
    '.rb-box.rb-quiet{margin:0;padding:24px 0;border-top:1px solid var(--rb-line);border-bottom:1px solid var(--rb-line)}' +
    '.rb-glyph{display:block;color:var(--rb-accent)}' +
    '.rb-quiet .rb-verse{margin-top:12px;--rb-vs:24px}' +
    '.rb-quiet .rb-foot{justify-content:flex-start;gap:4px 16px;margin-top:6px}' +
    '.rb-quiet .rb-ref{margin:0}' +
    '.rb-quiet .rb-link{font-weight:400;text-decoration:underline;text-underline-offset:4px}' +
    '@container (max-width:420px){.rb-quiet .rb-verse{--rb-vs:20px}}' +
    // Today: a compact sidebar card.
    '.rb-box.rb-today{padding:18px 18px 4px;--rb-maxw:360px}' +
    '.rb-today .rb-verse{margin-top:12px;--rb-vs:19px;line-height:1.45}' +
    '.rb-today .rb-ref{margin-top:8px}' +
    '.rb-today .rb-foot{margin-top:6px;border-top:1px solid var(--rb-line)}' +
    // A narrow sidebar column: the date chip drops under the label and long words still fit.
    '@container (max-width:260px){.rb-box.rb-today{padding:14px 14px 4px}.rb-today .rb-row{flex-wrap:wrap;gap:6px}' +
    '.rb-today .rb-verse{--rb-vs:17px}}' +
    // Calendar: a tear-off date beside the verse; the date becomes a band when narrow.
    // Calendar and Poster fill the column like a paragraph does; capped and centered, they sat
    // indented from the text on both sides.
    '.rb-cal{display:flex;overflow:hidden}' +
    '.rb-date{flex:none;width:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    // The date in the accent tint, not an ink slab: the slab was the heaviest thing on a light page.
    'gap:2px;padding:16px 0;background:var(--rb-tint);color:var(--rb-accent)}' +
    '.rb-mon{font-size:14px;font-weight:600;letter-spacing:0.08em}' +
    '.rb-day{font-family:' +
    SERIF +
    ';font-size:52px;line-height:1;font-weight:500}' +
    '.rb-wd{font-size:14px}' +
    '.rb-dline{display:none;font-size:15px;font-weight:500}' +
    '.rb-cal__body{flex:1;min-width:0;padding:20px 20px 4px}' +
    '.rb-cal .rb-verse{--rb-vs:21px}' +
    '.rb-cal .rb-foot{margin-top:8px}' +
    '.rb-pair{display:flex;gap:6px}' +
    '@container (max-width:460px){.rb-cal{flex-direction:column}.rb-date{width:auto;flex-direction:row;' +
    'align-items:baseline;justify-content:flex-start;gap:10px;padding:12px 18px}.rb-day{font-size:32px}' +
    '.rb-mon,.rb-wd{display:none}.rb-dline{display:inline}.rb-cal__body{padding:18px 18px 4px}.rb-cal .rb-verse{--rb-vs:19px}}' +
    // Poster: the card painted in the accent.
    '.rb-box.rb-poster{margin:0;padding:32px;border-radius:var(--rb-r);background:var(--rb-fill);color:var(--rb-onfill)}' +
    '.rb-poster .rb-verse{font-weight:600;line-height:1.35;letter-spacing:-0.01em;--rb-vs:26px}' +
    '.rb-poster .rb-ref{color:var(--rb-onfill);font-weight:500;font-size:16px;margin-top:14px}' +
    '.rb-poster .rb-foot{margin-top:24px;justify-content:flex-start}' +
    '.rb-poster .rb-btn{background:var(--rb-onfill);color:var(--rb-fill);border-color:var(--rb-onfill)}' +
    '.rb-poster .rb-icon{background:var(--rb-onfill-soft);color:var(--rb-onfill)}' +
    '@container (max-width:420px){.rb-box.rb-poster{padding:24px}.rb-poster .rb-verse{--rb-vs:22px}}' +
    // Floating: a corner button that opens the verse over the page; a bottom sheet on phones.
    '.rb-fab{position:fixed;right:24px;bottom:24px;z-index:2147483000;display:inline-flex;align-items:center;gap:8px;' +
    'min-height:52px;padding:0 20px;border:0;border-radius:999px;background:var(--rb-ink);color:var(--rb-surface);' +
    'font:500 15px/1 var(--rb-ui);box-shadow:0 12px 24px -10px rgba(8,14,24,0.5);cursor:pointer}' +
    '.rb-pop{position:fixed;right:24px;bottom:92px;z-index:2147483001;box-sizing:border-box;width:min(360px,calc(100vw - 32px));' +
    'max-height:calc(100vh - 120px);overflow:auto;padding:20px;border-radius:calc(var(--rb-r) - 2px);' +
    'background:var(--rb-surface);color:var(--rb-ink);border:1px solid var(--rb-line);box-shadow:0 24px 48px -16px rgba(8,14,24,0.35)}' +
    '.rb-pop[hidden],.rb-veil[hidden]{display:none}' +
    '.rb-pop .rb-verse{margin-top:4px;--rb-vs:19px}' +
    '.rb-pop .rb-foot{margin-top:12px}' +
    '.rb-pop .rb-label{font-weight:400;color:var(--rb-sec)}' +
    '.rb-grab{display:none}' +
    '.rb-veil{display:none}' +
    '@media (max-width:520px){.rb-pop{left:0;right:0;bottom:0;width:auto;max-height:85vh;padding:10px 20px 20px;' +
    'border-radius:var(--rb-r) var(--rb-r) 0 0;border-width:1px 0 0}' +
    '.rb-grab{display:block;width:36px;height:5px;margin:0 auto 8px;border-radius:999px;background:var(--rb-chip)}' +
    '.rb-veil:not([hidden]){display:block;position:fixed;inset:0;z-index:2147483000;background:rgba(8,14,24,0.55)}' +
    '.rb-fab{right:16px;bottom:16px}}' +
    // data-position="left", for sites whose right corner already holds a chat or dark-mode toggle.
    '.rb-left .rb-fab{right:auto;left:24px}.rb-left .rb-pop{right:auto;left:24px}' +
    '@media (max-width:520px){.rb-left .rb-fab{left:16px}.rb-left .rb-pop{left:0;right:0}}' +
    // data-inline="true": the button and card sit in the flow, for previews such as the block editor.
    '.rb-inline .rb-fab,.rb-inline .rb-pop{position:static}.rb-inline .rb-pop{margin-top:12px}' +
    '.rb-inline .rb-veil{display:none !important}';

  function verseBlock(verse) {
    return (
      '<blockquote class="rb-verse">' +
      escapeHtml(verse.text) +
      '</blockquote><cite class="rb-ref">' +
      escapeHtml(reference(verse.ref)) +
      '</cite>'
    );
  }

  function btnNew(cls, label) {
    return (
      '<button type="button" class="rb-btn ' +
      (cls || '') +
      '" data-rb="new">' +
      icon('refresh') +
      '<span>' +
      (label || 'New verse') +
      '</span></button>'
    );
  }

  /** Only offered where the browser has a share sheet; there is no fallback worth a button. */
  function btnShare(cls) {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return '';
    return (
      '<button type="button" class="rb-icon ' +
      (cls || '') +
      '" data-rb="share" aria-label="Share this verse">' +
      icon('share') +
      '</button>'
    );
  }

  /** The credit slot for the styled layouts (see creditSlot): colour comes from --rb-credit. */
  function credit(cfg) {
    if (!cfg.credit) return '';
    return (
      '<slot name="credit" class="rb-credit"><a href="' +
      SITE_LINK +
      '" target="_blank" rel="noopener">random-bible.com</a></slot>'
    );
  }

  var LAYOUTS = {
    window: function (v, st, cfg) {
      var ch = chapterLink(v.ref);
      return (
        '<figure class="rb-box rb-win"><img class="rb-photo" src="' +
        escapeHtml(cfg.photo) +
        '" alt="" decoding="async"><div class="rb-shade"></div>' +
        '<div class="rb-win__body">' +
        verseBlock(v) +
        '<div class="rb-dock"><button type="button" class="rb-icon rb-icon--light" data-rb="new" aria-label="New verse">' +
        icon('refresh') +
        '</button>' +
        (ch
          ? '<a class="rb-btn rb-btn--light" href="' +
            ch.href +
            '" target="_blank" rel="noopener" aria-label="Read ' +
            escapeHtml(ch.label) +
            '">' +
            icon('book') +
            '<span class="rb-long">Read ' +
            escapeHtml(ch.label) +
            '</span><span class="rb-short">Read chapter</span></a>'
          : '') +
        '<span class="rb-grow"></span>' +
        btnShare('rb-icon--light') +
        '</div></div></figure>' +
        (cfg.credit ? '<div class="rb-box rb-under">' + credit(cfg) + '</div>' : '')
      );
    },
    quiet: function (v, st, cfg) {
      return (
        '<figure class="rb-box rb-quiet">' +
        QUOTE_MARK +
        '<blockquote class="rb-verse">' +
        escapeHtml(v.text) +
        '</blockquote><figcaption class="rb-foot"><cite class="rb-ref">' +
        escapeHtml(reference(v.ref)) +
        '</cite><button type="button" class="rb-link" data-rb="new">Another verse</button>' +
        '<span class="rb-grow"></span>' +
        credit(cfg) +
        '</figcaption></figure>'
      );
    },
    today: function (v, st, cfg) {
      return (
        '<aside class="rb-box rb-card rb-today" aria-label="Verse of the day"><div class="rb-row"><span class="rb-label">' +
        (st.random ? 'Another verse' : 'Today') +
        '</span>' +
        (st.random
          ? ''
          : '<span class="rb-chip">' +
            fmtDate(dateFor(0), { weekday: 'short', month: 'short', day: 'numeric' }) +
            '</span>') +
        '</div>' +
        verseBlock(v) +
        '<div class="rb-foot"><button type="button" class="rb-link" data-rb="new">New verse</button>' +
        credit(cfg) +
        '</div></aside>'
      );
    },
    calendar: function (v, st, cfg) {
      var d = dateFor(st.offset);
      return (
        '<div class="rb-box rb-card rb-cal"><div class="rb-date"><span class="rb-mon">' +
        fmtDate(d, { month: 'short' }).toUpperCase() +
        '</span><span class="rb-day">' +
        d.getDate() +
        '</span><span class="rb-wd">' +
        fmtDate(d, { weekday: 'long' }) +
        '</span><span class="rb-dline">' +
        fmtDate(d, { month: 'long' }) +
        ' · ' +
        fmtDate(d, { weekday: 'long' }) +
        '</span></div><div class="rb-cal__body">' +
        verseBlock(v) +
        '<div class="rb-foot"><span class="rb-pair">' +
        '<button type="button" class="rb-icon" data-rb="prev" aria-label="Previous day"' +
        (st.offset <= -30 ? ' disabled' : '') +
        '>' +
        icon('prev') +
        '</button><button type="button" class="rb-icon" data-rb="next" aria-label="Next day"' +
        (st.offset >= 0 ? ' disabled' : '') +
        '>' +
        icon('next') +
        '</button></span>' +
        credit(cfg) +
        '</div></div></div>'
      );
    },
    poster: function (v, st, cfg) {
      return (
        '<figure class="rb-box rb-poster">' +
        verseBlock(v) +
        '<div class="rb-foot">' +
        btnNew() +
        btnShare() +
        '<span class="rb-grow"></span>' +
        credit(cfg) +
        '</div></figure>'
      );
    },
    floating: function (v, st, cfg) {
      var label = st.random ? 'A verse for you' : 'Verse for today';
      return (
        '<button type="button" class="rb-fab" data-rb="toggle" aria-expanded="' +
        (st.open ? 'true' : 'false') +
        '" aria-controls="rb-pop">' +
        icon(st.open ? 'close' : 'book') +
        '<span>' +
        label +
        '</span></button>' +
        '<div class="rb-veil" data-rb="close"' +
        (st.open ? '' : ' hidden') +
        '></div>' +
        // Always in the tree (hidden when closed) so the credit slot exists from the first paint.
        '<div class="rb-pop" id="rb-pop" role="dialog" aria-label="' +
        label +
        '"' +
        (st.open ? '' : ' hidden') +
        '><span class="rb-grab" aria-hidden="true"></span><div class="rb-row"><span class="rb-label">' +
        label +
        '</span><button type="button" class="rb-icon" data-rb="close" aria-label="Close">' +
        icon('close') +
        '</button></div>' +
        verseBlock(v) +
        '<div class="rb-foot">' +
        btnNew('rb-btn--solid') +
        credit(cfg) +
        '</div></div>'
      );
    },
  };

  /** Strip anything that could end a declaration; unquoted multi-word family names stay valid. */
  function safeFont(f) {
    return String(f || '')
      .replace(/["';{}<>\\]/g, '')
      .trim();
  }

  /** Set the custom properties a layout reads. Quiet takes its ink from the host text colour. */
  function applyVars(scope, cfg) {
    var isDark = darkTheme(cfg);
    var pal = PALETTES[isDark ? 'dark' : 'light'];
    var vars = {};
    if (cfg.style === 'quiet') {
      // Quiet has no surface of its own, so it decides light/dark from the host's text colour.
      var hostInk = cfg.hostColor || pal.ink;
      var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(hostInk);
      isDark = m ? luminance([+m[1], +m[2], +m[3]]) > 0.5 : isDark;
      pal = {
        surface: 'transparent',
        ink: hostInk,
        sec: hostInk,
        line: isDark ? PALETTES.dark.line : PALETTES.light.line,
        chip: 'transparent',
      };
    }
    var acc = accentSet(cfg, isDark);
    var c = CORNERS[cfg.corners] || CORNERS.round;
    var scale = { sm: 0.9, md: 1, lg: 1.15 }[cfg.size] || 1;
    vars['--rb-surface'] = pal.surface;
    vars['--rb-ink'] = pal.ink;
    vars['--rb-sec'] = pal.sec;
    vars['--rb-line'] = pal.line;
    vars['--rb-chip'] = pal.chip;
    vars['--rb-accent'] = acc.text;
    vars['--rb-tint'] = acc.tint;
    vars['--rb-fill'] = acc.fill;
    vars['--rb-onfill'] = acc.onFill;
    vars['--rb-onfill-soft'] =
      acc.onFill === '#ffffff' ? 'rgba(255,255,255,0.16)' : 'rgba(18,26,43,0.1)';
    vars['--rb-credit'] = cfg.style === 'poster' ? acc.onFill : pal.sec;
    vars['--rb-ui'] = SANS;
    vars['--rb-vf'] =
      cfg.font === 'sans' ? SANS : cfg.font === 'site' ? safeFont(cfg.hostFont) || SERIF : SERIF;
    vars['--rb-r'] = c.r + 'px';
    vars['--rb-s'] = c.s + 'px';
    vars['--rb-scale'] = String(scale);
    if (cfg.text) vars['--rb-vs-o'] = cfg.text + 'px';
    if (cfg.width) vars['--rb-maxw'] = cfg.width + 'px';
    vars['--rb-margin'] = cfg.align === 'left' ? '0' : '0 auto';
    for (var k in vars) scope.style.setProperty(k, vars[k]);
  }

  function shareVerse(verse) {
    try {
      navigator
        .share({
          text: verse.text + ' (' + reference(verse.ref) + ')',
          url: ORIGIN + '/?utm_source=widget&utm_medium=share',
        })
        .catch(function () {});
    } catch (e) {
      /* share sheet dismissed or unavailable */
    }
  }

  /** One parsed copy of the layout CSS for every embed, or null where constructable sheets are missing. */
  var sheetCache;
  function styledSheet() {
    if (sheetCache === undefined) {
      sheetCache = null;
      try {
        var sh = new CSSStyleSheet();
        sh.replaceSync(RESET + STYLED_CSS);
        if (document.adoptedStyleSheets !== undefined) sheetCache = sh;
      } catch (e) {
        /* older browsers: each render inlines a <style> instead */
      }
    }
    return sheetCache;
  }

  function renderStyled(el, cfg, pool, verse, focusKey) {
    // Calendar is the day's verse by definition (it shows the date), so it ignores data-mode.
    var st =
      el._rbState ||
      (el._rbState = {
        offset: 0,
        random: cfg.mode === 'random' && cfg.style !== 'calendar',
        open: false,
      });
    if (!verse) {
      if (!pool || !pool.length) verse = FALLBACK_VERSE;
      else if (st.random) verse = pick(pool);
      else verse = pool[((dayNumber(st.offset) % pool.length) + pool.length) % pool.length];
    }
    el._rbVerse = verse;
    el._rbTranslation = cfg.translation;
    var root = getRoot(el);
    // Each click re-renders the layout. The stylesheet is parsed once and shared by every embed
    // on the page (constructable sheets, with a <style> fallback), and the Window photo element
    // is carried over, so a tap doesn't reload or flash it.
    var sheet = styledSheet();
    var photo = root.querySelector('.rb-photo');
    if (sheet) root.adoptedStyleSheets = [sheet];
    root.innerHTML =
      (sheet ? '' : '<style>' + RESET + STYLED_CSS + '</style>') +
      '<div class="rb-scope rb-' +
      cfg.style +
      (cfg.position === 'left' ? ' rb-left' : '') +
      (cfg.inline ? ' rb-inline' : '') +
      '">' +
      LAYOUTS[cfg.style](verse, st, cfg) +
      '</div>';
    var freshPhoto = root.querySelector('.rb-photo');
    if (photo && freshPhoto && photo.getAttribute('src') === freshPhoto.getAttribute('src')) {
      freshPhoto.parentNode.replaceChild(photo, freshPhoto);
    }
    applyVars(root.querySelector('.rb-scope'), cfg);

    function again(key) {
      render(el, cfg, pool, null, key);
    }
    Array.prototype.forEach.call(root.querySelectorAll('[data-rb]'), function (node) {
      node.addEventListener('click', function () {
        var act = node.getAttribute('data-rb');
        if (act === 'new') {
          st.random = true;
          again('new');
        } else if (act === 'prev' || act === 'next') {
          st.offset += act === 'prev' ? -1 : 1;
          st.random = false;
          again(st.offset >= 0 && act === 'next' ? 'prev' : act);
        } else if (act === 'share') {
          shareVerse(verse);
        } else if (act === 'toggle') {
          st.open = !st.open;
          render(el, cfg, pool, verse, st.open ? 'close' : 'toggle');
        } else if (act === 'close') {
          st.open = false;
          render(el, cfg, pool, verse, 'toggle');
        }
      });
    });
    var pop = root.querySelector('.rb-pop');
    if (pop && st.open) {
      // Esc closes from anywhere in the widget, the corner button included.
      root.querySelector('.rb-scope').addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          st.open = false;
          render(el, cfg, pool, verse, 'toggle');
        }
      });
      // On phones the popover is a bottom sheet over a dimmed page, so it acts as a modal: Tab
      // cycles through the close button, New verse and the credit link instead of walking into
      // the page behind the veil.
      var sheetMode =
        typeof window.matchMedia === 'function' && window.matchMedia('(max-width:520px)').matches;
      if (sheetMode) {
        pop.setAttribute('aria-modal', 'true');
        pop.addEventListener('keydown', function (e) {
          if (e.key !== 'Tab') return;
          var link = el.querySelector('a[slot="credit"]') || root.querySelector('.rb-credit a');
          var stops = [
            pop.querySelector('[data-rb="close"]'),
            pop.querySelector('[data-rb="new"]'),
            link,
          ].filter(Boolean);
          var active = root.activeElement || document.activeElement;
          var i = stops.indexOf(active);
          if (e.shiftKey ? i <= 0 : i === stops.length - 1 || i === -1) {
            e.preventDefault();
            stops[e.shiftKey ? stops.length - 1 : 0].focus();
          }
        });
      }
    }
    if (focusKey) {
      var target =
        root.querySelector('.rb-pop [data-rb="' + focusKey + '"]') ||
        root.querySelector('[data-rb="' + focusKey + '"]');
      if (target && !target.disabled) target.focus();
    }
  }

  // Fetch each translation pool at most once and share the promise across containers.
  var poolCache = {};
  function getPool(translation) {
    if (!poolCache[translation]) {
      poolCache[translation] = fetch(ORIGIN + '/data/pool-' + translation + '.json')
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          return Array.isArray(data) ? data : [];
        });
    }
    return poolCache[translation];
  }

  /**
   * Render (or re-render) a single container, reading its current data attributes.
   * Pass { keepVerse: true } to restyle without drawing a new verse — used by the live preview
   * so changing the look doesn't shuffle the text. The verse is only kept when the translation
   * is unchanged (a different translation has a different pool, so it must re-pick).
   */
  function mount(el, opts) {
    if (!el) return;
    opts = opts || {};
    var cfg = readConfig(el);
    // One floating button per page: a second one would sit on top of the first in the same corner.
    // The owner is kept on window, so the embed script and the npm module (separate copies of this
    // code, possibly both on one page) share it; an owner that left the page or was destroyed
    // gives the corner up. Embeds that haven't mounted yet are found by the query, which keeps
    // the first one in the document the winner.
    var owner = window.__randomBibleFloating;
    if (owner && (!owner.isConnected || !owner._rbSig)) owner = null;
    if (cfg.style === 'floating' && !cfg.inline) {
      var first =
        owner ||
        document.querySelector(
          '.random-bible-verse[data-style="floating"]:not([data-inline="true"])',
        );
      if (first && first !== el) return;
      window.__randomBibleFloating = el;
    } else if (owner === el) {
      window.__randomBibleFloating = null;
    }
    // The host's own font and text colour, for data-font="site" and the Quiet style. Read from the
    // parent: the shadow root's `:host{all:initial}` resets the container's own computed style.
    var hostStyle = window.getComputedStyle(el.parentElement || el);
    cfg.hostFont = hostStyle.fontFamily;
    cfg.hostColor = hostStyle.color;
    // The layout's own state (random flag, calendar day, open popover) belongs to one style and
    // mode. When either changes, start it afresh and draw the verse that mode calls for; a pure
    // restyle (colour, theme, corners…) keeps both the state and the verse on screen.
    var sig = cfg.style + '|' + cfg.mode;
    var sameLayout = el._rbSig === sig;
    el._rbSig = sig;
    var keep = opts.keepVerse && sameLayout && el._rbVerse && el._rbTranslation === cfg.translation;
    if (!keep) el._rbState = null;
    // Only the latest mount draws: a slower pool from an earlier call (another translation, or a
    // mount that destroy() has since undone) must not land on top of it.
    var gen = (el._rbGen = (el._rbGen || 0) + 1);
    getPool(cfg.translation)
      .then(function (pool) {
        if (el._rbGen === gen) render(el, cfg, pool, keep ? el._rbVerse : null);
      })
      .catch(function () {
        // The legacy card leaves the host's fallback markup in place; a styled layout shows a
        // built-in verse rather than an empty box.
        if (el._rbGen === gen && cfg.style !== 'card' && getRoot(el)) render(el, cfg, [], null);
      });
  }

  /**
   * Undo mount(): empty the shadow root and forget the container's verse and layout state. The
   * shadow root itself stays (it can't be detached), so a later mount() reuses it.
   */
  function destroy(el) {
    if (!el) return;
    el._rbGen = (el._rbGen || 0) + 1;
    var root = el.shadowRoot;
    if (root) {
      if (root.adoptedStyleSheets && root.adoptedStyleSheets.length) root.adoptedStyleSheets = [];
      root.innerHTML = '';
    }
    el._rbState = el._rbVerse = el._rbTranslation = el._rbSig = null;
    if (window.__randomBibleFloating === el) window.__randomBibleFloating = null;
  }

  return { mount: mount, destroy: destroy, readConfig: readConfig };
}
