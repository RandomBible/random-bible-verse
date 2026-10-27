// The npm module: mount()/destroy() for any element, and the <random-bible-verse> custom element.
// build.mjs puts core.js where the marker below is.

/* @core */

const widget = createWidget();

/** Option names, in the order the custom element's attributes are listed. */
export const OPTION_NAMES = [
  'layout',
  'translation',
  'theme',
  'accent',
  'font',
  'corners',
  'mode',
  'align',
  'size',
  'width',
  'text',
  'photo',
  'position',
  'inline',
];

// The core reads the same keys as the embed's data attributes; `layout` is its `style`.
function toCoreOptions(options) {
  const out = {};
  for (const key of OPTION_NAMES) {
    const value = options[key];
    if (value === undefined || value === null || value === false) continue;
    out[key === 'layout' ? 'style' : key] = String(value);
  }
  return out;
}

const mounted = new Set();

/**
 * Draw the widget into `el` (any block element). Calling it again with new options restyles it in
 * place and keeps the verse on screen unless the layout, mode or translation changed.
 */
export function mount(el, options = {}) {
  el._rbOptions = toCoreOptions(options);
  widget.mount(el, { keepVerse: mounted.has(el) });
  mounted.add(el);
}

/** Remove what mount() drew. */
export function destroy(el) {
  mounted.delete(el);
  widget.destroy(el);
  delete el._rbOptions;
}

// theme: 'auto' follows the system setting live, as the embed does. Containers that left the page
// without destroy() are dropped here rather than kept alive and redrawn.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  const onScheme = () => {
    for (const el of mounted) {
      if (!el.isConnected) mounted.delete(el);
      else if (widget.readConfig(el).theme === 'auto') widget.mount(el, { keepVerse: true });
    }
  };
  // Safari before 14 only has the old addListener().
  if (scheme.addEventListener) scheme.addEventListener('change', onScheme);
  else if (scheme.addListener) scheme.addListener(onScheme);
}

const Base = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

/**
 * <random-bible-verse layout="poster" theme="auto"></random-bible-verse>
 *
 * Attributes are the mount() options; `inline` is a boolean attribute. Put the credit link inside
 * as <a slot="credit" href="https://random-bible.com/">random-bible.com</a>.
 */
export class RandomBibleVerseElement extends Base {
  static get observedAttributes() {
    return OPTION_NAMES;
  }

  connectedCallback() {
    // Moved within the page: still drawn, nothing to do.
    if (!mounted.has(this)) mount(this, this.options());
  }

  disconnectedCallback() {
    // A move (reorder, re-parent) disconnects and reconnects in the same task; only an element
    // that stays out of the page is torn down, so a move keeps its verse and state.
    queueMicrotask(() => {
      if (!this.isConnected) destroy(this);
    });
  }

  attributeChangedCallback() {
    if (this.isConnected && mounted.has(this)) mount(this, this.options());
  }

  options() {
    const options = {};
    for (const key of OPTION_NAMES) {
      if (!this.hasAttribute(key)) continue;
      const value = this.getAttribute(key);
      options[key] = key === 'inline' ? value !== 'false' : value;
    }
    return options;
  }
}

/** Register the custom element. Importing the package already does this for the default name. */
export function defineElement(name = 'random-bible-verse') {
  if (typeof customElements !== 'undefined' && !customElements.get(name)) {
    customElements.define(name, class extends RandomBibleVerseElement {});
  }
}

defineElement();
