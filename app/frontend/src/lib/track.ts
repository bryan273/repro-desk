import { suiteCall } from './suiteData';

type EventType = 'visit' | 'form_start';

const SID_KEY = 'rd-sid';

function sessionId(): string {
  let sid = sessionStorage.getItem(SID_KEY);
  if (!sid) {
    sid = crypto.randomUUID?.() ?? `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    sessionStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

/** Records an anonymous funnel event at most once per browser session. */
export function trackOnce(type: EventType, language: string): void {
  const key = `rd-tracked-${type}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    return;
  }
  suiteCall({ op: 'create', collection: 'site_events', data: { event_type: type, session_id: sessionId(), language, path: window.location.pathname } })
    .catch(() => sessionStorage.removeItem(key));
}
