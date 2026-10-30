import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Info, UserCheck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AppShell, { BrandMark } from '@/components/AppShell';
import RequestForm from '@/components/RequestForm';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PlanId } from '@/lib/client';
import type { FlagLevel } from '@/lib/content';
import { trackOnce } from '@/lib/track';

gsap.registerPlugin(ScrollTrigger);

const IMG = {
  hero: 'https://mgx-backend-cdn.metadl.com/generate/images/1614411/2026-10-24/zay3e3ycalsq/hero-researcher.png',
  bench: 'https://mgx-backend-cdn.metadl.com/generate/images/1614411/2026-10-24/zay3fiycalsa/report-bench.png',
  team: 'https://mgx-backend-cdn.metadl.com/generate/images/1614411/2026-10-24/zay3fvycalrq/team-review.png',
};

const FLAG_ICON: Record<FlagLevel, { Icon: typeof Info; cls: string }> = {
  resolved: { Icon: CheckCircle2, cls: 'text-success' },
  note: { Icon: AlertTriangle, cls: 'text-warning' },
  pass: { Icon: Check, cls: 'text-success' },
};

function SectionHead({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="reveal-head max-w-[680px]">
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-[26px] font-extrabold leading-[1.15] tracking-[-0.035em] md:text-[36px]">{title}</h2>
      {body && <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">{body}</p>}
    </div>
  );
}

export default function Index() {
  const { t, lang } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const [plan, setPlan] = useState<PlanId>('student');
  const [faqOpen, setFaqOpen] = useState('');

  useEffect(() => {
    trackOnce('visit', lang);
    // Track once per session on first mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.defaults({ ease: 'power2.out', duration: 0.6 });
        gsap
          .timeline()
          .from('.hero-line', { y: 24, autoAlpha: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 })
          .from('.hero-sub', { y: 16, autoAlpha: 0 }, '-=0.4')
          .from('.hero-cta', { y: 12, autoAlpha: 0 }, '-=0.4')
          .from('.hero-img', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, '-=0.6')
          .from('.hero-chip', { y: 12, autoAlpha: 0 }, '-=0.3');

        // Reveals keep content readable before triggers fire (never fully hidden).
        gsap.utils.toArray<HTMLElement>('.reveal-head').forEach((el) => {
          gsap.fromTo(
            el.children,
            { y: 20, opacity: 0.35 },
            { y: 0, opacity: 1, stagger: 0.1, immediateRender: false, scrollTrigger: { trigger: el, start: 'top 82%' } },
          );
        });
        gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
          gsap.fromTo(el, { y: 24, opacity: 0.35 }, { y: 0, opacity: 1, immediateRender: false, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        });
        ScrollTrigger.batch('.card', {
          start: 'top 90%',
          once: true,
          onEnter: (els) => gsap.fromTo(els, { y: 24, opacity: 0.35 }, { y: 0, opacity: 1, stagger: 0.1 }),
        });
        gsap.utils.toArray<HTMLElement>('.stat-num').forEach((el) => {
          const target = Number(el.dataset.value || 0);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.2,
            snap: { v: 1 },
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
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

  const openMethod = () => {
    setFaqOpen('method');
    requestAnimationFrame(() => document.getElementById('faq-method')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const c = t.report.card;
  const n = t.numbers;

  return (
    <AppShell>
      <div ref={root} className="min-w-0 overflow-x-clip">
        <main id="top" className="mx-auto max-w-[1180px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pt-12">
          {/* Hero */}
          <section className="grid items-center gap-10 lg:grid-cols-[1.12fr_1fr] lg:gap-14">
            <div className="min-w-0">
              <p className="hero-line eyebrow text-primary">{t.hero.eyebrow}</p>
              <h1 className="mt-4 text-[34px] font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-[46px] xl:text-[56px]">
                <span className="hero-line block">{t.hero.titleA}</span>
                <span className="hero-line block text-muted-foreground">{t.hero.titleB}</span>
              </h1>
              <p className="hero-sub mt-5 max-w-[560px] text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">{t.hero.body}</p>
              <div className="hero-cta mt-8 flex flex-wrap items-center gap-3">
                <a href="#request" className="btn-primary px-6">
                  {t.hero.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="#report" className="btn-ghost border border-border hover:bg-muted">
                  {t.hero.secondary}
                </a>
              </div>
              <dl className="mt-10 grid max-w-[560px] grid-cols-3 gap-3 border-t border-border pt-6 sm:gap-5">
                {t.hero.stats.map((s) => (
                  <div key={s.label} className="min-w-0">
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="font-mono text-[24px] font-bold tracking-tight md:text-[30px]">
                        <span className="stat-num" data-value={s.value}>
                          {s.value}
                        </span>
                        {s.suffix}
                      </span>
                      <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">{s.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative min-w-0">
              <div className="hero-img group overflow-hidden rounded-[16px] border border-border shadow-sm">
                <img
                  src={IMG.hero}
                  alt="Researcher reviewing experiment charts at her desk"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="hero-chip absolute -bottom-5 left-3 max-w-[calc(100%-1.5rem)] rounded-[16px] border border-border bg-card p-4 shadow-md sm:-left-6">
                <p className="eyebrow text-muted-foreground">{t.hero.chipLabel}</p>
                <p className="mt-1.5 font-mono text-[20px] font-bold sm:text-[24px]">{t.hero.chipValue}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[12px] font-semibold text-accent-foreground">
                  <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {c.verdict}
                </p>
              </div>
            </div>
          </section>

          {/* Fields row */}
          <section className="mt-16 rounded-[16px] border border-border bg-muted/70 px-5 py-5" aria-label={t.fields.label}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <p className="eyebrow shrink-0 text-muted-foreground">{t.fields.label}</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {t.fields.items.map((f) => (
                  <li key={f} className="text-[14px] font-semibold text-foreground/80">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Steps */}
          <section id="how" className="scroll-mt-24 pt-16 lg:pt-20">
            <SectionHead eyebrow={t.steps.eyebrow} title={t.steps.title} body={t.steps.body} />
            <ol className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
              {t.steps.items.map((s) => (
                <li key={s.n} className="card flex min-w-0 flex-col rounded-[16px] border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                  <span className="inline-flex h-8 w-fit items-center rounded-full bg-accent px-3 font-mono text-[12px] font-bold text-accent-foreground">{s.n}</span>
                  <h3 className="mt-5 text-[17px] font-bold leading-snug tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Sample report */}
          <section id="report" className="scroll-mt-24 pt-16 lg:pt-20">
            <div className="grid gap-8 rounded-[16px] border border-border bg-card p-5 shadow-sm sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:p-10">
              <div className="min-w-0">
                <SectionHead eyebrow={t.report.eyebrow} title={t.report.title} body={t.report.body} />
                <ul className="reveal mt-6 space-y-2.5">
                  {t.report.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[14px] text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="reveal mt-7 hidden overflow-hidden rounded-[12px] border border-border lg:block">
                  <img src={IMG.bench} alt="Training curves on a monitor next to a notebook of results" className="aspect-[4/3] w-full object-cover" />
                </div>
              </div>

              <article className="reveal min-w-0 overflow-hidden rounded-[16px] border border-border bg-background" aria-label={`${c.sample}: ${c.tag}`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-dashed border-border bg-accent/60 px-4 py-2.5">
                  <span className="rounded-full bg-primary px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                    {c.sample}
                  </span>
                  <span className="text-[12px] text-muted-foreground">{c.sampleNote}</span>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[12px] text-muted-foreground">{c.tag}</span>
                    <span className="text-[12px] text-muted-foreground">{c.venue}</span>
                  </div>
                  <h3 className="mt-2 text-[17px] font-bold leading-snug tracking-[-0.02em]">{c.paper}</h3>
                  <div className="mt-4 rounded-[12px] bg-muted/80 p-3.5">
                    <p className="eyebrow text-muted-foreground">{c.claimLabel}</p>
                    <p className="mt-1 text-[14px] font-semibold">{c.claim}</p>
                  </div>

                  <div className="mt-3 rounded-[12px] border border-border p-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="eyebrow text-muted-foreground">{c.toleranceLabel}</p>
                      <p className="font-mono text-[15px] font-bold">{c.tolerance}</p>
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">{c.toleranceNote}</p>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-[12px] border border-border p-3.5">
                      <dt className="eyebrow text-muted-foreground">{c.reportedLabel}</dt>
                      <dd className="mt-1.5 font-mono text-[22px] font-bold">{c.reported}</dd>
                    </div>
                    <div className="rounded-[12px] border border-primary bg-accent/50 p-3.5">
                      <dt className="eyebrow text-accent-foreground">{c.measuredLabel}</dt>
                      <dd className="mt-1.5 font-mono text-[22px] font-bold">{c.measured}</dd>
                      <dd className="mt-1 text-[11px] text-muted-foreground">{c.measuredNote}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="eyebrow text-muted-foreground">{c.verdictLabel}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      {c.verdict}
                    </span>
                  </div>

                  <p className="eyebrow mt-5 text-muted-foreground">{c.flagsLabel}</p>
                  <ul className="mt-2.5 space-y-2.5">
                    {c.flags.map((f) => {
                      const { Icon, cls } = FLAG_ICON[f.level];
                      return (
                        <li key={f.text} className="flex gap-2.5 text-[13px] leading-snug">
                          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} aria-hidden="true" />
                          <span>
                            <span className="font-semibold">{c.flagLevels[f.level]}:</span> {f.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
                    <div>
                      <dt className="eyebrow text-muted-foreground">{c.tokensLabel}</dt>
                      <dd className="mt-1 font-mono text-[18px] font-bold">{c.tokens}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-muted-foreground">{c.minutesLabel}</dt>
                      <dd className="mt-1 font-mono text-[18px] font-bold">{c.minutes}</dd>
                      <dd className="text-[11px] text-muted-foreground">{c.minutesNote}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
                    <UserCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {c.reviewer}
                  </p>
                </div>
              </article>
            </div>
          </section>

          {/* Honest numbers */}
          <section id="numbers" className="scroll-mt-24 pt-16 lg:pt-20">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
              <div className="min-w-0">
                <SectionHead eyebrow={n.eyebrow} title={n.title} body={n.body} />
                <p className="reveal mt-5 text-[15px] leading-relaxed">{n.caveat}</p>
                <button
                  type="button"
                  onClick={openMethod}
                  className="reveal mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-primary transition-colors duration-200 hover:text-primary/80"
                >
                  {n.link}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <dl className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
                {n.stats.map((s) => (
                  <div key={s.label} className="card min-w-0 rounded-[16px] border border-border bg-card p-5 shadow-sm">
                    <dd className="font-mono text-[28px] font-bold leading-none tracking-tight sm:text-[38px]">
                      {s.prefix}
                      <span className="stat-num" data-value={s.value}>
                        {s.value}
                      </span>
                      <span className="text-[16px] sm:text-[20px]">{s.suffix}</span>
                    </dd>
                    <dt className="mt-2.5 text-[13px] leading-snug text-muted-foreground">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="scroll-mt-24 pt-16 lg:pt-20">
            <SectionHead eyebrow={t.pricing.eyebrow} title={t.pricing.title} body={t.pricing.body} />
            <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-5">
              {t.pricing.plans.map((p) => (
                <div
                  key={p.id}
                  className={`card relative flex min-w-0 flex-col rounded-[16px] bg-card p-6 transition-shadow duration-300 hover:shadow-md ${
                    p.highlight ? 'border-2 border-primary shadow-md' : 'border border-border shadow-sm'
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">{t.pricing.recommended}</span>
                  )}
                  <h3 className="text-[18px] font-bold tracking-[-0.02em]">{p.name}</h3>
                  <p className="mt-1.5 min-h-[42px] text-[14px] text-muted-foreground">{p.desc}</p>
                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="text-[38px] font-extrabold leading-none tracking-[-0.035em]">{p.price}</span>
                    <span className="text-[13px] text-muted-foreground">{t.pricing.perClaim}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-border pt-5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[14px]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => choosePlan(p.id)}
                    className={p.highlight ? 'btn-primary mt-7 w-full' : 'btn-ghost mt-7 w-full border border-border hover:bg-muted'}
                  >
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24 pt-16 lg:pt-20">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
              <SectionHead eyebrow={t.faq.eyebrow} title={t.faq.title} body={t.faq.body} />
              <Accordion
                type="single"
                collapsible
                value={faqOpen}
                onValueChange={setFaqOpen}
                className="reveal min-w-0 rounded-[16px] border border-border bg-card px-5 shadow-sm md:px-6"
              >
                {t.faq.items.map((item, i) => (
                  <AccordionItem
                    key={item.id}
                    id={`faq-${item.id}`}
                    value={item.id}
                    className={`scroll-mt-24 ${i === t.faq.items.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <AccordionTrigger className="py-5 text-left text-[15px] font-semibold hover:no-underline">{item.q}</AccordionTrigger>
                    <AccordionContent className="pb-5 text-[14px] leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Request form */}
          <section id="request" className="scroll-mt-24 pt-16 lg:pt-20">
            <div className="grid gap-8 rounded-[16px] border border-border bg-muted/50 p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:p-10">
              <div className="min-w-0">
                <SectionHead eyebrow={t.form.eyebrow} title={t.form.title} body={t.form.body} />
                <div className="reveal group mt-7 overflow-hidden rounded-[12px] border border-border">
                  <img
                    src={IMG.team}
                    alt="Two researchers reviewing results together on a laptop"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="reveal min-w-0">
                <RequestForm plan={plan} onPlanChange={setPlan} />
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border bg-card">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
            <div>
              <BrandMark />
              <p className="mt-3 max-w-[320px] text-[13px] text-muted-foreground">{t.footer.tagline}</p>
            </div>
            {t.footer.cols.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-muted-foreground">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className="inline-flex min-h-8 items-center text-[14px] text-muted-foreground transition-colors duration-200 hover:text-foreground">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border">
            <p className="mx-auto max-w-[1180px] px-4 py-5 text-[12px] text-muted-foreground sm:px-6 lg:px-10">
              © {new Date().getFullYear()} Repro Desk. {t.footer.rights}
            </p>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
