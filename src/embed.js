/**
 * Random Bible: embeddable verse widget for any website (churches, blogs, ministries).
 *
 * Usage (paste on the host page):
 *   <div class="random-bible-verse">
 *     <a slot="credit" href="https://random-bible.com/">random-bible.com</a>
 *   </div>
 *   <script src="https://random-bible.com/widget.js" async></script>
 *
 * Renders a calm scripture card into every `.random-bible-verse` container, drawing from the
 * same curated, encouraging verse pools the site uses. Self-contained vanilla JS with
 * no dependencies. The card is rendered inside a Shadow DOM root, so the host page's
 * CSS cannot reach in and break it: not blanket `blockquote`/`button`/`figure` selectors, not
 * `!important` declarations, not injected `::before`/`::after` pseudo-elements. (Inline styles
 * alone can't defend against any of those.)
 *
 * The credit anchor is the one part that deliberately stays in the host's light DOM. A <slot> in
 * the card footer projects it, so it renders inside the card while remaining static markup in the
 * host page's served HTML, like any other link on that page. Embeds that predate the slot
 * supply no anchor, and the slot's fallback (built here, UTM-tagged) covers them.
 * ::slotted() styles it, with `!important`, because host `a {}` rules otherwise outrank the
 * shadow tree for slotted nodes.
 *
 * Each container is customized with data attributes (all optional; omit for the default look):
 *   data-style        window | quiet | today | calendar | poster | floating
 *                                                          (default: the original card)
 *   data-translation  kjv | web | asv                     (default kjv)
 *   data-theme        light | dark | auto                  (default light; auto follows the OS)
 *   data-accent       teal | clay | indigo | plum | #hex   (default teal; gold on the card)
 *   data-font         serif | sans | site                  (default serif; site = the page's font)
 *   data-corners      round | soft | square                (default round; not Quiet or the card)
 *   data-mode         daily | random                       (default daily; card: always random)
 *   data-align        center | left                        (default center)
 *   data-size         sm | md | lg                         (default md)
 *   data-width        card width in px, 200-1200           (overrides data-size's width)
 *   data-text         verse font size in px, 10-48         (overrides data-size's text)
 *   data-position     right | left                         (floating: which corner)
 *
 * Every option, with pictures: https://random-bible.com/bible-verse-widget/
 *
 * Example:
 *   <div class="random-bible-verse" data-style="poster" data-theme="auto" data-accent="clay">
 *     <a slot="credit" href="https://random-bible.com/">random-bible.com</a>
 *   </div>
 */
(function () {
  'use strict';
  /* @core */
  var widget = createWidget();
  var mount = widget.mount;

  function init() {
    var els = document.querySelectorAll('.random-bible-verse');
    Array.prototype.forEach.call(els, mount);
  }

  // data-theme="auto" follows the system setting live, not just at load.
  if (typeof window.matchMedia === 'function') {
    var scheme = window.matchMedia('(prefers-color-scheme: dark)');
    var onScheme = function () {
      var els = document.querySelectorAll('.random-bible-verse[data-theme="auto"]');
      Array.prototype.forEach.call(els, function (el) {
        mount(el, { keepVerse: true });
      });
    };
    if (scheme.addEventListener) scheme.addEventListener('change', onScheme);
    else if (scheme.addListener) scheme.addListener(onScheme);
  }

  // Expose a tiny API so the configurator page can re-render its live preview on change.
  window.RandomBibleWidget = { mount: mount, init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
