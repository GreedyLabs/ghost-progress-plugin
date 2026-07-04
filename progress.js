/*!
 * ghost-progress-plugin — a portable, theme-independent reading progress bar.
 * https://github.com/GreedyLabs/ghost-progress-plugin
 * MIT License
 *
 * Embed (e.g. Ghost → Settings → Code Injection → Site Footer):
 *   <link rel="stylesheet" href=".../progress.css">
 *   <script src=".../progress.js"
 *           data-content=".gh-content"
 *           data-position="top"></script>
 *
 * All data-* options (with defaults):
 *   data-content    CSS selector for the article body   (".gh-content, article, main, .post-content, .entry-content")
 *   data-position   "top" | "bottom"                    ("top")
 *   data-height     bar thickness (px)                  (4)
 *   data-color      bar color (any CSS color)           (theme accent)
 *   data-z-index    stacking order                      (100)
 *   data-auto       set to "false" to skip auto-init    ("true")
 *
 * Programmatic API (for tools / live previews):
 *   var bar = GreedyLabsGhostProgress.create({ content: '.article', position: 'top' });
 *   bar.destroy();
 *
 * Everything is namespaced under the unique class "greedylabs-ghost-progress"
 * (and --greedylabs-ghost-progress-* CSS variables) to avoid clashes with any theme.
 */
(function () {
    'use strict';

    var NS = 'greedylabs-ghost-progress';

    var DEFAULTS = {
        content: '.gh-content, article, main, .post-content, .entry-content',
        position: 'top',
        height: 4,
        color: '',
        zIndex: 100
    };

    // Merge defined option values over DEFAULTS and normalise `position`.
    function resolveConfig(options) {
        var cfg = {}, k;
        for (k in DEFAULTS) { if (DEFAULTS.hasOwnProperty(k)) { cfg[k] = DEFAULTS[k]; } }
        if (options) {
            for (k in options) {
                if (options.hasOwnProperty(k) && options[k] !== undefined && options[k] !== null) { cfg[k] = options[k]; }
            }
        }
        cfg.position = cfg.position === 'bottom' ? 'bottom' : 'top';
        return cfg;
    }

    // Build the bar element (a track holding a scaling fill).
    function buildBar(cfg) {
        var bar = document.createElement('div');
        bar.className = NS + ' ' + NS + '--' + cfg.position;
        bar.setAttribute('aria-hidden', 'true');
        bar.style.setProperty('--' + NS + '-height', cfg.height + 'px');
        bar.style.setProperty('--' + NS + '-z', String(cfg.zIndex));
        if (cfg.color) { bar.style.setProperty('--' + NS + '-color', cfg.color); }

        var fill = document.createElement('div');
        fill.className = NS + '__fill';
        bar.appendChild(fill);
        return { bar: bar, fill: fill };
    }

    // Create a progress-bar instance. Returns { element, destroy } or null if the
    // content element can't be found.
    function create(options) {
        var cfg = resolveConfig(options);

        var content = typeof cfg.content === 'string' ? document.querySelector(cfg.content) : cfg.content;
        if (!content) { return null; }

        var built = buildBar(cfg);
        var bar = built.bar, fill = built.fill;
        document.body.appendChild(bar);

        // Reading progress 0..1 through the article: 0 when its top reaches the top
        // of the viewport, 1 when its bottom reaches the bottom of the viewport.
        function progress() {
            var scrollY = window.scrollY;
            var start = content.getBoundingClientRect().top + scrollY;
            var end = start + content.offsetHeight - window.innerHeight;
            var p = end > start ? (scrollY - start) / (end - start) : (scrollY >= start ? 1 : 0);
            return p < 0 ? 0 : (p > 1 ? 1 : p);
        }

        function update() { fill.style.transform = 'scaleX(' + progress() + ')'; }

        // Coalesce scroll / resize / content-grow events into one update per frame.
        var ticking = false;
        function tick() {
            if (ticking) { return; }
            ticking = true;
            window.requestAnimationFrame(function () { update(); ticking = false; });
        }

        update();
        window.addEventListener('scroll', tick, { passive: true });
        window.addEventListener('resize', tick);

        // The page can grow after load (lazy images, embeds, comments), which
        // changes the article height, so recompute on document-size changes too.
        var ro = window.ResizeObserver ? new ResizeObserver(tick) : null;
        if (ro) { ro.observe(document.documentElement); }

        return {
            element: bar,
            destroy: function () {
                window.removeEventListener('scroll', tick);
                window.removeEventListener('resize', tick);
                if (ro) { ro.disconnect(); }
                if (bar.parentNode) { bar.parentNode.removeChild(bar); }
            }
        };
    }

    // Expose the programmatic API.
    window.GreedyLabsGhostProgress = { create: create, defaults: DEFAULTS };

    // Auto-init from this script's own data-* attributes (unless data-auto="false").
    var thisScript = document.currentScript;
    function ready(fn) {
        if (document.readyState !== 'loading') { fn(); }
        else { document.addEventListener('DOMContentLoaded', fn); }
    }
    ready(function () {
        var script = thisScript || document.querySelector('script[src*="progress.js"]');
        if (!script || script.getAttribute('data-auto') === 'false') { return; }
        function num(name, def) {
            var v = script.getAttribute('data-' + name);
            return v === null ? def : parseInt(v, 10);
        }
        function str(name, def) {
            var v = script.getAttribute('data-' + name);
            return v === null ? def : v;
        }
        create({
            content: str('content', undefined),
            position: str('position', undefined),
            height: num('height', undefined),
            color: str('color', undefined),
            zIndex: num('z-index', undefined)
        });
    });
})();
