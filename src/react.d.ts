import type { HTMLAttributes, ReactElement } from 'react';
import type { BibleVerseOptions } from './index.js';

export interface BibleVerseProps
  extends BibleVerseOptions, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {}

/** The Bible verse widget as a React component. Safe to render on the server. */
export function BibleVerse(props: BibleVerseProps): ReactElement;
