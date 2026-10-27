export type Layout = 'window' | 'quiet' | 'today' | 'calendar' | 'poster' | 'floating';

export interface BibleVerseOptions {
  /** The layout. Without it you get the original card. */
  layout?: Layout;
  /** Translation the verse comes from. Default 'kjv'. */
  translation?: 'kjv' | 'web' | 'asv';
  /**
   * 'auto' follows the visitor's system setting, live. Default 'light'. Quiet ignores it and
   * matches the text color around it.
   */
  theme?: 'light' | 'dark' | 'auto';
  /** A preset name, or a '#rgb' or '#rrggbb' color. Default 'teal'; 'gold' on the original card. */
  accent?: 'teal' | 'clay' | 'indigo' | 'plum' | (string & {});
  /** 'site' uses the font of the element the widget sits in. Default 'serif'. */
  font?: 'sans' | 'serif' | 'site';
  /** Card radius. Default 'round'. No effect on Quiet or the original card. */
  corners?: 'round' | 'soft' | 'square';
  /**
   * 'daily' shows the verse of the day, which changes at midnight in the visitor's time zone;
   * 'random' draws a new verse on each visit. Default 'daily'. Calendar is always daily and the
   * original card always random.
   */
  mode?: 'daily' | 'random';
  /** Center the widget in its column or keep it left. Default 'center'. No effect on Floating. */
  align?: 'center' | 'left';
  /** Preset scale. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Exact width in px, clamped to 200 to 1200. Default: the size preset. */
  width?: number;
  /** Exact verse text size in px, clamped to 10 to 48. Default: the size preset. */
  text?: number;
  /** An http(s) URL for the Window layout's photo. Default: the random-bible.com photo. */
  photo?: string;
  /** Floating only: which bottom corner the button sits in. Default 'right'. */
  position?: 'left' | 'right';
  /** Floating only: draw the button and its card in the page flow instead of the corner. */
  inline?: boolean;
}

/**
 * Draw the widget into `el`; the verse loads asynchronously. Calling it again restyles the widget
 * in place and keeps the verse on screen unless `layout`, `mode` or `translation` changed. Each
 * call replaces the previous options.
 */
export function mount(el: HTMLElement, options?: BibleVerseOptions): void;

/** Remove what mount() drew. Safe before the verse has loaded; the element can be mounted again. */
export function destroy(el: HTMLElement): void;

/** The class behind <random-bible-verse>; its attributes are the mount() options. */
export class RandomBibleVerseElement extends HTMLElement {
  static readonly observedAttributes: string[];
  options(): BibleVerseOptions;
}

/** The option names mount() reads, which are also the custom element's attributes. */
export const OPTION_NAMES: readonly (keyof BibleVerseOptions)[];

/** Register the custom element under another name. Importing the package registers the default. */
export function defineElement(name?: string): void;

declare global {
  interface HTMLElementTagNameMap {
    'random-bible-verse': RandomBibleVerseElement;
  }
}
