import { useEffect, useState, type ReactNode } from 'react';
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

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLanguage();
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

  const deskItems = [
    { id: 'top', href: '/#top', label: t.nav.overview },
    ...t.nav.links.map((l) => ({ id: l.href.slice(1), href: `/${l.href}`, label: l.label })),
    { id: 'request', href: '/#request', label: t.nav.cta },
    { id: 'admin', href: '/admin', label: t.nav.admin },
  ];

  const groupLabel = 'px-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground';
  const itemBase = 'flex min-h-[40px] items-center justify-between gap-2 rounded-full px-3 text-[14px] transition-colors duration-200';

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pb-5 pt-6">
      <div className="px-1">
        <BrandMark />
      </div>

      <nav className="mt-8" aria-label={t.nav.groupDesk}>
        <p className={groupLabel}>{t.nav.groupDesk}</p>
        <ul className="mt-2 space-y-0.5">
          {deskItems.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? (item.id === 'admin' ? 'page' : 'location') : undefined}
                  className={`${itemBase} ${
                    isActive ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav className="mt-7" aria-label={t.nav.groupSuite}>
        <p className={groupLabel}>{t.nav.groupSuite}</p>
        <ul className="mt-2 space-y-0.5">
          {t.nav.suite.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                className={`${itemBase} text-muted-foreground hover:bg-muted hover:text-foreground`}
              >
                <span className="min-w-0 truncate">{s.label}</span>
                <span aria-hidden="true" className="text-[12px]">
                  ↗
                </span>
                <span className="sr-only">({t.nav.newTab})</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-5">
        <ThemeToggle />
        <LangToggle />
      </div>
    </div>
  );
}

/** Shared Repro Suite layout: 248px sticky sidebar, drawer under 900px. */
export default function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground min-[900px]:grid min-[900px]:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen self-start border-r border-border bg-card min-[900px]:block">
        <Sidebar />
      </aside>

      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur min-[900px]:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.nav.menu}
          aria-expanded={open}
          aria-controls="mobile-drawer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-[18px] leading-none hover:bg-muted"
        >
          <span aria-hidden="true">☰</span>
        </button>
        <BrandMark compact />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 min-[900px]:hidden" role="dialog" aria-modal="true" aria-label={t.nav.groupDesk}>
          <button type="button" aria-label={t.nav.close} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40" />
          <aside id="mobile-drawer" className="relative h-full w-[280px] max-w-[85vw] border-r border-border bg-card shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.nav.close}
              className="absolute right-3 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full text-[18px] hover:bg-muted"
            >
              <span aria-hidden="true">✕</span>
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="min-w-0">{children}</div>
    </div>
  );
}
