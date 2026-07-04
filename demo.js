/* Configurator logic for the ghost-progress-plugin demo page.
   Drives the widget (loaded from ./progress.js with data-auto="false") via its
   create()/destroy() API, regenerates the embed snippet, and reports usage to
   Umami. None of this ships with the distributed widget. */
(function () {
    // jsDelivr serves our GitHub repo; @1 tracks the latest v1.x release and is
    // auto-minified (the .min file). If jsDelivr has a hiccup, Statically mirrors
    // the same paths at cdn.statically.io/gh/GreedyLabs/ghost-progress-plugin@main.
    var CDN = 'https://cdn.jsdelivr.net/gh/GreedyLabs/ghost-progress-plugin@1';
    var DEF = window.GreedyLabsGhostProgress.defaults;
    // per-page localized strings (set by each generated /<lang>/index.html)
    var I = window.GPROG_I18N || { copy: '복사', copyDone: '복사됨' };
    var instance = null;
    var $ = function (id) { return document.getElementById(id); };

    // Safe Umami event tracker (no-op if the script is blocked/unloaded)
    function track(name, data) {
        try { if (window.umami && window.umami.track) { window.umami.track(name, data); } } catch (e) {}
    }

    // Parse an integer field, falling back to the default only when it's empty/
    // invalid, NOT when it's a legitimate 0 (a `|| DEF` would swallow zero).
    function intField(id, def) {
        var v = parseInt($(id).value, 10);
        return isNaN(v) ? def : v;
    }

    function read() {
        return {
            content: $('f-content').value.trim() || '.gh-content',
            position: $('f-position').value,
            height: intField('f-height', DEF.height),
            useThemeColor: $('f-useThemeColor').checked,
            color: $('f-color').value,
            zIndex: intField('f-zindex', DEF.zIndex)
        };
    }

    function render() {
        var o = read();
        $('f-color').disabled = o.useThemeColor;

        if (instance) { instance.destroy(); instance = null; }
        instance = window.GreedyLabsGhostProgress.create({
            content: '.demo-article',
            position: o.position,
            height: o.height,
            color: o.useThemeColor ? undefined : o.color,
            zIndex: o.zIndex
        });
        updateSnippet(o);
    }

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function updateSnippet(o) {
        var a = [];
        a.push('data-content="' + esc(o.content) + '"');
        a.push('data-position="' + esc(o.position) + '"');
        if (o.height !== DEF.height) { a.push('data-height="' + o.height + '"'); }
        if (!o.useThemeColor) { a.push('data-color="' + esc(o.color) + '"'); }
        if (o.zIndex !== DEF.zIndex) { a.push('data-z-index="' + o.zIndex + '"'); }

        var code =
            '<link rel="stylesheet" href="' + CDN + '/progress.css">\n' +
            '<script src="' + CDN + '/progress.min.js"\n        ' +
            a.join('\n        ') + '><\/script>';
        $('snippet').textContent = code;
    }

    ['f-content', 'f-position', 'f-height', 'f-useThemeColor', 'f-color', 'f-zindex']
        .forEach(function (id) {
            var el = $(id);
            el.addEventListener('input', render);
            // 'change' = committed value (fires once on blur/select), so it's the
            // right granularity for analytics: one event per actual adjustment.
            el.addEventListener('change', function () {
                render();
                track('config_change', {
                    field: id.slice(2), // strip "f-"
                    value: String(el.type === 'checkbox' ? el.checked : el.value).slice(0, 60)
                });
            });
        });

    // Copy via the async Clipboard API, falling back to a hidden textarea +
    // execCommand for insecure contexts / unfocused documents / old browsers.
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
        }
        return legacyCopy(text);
    }
    function legacyCopy(text) {
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text; ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
            document.body.appendChild(ta); ta.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            ok ? resolve() : reject();
        });
    }

    $('copy').addEventListener('click', function () {
        var btn = this, o = read();
        track('copy_code', { position: o.position, height: o.height, useThemeColor: o.useThemeColor });
        copyText($('snippet').textContent).then(function () {
            btn.textContent = I.copyDone; btn.classList.add('ok');
            setTimeout(function () { btn.textContent = I.copy; btn.classList.remove('ok'); }, 1500);
        });
    });

    // language dropdown → navigate to the selected /<lang>/
    var langSel = $('lang-select');
    if (langSel) { langSel.addEventListener('change', function () { location.href = this.value; }); }

    // theme switcher: light / dark / system. "system" follows the OS and reacts
    // to OS changes live; the chosen mode is persisted. Light/dark set on <html>
    // drive the demo page and the bar (via its CSS variables); giscus is kept in
    // sync over postMessage.
    var themeSel = $('theme-select');
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    function effectiveTheme(mode) { return mode === 'system' ? (mql.matches ? 'dark' : 'light') : mode; }
    function syncGiscus(theme) {
        var f = document.querySelector('iframe.giscus-frame');
        if (f && f.contentWindow) {
            f.contentWindow.postMessage({ giscus: { setConfig: { theme: theme } } }, 'https://giscus.app');
        }
    }
    function applyTheme(mode) {
        document.documentElement.setAttribute('data-theme', effectiveTheme(mode));
        syncGiscus(mode === 'system' ? 'preferred_color_scheme' : effectiveTheme(mode));
    }
    if (themeSel) {
        var saved = 'system';
        try { saved = localStorage.getItem('gprog-theme') || 'system'; } catch (e) {}
        themeSel.value = saved;
        applyTheme(saved);
        themeSel.addEventListener('change', function () {
            try { localStorage.setItem('gprog-theme', this.value); } catch (e) {}
            applyTheme(this.value);
            track('theme_change', { theme: this.value });
        });
        mql.addEventListener('change', function () {
            if (themeSel.value === 'system') { applyTheme('system'); }
        });
        // giscus loads lazily; push the current theme once it's ready (its initial
        // data-theme is preferred_color_scheme, which only matches "system").
        var giscusSynced = false;
        window.addEventListener('message', function (e) {
            if (e.origin !== 'https://giscus.app' || giscusSynced) { return; }
            if (e.data && e.data.giscus) {
                giscusSynced = true;
                if (themeSel.value !== 'system') { syncGiscus(effectiveTheme(themeSel.value)); }
            }
        });
    }

    // content-selector presets (Ghost / Notion) — fill the field with one click
    [].forEach.call(document.querySelectorAll('.preset'), function (btn) {
        btn.addEventListener('click', function () {
            $('f-content').value = this.getAttribute('data-content');
            render();
            track('preset', { content: this.getAttribute('data-content') });
        });
    });

    render();
})();
