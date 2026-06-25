// GET/POST /pili — password-protected branded growth plan for Pili (Pacific West Concrete).
// Plan HTML is only returned once the password is correct (checked server-side),
// behind a styled on-brand gate instead of the default Basic-Auth popup.

const PASSWORD = 'rebar'; // dead simple, concrete-related. Change here anytime.
const COOKIE = 'pili_ok=1';
const INTAKE_LINK = 'https://drive.google.com/drive/folders/1Fxd_tG4uKKA2KuwIktSbHgFLEooeRH3X'; // shared asset-intake folder

export async function onRequest(context) {
  const { request } = context;
  const cookie = request.headers.get('Cookie') || '';
  const authed = cookie.split(/;\s*/).indexOf(COOKIE) !== -1;

  if (request.method === 'POST') {
    const form = await request.formData().catch(() => null);
    const pw = form ? String(form.get('pw') || '').trim().toLowerCase() : '';
    if (pw === PASSWORD) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: '/pili',
          'Set-Cookie': COOKIE + '; Path=/pili; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure'
        }
      });
    }
    return html(gate(true), 401);
  }

  if (authed) return html(plan());

  // Convenience: a one-tap link (e.g. text Pili /pili?pw=rebar). Sets the cookie too.
  const qpw = new URL(request.url).searchParams.get('pw');
  if (qpw && qpw.trim().toLowerCase() === PASSWORD) {
    return new Response(plan(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': COOKIE + '; Path=/pili; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure'
      }
    });
  }
  return html(gate(false));
}

const html = (body, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

// ---- shared head (light defaults + dark theme via shared theme.css) ----
function head(title) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0b0c0a">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='14' fill='%231b2a47'/><text x='50' y='73' font-size='66' text-anchor='middle' fill='%232f7d52' font-family='Arial,sans-serif' font-weight='bold'>A</text></svg>">
<script>(function(){try{var t=localStorage.getItem('theme')==='light'?'light':'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();</script>
<style>
  :root{
    --paper:#ffffff;--panel:#ffffff;--ink:#1a1d23;--navy:#1b2a47;--muted:#616a76;
    --line:#e6e5dd;--line-2:#d4d3c9;--accent:#2f7d52;--accent-dk:#266a45;
    --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    --mono:"SF Mono",ui-monospace,"JetBrains Mono","Cascadia Code",Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:15.5px;line-height:1.65;-webkit-font-smoothing:antialiased;padding:clamp(24px,5vw,56px);min-height:100vh}
  ::selection{background:var(--accent);color:#fff}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:780px;margin:0 auto}
  .label{font-family:var(--mono);font-size:11.5px;letter-spacing:2.5px;text-transform:uppercase;color:var(--muted);display:block}
  .label::before{content:"// "}
  .logo{display:inline-flex;align-items:center;gap:9px;font-weight:800;font-size:17px;letter-spacing:-.4px;color:var(--navy)}
  .logo .mark{width:24px;height:24px;background:var(--navy);color:var(--accent);display:grid;place-items:center;font-weight:800;border-radius:5px;font-size:14px}
  .logo b{color:var(--accent)}

  /* gate */
  .gate{min-height:calc(100svh - clamp(48px,10vw,112px));display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:18px}
  .gate h1{font-size:clamp(22px,4vw,28px);color:var(--navy);letter-spacing:-.4px}
  .gate p{color:var(--muted);max-width:34ch}
  .gate form{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:4px}
  .gate input{font-family:var(--mono);font-size:15px;color:var(--ink);background:var(--panel);border:1.5px solid var(--line-2);border-radius:6px;padding:12px 15px;min-width:220px}
  .gate input:focus{outline:none;border-color:var(--accent)}
  .gate button{font-family:var(--sans);font-weight:700;font-size:15px;border:1.5px solid var(--accent);background:var(--accent);color:#fff;border-radius:6px;padding:12px 22px;cursor:pointer}
  .gate button:hover{background:var(--accent-dk);border-color:var(--accent-dk)}
  .err{color:#c0532a;font-size:13px;min-height:1em}

  /* plan */
  .doc-head{margin:6px 0 clamp(26px,5vw,40px)}
  .doc-title{font-size:clamp(28px,6vw,46px);line-height:1.05;letter-spacing:-1.2px;font-weight:800;color:var(--navy);margin:18px 0 0}
  .doc-title .accent{color:var(--accent)}
  .doc-sub{margin-top:12px;color:var(--muted);max-width:54ch}

  .titleblock{margin-top:26px;border:1.5px solid var(--navy);border-radius:6px;overflow:hidden;background:var(--panel);max-width:460px}
  .tb-head{background:var(--navy);color:#fff;padding:9px 15px;display:flex;align-items:center;justify-content:space-between}
  .tb-head .t{font-family:var(--mono);font-size:10.5px;letter-spacing:2px;text-transform:uppercase;opacity:.85}
  .tb-head .dot{width:8px;height:8px;border-radius:50%;background:var(--accent)}
  .tb-row{display:grid;grid-template-columns:92px 1fr;gap:4px 14px;padding:10px 15px;border-bottom:1px dashed var(--line-2)}
  .tb-row:last-child{border-bottom:none}
  .tb-row dt{font-family:var(--mono);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);align-self:center}
  .tb-row dd{font-weight:600;color:var(--navy);font-size:13.5px}

  section{padding:clamp(28px,5vw,42px) 0;border-top:1px solid var(--line)}
  section h2{font-size:clamp(20px,3.4vw,27px);letter-spacing:-.5px;font-weight:800;color:var(--navy);margin:9px 0 14px}
  section p{color:var(--ink);margin-bottom:13px;max-width:64ch}
  section p .muted{color:var(--muted)}
  strong{color:var(--navy)}

  .callout{border-left:3px solid var(--accent);background:rgba(47,125,82,.06);padding:16px 18px;border-radius:0 6px 6px 0;margin:6px 0 4px}
  .callout b{color:var(--accent)}

  .phases{display:grid;gap:14px;margin-top:6px}
  .phase{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:18px 20px}
  .phase .ph{font-family:var(--mono);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);font-weight:700}
  .phase h3{font-size:17px;font-weight:700;color:var(--navy);margin:6px 0 9px}
  .phase ul{list-style:none;display:grid;gap:8px}
  .phase li{position:relative;padding-left:20px;color:var(--ink);font-size:14.5px;line-height:1.5}
  .phase li::before{content:"›";position:absolute;left:2px;color:var(--accent);font-weight:700}
  .phase li .muted{color:var(--muted)}

  /* roadmap dropdowns */
  .phase details.d{border-top:1px solid var(--line)}
  .phase summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:11px 0;font-weight:700;color:var(--navy);font-size:14.5px;line-height:1.35}
  .phase summary::-webkit-details-marker{display:none}
  .phase summary .s-t{flex:1}
  .phase summary .owner{font-family:var(--mono);font-size:9px;letter-spacing:.8px;text-transform:uppercase;padding:3px 8px;border-radius:999px;border:1px solid var(--line-2);color:var(--muted);font-weight:700;white-space:nowrap}
  .phase summary .owner.both{color:var(--accent);border-color:var(--accent)}
  .phase summary::after{content:"+";color:var(--accent);font-weight:700;font-size:18px;line-height:1;width:12px;text-align:center;flex:none}
  .phase details[open] summary::after{content:"–"}
  .phase .dd{padding:2px 0 13px;color:var(--muted);font-size:14px;line-height:1.55;max-width:62ch}
  .phase .dd strong{color:var(--navy)}

  .firstmove{border:1.5px solid var(--accent);border-radius:10px;padding:22px clamp(18px,3vw,26px);background:rgba(47,125,82,.05)}
  .firstmove h2{margin-top:0}
  .firstmove ol{margin:6px 0 0 20px;display:grid;gap:7px}
  .firstmove li{color:var(--ink)}

  .ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
  .cta{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:15px;padding:13px 22px;border-radius:6px;border:1.5px solid var(--accent);background:var(--accent);color:#fff}
  .cta:hover{background:var(--accent-dk);border-color:var(--accent-dk)}
  .cta.ghost{background:transparent;color:var(--navy);border-color:var(--line-2)}
  .cta.ghost:hover{border-color:var(--accent);color:var(--accent)}

  footer{border-top:1px solid var(--line);padding-top:24px;margin-top:8px;color:var(--muted);font-size:12.5px;display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:space-between}

  /* dark mode: the Plan Spec card uses --navy for its header bar + border, but --navy
     flips light in dark mode (headlines go light). Pin those back to brand navy so the
     header bar stays dark with legible white text and the border isn't washed out. */
  :root[data-theme="dark"] .titleblock{border-color:#33405c}
  :root[data-theme="dark"] .tb-head{background:#1b2a47}

  /* internal call-prep block — temporary, removed before sending to Pili */
  .cp{border:1.5px dashed #c8912f;border-radius:10px;padding:clamp(18px,3vw,26px);margin-bottom:18px;background:rgba(200,145,47,.06)}
  .cp-flag{font-family:var(--mono);font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#b5751c;font-weight:700;margin-bottom:14px}
  .cp h2{font-size:clamp(20px,3.4vw,26px);color:var(--navy);letter-spacing:-.4px;margin:0 0 4px}
  .cp .cp-sub{color:var(--muted);font-size:14px;margin-bottom:14px;max-width:66ch}
  .cp h3{font-family:var(--mono);font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#b5751c;margin:22px 0 10px}
  .cp .q{margin:0 0 13px}
  .cp .q .t{font-weight:700;color:var(--navy);font-size:15px}
  .cp .q .ask,.cp .q .why{display:block;font-size:13.5px;margin-top:3px;line-height:1.5}
  .cp .q .ask{color:var(--ink)}
  .cp .q .why{color:var(--muted)}
  .cp .q b{color:var(--navy)}
  .cp ul{list-style:none;display:grid;gap:9px;margin-top:4px}
  .cp ul li{position:relative;padding-left:18px;font-size:13.5px;color:var(--ink);line-height:1.5}
  .cp ul li::before{content:"›";position:absolute;left:2px;color:#b5751c;font-weight:700}
  .cp ul li b{color:var(--navy)}
  .cp .mind{margin-top:18px;border-left:3px solid #c8912f;padding:10px 14px;background:rgba(200,145,47,.07);color:var(--ink);font-size:14px}
  .cp-divider{display:flex;align-items:center;gap:14px;margin:6px 0 30px;color:var(--muted);font-family:var(--mono);font-size:11px;letter-spacing:2px;text-transform:uppercase}
  .cp-divider::before,.cp-divider::after{content:"";flex:1;height:1px;background:var(--line-2)}
  .cp-field{display:block;width:100%;margin-top:8px;font-family:var(--mono);font-size:13.5px;line-height:1.5;color:var(--ink);background:var(--panel);border:1px solid var(--line-2);border-radius:6px;padding:9px 11px;resize:vertical;min-height:42px}
  .cp-field:focus{outline:none;border-color:#c8912f;box-shadow:0 0 0 1px #c8912f}
  .cp-field::placeholder{color:var(--muted);opacity:.65}
  .cp-tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:2px 0 22px}
  .cp-btn{font-family:var(--mono);font-size:12px;font-weight:700;color:#b5751c;background:rgba(200,145,47,.1);border:1px solid #c8912f;border-radius:6px;padding:8px 14px;cursor:pointer}
  .cp-btn:hover{background:#c8912f;color:#fff}
  .cp-note{font-family:var(--mono);font-size:11px;color:var(--muted)}
</style>
<link rel="stylesheet" href="/assets/theme.css">
<script src="/assets/theme.js" defer></script>
</head><body><main class="wrap">`;
}
const foot = `</main></body></html>`;

function gate(error) {
  return head('Private plan · AraBuilds') + `
  <div class="gate">
    <a class="logo" href="/"><span class="mark">A</span>Ara<b>Builds</b></a>
    <h1>This plan is private</h1>
    <p>Pili — enter the password I gave you to open your growth plan.</p>
    <form method="post" action="/pili">
      <input type="password" name="pw" placeholder="password" autofocus autocomplete="current-password" aria-label="Password">
      <button type="submit">Open plan →</button>
    </form>
    <div class="err">${error ? 'Wrong password — try again.' : ''}</div>
  </div>` + foot;
}

function plan() {
  return head('Growth Plan — Pacific West Concrete · AraBuilds') + `
  <div class="doc-head">
    <a class="logo" href="/"><span class="mark">A</span>Ara<b>Builds</b></a>
    <span class="label" style="margin-top:22px">growth plan · prepared for pili</span>
    <h1 class="doc-title">Pacific West <span class="accent">Concrete.</span></h1>
    <p class="doc-sub">Here's how I'd take you from skilled-but-invisible to a concrete business that books steady, good-paying work — plain and in order. Think of this as a starting point, not a verdict: tell me what fits, what doesn't, and where I might've got your business wrong.</p>

    <aside class="titleblock" aria-label="Plan details">
      <div class="tb-head"><span class="t">Plan Spec</span><span class="dot"></span></div>
      <dl>
        <div class="tb-row"><dt>Prepared for</dt><dd>Pili</dd></div>
        <div class="tb-row"><dt>Trade</dt><dd>Concrete · foundations, retaining walls &amp; drainage, flatwork</dd></div>
        <div class="tb-row"><dt>Service area</dt><dd>Alameda, Berkeley, Walnut Creek, Benicia, Tiburon</dd></div>
        <div class="tb-row"><dt>Engagement</dt><dd>Full growth partner</dd></div>
        <div class="tb-row"><dt>Prepared by</dt><dd>AraBuilds · June 2026</dd></div>
      </dl>
    </aside>
  </div>

  <section>
    <span class="label">my evaluation</span>
    <h2>You've got the hard part already</h2>
    <p>This is a trade your dad handed you and you took further — foundations, stem walls, retaining walls with full drainage, excavation and grading. You don't just swing the labor; you organize the crew, rent the equipment, and write the bids. Years in, a deep bench of family who can work, and a phone full of real before-and-afters. That's a stronger base than most guys ever build on.</p>
    <p>Here's the honest gap: <strong>every concrete job you do comes through one general contractor.</strong> All your eggs in one basket. You're building someone else's business — you don't own a single one of those customers, and the only work that comes to <em>you</em> directly is the odd tree job a few times a year. No license in your name, no Google profile, no website. So even though you can pour with anyone, a homeowner deciding who handles their $15k retaining wall has no way to find you or trust you.</p>
    <div class="callout"><b>The core gap:</b> you have the skill, but none of it is <em>yours</em> yet — no license, no visibility, no customers of your own.</div>
  </section>

  <section>
    <span class="label">the strategy</span>
    <h2>Step one on the way to the top</h2>
    <p>The smart part: you don't bet anything. You keep doing the GC work that pays your bills — nothing there changes — and we plant something of your own alongside it: your name, your profile, your reviews, your own customers. There are good concrete guys in these towns already, but you're not trying to take them all on, or risk a dollar of your income to compete. You just need <strong>2–4 good jobs a month that are yours</strong>, in your best towns, at your real prices — every one on top of what you already make. <span class="muted">That's step one: water it, and it keeps growing.</span></p>
  </section>

  <section>
    <span class="label">the roadmap</span>
    <h2>How I'd build it</h2>
    <p class="muted" style="margin:-2px 0 4px">Open any step for the how. The tag shows who drives it — <b style="color:var(--accent)">me</b>, <b style="color:var(--navy)">you</b>, or <b style="color:var(--accent)">together</b>.</p>
    <div class="phases">
      <div class="phase">
        <span class="ph">Phase 0 · Starts now</span>
        <h3>Get legit, on your own</h3>
        <details class="d">
          <summary><span class="s-t">Get your C-8 contractor license</span><span class="owner both">Together</span></summary>
          <div class="dd">The big one — and you haven't started because nobody's shown you how. Your years on the job already qualify you for the <strong>C-8 (concrete)</strong> exam; from there it's mostly studying and passing a test. I walk every step — experience sign-off, application, exam, the contractor bond, and insurance (a concrete license requires workers' comp for your crew, so we line that up). If asking your GC to verify your hours is awkward, there are other ways to document them. It's a ~2-month process, so we start now and run it in the background while the faster wins get going.</div>
        </details>
        <details class="d">
          <summary><span class="s-t">Lock in one official business name</span><span class="owner both">Together</span></summary>
          <div class="dd">You're already <strong>Pacific West Concrete</strong> — we lead with concrete and keep landscaping as a quiet add-on. I'll confirm it's properly registered (entity, EIN, bank) so your license, Google, site, and reviews all point to one clean business.</div>
        </details>
      </div>
      <div class="phase">
        <span class="ph">Phase 1 · Early on</span>
        <h3>Your first calls, from Google</h3>
        <details class="d">
          <summary><span class="s-t">Launch your Google Business Profile</span><span class="owner">AraBuilds</span></summary>
          <div class="dd">It's free, and it's exactly where Bay Area homeowners search "concrete near me." I load your photos and before/afters, set your service towns, and pull over your Yelp reviews. Google verifies new profiles with a quick phone video of your truck and tools — I'll hand you a simple shot-list (your only 2-minute part) so it passes first try.</div>
        </details>
        <details class="d">
          <summary><span class="s-t">Get to 10–20 reviews, fast</span><span class="owner both">Together</span></summary>
          <div class="dd">I set up a one-tap Google review link and write you a short, ready-to-send message. You text it to past customers — tree, landscape, side jobs, anyone glad they hired you. Coming straight from you, it lands far better than from a stranger, and gets you the reviews a homeowner needs before handing you a driveway.</div>
        </details>
      </div>
      <div class="phase">
        <span class="ph">Phase 2 · Weeks 2–4</span>
        <h3>A site that makes a $10k job feel safe</h3>
        <details class="d">
          <summary><span class="s-t">Build your concrete-specialist website</span><span class="owner">AraBuilds</span></summary>
          <div class="dd">A sharp specialist site: your best pours, before/afters, reviews, your service towns (Berkeley, Walnut Creek, Benicia, Tiburon), click-to-call, and a simple quote form. Built to convert, not a template.</div>
        </details>
      </div>
      <div class="phase">
        <span class="ph">Phase 3 · Ongoing</span>
        <h3>Leads, pricing &amp; keeping it running</h3>
        <details class="d">
          <summary><span class="s-t">Local SEO + lead generation</span><span class="owner">AraBuilds</span></summary>
          <div class="dd">Aimed at high-ticket concrete buyers in your best towns — Berkeley, Walnut Creek, Benicia, Tiburon. Quality over volume: a few good jobs, not a flood.</div>
        </details>
        <details class="d">
          <summary><span class="s-t">Pricing &amp; a job filter</span><span class="owner both">Together</span></summary>
          <div class="dd">We set your minimum and define your ideal job — the higher-ticket work you're best at: foundations, retaining walls with drainage, bigger flatwork, $8k+ in your best towns — so it's easier to pass on the rest.</div>
        </details>
        <details class="d">
          <summary><span class="s-t">A tracked business line + follow-up</span><span class="owner">AraBuilds</span></summary>
          <div class="dd">Your number on Google and the site is a dedicated line that rings your cell — every call and text logged. We see exactly which jobs came from your new setup, and nothing slips between a quote and a booked job.</div>
        </details>
        <details class="d">
          <summary><span class="s-t">Monthly management — hands-off for you</span><span class="owner">AraBuilds</span></summary>
          <div class="dd">I run Google, reviews, the site, leads, and tracking every month. Your job stays simple: do great work and send me photos.</div>
        </details>
      </div>
    </div>
  </section>

  <section>
    <span class="label">what success looks like</span>
    <h2>3–4 good jobs a month, built on proof</h2>
    <p>3–4 booked jobs a month that are your own, at your real prices, lands you in your $10–25k target — and with your family bench, the crew scales as the work grows. It's all built on real proof and a real license, so you're never risking your name on work you can't stand behind. <span class="muted">That's the whole point: a business that's yours, not borrowed.</span></p>
  </section>

  <section>
    <span class="label">how we work together</span>
    <h2>You pay nothing up front. I only win when you do.</h2>
    <p>You asked what's in it for each of us — fair question. Straight answer: <strong>nothing out of your pocket to start.</strong> I build the license help, the Google profile, the site, and the lead engine, and I only earn once it's actually putting paying jobs in your hands. Once it's working, we land on whatever feels fair — a simple monthly to run it, or a small share of the jobs that close through the site. No lock-in, no surprises. <span class="muted">My incentive is to make you money, because that's the only way I make any. Same team.</span></p>
  </section>

  <section>
    <div class="firstmove">
      <span class="label">start here</span>
      <p style="font-size:17px">Whenever you're ready, give me the green light and I'll start your license paperwork and get your Google profile live while we shape the rest together. To kick it off, send me a few things — drop what you can in our shared folder:</p>
      <ol>
        <li>Your best <strong>15–20 job photos</strong> (before/afters especially).</li>
        <li>The <strong>exact registered name</strong> of the business (Pacific West Concrete, or "&amp; Landscaping"?), whether it's a sole prop / DBA / LLC, and a photo of any registration paperwork — so everything points to one clean, legal business.</li>
        <li>Your <strong>cell number, email, and hours</strong> — I'll set you up with a dedicated business line that rings your phone, so customers reach you the same as always and every lead gets tracked.</li>
        <li>Any <strong>logo or branding</strong> you already have (no worries if not — we'll make you one).</li>
        <li>A <strong>website or two whose look you love</strong> (any trade, anywhere) — your north star for how yours should feel.</li>
      </ol>
      <div class="ctas">
        <a class="cta" href="${INTAKE_LINK}" target="_blank" rel="noopener">Open the shared folder →</a>
      </div>
      <p style="margin-top:16px;color:var(--muted)">Questions, comments, or changes first? <a href="tel:+15106942210" style="color:var(--accent);font-weight:600">Give me a call</a>.</p>
    </div>
  </section>

  <footer>
    <span>Prepared by AraBuilds for Pili — Pacific West Concrete</span>
    <a href="/">arabuilds.com</a>
  </footer>` + foot;
}
