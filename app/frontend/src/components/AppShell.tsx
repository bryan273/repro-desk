import { useEffect, useState, type ReactNode } from 'react';
import SuiteTopBar from '@/components/SuiteTopBar';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { Lang } from '@/lib/content';

const SECTION_IDS = ['top', 'how', 'report', 'numbers', 'pricing', 'faq', 'request'];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  return (
    <a href="/" className="flex min-w-0 items-center gap-3 rounded-[12px]">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-black text-[17px] font-extrabold text-white dark:ring-1 dark:ring-border"
      >
        D
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-extrabold leading-tight tracking-[-0.02em]">Repro Desk</span>
        {!compact && <span className="block truncate text-[12px] text-muted-foreground">{t.nav.suiteTagline}</span>}
      </span>
    </a>
  );
}

export function LangToggle() {
  const { lang, setLang, t } = useLanguage();
  const options: { id: Lang; label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'zh', label: '中文' },
  ];
  return (
    <div role="group" aria-label={t.nav.langLabel} className="inline-flex h-10 shrink-0 items-center rounded-full border border-border bg-muted p-1 text-[13px]">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={lang === o.id}
          onClick={() => setLang(o.id)}
          className={`h-8 min-w-[44px] rounded-full px-3 font-semibold transition-colors duration-200 ${
            lang === o.id ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();
  const label = theme === 'dark' ? t.nav.themeLight : t.nav.themeDark;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[17px] leading-none transition-colors duration-200 hover:bg-muted"
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}

/** Shared Paperlit layout: sticky top bar with the app links, the Paper Explainer link and the suite menu. */
export default function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useLanguage();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [active, setActive] = useState(isHome ? 'top' : 'admin');

  useEffect(() => {
    if (!isHome) {
      setActive(pathname.startsWith('/admin') ? 'admin' : '');
      return;
    }
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-35% 0px -60% 0px' },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [isHome, pathname]);

  const nav = [
    { label: t.nav.overview, to: '/#top', active: active === 'top' },
    ...t.nav.links
      .filter((l) => ['#how', '#report', '#pricing'].includes(l.href))
      .map((l) => ({ label: l.label, to: `/${l.href}`, active: active === l.href.slice(1) })),
    { label: t.nav.cta, to: '/#request', active: active === 'request' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SuiteTopBar appId="desk" brand="Repro Desk" letter="D" homeTo="/#top" nav={nav} dark={theme === 'dark'} onToggleDark={toggle} lang={lang} onLang={setLang} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
