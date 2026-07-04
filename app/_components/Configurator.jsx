'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { CDN, LOCALES, NAMES } from '../../lib/site';

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
      <h1>ghost-progress-plugin</h1>
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
