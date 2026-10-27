import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { client, errorMessage, type PlanId, type ReproRequestInput } from '@/lib/client';
import { trackOnce } from '@/lib/track';

type Field = 'paper_link' | 'claim' | 'email';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function isPaperLink(v: string): boolean {
  const s = v.trim();
  return /^https?:\/\/\S+\.\S+/i.test(s) || /^doi:\S+/i.test(s) || /^10\.\d{4,}\/\S+/.test(s);
}

interface Props {
  plan: PlanId;
  onPlanChange: (plan: PlanId) => void;
}

const inputCls =
  'w-full rounded-[12px] border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card';

export default function RequestForm({ plan, onPlanChange }: Props) {
  const { t, lang } = useLanguage();
  const f = t.form;
  const [values, setValues] = useState({ paper_link: '', claim: '', email: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successId, setSuccessId] = useState<number | null>(null);

  const validate = () => {
    const next: Partial<Record<Field, string>> = {};
    if (!isPaperLink(values.paper_link)) next.paper_link = f.errors.paper;
    if (values.claim.trim().length < 5) next.claim = f.errors.claim;
    if (!EMAIL_RE.test(values.email.trim())) next.email = f.errors.email;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setSubmitting(true);
    const payload: ReproRequestInput = {
      paper_link: values.paper_link.trim(),
      claim: values.claim.trim(),
      email: values.email.trim(),
      language: lang,
      plan,
    };
    try {
      const res = await client.entities.repro_requests.create({ data: payload });
      setSuccessId(res.data?.id ?? null);
      setValues({ paper_link: '', claim: '', email: '' });
    } catch (err) {
      setSubmitError(`${f.errors.submit} (${errorMessage(err, 'error')})`);
    } finally {
      setSubmitting(false);
    }
  };

  const update = (k: Field, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  if (successId !== null) {
    return (
      <div className="rounded-[16px] border border-border bg-card p-6 shadow-sm md:p-8" role="status" aria-live="polite">
        <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
        <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.03em]">{f.successTitle}</h3>
        <p className="mt-3 text-muted-foreground">{f.successBody}</p>
        <p className="mt-6 font-mono text-3xl font-bold">RQ-{String(successId).padStart(4, '0')}</p>
        <button type="button" onClick={() => setSuccessId(null)} className="btn-ghost mt-8 border border-border hover:bg-muted">
          {f.another}
        </button>
      </div>
    );
  }

  const fieldErr = (k: Field) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mt-2 text-[13px] text-destructive">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={() => trackOnce('form_start', lang)}
      noValidate
      className="min-w-0 rounded-[16px] border border-border bg-card p-5 shadow-sm sm:p-7 md:p-8"
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="paper_link" className="block text-[14px] font-semibold">
            {f.paper}
          </label>
          <p className="mt-1 text-[13px] text-muted-foreground">{f.paperHint}</p>
          <input
            id="paper_link"
            type="text"
            inputMode="url"
            autoComplete="url"
            value={values.paper_link}
            onChange={(e) => update('paper_link', e.target.value)}
            placeholder={f.paperPh}
            aria-invalid={!!errors.paper_link}
            aria-describedby={errors.paper_link ? 'paper_link-err' : undefined}
            className={`${inputCls} mt-2.5 h-11`}
          />
          {fieldErr('paper_link')}
        </div>
        <div>
          <label htmlFor="claim" className="block text-[14px] font-semibold">
            {f.claim}
          </label>
          <p className="mt-1 text-[13px] text-muted-foreground">{f.claimHint}</p>
          <textarea
            id="claim"
            rows={3}
            maxLength={4000}
            value={values.claim}
            onChange={(e) => update('claim', e.target.value)}
            placeholder={f.claimPh}
            aria-invalid={!!errors.claim}
            aria-describedby={errors.claim ? 'claim-err' : undefined}
            className={`${inputCls} mt-2.5 resize-y py-3`}
          />
          {fieldErr('claim')}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block text-[14px] font-semibold">
              {f.email}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder={f.emailPh}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-err' : undefined}
              className={`${inputCls} mt-2.5 h-11`}
            />
            {fieldErr('email')}
          </div>
          <div>
            <label htmlFor="plan" className="block text-[14px] font-semibold">
              {f.plan}
            </label>
            <select id="plan" value={plan} onChange={(e) => onPlanChange(e.target.value as PlanId)} className={`${inputCls} mt-2.5 h-11`}>
              {t.pricing.plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.price}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {submitError && (
        <p className="mt-5 rounded-[12px] bg-destructive/10 px-4 py-3 text-[13px] text-destructive" role="alert">
          {submitError}
        </p>
      )}
      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted-foreground">{f.privacy}</p>
        <button type="submit" disabled={submitting} className="btn-primary min-w-[170px]">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? f.sending : f.submit}
        </button>
      </div>
    </form>
  );
}
