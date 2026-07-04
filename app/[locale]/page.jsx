import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LOCALES, codeInstall, CODE_OPTIONS, CODE_COLOR, richText } from '../../lib/site';
import Configurator from '../_components/Configurator';
import Comments from '../_components/Comments';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <>
      <Configurator locale={locale} />

      <div className="demo-hero">{t('heroText')}</div>

      <article className="demo-article gh-content gh-canvas">
        <h1>{t('demoTitle')}</h1>
        <p>{richText(t('demoIntro'))}</p>

        <h2>{t('h_intro')}</h2>
        <p>{richText(t('bodyIntro'))}</p>

        <h2>{t('h_install')}</h2>
        <p>{richText(t('bodyInstall'))}</p>
        <pre><code>{codeInstall()}</code></pre>
        <h3>{t('h_codeinjection')}</h3>
        <p>{richText(t('bodyCodeInjection'))}</p>
        <h3>{t('h_options')}</h3>
        <p>{richText(t('bodyOptions'))}</p>
        <pre><code>{CODE_OPTIONS}</code></pre>

        <h2>{t('h_customize')}</h2>
        <p>{richText(t('bodyCustomize'))}</p>
        <h3>{t('h_color')}</h3>
        <p>{richText(t('bodyColor'))}</p>
        <pre><code>{CODE_COLOR}</code></pre>
        <h3>{t('h_position')}</h3>
        <p>{richText(t('bodyPosition'))}</p>

        <h2>{t('h_faq')}</h2>
        <h4>{t('faqQ1')}</h4>
        <p>{richText(t('faqA1'))}</p>
        <h4>{t('faqQ2')}</h4>
        <p>{richText(t('faqA2'))}</p>
        <h4>{t('faqQ3')}</h4>
        <p>{richText(t('faqA3'))}</p>

        <h2>{t('h_closing')}</h2>
        <p>{richText(t('bodyClosing'))}</p>
      </article>

      <section className="demo-comments gh-canvas">
        <Comments locale={locale} />
      </section>
    </>
  );
}
