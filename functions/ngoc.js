// GET/POST /ngoc — password-protected branded plan for Ngoc (brand: Lil Willers Hard Cider Co.).
// Fun little placeholder plan, shown to a web-designer friend for feedback on the format.
// Plan HTML only returns once the password is correct (server-side), behind a styled gate.

const PASSWORD = 'theromster'; // on-theme, dead simple. Change here anytime.
const COOKIE = 'ngoc_ok=1';

// Where the CTA points — swap for the real shared folder when there is one.
const INTAKE_LINK = 'https://drive.google.com/drive/folders/placeholder';

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
          Location: '/ngoc',
          'Set-Cookie': COOKIE + '; Path=/ngoc; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure'
        }
      });
    }
    return html(gate(true), 401);
  }

  if (authed) return html(plan());

  // Convenience: a one-tap link (/ngoc?pw=theromster). Sets the cookie too.
  const qpw = new URL(request.url).searchParams.get('pw');
  if (qpw && qpw.trim().toLowerCase() === PASSWORD) {
    return new Response(plan(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': COOKIE + '; Path=/ngoc; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure'
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
<meta name="theme-color" content="#1f130c">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='14' fill='%235a3a22'/><text x='50' y='73' font-size='58' text-anchor='middle' fill='%23d98a2b' font-family='Arial,sans-serif' font-weight='bold'>LW</text></svg>">
<script>(function(){try{var t=localStorage.getItem('theme')==='light'?'light':'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();</script>
<style>
  :root{
    --paper:#fffdf8;--panel:#ffffff;--ink:#211a13;--navy:#5a3a22;--muted:#7a6a58;
    --line:#ece4d6;--line-2:#dccdb6;--accent:#c2701f;--accent-dk:#a85c12;
    --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    --mono:"SF Mono",ui-monospace,"JetBrains Mono","Cascadia Code",Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:15.5px;line-height:1.6;-webkit-font-smoothing:antialiased;padding:clamp(24px,5vw,56px);min-height:100vh}
  ::selection{background:var(--accent);color:#fff}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:720px;margin:0 auto}
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
  .doc-head{margin:6px 0 clamp(22px,4vw,32px)}
  .doc-title{font-size:clamp(27px,6vw,44px);line-height:1.05;letter-spacing:-1.2px;font-weight:800;color:var(--navy);margin:16px 0 0}
  .doc-title .accent{color:var(--accent)}
  .doc-sub{margin-top:12px;color:var(--muted);max-width:52ch}

  .titleblock{margin-top:24px;border:1.5px solid var(--navy);border-radius:6px;overflow:hidden;background:var(--panel);max-width:460px}
  .tb-head{background:var(--navy);color:#fff;padding:9px 15px;display:flex;align-items:center;justify-content:space-between}
  .tb-head .t{font-family:var(--mono);font-size:10.5px;letter-spacing:2px;text-transform:uppercase;opacity:.85}
  .tb-head .dot{width:8px;height:8px;border-radius:50%;background:var(--accent)}
  .tb-row{display:grid;grid-template-columns:104px 1fr;gap:4px 14px;padding:9px 15px;border-bottom:1px dashed var(--line-2)}
  .tb-row:last-child{border-bottom:none}
  .tb-row dt{font-family:var(--mono);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);align-self:center}
  .tb-row dd{font-weight:600;color:var(--navy);font-size:13.5px}

  section{padding:clamp(22px,4vw,32px) 0;border-top:1px solid var(--line)}
  section h2{font-size:clamp(19px,3.2vw,25px);letter-spacing:-.5px;font-weight:800;color:var(--navy);margin:9px 0 12px}
  section p{color:var(--ink);margin-bottom:11px;max-width:62ch}
  section p .muted{color:var(--muted)}
  strong{color:var(--navy)}

  .callout{border-left:3px solid var(--accent);background:rgba(194,112,31,.07);padding:14px 16px;border-radius:0 6px 6px 0;margin:4px 0}
  .callout b{color:var(--accent)}

  .phases{display:grid;gap:14px;margin-top:6px}
  .phase{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:16px 18px}
  .phase .ph{font-family:var(--mono);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);font-weight:700}
  .phase h3{font-size:16.5px;font-weight:700;color:var(--navy);margin:6px 0 4px}

  /* roadmap dropdowns — concise summary, detail on demand */
  .phase details.d{border-top:1px solid var(--line)}
  .phase summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:11px 0;font-weight:700;color:var(--navy);font-size:14.5px;line-height:1.35}
  .phase summary::-webkit-details-marker{display:none}
  .phase summary .s-t{flex:1}
  .phase summary .owner{font-family:var(--mono);font-size:9px;letter-spacing:.8px;text-transform:uppercase;padding:3px 8px;border-radius:999px;border:1px solid var(--line-2);color:var(--muted);font-weight:700;white-space:nowrap}
  .phase summary .owner.both{color:var(--accent);border-color:var(--accent)}
  .phase summary::after{content:"+";color:var(--accent);font-weight:700;font-size:18px;line-height:1;width:12px;text-align:center;flex:none}
  .phase details[open] summary::after{content:"–"}
  .phase .dd{padding:2px 0 13px;color:var(--muted);font-size:14px;line-height:1.55;max-width:60ch}
  .phase .dd strong{color:var(--navy)}

  .firstmove{border:1.5px solid var(--accent);border-radius:10px;padding:20px clamp(16px,3vw,24px);background:rgba(194,112,31,.06)}
  .firstmove ol{margin:6px 0 0 20px;display:grid;gap:6px}
  .firstmove li{color:var(--ink)}
  .ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}
  .cta{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:15px;padding:12px 22px;border-radius:6px;border:1.5px solid var(--accent);background:var(--accent);color:#fff}
  .cta:hover{background:var(--accent-dk);border-color:var(--accent-dk)}

  footer{border-top:1px solid var(--line);padding-top:22px;margin-top:8px;color:var(--muted);font-size:12.5px;display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:space-between}

  /* dark mode: the Plan Spec card uses --navy for its header bar + border, but --navy
     flips light in dark mode. Pin those back to brand barrel-brown so the header stays
     dark with legible white text and the border isn't washed out. */
  :root[data-theme="dark"] .titleblock{border-color:#5a3a22}
  :root[data-theme="dark"] .tb-head{background:#3a2616}
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
    <p>Hey Ngoc. Pop in the password I gave you and the Lil Willers plan's all yours.</p>
    <form method="post" action="/ngoc">
      <input type="password" name="pw" placeholder="password" autofocus autocomplete="current-password" aria-label="Password">
      <button type="submit">Open plan →</button>
    </form>
    <div class="err">${error ? 'Wrong password. Try again.' : ''}</div>
  </div>` + foot;
}

function plan() {
  return head('Website Plan — Lil Willers Hard Cider Co. · AraBuilds') + `
  <div class="doc-head">
    <a class="logo" href="/"><span class="mark">A</span>Ara<b>Builds</b></a>
    <span class="label" style="margin-top:20px">website plan · for ngoc</span>
    <h1 class="doc-title">The little cidery people <span class="accent">actually find.</span></h1>
    <p class="doc-sub">Here's how I'd take Lil Willers from a bottle people stumble onto to the cidery they actually look up and buy from. None of this is set in stone, so tell me where I'm off. And rip the format apart too, that's kinda why you're here.</p>

    <aside class="titleblock" aria-label="Plan details">
      <div class="tb-head"><span class="t">Plan Spec</span><span class="dot"></span></div>
      <dl>
        <div class="tb-row"><dt>Prepared for</dt><dd>Ngoc · Lil Willers Hard Cider Co.</dd></div>
        <div class="tb-row"><dt>Brand</dt><dd>Lil Willers · lilwillers.com</dd></div>
        <div class="tb-row"><dt>Focus</dt><dd>Direct sales + local discovery</dd></div>
        <div class="tb-row"><dt>Niche</dt><dd>Small-batch Bay Area cider</dd></div>
        <div class="tb-row"><dt>Prepared by</dt><dd>AraBuilds · June 2026</dd></div>
      </dl>
    </aside>
  </div>

  <section>
    <span class="label">my read</span>
    <h2>The cider's the hard part, and you've already got it down.</h2>
    <p>The cider's good, the bottle looks great, and the regulars love you. The website's the easy part nobody's gotten to yet. Right now you're basically a Linktree and a few tagged photos, so when someone hears about you and goes looking, they can't tell <strong>what's on tap, where to buy, or where you're poured</strong>. So they kinda just don't.</p>
    <div class="callout"><b>The gap, plainly:</b> people are sold on the cider before they even show up, and then there's nowhere to actually show up. That's the whole fix.</div>
  </section>

  <section>
    <span class="label">the strategy</span>
    <h2>Lean all the way into being the local one.</h2>
    <p>You're not gonna out-spend the big labels and you don't need to. The thing they don't have is you being small and local, so the site plays that up: who you are, what's pouring right now, and the two ways to get it. Buy a bottle direct, or find you on tap somewhere close.</p>
  </section>

  <section>
    <span class="label">the roadmap</span>
    <h2>How I'd build it</h2>
    <p class="muted" style="margin:-2px 0 4px">Tap any step for details.</p>
    <div class="phases">
      <div class="phase">
        <span class="ph">Phase 1 · The home base</span>
        <h3>A real site that looks as good as the bottles</h3>
        <details class="d">
          <summary><span class="s-t">One-page site at your own domain</span><span class="owner">AraBuilds</span></summary>
          <div class="dd">Kills the Linktree. The story, the vibe, and a clear "buy / find us" right up top. I'd throw together a rough version fast so you've got something real to react to, then we tighten it up.</div>
        </details>
        <details class="d">
          <summary><span class="s-t">"On tap now" + "find us" map</span><span class="owner both">Together</span></summary>
          <div class="dd">What's pouring this week and which bars, shops and markets carry you. You send me the list, I build it, and I'll keep it stupid easy for you to update.</div>
        </details>
        <details class="d">
          <summary><span class="s-t">Show up in local search</span><span class="owner">AraBuilds</span></summary>
          <div class="dd">Get the Google profile and tags sorted so "hard cider near me" or just "Lil Willers" actually lands on you instead of some old Instagram post.</div>
        </details>
      </div>
      <div class="phase">
        <span class="ph">Phase 2 · Sell + stay in touch</span>
        <h3>Turn the fans into a list and some orders</h3>
        <details class="d">
          <summary><span class="s-t">Buy direct (or pre-order a batch)</span><span class="owner both">Together</span></summary>
          <div class="dd">Simple checkout for bottles, merch, whatever. We start with whatever's actually legal and easy for you to ship, and grow it from there.</div>
        </details>
        <details class="d">
          <summary><span class="s-t">"Tell me when the next batch drops"</span><span class="owner">AraBuilds</span></summary>
          <div class="dd">A little email signup so a random visitor turns into someone you can ping when a new batch lands. Honestly the most useful thing on here for a small label.</div>
        </details>
      </div>
    </div>
  </section>

  <section>
    <span class="label">how we work together</span>
    <h2>You don't pay to build it. I take a cut of what it sells.</h2>
    <p>Quick on the money, since it matters. <strong>Nothing up front.</strong> I build the site, the buy button, the local search, all of it, and I only earn once it's actually moving cider for you: bottles sold and orders that came through the site. We can see which ones did, so my cut's always tied to real sales, not some flat bill.</p>
    <p><strong>The rest stays all yours.</strong> Taproom pours, your regulars, wholesale you'd have done anyway: none of my business, literally. I only share in the new stuff the site brings in.</p>
    <p>And you can <strong>buy me out whenever</strong> and own the whole thing outright. No lock-in.</p>
    <div class="callout"><b>Short version:</b> I only make money when the site makes you money, and you can buy it out anytime.</div>
  </section>

  <section>
    <div class="firstmove">
      <span class="label">start here</span>
      <p style="font-size:17px">If you're ready <b style="color:var(--accent)">let me know</b> and drop a few things into our shared folder:</p>
      <ol>
        <li>Logo and a few bottle/taproom photos.</li>
        <li>A couple lines on the Lil Willers story (that name's gotta have one).</li>
        <li>What ciders you've got going, and where you're poured / stocked.</li>
      </ol>
      <div class="ctas">
        <a class="cta" href="${INTAKE_LINK}" target="_blank" rel="noopener">Open our shared folder →</a>
      </div>
      <p style="margin-top:14px;color:var(--muted)">Got questions, or wanna pick the format apart first? <a href="tel:+15106942210" style="color:var(--accent);font-weight:600">Just text me</a>.</p>
    </div>
  </section>

  <footer>
    <span>Prepared by AraBuilds for Ngoc · Lil Willers Hard Cider Co.</span>
    <a href="/">arabuilds.com</a>
  </footer>` + foot;
}
