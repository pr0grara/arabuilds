// GET /admin — Basic-Auth protected dashboard of intake submissions.
// Supports ?class=<classification> filter, ?q=<search>, and ?format=csv export.
import { LABELS, norm, escapeHtml } from './_lib.js';

const CLASSES = ['Foundation Client', 'Growth Client', 'Operator Client', 'Not Ready / Needs Basics'];

export async function onRequestGet(context) {
  const { request, env } = context;

  // --- auth ---
  const expected = env.ADMIN_USER && env.ADMIN_PASS
    ? 'Basic ' + btoa(`${env.ADMIN_USER}:${env.ADMIN_PASS}`)
    : null;
  const provided = request.headers.get('Authorization');
  if (!expected || provided !== expected) {
    return new Response('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="arabuilds admin", charset="UTF-8"' }
    });
  }

  if (!env.DB) return new Response('Storage not configured.', { status: 500 });

  const url = new URL(request.url);
  const cls = url.searchParams.get('class') || '';
  const q = (url.searchParams.get('q') || '').trim();

  // --- query with optional filters ---
  const where = [];
  const binds = [];
  if (cls) { where.push('classification = ?'); binds.push(cls); }
  if (q) {
    where.push('(business_name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR area_current LIKE ?)');
    const like = '%' + q + '%';
    binds.push(like, like, like, like);
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const rows = (await env.DB.prepare(
    `SELECT * FROM intakes ${whereSql} ORDER BY created_at DESC LIMIT 1000`
  ).bind(...binds).all()).results || [];

  if (url.searchParams.get('format') === 'csv') {
    return csvResponse(rows);
  }

  // counts by classification for the summary bar
  const counts = (await env.DB.prepare(
    `SELECT classification, COUNT(*) AS n FROM intakes GROUP BY classification`
  ).all()).results || [];

  return new Response(renderPage(rows, counts, { cls, q }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function csvResponse(rows) {
  const cols = ['id', 'created_at', 'classification', 'business_name', 'contact_name', 'phone', 'email', 'main_trade', 'business_stage', 'main_goal', 'area_current', 'classification_reasons', 'data'];
  const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const lines = [cols.join(',')];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(','));
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="arabuilds-intakes.csv"'
    }
  });
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
}

function detailsHtml(dataJson) {
  let data;
  try { data = JSON.parse(dataJson); } catch { return escapeHtml(dataJson || ''); }
  const parts = [];
  for (const key in LABELS) {
    if (data[key] == null || data[key] === '') continue;
    parts.push(`<div class="dt">${escapeHtml(LABELS[key])}</div><div class="dd">${escapeHtml(norm(data[key]))}</div>`);
  }
  return `<div class="detail">${parts.join('')}</div>`;
}

function renderPage(rows, counts, state) {
  const countMap = Object.fromEntries(counts.map((c) => [c.classification || '—', c.n]));
  const total = counts.reduce((s, c) => s + c.n, 0);

  const chip = (label, value) => {
    const active = state.cls === value ? ' active' : '';
    const n = value ? (countMap[value] || 0) : total;
    const href = value ? `?class=${encodeURIComponent(value)}` : '?';
    return `<a class="chip${active}" href="${href}">${escapeHtml(label)} <b>${n}</b></a>`;
  };

  const rowsHtml = rows.map((r) => {
    const tag = (r.classification || '—').replace(' Client', '').replace(' / Needs Basics', '');
    const cl = (r.classification || '').toLowerCase().includes('operator') ? 'op'
      : (r.classification || '').toLowerCase().includes('growth') ? 'gr'
      : (r.classification || '').toLowerCase().includes('foundation') ? 'fn' : 'nr';
    return `<tbody class="row">
      <tr class="head" onclick="this.closest('tbody').classList.toggle('open')">
        <td class="when">${escapeHtml(fmtDate(r.created_at))}</td>
        <td><span class="tag ${cl}">${escapeHtml(tag)}</span></td>
        <td>${escapeHtml(r.business_name || '—')}<div class="sub">${escapeHtml(r.contact_name || '')}</div></td>
        <td>${escapeHtml(r.main_trade || '—')}</td>
        <td>${escapeHtml(r.area_current || '—')}</td>
        <td class="contact"><a href="tel:${escapeHtml(r.phone || '')}" onclick="event.stopPropagation()">${escapeHtml(r.phone || '')}</a><div class="sub"><a href="mailto:${escapeHtml(r.email || '')}" onclick="event.stopPropagation()">${escapeHtml(r.email || '')}</a></div></td>
        <td class="caret">▸</td>
      </tr>
      <tr class="body"><td colspan="7">${detailsHtml(r.data)}</td></tr>
    </tbody>`;
  }).join('');

  const csvHref = `?format=csv${state.cls ? '&class=' + encodeURIComponent(state.cls) : ''}${state.q ? '&q=' + encodeURIComponent(state.q) : ''}`;

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Intake admin — arabuilds</title><meta name="robots" content="noindex">
<style>
  :root{--bg:#0b0c0a;--fg:#d7dccf;--dim:#6b7264;--accent:#62e36b;--line:#1c1f1a;--field:#101210;--field-line:#2a2e26;--mono:"SF Mono",ui-monospace,"JetBrains Mono",Menlo,Consolas,monospace}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--fg);font-family:var(--mono);font-size:14px;line-height:1.6;padding:clamp(16px,4vw,36px);background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.012) 0 1px,transparent 1px 3px)}
  a{color:var(--accent);text-decoration:none}
  h1{font-size:clamp(20px,4vw,28px);letter-spacing:-.4px;margin-bottom:4px}
  h1 .accent{color:var(--accent)}
  .meta{color:var(--dim);font-size:12px;margin-bottom:22px}
  .bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:18px}
  .chip{border:1px solid var(--field-line);color:var(--fg);padding:7px 12px;border-radius:2px;font-size:12.5px}
  .chip b{color:var(--accent);margin-left:4px}
  .chip.active{border-color:var(--accent);background:rgba(98,227,107,.08)}
  form.search{margin-left:auto;display:flex;gap:8px}
  input[type=text]{font-family:var(--mono);font-size:13px;color:var(--fg);background:var(--field);border:1px solid var(--field-line);border-radius:2px;padding:7px 11px}
  input[type=text]:focus{outline:none;border-color:var(--accent)}
  .btn{border:1px solid var(--field-line);color:var(--dim);padding:7px 12px;border-radius:2px;font-size:12.5px;cursor:pointer;background:transparent}
  .btn:hover{border-color:var(--accent);color:var(--accent)}
  table{width:100%;border-collapse:collapse;font-size:13px}
  thead th{text-align:left;color:var(--dim);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;padding:0 12px 10px;border-bottom:1px solid var(--line);font-weight:400}
  tbody.row{border-bottom:1px solid var(--line)}
  tr.head{cursor:pointer}
  tr.head:hover td{background:rgba(255,255,255,.02)}
  td{padding:12px;vertical-align:top}
  .when{color:var(--dim);white-space:nowrap;font-size:12px}
  .sub{color:var(--dim);font-size:12px}
  .contact{white-space:nowrap}
  .caret{color:var(--dim);text-align:right}
  tbody.open .caret{color:var(--accent)}
  .tag{font-size:11px;padding:3px 8px;border-radius:2px;border:1px solid var(--field-line);white-space:nowrap}
  .tag.op{color:#62e36b;border-color:#2f5f33}
  .tag.gr{color:#62b6e3;border-color:#2f4f5f}
  .tag.fn{color:#e3c062;border-color:#5f562f}
  .tag.nr{color:#e38062;border-color:#5f372f}
  tr.body{display:none}
  tbody.open tr.body{display:table-row}
  .detail{display:grid;grid-template-columns:auto 1fr;gap:4px 18px;padding:8px 4px 16px;border-top:1px dashed var(--line)}
  .dt{color:var(--dim)}
  .dd{color:var(--fg)}
  .empty{color:var(--dim);padding:40px 0;text-align:center}
  @media(max-width:720px){.t-hide{display:none}form.search{width:100%;margin:8px 0 0}.detail{grid-template-columns:1fr;gap:1px 0}.dt{margin-top:8px}}
</style></head><body>
  <h1>intake<span class="accent"> admin</span></h1>
  <div class="meta">${total} total submission${total === 1 ? '' : 's'} · click a row to expand · <a href="${csvHref}">download CSV ↓</a></div>
  <div class="bar">
    ${chip('All', '')}
    ${CLASSES.map((c) => chip(c.replace(' Client', '').replace(' / Needs Basics', ''), c)).join('')}
    <form class="search" method="get">
      ${state.cls ? `<input type="hidden" name="class" value="${escapeHtml(state.cls)}">` : ''}
      <input type="text" name="q" placeholder="search name, email, area…" value="${escapeHtml(state.q)}">
      <button class="btn" type="submit">search</button>
    </form>
  </div>
  ${rows.length ? `<table>
    <thead><tr>
      <th>When</th><th>Tier</th><th>Business</th><th class="t-hide">Trade</th><th class="t-hide">Area</th><th>Contact</th><th></th>
    </tr></thead>
    ${rowsHtml}
  </table>` : '<div class="empty">No submissions yet.</div>'}
</body></html>`;
}
