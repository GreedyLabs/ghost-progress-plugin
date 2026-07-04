import React from 'react';
import meta from '../i18n/meta.json';

export const ORIGIN = 'https://ghost-progress-plugin.greedylabs.kr';
export const CDN = 'https://cdn.jsdelivr.net/gh/GreedyLabs/ghost-progress-plugin@1';
export const REPO = 'https://github.com/GreedyLabs/ghost-progress-plugin';
export const ORG = 'https://github.com/GreedyLabs';
export const LOCALES = meta.order;
export const DEFAULT_LOCALE = meta.default;
export const NAMES = meta.names;
export const OG_LOCALES = meta.locales;

export const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%231a73e8'/%3E%3Crect x='6' y='14' width='20' height='4' rx='2' fill='rgba(255,255,255,.35)'/%3E%3Crect x='6' y='14' width='12' height='4' rx='2' fill='white'/%3E%3C/svg%3E";

export const GISCUS_LANG = { ko: 'ko', en: 'en', ja: 'ja', zh: 'zh-CN', es: 'es', fr: 'fr', de: 'de', pt: 'pt', hi: 'en' };

export const codeInstall = () =>
`<link rel="stylesheet" href="${CDN}/progress.css">
<script src="${CDN}/progress.min.js"
        data-content=".gh-content"
        data-position="top"></script>`;

export const CODE_OPTIONS =
`data-content=".gh-content"
data-position="top"
data-height="4"
data-z-index="100"`;

export const CODE_COLOR =
`.greedylabs-ghost-progress {
  --greedylabs-ghost-progress-color: #1a73e8;
  --greedylabs-ghost-progress-track: rgba(0,0,0,.08);
}`;

// Wrap code tokens (data-* attrs, selectors, class names, CSS vars) in <code> for monospace.
const CODE_RE = /(data-[a-z]+(?:-[a-z]+)*(?:="[^"]*")?)|(\.gh-[a-z-]+)|(\.notion-page-content)|(\.giscus)(?![\w-])|(gh-comments gh-canvas)|(--[a-z-]*ghost[a-z-]*)|(greedylabs-ghost-[a-z-]+)/g;

export function richText(s) {
  const out = []; let last = 0, m; CODE_RE.lastIndex = 0;
  while ((m = CODE_RE.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    out.push(React.createElement('code', { key: m.index }, m[0]));
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

export function jsonLd(locale, t, url) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'ghost-progress-plugin',
        description: t('description'),
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web (Ghost, Notion)',
        softwareVersion: '1',
        url,
        codeRepository: REPO,
        license: 'https://opensource.org/licenses/MIT',
        author: { '@type': 'Organization', name: 'GreedyLabs', url: ORG },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        sameAs: [REPO]
      },
      {
        '@type': 'WebSite',
        name: 'ghost-progress-plugin',
        url: `${ORIGIN}/`,
        inLanguage: locale,
        publisher: { '@type': 'Organization', name: 'GreedyLabs', url: ORG }
      }
    ]
  };
}
