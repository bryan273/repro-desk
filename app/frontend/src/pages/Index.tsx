import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SiteHeader, { Wordmark } from '@/components/SiteHeader';
import RequestForm from '@/components/RequestForm';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PlanId } from '@/lib/client';

gsap.registerPlugin(ScrollTrigger);

const IMG = {
  hero: 'https://mgx-backend-cdn.metadl.com/generate/images/1614411/2026-10-24/zay3e3ycalsq/hero-researcher.png',
  bench: 'https://mgx-backend-cdn.metadl.com/generate/images/1614411/2026-10-24/zay3fiycalsa/report-bench.png',
  team: 'https://mgx-backend-cdn.metadl.com/generate/images/1614411/2026-10-24/zay3fvycalrq/team-review.png',
};

const REPORT_NUMBERS = { reported: '34.1', reproduced: '33.8 ± 0.3', delta: '−0.3' };

function SectionHead({ eyebrow, title, body, dark = false }: { eyebrow: string; title: string; body?: string; dark?: boolean }) {
  return (
    <div className="reveal-head max-w-[720px]">
      <p className={`eyebrow ${dark ? 'text-white/70' : 'text-muted-foreground'}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-[32px] font-medium leading-[1.15] tracking-[-0.01em] md:text-[42px] ${dark ? 'text-white' : ''}`}>{title}</h2>
      {body && <p className={`mt-5 text-[17px] leading-relaxed ${dark ? 'text-white/75' : 'text-muted-foreground'}`}>{body}</p>}
    </div>
  );
}

export default function Index() {
  const { t } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [plan, setPlan] = useState<PlanId>('pilot');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.defaults({ ease: 'power2.out', duration: 0.6 });
        const tl = gsap.timeline();
        tl.from('.hero-line', { y: 24, autoAlpha: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 })
          .from('.hero-sub', { y: 16, autoAlpha: 0 }, '-=0.4')
          .from('.hero-cta', { y: 12, autoAlpha: 0 }, '-=0.4')
          .from('.hero-img', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, '-=0.6')
          .from('.hero-chip', { y: 12, autoAlpha: 0 }, '-=0.3');

        // Reveals keep content readable before triggers fire (never fully hidden).
        gsap.utils.toArray<HTMLElement>('.reveal-head').forEach((el) => {
          gsap.fromTo(
            el.children,
            { y: 20, opacity: 0.35 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              immediateRender: false,
              scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 24, opacity: 0.35 },
            { y: 0, opacity: 1, immediateRender: false, scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
          );
        });

        ScrollTrigger.batch('.card', {
          start: 'top 88%',
          once: true,
          onEnter: (els) => gsap.fromTo(els, { y: 24, opacity: 0.35 }, { y: 0, opacity: 1, stagger: 0.1 }),
        });

        gsap.utils.toArray<HTMLElement>('.divider-img').forEach((el) => {
          gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, scrub: true } });
        });

        gsap.utils.toArray<HTMLElement>('.stat-num').forEach((el) => {
          const target = Number(el.dataset.value || 0);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.2,
            snap: { v: 1 },
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: () => {
              el.textContent = String(obj.v);
            },
          });
        });
      });
    }, root);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  const choosePlan = (id: PlanId) => {
    setPlan(id);
    document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' });
  };

  const c = t.report.card;

  return (
    <div ref={root} className="min-h-screen bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-background focus:px-4 focus:py-2">
        Skip to content
      </a>
      <SiteHeader scrolled={scrolled} />

      <main id="main">
        {/* Hero */}
        <section className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-16">
          <div>
            <p className="hero-line eyebrow text-muted-foreground">{t.hero.eyebrow}</p>
            <h1 className="mt-5 text-[40px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[52px] xl:text-[66px]">
              <span className="hero-line block">{t.hero.titleA}</span>
              <span className="hero-line block">
                <em className="font-serif font-normal italic">{t.hero.titleEm}</em> {t.hero.titleB}
              </span>
            </h1>
            <p className="hero-sub mt-6 max-w-[560px] text-[18px] leading-relaxed text-muted-foreground md:text-[20px]">{t.hero.body}</p>
            <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
              <a href="#request" className="btn-primary px-7">
                {t.hero.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#report" className="btn-ghost text-foreground hover:bg-muted">
                {t.hero.secondary}
              </a>
            </div>
            <dl className="mt-12 grid max-w-[560px] grid-cols-3 gap-6 border-t border-border pt-8">
              {t.hero.stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="font-mono text-[28px] font-bold md:text-[34px]">
                      <span className="stat-num" data-value={s.value}>
                        {s.value}
                      </span>
                      {s.suffix}
                    </span>
                    <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="hero-img group overflow-hidden rounded-[24px] shadow-xl">
              <img
                src={IMG.hero}
                alt="Researcher reviewing experiment charts at her desk"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <div className="hero-chip absolute -bottom-6 left-4 rounded-[16px] bg-background p-5 shadow-2xl sm:-left-8 sm:p-6">
              <p className="eyebrow text-muted-foreground">{t.hero.chipLabel}</p>
              <p className="mt-2 font-mono text-[22px] font-bold sm:text-[26px]">
                84.2 <span className="text-muted-foreground">→</span> 83.9
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[13px] font-medium">
                <Check className="h-3.5 w-3.5 text-[hsl(145_45%_34%)]" aria-hidden="true" />
                {t.report.card.verdict}
              </p>
            </div>
          </div>
        </section>

        {/* Fields row */}
        <section className="border-y border-border bg-muted/50" aria-label={t.fields.label}>
          <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-6 py-8 lg:flex-row lg:items-center lg:gap-10 lg:px-10">
            <p className="eyebrow shrink-0 text-muted-foreground">{t.fields.label}</p>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {t.fields.items.map((f) => (
                <li key={f} className="text-[17px] font-medium text-foreground/80">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Steps */}
        <section id="how" className="mx-auto max-w-[1320px] scroll-mt-20 px-6 py-20 lg:px-10 lg:py-24">
          <SectionHead eyebrow={t.steps.eyebrow} title={t.steps.title} body={t.steps.body} />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {t.steps.items.map((s) => (
              <li key={s.n} className="card flex flex-col rounded-[16px] border border-border bg-card p-8 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                <span className="font-mono text-sm font-bold text-muted-foreground">{s.n}</span>
                <h3 className="mt-6 text-[22px] font-medium leading-snug">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Sample report — charcoal band */}
        <section id="report" className="scroll-mt-16 bg-[hsl(60_13%_6%)] text-white">
          <div className="mx-auto grid max-w-[1320px] gap-12 px-6 py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-10 lg:py-24">
            <div>
              <SectionHead eyebrow={t.report.eyebrow} title={t.report.title} body={t.report.body} dark />
              <ul className="reveal mt-8 space-y-3">
                {t.report.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-white/85">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="reveal relative mt-10 hidden overflow-hidden rounded-[16px] lg:block">
                <img src={IMG.bench} alt="Training curves on a monitor next to a notebook of results" className="divider-img aspect-[4/3] w-full scale-110 object-cover" />
              </div>
            </div>

            <article className="reveal self-start rounded-[16px] bg-background p-6 text-foreground shadow-2xl md:p-10" aria-label={c.tag}>
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-muted px-3 py-1 font-mono text-[13px]">{c.tag}</span>
                <span className="text-[13px] text-muted-foreground">{c.venue}</span>
              </div>
              <h3 className="mt-6 text-[22px] font-medium leading-snug md:text-[26px]">{c.paper}</h3>
              <div className="mt-6 rounded-[12px] bg-muted p-4">
                <p className="eyebrow text-muted-foreground">{c.claimLabel}</p>
                <p className="mt-1 font-medium">{c.claim}</p>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { k: c.reported, v: REPORT_NUMBERS.reported },
                  { k: c.reproduced, v: REPORT_NUMBERS.reproduced },
                  { k: c.delta, v: REPORT_NUMBERS.delta },
                ].map((m) => (
                  <div key={m.k} className="rounded-[12px] border border-border p-4">
                    <dt className="eyebrow text-muted-foreground">{m.k}</dt>
                    <dd className="mt-2 font-mono text-[18px] font-bold md:text-[22px]">{m.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="eyebrow text-muted-foreground">{c.verdictLabel}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {c.verdict}
                </span>
              </div>
              <p className="eyebrow mt-8 text-muted-foreground">{c.checksLabel}</p>
              <table className="mt-3 w-full text-[15px]">
                <tbody>
                  {c.checks.map((row) => (
                    <tr key={row.k} className="border-t border-border">
                      <th scope="row" className="py-3 pr-4 text-left font-normal text-muted-foreground">
                        {row.k}
                      </th>
                      <td className="py-3 text-right font-medium">{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-[1320px] scroll-mt-20 px-6 py-20 lg:px-10 lg:py-24">
          <SectionHead eyebrow={t.pricing.eyebrow} title={t.pricing.title} body={t.pricing.body} />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {t.pricing.plans.map((p) => (
              <div
                key={p.id}
                className={`card relative flex flex-col rounded-[16px] bg-card p-8 transition-shadow duration-300 hover:shadow-xl ${
                  p.highlight ? 'border-2 border-foreground shadow-lg' : 'border border-border shadow-sm'
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-[13px] font-medium text-primary-foreground">{t.pricing.recommended}</span>
                )}
                <h3 className="text-[22px] font-medium">{p.name}</h3>
                <p className="mt-2 min-h-[48px] text-muted-foreground">{p.desc}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-[44px] font-medium leading-none tracking-tight">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{t.pricing.perClaim}</span>
                </p>
                <ul className="mt-8 flex-1 space-y-3 border-t border-border pt-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => choosePlan(p.id)}
                  className={
                    p.highlight
                      ? 'btn-primary mt-8 w-full'
                      : 'btn-ghost mt-8 w-full border border-border text-foreground hover:bg-muted'
                  }
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-border bg-muted/40">
          <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10 lg:py-24">
            <SectionHead eyebrow={t.faq.eyebrow} title={t.faq.title} body={t.faq.body} />
            <Accordion type="single" collapsible className="reveal rounded-[16px] bg-card px-6 shadow-sm md:px-8">
              {t.faq.items.map((item, i) => (
                <AccordionItem key={item.q} value={`faq-${i}`} className={i === t.faq.items.length - 1 ? 'border-b-0' : ''}>
                  <AccordionTrigger className="py-6 text-left text-[17px] font-medium hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="pb-6 text-[16px] leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Request form — charcoal band */}
        <section id="request" className="scroll-mt-16 bg-[hsl(60_13%_6%)] text-white">
          <div className="mx-auto grid max-w-[1320px] gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-10 lg:py-24">
            <div>
              <SectionHead eyebrow={t.form.eyebrow} title={t.form.title} body={t.form.body} dark />
              <div className="reveal group mt-10 overflow-hidden rounded-[16px]">
                <img
                  src={IMG.team}
                  alt="Two researchers reviewing results together on a laptop"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>
            <div className="reveal">
              <RequestForm plan={plan} onPlanChange={setPlan} />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-[340px] text-muted-foreground">{t.footer.tagline}</p>
          </div>
          {t.footer.cols.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-muted-foreground">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="text-foreground/80 transition-colors duration-200 hover:text-foreground">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border">
          <p className="mx-auto max-w-[1320px] px-6 py-6 text-sm text-muted-foreground lg:px-10">
            © {new Date().getFullYear()} Repro Desk. {t.footer.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
