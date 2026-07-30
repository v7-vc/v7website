/**
 * Contact form submission.
 *
 * Two paths, selected by `data-provider` (see src/config/form.ts):
 *
 *  - `web3forms` — normal CORS request; the JSON response is inspected, so
 *    "sent" means the provider accepted the enquiry. This replaces the old
 *    `mode: 'no-cors'` behaviour, which could never confirm delivery: the
 *    browser hides the response, so a rejected payload looked exactly like
 *    success and leads were silently lost.
 *
 *  - `legacy` — the current production path (Zapier catch hook). Zapier sends
 *    no CORS headers, so the request must stay `no-cors` and success is
 *    reported optimistically. Kept byte-for-byte compatible with today's
 *    behaviour so that deploying this file cannot regress a working form.
 *
 * Without JS both paths still POST natively to the same endpoint.
 */

type StatusKind = 'pending' | 'ok' | 'error';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const SENT_MESSAGE = 'Thanks — we’ll be in touch soon.';

function setStatus(el: HTMLElement | null, kind: StatusKind, text: string) {
  if (!el) return;
  el.textContent = text;
  el.dataset.state = kind;
}

async function submitForm(form: HTMLFormElement) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label = btn?.querySelector('span') ?? btn;
  const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
  const fileName = form.querySelector<HTMLElement>('[data-file-name]');
  const legacy = form.dataset.provider !== 'web3forms';

  // native validation first — don't send half-filled leads
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);

  // honeypot: real users never fill this
  if ((data.get('botcheck') as string)?.length) return;
  data.delete('botcheck');

  const upload = fileInput?.files?.[0];
  if (upload && upload.size > MAX_UPLOAD_BYTES) {
    setStatus(status, 'error', 'That file is over 5 MB — please email it to hello@v7.vc.');
    return;
  }
  if (!upload) data.delete('presentation');

  if (!legacy) {
    // give the notification a useful subject line
    const name = ((data.get('name') as string) || '').trim();
    data.set('subject', name ? `v7.vc — new enquiry from ${name}` : 'v7.vc — new enquiry');
    if (name) data.set('from_name', name);
  }

  const original = label?.textContent ?? 'Submit';
  if (btn) btn.disabled = true;
  if (label) label.textContent = 'Sending…';
  setStatus(status, 'pending', '');

  const done = () => {
    form.reset();
    if (fileName) fileName.textContent = '';
    setStatus(status, 'ok', SENT_MESSAGE);
  };

  try {
    if (legacy) {
      // Zapier hook: opaque response, no confirmation possible (see module note).
      // Mirrors today's payload shape: URL-encoded unless a file is attached.
      const body = upload ? data : new URLSearchParams(data as unknown as Record<string, string>);
      await fetch(form.action, { method: 'POST', mode: 'no-cors', body });
      done();
      return;
    }

    const res = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });
    const payload = await res.json().catch(() => null);

    if (res.ok && payload?.success) {
      done();
    } else {
      // surface the real reason instead of a blanket "something went wrong"
      const reason = payload?.message || `${res.status} ${res.statusText}`;
      setStatus(status, 'error', `Could not send (${reason}). Please email hello@v7.vc.`);
      console.error('[forms] Submission rejected:', reason);
    }
  } catch (err) {
    setStatus(status, 'error', 'Something went wrong — please email hello@v7.vc.');
    console.error('[forms] Submission failed:', err);
  } finally {
    if (btn) btn.disabled = false;
    if (label) label.textContent = original;
  }
}

export function initForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-contact-form]').forEach((form) => {
    if (form.dataset.formBound) return;
    form.dataset.formBound = 'true';

    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const fileName = form.querySelector<HTMLElement>('[data-file-name]');
    if (fileInput && fileName) {
      fileInput.addEventListener('change', () => {
        fileName.textContent = fileInput.files?.[0]?.name ?? '';
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      void submitForm(form);
    });
  });
}

initForms();
