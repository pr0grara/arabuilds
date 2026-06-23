# Client Plan Page — Playbook

> Private (the `clients` folder is in `.assetsignore`, never served). How to build the
> branded, password-gated proposal pages at `arabuilds.com/<client>` — e.g.
> [`functions/pili.js`](../functions/pili.js), [`functions/auguste.js`](../functions/auguste.js).

## What these are
A single self-contained Cloudflare Pages Function per client that serves a **private, on-brand
"here's my plan for your business" page** behind a styled password gate. Used to win the
engagement before any real building starts. `noindex`, password on line 1, one-tap `?pw=` link.

## The core philosophy (lead with this)
**Impress upon the client, as plainly as possible, the key things we do that their current
setup is grossly failing to do.** Not features — gaps. The page should make the contrast
between "what you have now" and "what this does" impossible to miss.

How that shows up in the copy, in order:
1. **"The read" — flatter the foundation, then name the gap bluntly.** Open by crediting what
   they've genuinely got (skill, track record, leads that convert, real numbers). *Then* state
   plainly what's broken. People accept the hard truth once they feel seen first.
2. **Use a `.callout` to crystallize the single core gap** ("legitimacy & visibility" for Pili;
   "your site undersells you and lets the not-quite-ready ones slip away" for Auguste).
3. **Quantify their own good numbers** and the specific things their current site can't do
   (Auguste: "$80/lead, ~50% close" vs. "a five-page site that can't show up for any of those
   searches"). Concrete > generic.
4. **Throughout the roadmap, contrast each capability with their status quo** — e.g. the SEO
   callout: "A handful of these specialized pages can quietly out-earn the entire site you have
   today… the difference between renting attention and owning it."
5. **Tone:** warm, plain, "a starting point, not a verdict — tell me where I've got it wrong."
   Invite pushback. It's a conversation, not a pitch deck.

## Page structure (sections, top to bottom)
- **Gate** (`gate()`) — styled password screen, not Basic Auth.
- **Internal call-prep block** (`callGuide()`) — orange dashed box, **removed before sending**.
  Pre-call: discovery questions with autosaved `<textarea>`s + Copy/Clear. Post-call: swap to a
  confirmed-answers recap + remaining open items. (Auguste's was removed entirely once final;
  Pili's is kept while still pre-call.) Don't remove a client's call-prep unless they're past it.
- **`doc-head`** — logo, mono `label`, big `doc-title` with one `.accent` word, `doc-sub`, and the
  **Plan Spec** `titleblock`.
- **the read** → **the reframe** → **the roadmap** (phased `.phase` cards) → **what success looks
  like** → **start here** (`firstmove` CTA) → **footer**.

## Preferences / lessons learned
- **Brand accuracy is non-negotiable.** Use the client's *own* brand, never their employer/
  brokerage. (Auguste's brand is "Auguste Realtor / auguste-realtor.com"; All East Bay
  Properties is just the brokerage he's licensed under — do NOT present it as his brand.)
- **CTA: minimal.** One clear primary action. No stacked buttons / extraneous verbiage. A quiet
  fallback line is fine ("Questions, comments, or changes first? *Give me a call*" → `tel:`).
- **Asset intake = one shared Google Drive folder**, wired through a single `INTAKE_LINK`
  constant at the top of the file (easy to swap). Open in a new tab (`target="_blank" rel="noopener"`).
- **Explicitly ask for the green light** to start building, near the CTA.
- **Don't ask for credentials (e.g. MLS logins) via the shared Drive** — call that out and defer.
- **Niche positioning beats generalist.** Find the one lane the client can own (Auguste →
  "the Emeryville condo specialist") and build the whole page around it; widen out from there.
- **Sold-work / proof is the top seller-conversion asset** — give it its own phase.

## Technical gotchas
- **Dark-mode Plan Spec card.** The `.titleblock` uses `var(--navy)` for its header-bar
  background and border. `assets/theme.css` flips `--navy` to near-white in dark mode (so
  headlines stay readable), which washes out the card's header text and border. **Fix (apply to
  every plan page):**
  ```css
  :root[data-theme="dark"] .titleblock{border-color:#33405c}
  :root[data-theme="dark"] .tb-head{background:#1b2a47}
  ```
- Reuse `/assets/theme.css` + `/assets/theme.js`; keep page CSS in the inline `<style>`.
- `node --check` a Function by copying to a temp `.mjs` first (it's an ES module).
- Add new plan routes to [`dev-server.py`](../dev-server.py)'s Function guard so local dev shows a
  clean "Functions don't run here" message instead of a 404.

## Privacy & deploy
- Page itself: `noindex`. Client working notes + this playbook: under `clients/`, excluded from
  public serving via `.assetsignore`. (Not git-ignored — decide per repo whether to commit, esp.
  if the GitHub remote is public, since notes contain client revenue/strategy.)
- **Deploy = `nvm use 22 && npm run deploy`** (wrangler uploads the local dir straight to prod).
  Git push does NOT deploy. Functions can't be previewed locally (no workerd on this Mac), so the
  deploy preview is the only way to verify.
