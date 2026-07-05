'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { CDN, LOCALES, NAMES, REPO } from '../../lib/site';

const DEF = { height: 4, zIndex: 100 };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default function Configurator({ locale }) {
  const t = useTranslations();
  const [o, setO] = useState({
    content: '.gh-content', position: 'top', height: DEF.height,
    useThemeColor: true, color: '#1a73e8', zIndex: DEF.zIndex
  });
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const inst = useRef(null);
  const set = (k) => (e) => setO((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  useEffect(() => setMounted(true), []);

  // Load the local widget and drive it via its API (data-auto="false" skips its auto-init).
  useEffect(() => {
    if (window.GreedyLabsGhostProgress) { setReady(true); return; }
    const s = document.createElement('script');
    s.src = '/progress.js'; s.setAttribute('data-auto', 'false');
    s.onload = () => setReady(true);
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    if (!ready || !window.GreedyLabsGhostProgress) return;
    if (inst.current) { inst.current.destroy(); inst.current = null; }
    inst.current = window.GreedyLabsGhostProgress.create({
      content: '.demo-article', position: o.position, height: num(o.height),
      color: o.useThemeColor ? undefined : o.color, zIndex: num(o.zIndex)
    });
    return () => { if (inst.current) { inst.current.destroy(); inst.current = null; } };
  }, [ready, o]);

  function num(v) { const n = parseInt(v, 10); return isNaN(n) ? undefined : n; }
  const snippet = buildSnippet(o);

  function copy() {
    copyText(snippet).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }

  return (
    <aside className="panel">
      <div className="panel-head">
        <h1>ghost-progress-plugin</h1>
        <a className="gh-link" href={REPO} target="_blank" rel="noopener" aria-label="View on GitHub" title="View on GitHub">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
        </a>
      </div>
      <div className="panel-meta">
        <div className="field row">
          <div>
            <label htmlFor="lang-select">{t('langLabel')}</label>
            <select id="lang-select" value={`/${locale}/`} onChange={(e) => { location.href = e.target.value; }}>
              {LOCALES.map((l) => <option key={l} value={`/${l}/`}>{NAMES[l]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="theme-select">{t('themeLabel')}</label>
            <select id="theme-select" value={mounted ? (theme || 'system') : 'system'} onChange={(e) => setTheme(e.target.value)}>
              <option value="system">{t('themeSystem')}</option>
              <option value="light">{t('themeLight')}</option>
              <option value="dark">{t('themeDark')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="field">
        <label htmlFor="f-content">{t('lblContent')} <span style={{ fontWeight: 400, color: 'var(--ui-muted)' }}>{t('hintContent')}</span></label>
        <input type="text" id="f-content" value={o.content} onChange={set('content')} />
        <div className="presets">
          <button type="button" className="preset" onClick={() => setO((p) => ({ ...p, content: '.gh-content' }))}>Ghost</button>
          <button type="button" className="preset" onClick={() => setO((p) => ({ ...p, content: '.notion-page-content' }))}>Notion</button>
        </div>
      </div>

      <div className="field row">
        <div>
          <label htmlFor="f-position">{t('lblPosition')}</label>
          <select id="f-position" value={o.position} onChange={set('position')}>
            <option value="top">{t('optTop')}</option>
            <option value="bottom">{t('optBottom')}</option>
          </select>
        </div>
        <div><label htmlFor="f-height">{t('lblHeight')}</label><input type="number" id="f-height" value={o.height} step="1" onChange={set('height')} /></div>
      </div>

      <div className="field check">
        <input type="checkbox" id="f-useThemeColor" checked={o.useThemeColor} onChange={set('useThemeColor')} />
        <label htmlFor="f-useThemeColor">{t('lblAutoColor')}</label>
      </div>
      <div className="field row">
        <div><label htmlFor="f-color">{t('lblColor')}</label><input type="color" id="f-color" value={o.color} disabled={o.useThemeColor} onChange={set('color')} /></div>
        <div><label htmlFor="f-zindex">{t('lblZindex')}</label><input type="number" id="f-zindex" value={o.zIndex} step="1" onChange={set('zIndex')} /></div>
      </div>

      <div className="code">
        <div className="code-head"><strong>{t('embedLabel')}</strong><button className={'copy' + (copied ? ' ok' : '')} id="copy" onClick={copy}>{copied ? t('copyDone') : t('copy')}</button></div>
        <pre><code id="snippet">{snippet}</code></pre>
      </div>

      <div className="panel-support">
        <p>{t('support')}</p>
        <a href="https://www.buymeacoffee.com/daeho.ro" target="_blank" rel="noopener">
          <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy me a coffee" height="40" width="145" />
        </a>
      </div>
    </aside>
  );
}

function buildSnippet(o) {
  const a = [
    `data-content="${esc(o.content)}"`,
    `data-position="${esc(o.position)}"`
  ];
  const ni = (v) => parseInt(v, 10);
  if (ni(o.height) !== DEF.height) a.push(`data-height="${ni(o.height)}"`);
  if (!o.useThemeColor) a.push(`data-color="${esc(o.color)}"`);
  if (ni(o.zIndex) !== DEF.zIndex) a.push(`data-z-index="${ni(o.zIndex)}"`);
  return `<link rel="stylesheet" href="${CDN}/progress.css">\n<script src="${CDN}/progress.min.js"\n        ${a.join('\n        ')}></script>`;
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
  }
  return legacyCopy(text);
}
function legacyCopy(text) {
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    ok ? resolve() : reject();
  });
}
