// GET/POST /auguste — password-protected branded plan for Auguste Vende (All East Bay Properties).
// Plan HTML is only returned once the password is correct (checked server-side),
// behind a styled on-brand gate instead of the default Basic-Auth popup.

const PASSWORD = 'eastbay'; // dead simple, on-theme. Change here anytime.
const COOKIE = 'auguste_ok=1';

// Where the "Send it over" CTA points. Default is email; if we set up a shared
// Google Drive folder for his assets, paste the folder link here instead.
const INTAKE_LINK = 'mailto:azbaghda@gmail.com?subject=' +
  encodeURIComponent('Auguste — site assets for AraBuilds');

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

function plan() {
  return head('Website Plan — Auguste Vende · AraBuilds') + `
  <div class="doc-head">
    <a class="logo" href="/"><span class="mark">A</span>Ara<b>Builds</b></a>
    <span class="label" style="margin-top:22px">website plan · prepared for auguste</span>
    <h1 class="doc-title">The Emeryville <span class="accent">condo specialist.</span></h1>
    <p class="doc-sub">Here's how I'd turn your site from a nice business card into the place every Emeryville condo buyer and seller lands first — and how we put the 60 deals you've already closed to work winning the next ones. A starting point, not a verdict: tell me where I've got it wrong.</p>

    <aside class="titleblock" aria-label="Plan details">
      <div class="tb-head"><span class="t">Plan Spec</span><span class="dot"></span></div>
      <dl>
        <div class="tb-row"><dt>Prepared for</dt><dd>Auguste Vende</dd></div>
        <div class="tb-row"><dt>Brokerage</dt><dd>All East Bay Properties · DRE#02090399</dd></div>
        <div class="tb-row"><dt>Focus</dt><dd>Sellers first · Emeryville condos</dd></div>
        <div class="tb-row"><dt>Niche</dt><dd>Condos → neighboring cities → small multifamily</dd></div>
        <div class="tb-row"><dt>Prepared by</dt><dd>AraBuilds · June 2026</dd></div>
      </dl>
    </aside>
  </div>

  <section>
    <span class="label">the read</span>
    <h2>Your funnel already works. The website is the weak link.</h2>
    <p>This is the part most agents never get right and you already have: your paid Google ads bring in leads at <strong>~$80 each and you close about half of them.</strong> That's a fantastic number. On top of that, the property-management portfolio feeds you listings, and you've personally closed <strong>around 60 properties</strong>. The lead math and the track record are both real. <span class="muted">You're not short on skill or on leads that convert.</span></p>
    <p>The gap is what happens <strong>after</strong> someone hears your name or clicks your ad and looks you up. They land on a five-page Wix brochure that doesn't say "Emeryville condo specialist," doesn't show the 60 homes you've sold, can't search listings, and can't capture them if they're not ready to book a call right that second. <span class="muted">You're paying to send people to a site that undersells you and lets the not-quite-ready ones slip away.</span></p>
    <div class="callout"><b>The job of the new site:</b> make your paid leads close even better, and start pulling in <b>free</b> ones from search — built on proof you already have. Push back anywhere this doesn't fit.</div>
  </section>

  <section>
    <span class="label">the reframe</span>
    <h2>Don't be everyone's East Bay agent. Be <em>the</em> Emeryville condo agent.</h2>
    <p>"East Bay realtor" puts you against hundreds of generalists. <strong>"Emeryville condos"</strong> is a niche you can actually own — and you already do the work. When you're the obvious specialist, three things happen: you can rank #1 for the searches that matter, sellers pick you because <strong>specialists win listings</strong>, and everything we publish compounds instead of getting lost in the noise.</p>
    <p>So the site leads with Emeryville condos, then widens out the way your business does — <strong>condos in the neighboring cities</strong>, and <strong>small multifamily</strong> in the same area (the kind you just sold through the PM company). One clear lane, then the adjacent ones.</p>
  </section>

  <section>
    <span class="label">the roadmap</span>
    <h2>How I'd build it</h2>
    <div class="phases">
      <div class="phase">
        <span class="ph">Phase 1 · Foundation &amp; the niche</span>
        <h3>A fast site that says "Emeryville condos" loud and clear</h3>
        <ul>
          <li><strong>Rebuild keeping the look and domain you like</strong> <span class="muted">— same auguste-realtor.com, in the clean, high-end style you pointed me to (the feel of timallenproperties.com). We just put a real engine underneath.</span></li>
          <li><strong>Emeryville condos as the front door</strong> <span class="muted">— a page built to rank for "Emeryville condos for sale" and "Emeryville condo realtor," then pages for the neighboring cities and small multifamily.</span></li>
          <li><strong>Real-estate setup done right</strong> <span class="muted">— the search-engine tags, schema, and DRE/Equal-Housing details (I handle compliance) so Google knows you're the Emeryville condo specialist.</span></li>
          <li><strong>Tie your presence together</strong> <span class="muted">— your Google profile, the Local Service Ads, and Zillow all pointing at the new site and saying the same thing.</span></li>
        </ul>
      </div>
      <div class="phase">
        <span class="ph">Phase 2 · Proof — put your 60 deals to work</span>
        <h3>The single best thing for winning listings</h3>
        <ul>
          <li><strong>A "Recently Sold" showcase</strong> <span class="muted">— the feature you liked on sashabayrealtor.com. Every closed sale with photo, price, and neighborhood. For a seller deciding who to trust with their condo, nothing beats a wall of homes you've already sold.</span></li>
          <li><strong>Your reviews, front and center</strong> <span class="muted">— you've got plenty; we feature them where they do the most work, not buried on one page.</span></li>
          <li><strong>The human story</strong> <span class="muted">— the jazz-musician-turned-broker angle people remember, woven in.</span></li>
        </ul>
      </div>
      <div class="phase">
        <span class="ph">Phase 3 · Live search &amp; lead capture</span>
        <h3>Make it a real destination — and stop losing visitors</h3>
        <ul>
          <li><strong>Live home search (IDX) right on your site</strong> <span class="muted">— real MLS listings, searchable, the same kind of setup sashabayrealtor.com uses. Buyers search on your site instead of leaving for Zillow, and sold comps show automatically. Budget roughly <strong>$50–110/month</strong> for the vendor on top of your MLS; I'll lock the exact number once we pick one.</span></li>
          <li><strong>"What's my Emeryville condo worth?"</strong> <span class="muted">— a valuation tool aimed right at your niche. The best seller-lead magnet there is.</span></li>
          <li><strong>Buyer listing alerts</strong> <span class="muted">— capture the email, follow up, no more anonymous visitors.</span></li>
          <li><strong>Every lead in one place</strong> <span class="muted">— emails you instantly and drops into a simple dashboard so nothing slips.</span></li>
        </ul>
      </div>
      <div class="phase">
        <span class="ph">Phase 4 · Grow &amp; compound</span>
        <h3>Lean less on paid over time</h3>
        <ul>
          <li><strong>Condo-building &amp; neighborhood guides</strong> <span class="muted">— the specific Emeryville buildings and pockets buyers search by name. Each one is another free door into your site.</span></li>
          <li><strong>A small-multifamily / investor angle</strong> <span class="muted">— almost no agent owns this, and you just sold an 8- and 12-unit. Ties straight to the PM portfolio.</span></li>
          <li><strong>Reviews engine + ongoing SEO</strong> <span class="muted">— keep the Google reviews coming and keep sharpening what ranks, so the free leads grow.</span></li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <span class="label">what success looks like</span>
    <h2>The same great close rate — on more, cheaper, and <strong>your own</strong> leads</h2>
    <p>You already turn ~half your $80 leads into deals. Put those clicks onto a site that screams "Emeryville condo specialist," backed by 60 sold homes and live search, and that number only gets better — while organic search quietly adds leads you didn't pay for. A couple of extra listings a year at 2.5–3% covers all of this many times over. <span class="muted">The goal: your reputation and your track record, finally working for you online.</span></p>
  </section>

  <section>
    <div class="firstmove">
      <span class="label">start here</span>
      <h2>Let's go</h2>
      <p>When you're ready, send me a few things:</p>
      <ol>
        <li>Your <strong>bio</strong> and a couple of <strong>professional photos</strong>.</li>
        <li>Your <strong>list of sold properties</strong> — addresses and photos for the Recently Sold wall.</li>
        <li>A handful of favorite <strong>reviews</strong>, and if you are ready your <strong>MLS login</strong> so I can set up the live search. We can totally wait on this one.</li>
      </ol>
      <div class="ctas">
        <a class="cta" href="${INTAKE_LINK}">Send it over →</a>
      </div>
    </div>
  </section>

  <footer>
    <span>Prepared by AraBuilds for Auguste Vende — All East Bay Properties</span>
    <a href="/">arabuilds.com</a>
  </footer>` + foot;
}
