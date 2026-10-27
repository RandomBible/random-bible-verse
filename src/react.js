'use client';
// <BibleVerse layout="poster" theme="auto" />: a thin React wrapper over mount()/destroy().

import { createElement, useEffect, useRef } from 'react';
import { OPTION_NAMES, destroy, mount } from './index.js';

// The shortest each layout gets over the real verse pool at 340px and 680px columns (measured in
// Chrome), so the server-rendered placeholder holds most of the room without ever leaving a gap
// under the widget once it draws.
const RESERVE = { card: 160, window: 364, quiet: 176, today: 192, calendar: 204, poster: 200 };

export function BibleVerse(props) {
  const ref = useRef(null);
  const options = {};
  const rest = {};
  for (const key of Object.keys(props)) {
    if (OPTION_NAMES.includes(key)) options[key] = props[key];
    else if (key !== 'children') rest[key] = props[key];
  }
  const signature = JSON.stringify(options);

  useEffect(() => {
    mount(ref.current, options);
  }, [signature]);

  useEffect(() => {
    const el = ref.current;
    return () => destroy(el);
  }, []);

  const floating = options.layout === 'floating' && !options.inline;
  const minHeight = floating ? undefined : RESERVE[options.layout || 'card'];
  return createElement(
    'div',
    { ...rest, ref, style: { minHeight, ...rest.style } },
    // The credit link is part of the server-rendered HTML; the widget shows it in its footer.
    createElement('a', { slot: 'credit', href: 'https://random-bible.com/' }, 'random-bible.com'),
  );
}
