// GET/POST /pili — password-protected branded growth plan for Pili (Pacific West Concrete).
// Plan HTML is only returned once the password is correct (checked server-side),
// behind a styled on-brand gate instead of the default Basic-Auth popup.

const PASSWORD = 'rebar'; // dead simple, concrete-related. Change here anytime.
const COOKIE = 'pili_ok=1';

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

function callGuide() {
  return `
  <div class="cp">
    <div class="cp-flag">⚠ Internal · call prep — not part of Pili's plan · remove before sending</div>
    <h2>Call prep — man to man with Pili</h2>
    <p class="cp-sub">The plan below rests on a few assumptions. These are the spots to pull out of him on the call. Don't leave without the license timeline, his real capacity, and the money. Let him talk ~70%.</p>

    <div class="cp-tools">
      <button type="button" class="cp-btn" id="cpCopy">Copy answers</button>
      <button type="button" class="cp-btn" id="cpClear">Clear</button>
      <span class="cp-note">saved in this browser as you type</span>
    </div>

    <h3>The four that change the plan</h3>
    <div class="q">
      <span class="t">1. License &amp; insurance — where exactly, and when?</span>
      <span class="ask"><b>Ask:</b> Which license (C-8 concrete or B general)? Passed the exam? Bonded? Real date it's active? General liability now, and workers' comp for the crew?</span>
      <span class="why"><b>Why:</b> In CA you generally need a CSLB license once a job crosses ~$500 (labor + materials) — his ideal job is $10k+. Until it lands he can't legally chase the jobs we're building toward.</span>
      <textarea class="cp-field" data-k="q1" data-q="1. License + insurance" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">2. Real capacity — and who is the crew?</span>
      <span class="ask"><b>Ask:</b> If leads showed up tomorrow, how many jobs a month could you actually run? Employees, 1099, or on-call guys? Could you run two crews?</span>
      <span class="why"><b>Why:</b> 3–5 people but only 1–3 jobs/month doesn't add up. Sets the entire lead-gen target — if the true ceiling is 6–8, we build differently.</span>
      <textarea class="cp-field" data-k="q2" data-q="2. Real capacity + crew" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">3. The money</span>
      <span class="ask"><b>Ask:</b> Roughly what are you doing in revenue a month now? What does a typical job invoice at? Know your margins? And what can you put into this each month?</span>
      <span class="why"><b>Why:</b> No baseline today. Right-sizes the plan and tells us if pricing is the fastest win.</span>
      <textarea class="cp-field" data-k="q3" data-q="3. The money" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">4. Direction — homeowners or general contractors?</span>
      <span class="ask"><b>Ask:</b> Keep subbing for GCs, or shift to direct homeowners? Which has been better money and less headache?</span>
      <span class="why"><b>Why:</b> Direct = Google/site/reviews are the whole game. GC = relationships. Changes where we spend effort first.</span>
      <textarea class="cp-field" data-k="q4" data-q="4. Direction (homeowners vs GCs)" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>

    <h3>Deeper — sharpen it</h3>
    <div class="q">
      <span class="t">"Bad leads" + where deals die</span>
      <span class="why">What makes a lead junk to him? When he quotes and loses, why? (Texts quotes, follows up "sometimes.")</span>
      <textarea class="cp-field" data-k="d1" data-q="Bad leads / where deals die" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Is the review asset real?</span>
      <span class="why">Can he pull 15–20 past customers' numbers this week? He listed "reviews" as proof but has 0 on Google — what did he mean?</span>
      <textarea class="cp-field" data-k="d2" data-q="Review asset (reachable customers)" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Tree / landscape — real money or side gig?</span>
      <span class="why">What share is concrete vs tree vs landscape? Decides the name and what we market.</span>
      <textarea class="cp-field" data-k="d3" data-q="Tree/landscape vs concrete split" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Home base + where he wins</span>
      <span class="why">Where's he based, and where have the best, most profitable jobs come from?</span>
      <textarea class="cp-field" data-k="d4" data-q="Home base + where he wins" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>

    <h3>Quick confirms</h3>
    <div class="q">
      <span class="t">Who owns it — just him, or partners?</span>
      <textarea class="cp-field" data-k="c1" data-q="Owner / partners" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Either name already registered? (entity, EIN, bank, Yelp/FB)</span>
      <textarea class="cp-field" data-k="c2" data-q="Name already registered?" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Why now — slow and needs work, or building ahead?</span>
      <textarea class="cp-field" data-k="c3" data-q="Why now / season" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Photos usable? Testimonials written down or verbal?</span>
      <textarea class="cp-field" data-k="c4" data-q="Photos / testimonials" rows="1" placeholder="Type Pili's answer…"></textarea>
    </div>

    <div class="mind">This call isn't to pitch the plan — it's to find the 2–3 places you're wrong so v2 becomes <em>his</em>, not yours.</div>
  </div>

  <div class="cp-divider">Pili's plan below</div>

  <script>
  (function(){
    var KEY='pili_prep_v1';
    var fields=document.querySelectorAll('.cp-field');
    var store={};
    try{store=JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){}
    function autosize(f){f.style.height='auto';f.style.height=(f.scrollHeight+2)+'px';}
    fields.forEach(function(f){
      var id=f.getAttribute('data-k');
      if(store[id]){f.value=store[id];}
      autosize(f);
      f.addEventListener('input',function(){
        store[id]=f.value;
        try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}
        autosize(f);
      });
    });
    var copyBtn=document.getElementById('cpCopy');
    if(copyBtn){copyBtn.addEventListener('click',function(){
      var out='CALL NOTES — Pili / Pacific West Concrete\\n\\n';
      fields.forEach(function(f){
        var a=(f.value||'').trim();
        if(a){out+=f.getAttribute('data-q')+'\\n'+a+'\\n\\n';}
      });
      navigator.clipboard.writeText(out).then(function(){
        copyBtn.textContent='Copied ✓';
        setTimeout(function(){copyBtn.textContent='Copy answers';},1600);
      }).catch(function(){copyBtn.textContent='Press Ctrl+C';});
    });}
    var clearBtn=document.getElementById('cpClear');
    if(clearBtn){clearBtn.addEventListener('click',function(){
      if(!window.confirm('Clear all typed answers?')){return;}
      store={};try{localStorage.removeItem(KEY);}catch(e){}
      fields.forEach(function(f){f.value='';autosize(f);});
    });}
  })();
  </script>
`;
}

function plan() {
  return head('Growth Plan — Pacific West Concrete · AraBuilds') + callGuide() + `
  <div class="doc-head">
    <a class="logo" href="/"><span class="mark">A</span>Ara<b>Builds</b></a>
    <span class="label" style="margin-top:22px">growth plan · prepared for pili</span>
    <h1 class="doc-title">Pacific West <span class="accent">Concrete.</span></h1>
    <p class="doc-sub">Here's how I'd take you from skilled-but-invisible to a concrete business that books steady, good-paying work — plain and in order. Think of this as a starting point, not a verdict: tell me what fits, what doesn't, and where I've got your business wrong.</p>

    <aside class="titleblock" aria-label="Plan details">
      <div class="tb-head"><span class="t">Plan Spec</span><span class="dot"></span></div>
      <dl>
        <div class="tb-row"><dt>Prepared for</dt><dd>Pili</dd></div>
        <div class="tb-row"><dt>Trade</dt><dd>Concrete · flatwork &amp; hardscape</dd></div>
        <div class="tb-row"><dt>Service area</dt><dd>Oakland → San Francisco</dd></div>
        <div class="tb-row"><dt>Engagement</dt><dd>Full growth partner</dd></div>
        <div class="tb-row"><dt>Prepared by</dt><dd>AraBuilds · June 2026</dd></div>
      </dl>
    </aside>
  </div>

  <section>
    <span class="label">the read</span>
    <h2>You've got the hard part already</h2>
    <p>You're skilled, you run a 3–5 person crew, and you've got <strong>lots</strong> of photos, before-and-afters, real testimonials, GC referrals, and years of work behind you. You answer same-day. That's a stronger base than most guys ever build.</p>
    <p>The problem isn't the work — it's that <strong>none of it exists online.</strong> No website, no Google profile, zero reviews, two different business names, license and insurance still in process. To someone deciding who pours their $12k driveway, you're invisible and unverifiable right now. <span class="muted">That's the whole gap — and it's very fixable.</span></p>
    <div class="callout"><b>What I think is mainly holding you back:</b> legitimacy &amp; visibility. The rest of this is aimed at fixing that, in order — but you know your business better than I do, so push back anywhere it doesn't fit.</div>
  </section>

  <section>
    <span class="label">the reframe</span>
    <h2>You don't need more leads. You need a few good ones.</h2>
    <p>You want $10–25k a month, and you comfortably run 1–3 jobs a month. That means the goal isn't a flood of calls — it's <strong>2–4 good jobs a month</strong> at your real prices. So we build trust and point it at the right work. That also kills your "too many bad leads" problem at the root.</p>
  </section>

  <section>
    <span class="label">the roadmap</span>
    <h2>How I'd build it</h2>
    <div class="phases">
      <div class="phase">
        <span class="ph">Phase 0 · Week 1 — Settle the identity</span>
        <h3>Land on one official business</h3>
        <ul>
          <li><strong>Pick one name — your call.</strong> <span class="muted">"Pilis Concrete / Pacific West Concrete and Landscaping" reads as two businesses right now. I lean toward <strong>Pacific West Concrete</strong> — concrete-forward, where your best money is, with tree/landscape as a side service. But it's your name; if Pilis Concrete means more to you, we run with that.</span></li>
          <li><strong>Finish license &amp; insurance.</strong> <span class="muted">You're already in process — once it's done it unlocks trust, Google, and bidding bigger jobs legally. I'll walk the steps with you.</span></li>
        </ul>
      </div>
      <div class="phase">
        <span class="ph">Phase 1 · Weeks 1–2 — Turn your proof into a Google profile</span>
        <h3>The fastest path to new calls</h3>
        <ul>
          <li><strong>Google Business Profile, live.</strong> <span class="muted">It's free, and it's literally where Bay Area people search "concrete near me." We load your existing photos and before/afters.</span></li>
          <li><strong>Review engine.</strong> <span class="muted">You've got years of happy customers and GC referrals in your phone. We text them a one-tap link and get you to 10–20 reviews fast — this starts the phone ringing before the website is even done.</span></li>
        </ul>
      </div>
      <div class="phase">
        <span class="ph">Phase 2 · Weeks 2–4 — The website</span>
        <h3>Make a $10k job feel safe to hand you</h3>
        <ul>
          <li><strong>A sharp concrete-specialist site:</strong> <span class="muted">your best pours, before/afters, testimonials, service area (Oakland → SF), click-to-call, and a simple quote form. Built to convert, not a template.</span></li>
        </ul>
      </div>
      <div class="phase">
        <span class="ph">Phase 3 · Ongoing — Leads, pricing &amp; keeping it running</span>
        <h3>The part I run for you</h3>
        <ul>
          <li><strong>Local SEO + lead generation</strong> <span class="muted">aimed at Oakland–SF flatwork buyers. Quality over volume.</span></li>
          <li><strong>Pricing &amp; a job filter</strong> <span class="muted">— together we'd nudge your minimum up off $500 and define your ideal job: $8k+ flatwork, Oakland–SF, driveways / patios / foundations / retaining walls — so it's easier to pass on the rest. (Helps with "knowing which jobs to accept.")</span></li>
          <li><strong>Simple lead tracking + a follow-up rhythm</strong> <span class="muted">so nothing slips — part of why your close rate sits at 10–25% today.</span></li>
          <li><strong>I manage it monthly:</strong> <span class="muted">Google, reviews, site, leads, tracking. Your job stays simple — do great work and send me photos + happy-customer numbers.</span></li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <span class="label">what success looks like</span>
    <h2>3–4 good jobs a month, built on proof</h2>
    <p>3–4 booked flatwork jobs a month at your real prices lands you in your $10–25k target — comfortably inside your crew's capacity. And it's all built on real proof, so you never feel like you're risking your credibility. <span class="muted">That was your biggest worry; this plan is designed around it.</span></p>
  </section>

  <section>
    <div class="firstmove">
      <span class="label">start here</span>
      <h2>If you're in, a great first step</h2>
      <p>Whenever you're ready, send me three things and I'll get your Google profile live and reviews coming in while we shape the rest together:</p>
      <ol>
        <li>The <strong>name</strong> you want to go with.</li>
        <li>Your best <strong>15–20 job photos</strong> (before/afters especially).</li>
        <li>Phone numbers of <strong>15 past happy customers</strong>.</li>
      </ol>
      <div class="ctas">
        <a class="cta" href="sms:+15106942210">Text me the details →</a>
        <a class="cta ghost" href="tel:+15106942210">Call AraBuilds</a>
      </div>
    </div>
  </section>

  <footer>
    <span>Prepared by AraBuilds for Pili — Pacific West Concrete</span>
    <a href="/">arabuilds.com</a>
  </footer>` + foot;
}
