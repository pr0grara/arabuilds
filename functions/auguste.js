// GET/POST /auguste — password-protected branded plan for Auguste Vende (All East Bay Properties).
// Plan HTML is only returned once the password is correct (checked server-side),
// behind a styled on-brand gate instead of the default Basic-Auth popup.

const PASSWORD = 'eastbay'; // dead simple, on-theme. Change here anytime.
const COOKIE = 'auguste_ok=1';

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
          Location: '/auguste',
          'Set-Cookie': COOKIE + '; Path=/auguste; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure'
        }
      });
    }
    return html(gate(true), 401);
  }

  if (authed) return html(plan());

  // Convenience: a one-tap link (e.g. text Auguste /auguste?pw=eastbay). Sets the cookie too.
  const qpw = new URL(request.url).searchParams.get('pw');
  if (qpw && qpw.trim().toLowerCase() === PASSWORD) {
    return new Response(plan(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Set-Cookie': COOKIE + '; Path=/auguste; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure'
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

  .titleblock{margin-top:26px;border:1.5px solid var(--navy);border-radius:6px;overflow:hidden;background:var(--panel);max-width:480px}
  .tb-head{background:var(--navy);color:#fff;padding:9px 15px;display:flex;align-items:center;justify-content:space-between}
  .tb-head .t{font-family:var(--mono);font-size:10.5px;letter-spacing:2px;text-transform:uppercase;opacity:.85}
  .tb-head .dot{width:8px;height:8px;border-radius:50%;background:var(--accent)}
  .tb-row{display:grid;grid-template-columns:104px 1fr;gap:4px 14px;padding:10px 15px;border-bottom:1px dashed var(--line-2)}
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

  /* internal call-prep block — temporary, removed before sending to Auguste */
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
    <p>Auguste — enter the password I gave you to open your website plan.</p>
    <form method="post" action="/auguste">
      <input type="password" name="pw" placeholder="password" autofocus autocomplete="current-password" aria-label="Password">
      <button type="submit">Open plan →</button>
    </form>
    <div class="err">${error ? 'Wrong password — try again.' : ''}</div>
  </div>` + foot;
}

function callGuide() {
  return `
  <div class="cp">
    <div class="cp-flag">⚠ Internal · call prep — not part of Auguste's plan · remove before sending</div>
    <h2>Call prep — sit-down with Auguste</h2>
    <p class="cp-sub">The plan below makes some assumptions about where his business actually comes from and where he wants to take it. These are the spots to pull out of him. Don't leave without buyers-vs-sellers, where his deals really come from, and the money. Let him talk ~70%.</p>

    <div class="cp-tools">
      <button type="button" class="cp-btn" id="cpCopy">Copy answers</button>
      <button type="button" class="cp-btn" id="cpClear">Clear</button>
      <span class="cp-note">saved in this browser as you type</span>
    </div>

    <h3>The four that change the plan</h3>
    <div class="q">
      <span class="t">1. Buyers or sellers — where's the money and where does he want volume?</span>
      <span class="ask"><b>Ask:</b> Of your deals, what's the split buyers vs sellers? Which is better money and less headache? If you could fill your calendar with one, which?</span>
      <span class="why"><b>Why:</b> Decides what the site leads with — a "what's my home worth?" seller tool, or buyer listing-alerts. We can do both, but one has to be the hero CTA.</span>
      <textarea class="cp-field" data-k="q1" data-q="1. Buyers vs sellers" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">2. Where does business come from <em>today</em>?</span>
      <span class="ask"><b>Ask:</b> Referrals? Paying for Zillow leads (how much)? Repeat clients? Are you converting any of the brokerage's 500+ rental tenants into buyers? Roughly what % from each?</span>
      <span class="why"><b>Why:</b> Tells us whether we're replacing paid Zillow spend, amplifying referrals, or tapping the rental book. Changes the whole first move and how fast it pays for itself.</span>
      <textarea class="cp-field" data-k="q2" data-q="2. Where business comes from today" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">3. The money</span>
      <span class="ask"><b>Ask:</b> Roughly how many deals a year now? Average commission? What are you spending on leads/marketing today? What could you put toward this monthly?</span>
      <span class="why"><b>Why:</b> No baseline yet. Right-sizes the build and tells us if even 2–3 extra deals a year makes the whole thing a no-brainer.</span>
      <textarea class="cp-field" data-k="q3" data-q="3. The money" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">4. Geographic reality — where do the deals actually come from?</span>
      <span class="ask"><b>Ask:</b> Which cities/neighborhoods have your best, most profitable deals come from? Oakland/Berkeley/Emeryville, or wider? Anywhere you want to break into?</span>
      <span class="why"><b>Why:</b> Sets which city pages we build first. Better to own 3 cities he actually works than spread thin across 10 he doesn't.</span>
      <textarea class="cp-field" data-k="q4" data-q="4. Geographic reality" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>

    <h3>Deeper — sharpen it</h3>
    <div class="q">
      <span class="t">MLS + IDX appetite</span>
      <span class="why">Is he active on the MLS? Would he pay a monthly vendor later so buyers can search live listings right on his site (that's "IDX")? Don't oversell it — it's a phase-3 maybe, not a launch need.</span>
      <textarea class="cp-field" data-k="d1" data-q="MLS / IDX appetite" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Engagement shape — build-once or ongoing?</span>
      <span class="why">Does he want a site handed off, or me running Google/reviews/SEO/leads monthly? SEO and reviews are the part that compounds — gauge his appetite for ongoing.</span>
      <textarea class="cp-field" data-k="d2" data-q="Engagement (build-once vs ongoing)" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Reviews + reputation — what's real and reachable?</span>
      <span class="why">He has Zillow + Experience reviews. Can he funnel happy clients to Google? How many past clients could he ask this month? Google reviews are the local-search needle-mover.</span>
      <textarea class="cp-field" data-k="d3" data-q="Reviews / reachable clients" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">The Wix site — keep the brand, or open rebuild?</span>
      <span class="why">Is he attached to the current look/domain? Confirm we keep auguste-realtor.com and his brand, just rebuild underneath it.</span>
      <textarea class="cp-field" data-k="d4" data-q="Wix / brand attachment" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>

    <h3>Quick confirms</h3>
    <div class="q">
      <span class="t">Solo, or a team/transaction coordinator behind him?</span>
      <textarea class="cp-field" data-k="c1" data-q="Solo vs team" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Assets ready? (pro photos, bio, past listing data, review text)</span>
      <textarea class="cp-field" data-k="c2" data-q="Assets ready" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Why now — slow season, or building ahead of a push?</span>
      <textarea class="cp-field" data-k="c3" data-q="Why now" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>
    <div class="q">
      <span class="t">Does he handle property management leads too, or just sales here?</span>
      <textarea class="cp-field" data-k="c4" data-q="PM vs sales scope" rows="1" placeholder="Type Auguste's answer…"></textarea>
    </div>

    <div class="mind">This call isn't to pitch the plan — it's to find the 2–3 places I'm wrong so v2 becomes <em>his</em>, not mine.</div>
  </div>

  <div class="cp-divider">Auguste's plan below</div>

  <script>
  (function(){
    var KEY='auguste_prep_v1';
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
      var out='CALL NOTES — Auguste Vende / All East Bay Properties\\n\\n';
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
  return head('Website Plan — Auguste Vende · AraBuilds') + callGuide() + `
  <div class="doc-head">
    <a class="logo" href="/"><span class="mark">A</span>Ara<b>Builds</b></a>
    <span class="label" style="margin-top:22px">website plan · prepared for auguste</span>
    <h1 class="doc-title">All East Bay <span class="accent">Properties.</span></h1>
    <p class="doc-sub">Here's how I'd turn your website from a nice digital business card into something that actually brings you buyers and sellers — plain and in order. Think of this as a starting point, not a verdict: tell me what fits, what doesn't, and where I've got your business wrong.</p>

    <aside class="titleblock" aria-label="Plan details">
      <div class="tb-head"><span class="t">Plan Spec</span><span class="dot"></span></div>
      <dl>
        <div class="tb-row"><dt>Prepared for</dt><dd>Auguste Vende</dd></div>
        <div class="tb-row"><dt>Brokerage</dt><dd>All East Bay Properties · DRE#02090399</dd></div>
        <div class="tb-row"><dt>Goal</dt><dd>More buyer &amp; seller leads</dd></div>
        <div class="tb-row"><dt>Service area</dt><dd>Oakland · Berkeley · Emeryville → East Bay</dd></div>
        <div class="tb-row"><dt>Prepared by</dt><dd>AraBuilds · June 2026</dd></div>
      </dl>
    </aside>
  </div>

  <section>
    <span class="label">the read</span>
    <h2>You've got the hard part already</h2>
    <p>You're the Broker of Record, you've helped run <strong>500+ homes</strong> across the East Bay since 2005, you've got real reviews on Zillow and Experience, and you've got a story people remember — the jazz musician who became their realtor. That's trust most agents would kill for. <span class="muted">The credibility is real and it's yours.</span></p>
    <p>The problem isn't you — it's that <strong>your website can't be found and can't catch a lead.</strong> It's five clean pages on Wix. Nobody searching "Oakland realtor" or "sell my house in Emeryville" is landing on it, there's no way for a seller to get a home value or a buyer to get listing alerts, and the only path is "book a Calendly call." Everyone who isn't ready to book a meeting right then just leaves. <span class="muted">That's the whole gap — and it's very fixable.</span></p>
    <div class="callout"><b>What I think is mainly holding the site back:</b> it's a brochure, not a lead engine. The rest of this is aimed at fixing that, in order — but you know your business better than I do, so push back anywhere it doesn't fit.</div>
  </section>

  <section>
    <span class="label">the reframe</span>
    <h2>You don't need a flashier site. You need to get found, and catch the lead.</h2>
    <p>Zillow and Redfin already won the "browse homes" game — chasing them is a money pit. Your edge is different: you're the trusted local broker people <strong>want a human for</strong> when they're actually buying or selling in the East Bay. So we build two things — <strong>pages Google can find</strong> when someone searches your cities, and <strong>simple tools that capture the lead</strong> the moment they land. Quality leads from people already in your backyard, not a flood of tire-kickers.</p>
  </section>

  <section>
    <span class="label">the roadmap</span>
    <h2>How I'd build it</h2>
    <div class="phases">
      <div class="phase">
        <span class="ph">Phase 1 · Foundation &amp; getting found</span>
        <h3>A fast site Google actually understands</h3>
        <ul>
          <li><strong>Rebuild on a fast, owned site</strong> <span class="muted">— same as the trade businesses in my portfolio. You keep your brand and domain (auguste-realtor.com); we just put a real engine under it.</span></li>
          <li><strong>A page for each city you work</strong> <span class="muted">— start with Oakland, Berkeley, and Emeryville. Real content about each market so you can rank for "Oakland realtor," "sell my house Berkeley," and the like. This is the part the current site is missing entirely.</span></li>
          <li><strong>Proper real-estate setup behind the scenes</strong> <span class="muted">— the search-engine tags and licensing/Equal-Housing details done right (I handle the compliance side), so Google knows exactly who you are and where you work.</span></li>
          <li><strong>Tie your presence together</strong> <span class="muted">— Google Business Profile, Zillow, and your site all pointing at each other and saying the same thing.</span></li>
        </ul>
      </div>
      <div class="phase">
        <span class="ph">Phase 2 · Catch the leads</span>
        <h3>Stop letting visitors leave empty-handed</h3>
        <ul>
          <li><strong>A "What's my home worth?" tool for sellers</strong> <span class="muted">— the single best-converting thing on a real estate site. They tell you about their home, you get a hot seller lead in your inbox.</span></li>
          <li><strong>Listing alerts for buyers</strong> <span class="muted">— they tell you what they're looking for, you capture the email and follow up. No more anonymous visitors.</span></li>
          <li><strong>Everything lands in one place</strong> <span class="muted">— each lead emails you instantly and drops into a simple dashboard so nothing slips and you know exactly who to call.</span></li>
        </ul>
      </div>
      <div class="phase">
        <span class="ph">Phase 3 · Grow it</span>
        <h3>The part that compounds</h3>
        <ul>
          <li><strong>Neighborhood guides &amp; content</strong> <span class="muted">— answer the questions East Bay buyers and sellers are already Googling. Each one is another door into your site.</span></li>
          <li><strong>A reviews engine</strong> <span class="muted">— a simple way to keep happy clients leaving you Google reviews, which is what wins the local search game.</span></li>
          <li><strong>Ongoing local SEO</strong> <span class="muted">— keep sharpening what ranks and what converts.</span></li>
          <li><strong>Live home search, later if you want it</strong> <span class="muted">— we can plug real MLS listings with search right into your site ("IDX") down the road. It's a monthly add-on, so we'd do it once leads are already flowing — not day one.</span></li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <span class="label">what success looks like</span>
    <h2>A steady trickle of leads from your own site</h2>
    <p>Instead of renting attention on Zillow, you've got buyers and sellers finding <strong>you</strong> — searching their East Bay city, landing on your page, and raising their hand right there. A few extra deals a year from your own site pays for the whole thing many times over, and it's all built on the trust you've already earned. <span class="muted">That's the goal: your reputation, finally working for you online.</span></p>
  </section>

  <section>
    <div class="firstmove">
      <span class="label">start here</span>
      <h2>If you're in, a great first step</h2>
      <p>Whenever you're ready, send me a few things and I'll start shaping the real thing while we sort out the details together:</p>
      <ol>
        <li>Your <strong>bio</strong> and a couple of <strong>professional photos</strong>.</li>
        <li>The <strong>cities/neighborhoods</strong> where your best deals come from.</li>
        <li>A handful of <strong>reviews or testimonials</strong> I can feature, and any past listing photos.</li>
      </ol>
      <div class="ctas">
        <a class="cta" href="sms:+15106942210">Text me the details →</a>
        <a class="cta ghost" href="tel:+15106942210">Call AraBuilds</a>
      </div>
    </div>
  </section>

  <footer>
    <span>Prepared by AraBuilds for Auguste Vende — All East Bay Properties</span>
    <a href="/">arabuilds.com</a>
  </footer>` + foot;
}
