import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Lang } from '@/lib/content';

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <a href="/" className={`inline-flex items-center gap-1 text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-foreground'}`}>
      Repro<span className="inline-block h-2 w-2 translate-y-1 rounded-full bg-primary" aria-hidden="true" />Desk
    </a>
  );
}

export function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  const options: { id: Lang; label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'zh', label: '中文' },
  ];
  return (
    <div
      role="group"
      aria-label={t.nav.langLabel}
      className={`inline-flex h-10 items-center rounded-full p-1 text-sm ${dark ? 'bg-white/10' : 'bg-muted'}`}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={lang === o.id}
          onClick={() => setLang(o.id)}
          className={`h-8 min-w-[44px] rounded-full px-3 font-medium transition-colors duration-200 ${
            lang === o.id
              ? dark
                ? 'bg-white text-foreground'
                : 'bg-foreground text-background'
              : dark
                ? 'text-white/75 hover:text-white'
                : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
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
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-6 px-6 lg:px-10">
        <Wordmark />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {t.nav.links.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] text-muted-foreground transition-colors duration-200 hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LangToggle />
          <a href="#request" className="btn-primary h-11">
            {t.nav.cta}
          </a>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
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
        <div className="border-t border-border bg-background px-6 pb-6 lg:hidden">
          <nav className="flex flex-col py-2" aria-label="Mobile">
            {t.nav.links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 text-lg">
                {l.label}
              </a>
            ))}
          </nav>
          <a href="#request" onClick={() => setOpen(false)} className="btn-primary w-full">
            {t.nav.cta}
          </a>
        </div>
      )}
    </header>
  );
}
