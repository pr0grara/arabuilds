# Auguste Vende — Discovery & Audit Notes

> Private working notes. Excluded from public serving via `.assetsignore`.

## 1. Current site audit (auguste-realtor.com)

**Platform:** Wix · **Pages:** 5 (Home, Services, Featured Properties, Testimonials, About) · single CTA = Calendly.

**SEO basics present:** clean `<title>`, meta description, canonical, OG + Twitter cards, valid Wix `sitemap.xml`, `robots.txt`, two JSON-LD blocks (`LocalBusiness` + `WebSite`).

**Gaps (why it doesn't generate leads):**
- Thin — ~5 pages, ~350 words on home. Nothing to rank for "Emeryville condo realtor," "sell my condo Emeryville," etc.
- No IDX/home search; no seller valuation tool; no buyer capture. Only path is "book a Calendly call."
- Schema is generic `LocalBusiness`, not `RealEstateAgent`; no reviews schema despite real reviews.
- Content typo on a featured listing ("$2,2500,000").
- Off-site presence (Zillow, homes.com, Experience, GBP) not leveraged or consolidated.

**Diagnosis:** clean digital business card, not a lead engine.

## 2. Discovery call — his answers

| Topic | Answer |
|---|---|
| **Buyers vs sellers** | Leans **sellers**; either is fine. |
| **Where business comes from today** | The **All East Bay Properties PM portfolio** (he's listing agent on the contracts) + **paid Google Local Service Ads**. ~4–5 personal clients in 3 years. |
| **The money** | **1–2 personal deals/year** · **2.5–3%** commission · **$80/lead, ~50% close** on LSAs. |
| **Geography / niche** | Specialty = **condos in Emeryville** (primary). Secondary = condos in neighboring cities + **small multifamily** same region. Sells any residential. Recently sold an **8-unit and 12-unit** via the PM company. **Exclude East Oakland.** |
| **MLS / IDX** | Active on MLS; **wants live IDX on the site.** |
| **Reference sites** | Loves the recently-bought/sold feature on **sashabayrealtor.com** (that's iHomeFinder IDX, status=Sold). Aspirational look = **timallenproperties.com**. |
| **Brand / domain** | Keep the current look + domain (auguste-realtor.com). |
| **Team** | **Solo.** |
| **Assets** | Has it all — **~60 sold properties**, reviews, bio, photos. Placeholders first, then Google Drive. |
| **PM vs sales** | Does both; **welcomes PM leads** too. |

## 3. Open items — resolved

1. **IDX vendor + price** → *He doesn't know; wants a ballpark.* **Estimate to give him: ~$50–110/month** for a standard IDX widget (iHomeFinder / IDX Broker / Showcase IDX class), occasionally a one-time setup fee (~$100), **separate from and on top of his MLS dues.** Premium all-in agent platforms (e.g. Luxury Presence, which powers Tim Allen's site) run $300+/mo — not needed for him.
2. **"Recently sold" source** → **Both.** Curated gallery of his ~60 sold deals (his photos/story) **and** IDX-pulled MLS sold listings (status=Sold) that update automatically.
3. **Engagement / budget** → **Ongoing monthly = yes.** He didn't recognize the term but agreed to the substance: keep updating the site monthly because it helps SEO. So: **build + monthly.**
4. **LSA strategy** → **Keeps the ads running for now.** (Site's job includes converting that paid traffic better — a niche landing page should push his effective cost-per-deal even lower.)

## 4. Strategy (what v2 of the plan is built on)

- **Position him as THE Emeryville condo specialist** — a winnable niche vs. competing as a generalist East Bay agent.
- His **paid funnel already converts great** — the site's job is positioning, proof, and adding **free organic** leads, not fixing conversion.
- **Proof engine:** Recently Sold showcase from his ~60 deals = the #1 listing-winner for a sellers-first agent.
- **Live IDX search** + **"What's my Emeryville condo worth?"** valuation + **buyer alerts**, all feeding his inbox + a simple dashboard.
- **Compounding content:** Emeryville condo-building/neighborhood guides + a small-multifamily/investor angle (ties to the PM portfolio + 8/12-unit sales) almost no agent owns.
- Keep his **brand + domain**; north-star look = timallenproperties.com; feature-match sashabayrealtor.com.

Full client-facing version lives in the proposal page: [`functions/auguste.js`](../../functions/auguste.js) → `/auguste`.

## 5. Next steps / open

- [ ] Deploy `/auguste` (`nvm use 22 && npm run deploy`) and send him `arabuilds.com/auguste?pw=eastbay`.
- [ ] Decide IDX vendor (default lean: **iHomeFinder**, what the reference site uses) and confirm his MLS allows it.
- [ ] Set up shared Google Drive for assets → paste link into `INTAKE_LINK` in `functions/auguste.js` (currently emails azbaghda@gmail.com).
- [ ] Collect: bio, photos, ~60 sold properties (addresses + photos), favorite reviews, MLS login.
