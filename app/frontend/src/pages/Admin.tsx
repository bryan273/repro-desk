import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Loader2, LogOut, RefreshCw, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { LangToggle, ThemeToggle, Wordmark } from '@/components/SiteHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { client, errorMessage, type FunnelStats, type ReproRequest, type RequestStatus } from '@/lib/client';

type AuthState = 'loading' | 'authenticated' | 'anonymous';
type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'forbidden';

const PAGE_SIZE = 25;
const STATUSES: RequestStatus[] = ['new', 'in_review', 'done', 'declined'];

function linkHref(link: string): string {
  if (/^https?:\/\//i.test(link)) return link;
  return `https://doi.org/${link.replace(/^doi:/i, '')}`;
}

export default function Admin() {
  const { t, lang } = useLanguage();
  const a = t.admin;
  const [auth, setAuth] = useState<AuthState>('loading');
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState('');
  const [items, setItems] = useState<ReproRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<RequestStatus | ''>('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    client.auth
      .me()
      .then((res) => setAuth(res?.data ? 'authenticated' : 'anonymous'))
      .catch(() => setAuth('anonymous'));
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await client.apiCall.invoke({ url: '/api/v1/entities/site_events/stats', method: 'GET', data: {} });
      setStats(res.data as FunnelStats);
      setStatsError(false);
    } catch {
      setStatsError(true);
    }
  }, []);

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    loadStats();
    try {
      const data: Record<string, string | number> = { skip: page * PAGE_SIZE, limit: PAGE_SIZE };
      if (filter) data.status = filter;
      const res = await client.apiCall.invoke({ url: '/api/v1/entities/repro_requests', method: 'GET', data });
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
      setState('ready');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const code = e?.status ?? e?.response?.status;
      if (code === 403) {
        setState('forbidden');
      } else if (code === 401) {
        setAuth('anonymous');
        setState('idle');
      } else {
        setError(errorMessage(e, a.error));
        setState('error');
      }
    }
  }, [page, filter, a.error, loadStats]);

  useEffect(() => {
    if (auth === 'authenticated') load();
  }, [auth, load]);

  const changeStatus = async (row: ReproRequest, status: RequestStatus) => {
    setSavingId(row.id);
    try {
      await client.apiCall.invoke({ url: `/api/v1/entities/repro_requests/${row.id}`, method: 'PUT', data: { status } });
      setItems((list) => list.map((r) => (r.id === row.id ? { ...r, status } : r)));
      toast.success(a.updated);
    } catch (e) {
      toast.error(`${a.updateFailed}: ${errorMessage(e, '')}`);
    } finally {
      setSavingId(null);
    }
  };

  const fmtDate = (s?: string | null) =>
    s ? new Date(s).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const Notice = ({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) => (
    <div className="mx-auto mt-16 max-w-[520px] rounded-[16px] border border-border bg-card p-10 text-center shadow-md">
      <UserRound className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-5 text-2xl font-medium">{title}</h2>
      <p className="mt-3 text-muted-foreground">{body}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-4 px-6 lg:px-10">
          <div className="flex items-center gap-6">
            <Wordmark />
            <a href="/" className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline-flex">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {a.back}
            </a>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <LangToggle />
            <ThemeToggle />
            {auth === 'authenticated' && (
              <button
                type="button"
                onClick={() => client.auth.logout()}
                aria-label={a.logout}
                title={a.logout}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-6 py-10 lg:px-10">
        {auth === 'loading' && (
          <p className="mt-16 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {a.loading}
          </p>
        )}

        {auth === 'anonymous' && (
          <Notice
            title={a.loginTitle}
            body={a.loginBody}
            action={
              <button type="button" onClick={() => client.auth.toLogin()} className="btn-primary px-8">
                {a.login}
              </button>
            }
          />
        )}

        {auth === 'authenticated' && state === 'forbidden' && <Notice title={a.forbiddenTitle} body={a.forbiddenBody} />}

        {auth === 'authenticated' && state !== 'forbidden' && (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-[32px] font-medium tracking-tight md:text-[40px]">{a.title}</h1>
                <p className="mt-2 text-muted-foreground">
                  {a.subtitle} <span className="font-mono">{total}</span> {a.total}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="status-filter" className="sr-only">
                  {a.cols.status}
                </label>
                <select
                  id="status-filter"
                  value={filter}
                  onChange={(e) => {
                    setPage(0);
                    setFilter(e.target.value as RequestStatus | '');
                  }}
                  className="h-11 rounded-[12px] border border-input bg-background px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">{a.filterAll}</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {a.statuses[s]}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={load} className="btn-ghost h-11 border border-border bg-background text-foreground hover:bg-muted">
                  <RefreshCw className={`h-4 w-4 ${state === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />
                  {a.refresh}
                </button>
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { k: a.counters.visits, v: stats ? String(stats.visits) : '—', note: a.counters.visitsNote },
                {
                  k: a.counters.formStarts,
                  v: stats ? String(stats.form_starts) : '—',
                  note: stats ? `${stats.form_start_rate}% ${a.counters.formStartsNote}` : a.counters.formStartsNote,
                },
                { k: a.counters.submissions, v: stats ? String(stats.submissions) : '—', note: a.counters.submissionsNote },
                { k: a.counters.conversion, v: stats ? `${stats.conversion_rate}%` : '—', note: a.counters.conversionNote },
              ].map((s) => (
                <div key={s.k} className="min-w-0 rounded-[16px] border border-border bg-card p-5 shadow-sm">
                  <dt className="eyebrow text-muted-foreground">{s.k}</dt>
                  <dd className="mt-2 font-mono text-[28px] font-bold leading-none md:text-[34px]">{s.v}</dd>
                  <dd className="mt-2 text-[13px] text-muted-foreground">{s.note}</dd>
                </div>
              ))}
            </dl>
            {statsError && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {a.error}
              </p>
            )}

            <div className="mt-8 overflow-hidden rounded-[16px] border border-border bg-card shadow-sm">
              {state === 'loading' && items.length === 0 && (
                <p className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {a.loading}
                </p>
              )}
              {state === 'error' && (
                <div className="p-12 text-center" role="alert">
                  <p className="text-destructive">{a.error}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                  <button type="button" onClick={load} className="btn-primary mt-6">
                    {a.retry}
                  </button>
                </div>
              )}
              {state === 'ready' && items.length === 0 && <p className="p-12 text-center text-muted-foreground">{a.empty}</p>}
              {items.length > 0 && state !== 'error' && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] text-left text-[15px]">
                    <thead className="bg-muted/60">
                      <tr>
                        {[a.cols.id, a.cols.date, a.cols.paper, a.cols.claim, a.cols.email, a.cols.plan, a.cols.lang, a.cols.status].map((h) => (
                          <th key={h} scope="col" className="eyebrow px-4 py-3 font-medium text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((r) => (
                        <tr key={r.id} className="border-t border-border align-top">
                          <td className="whitespace-nowrap px-4 py-4 font-mono text-sm">RQ-{String(r.id).padStart(4, '0')}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">{fmtDate(r.created_at)}</td>
                          <td className="max-w-[220px] px-4 py-4">
                            <a
                              href={linkHref(r.paper_link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-start gap-1 break-all text-sm underline-offset-2 hover:underline"
                            >
                              {r.paper_link}
                              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            </a>
                          </td>
                          <td className="max-w-[320px] whitespace-pre-wrap px-4 py-4 text-sm">{r.claim}</td>
                          <td className="px-4 py-4 text-sm">
                            <a href={`mailto:${r.email}`} className="break-all hover:underline">
                              {r.email}
                            </a>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm">{r.plan ? a.plans[r.plan] ?? r.plan : '—'}</td>
                          <td className="px-4 py-4 font-mono text-sm uppercase">{r.language ?? '—'}</td>
                          <td className="px-4 py-4">
                            <label htmlFor={`status-${r.id}`} className="sr-only">
                              {a.cols.status}
                            </label>
                            <select
                              id={`status-${r.id}`}
                              value={r.status ?? 'new'}
                              disabled={savingId === r.id}
                              onChange={(e) => changeStatus(r, e.target.value as RequestStatus)}
                              className="h-10 rounded-[10px] border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {a.statuses[s]}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {total > PAGE_SIZE && (
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-ghost h-11 border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50"
                >
                  {a.prev}
                </button>
                <span className="font-mono text-sm">
                  {page + 1} / {pages}
                </span>
                <button
                  type="button"
                  disabled={page + 1 >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-ghost h-11 border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50"
                >
                  {a.next}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
