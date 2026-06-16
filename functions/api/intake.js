// POST /api/intake — validate, store in D1, fire an email alert.
import { LABELS, REQUIRED, norm, summarize, json } from '../_lib.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: 'Invalid JSON' }, 400);
  }

  // Honeypot: silently accept so bots think they succeeded, but store nothing.
  if (body.botcheck) return json({ success: true });

  // Server-side validation of the essentials.
  const missing = REQUIRED.filter((f) => !body[f] || norm(body[f]).trim() === '');
  if (missing.length) {
    return json({ success: false, message: 'Missing required field(s): ' + missing.join(', ') }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(norm(body.email))) {
    return json({ success: false, message: 'Invalid email' }, 400);
  }

  if (!env.DB) {
    return json({ success: false, message: 'Storage not configured' }, 500);
  }

  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO intakes
         (created_at, business_name, contact_name, phone, email, main_trade,
          business_stage, main_goal, area_current, classification, classification_reasons, data)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      now,
      norm(body.business_name),
      norm(body.contact_name),
      norm(body.phone),
      norm(body.email),
      norm(body.main_trade),
      norm(body.business_stage),
      norm(body.main_goal),
      norm(body.area_current),
      norm(body.classification),
      norm(body.classification_reasons),
      JSON.stringify(body)
    ).run();
  } catch (err) {
    return json({ success: false, message: 'Could not save submission' }, 500);
  }

  // Email alert is best-effort: never fail the submission if it errors.
  context.waitUntil(sendAlert(env, body).catch(() => {}));

  return json({ success: true });
}

async function sendAlert(env, body) {
  if (!env.RESEND_API_KEY || !env.ALERT_TO) return;
  const who = norm(body.business_name) || norm(body.contact_name) || 'contractor';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.ALERT_FROM || 'AraBuilds Intake <onboarding@resend.dev>',
      to: [env.ALERT_TO],
      reply_to: norm(body.email) || undefined,
      subject: `New intake — ${norm(body.classification) || 'Lead'} — ${who}`,
      text: summarize(body)
    })
  });
  if (!res.ok) throw new Error('Resend ' + res.status);
}
