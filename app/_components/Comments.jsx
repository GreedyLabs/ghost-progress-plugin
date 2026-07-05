'use client';
import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';
import { GISCUS_LANG } from '../../lib/site';

export default function Comments({ locale }) {
  const { resolvedTheme } = useTheme();
  return (
    <Giscus
      repo="GreedyLabs/giscus-comment"
      repoId="R_kgDOTHbOrw"
      category="ghost-plugins"
      categoryId="DIC_kwDOTHbOr84DAhRe"
      mapping="specific"
      term="ghost-progress-plugin"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={resolvedTheme || 'preferred_color_scheme'}
      lang={GISCUS_LANG[locale] || 'en'}
      loading="lazy"
    />
  );
}
