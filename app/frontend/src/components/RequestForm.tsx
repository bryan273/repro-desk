import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { client, errorMessage, type PlanId, type ReproRequestInput } from '@/lib/client';

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
  'w-full rounded-[12px] border border-white/15 bg-white/[0.06] px-4 text-[16px] text-white placeholder:text-white/40 transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring';

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
      <div className="rounded-[16px] bg-[hsl(60_10%_10%)] p-8 text-white shadow-2xl md:p-10" role="status" aria-live="polite">
        <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
        <h3 className="mt-5 text-2xl font-medium">{f.successTitle}</h3>
        <p className="mt-3 text-white/75">{f.successBody}</p>
        <p className="mt-6 font-mono text-3xl font-bold">RQ-{String(successId).padStart(4, '0')}</p>
        <button type="button" onClick={() => setSuccessId(null)} className="btn-ghost mt-8 border border-white/25 px-6 text-white hover:bg-white/10">
          {f.another}
        </button>
      </div>
    );
  }

  const fieldErr = (k: Field) =>
    errors[k] ? (
      <p id={`${k}-err`} className="mt-2 text-sm text-[hsl(0_85%_75%)]">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-[16px] bg-[hsl(60_10%_10%)] p-6 text-white shadow-2xl md:p-10">
      <div className="space-y-6">
        <div>
          <label htmlFor="paper_link" className="block font-medium">
            {f.paper}
          </label>
          <p className="mt-1 text-sm text-white/60">{f.paperHint}</p>
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
            className={`${inputCls} mt-3 h-12`}
          />
          {fieldErr('paper_link')}
        </div>
        <div>
          <label htmlFor="claim" className="block font-medium">
            {f.claim}
          </label>
          <p className="mt-1 text-sm text-white/60">{f.claimHint}</p>
          <textarea
            id="claim"
            rows={3}
            maxLength={4000}
            value={values.claim}
            onChange={(e) => update('claim', e.target.value)}
            placeholder={f.claimPh}
            aria-invalid={!!errors.claim}
            aria-describedby={errors.claim ? 'claim-err' : undefined}
            className={`${inputCls} mt-3 resize-y py-3`}
          />
          {fieldErr('claim')}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="block font-medium">
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
              className={`${inputCls} mt-3 h-12`}
            />
            {fieldErr('email')}
          </div>
          <div>
            <label htmlFor="plan" className="block font-medium">
              {f.plan}
            </label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => onPlanChange(e.target.value as PlanId)}
              className={`${inputCls} mt-3 h-12 [&>option]:text-foreground`}
            >
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
        <p className="mt-6 rounded-[12px] bg-[hsl(0_72%_51%/0.15)] px-4 py-3 text-sm text-[hsl(0_85%_80%)]" role="alert">
          {submitError}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/60">{f.privacy}</p>
        <button type="submit" disabled={submitting} className="btn-primary min-w-[180px]">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitting ? f.sending : f.submit}
        </button>
      </div>
    </form>
  );
}
