import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { Lang } from '@/lib/content';

export function Wordmark() {
  return (
    <a href="/" className="inline-flex shrink-0 items-center gap-1 text-xl font-bold tracking-tight text-foreground">
      Repro<span className="inline-block h-2 w-2 translate-y-1 rounded-full bg-primary" aria-hidden="true" />Desk
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
    <div role="group" aria-label={t.nav.langLabel} className="inline-flex h-10 shrink-0 items-center rounded-full bg-muted p-1 text-sm">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={lang === o.id}
          onClick={() => setLang(o.id)}
          className={`h-8 min-w-[44px] rounded-full px-3 font-medium transition-colors duration-200 ${
            lang === o.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { theme, toggle } = useTheme();
  const { t } = useLanguage();
  const label = theme === 'dark' ? t.nav.themeLight : t.nav.themeDark;
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full transition-colors duration-200 hover:bg-muted ${
        withLabel ? 'border border-border px-4' : 'w-11'
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {withLabel && <span className="text-[15px]">{t.nav.themeText}</span>}
    </button>
  );
}

export default function SiteHeader({ scrolled }: { scrolled: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur transition-[border-color] duration-200 ${
        scrolled ? 'border-b border-border' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-6 lg:px-10">
        <Wordmark />
        <nav className="hidden items-center gap-7 xl:flex" aria-label="Main">
          {t.nav.links.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] text-muted-foreground transition-colors duration-200 hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <LangToggle />
          <ThemeToggle />
          <a href="#request" className="btn-primary ml-1 h-11">
            {t.nav.cta}
          </a>
        </div>
        <div className="flex items-center gap-1 xl:hidden">
          <LangToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t.nav.close : t.nav.menu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-5 pb-6 xl:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile">
            {t.nav.links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-lg">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle withLabel />
            <a href="#request" onClick={() => setOpen(false)} className="btn-primary flex-1">
              {t.nav.cta}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
