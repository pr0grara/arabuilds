# Auguste — Leadflow Integration Plan

> Private planning doc. How we turn `/dashboard` (on the new site) from a viewer of
> new-site form fills into the **one place that holds every lead**, from every source.
> Status: **plan stage**, no build yet. Gated on the discovery answers at the bottom.

## The goal
The dashboard already shows leads captured by the new site's forms (`/api/lead` → D1
`leads`). But that's a fraction of his real flow. To "hold everything" it has to ingest
the leads he already gets today, the ones that never touch the website.

## His leadflow today (what we know)
From [discovery-notes.md](discovery-notes.md):

| Source | Role | Notes |
|---|---|---|
| **Google Local Services Ads** | Main paid engine | ~$80/lead, ~50% close. His highest volume. |
| **All East Bay PM portfolio** | Where most deals originate | He's listing agent on the contracts; referrals arrive via the brokerage. |
| **Calendly** | Current Wix site's only CTA | Bookings, not captured anywhere structured. |
| **New site forms** | Just built | Valuation + contact. Already in `leads`. ✅ |

Everything except the new-site forms currently lives in his inbox / phone / the brokerage,
not in one system.

## The architecture
**Key insight:** every source already emails him a notification (LSA lead alert, Calendly
booking, Zillow/realtor.com inquiry, PM handoff). So rather than build a bespoke API
integration per source, make **email the ingestion bus** — our stack supports it natively
via Cloudflare Email Routing → an Email Worker that parses each provider's format and
upserts into `leads`.

```
LSA / Calendly / Zillow / PM email ─┐
                                     ├─► Email Routing → parser Worker ─┐
New-site forms ──────────────────────┤                                  ├─► leads (D1) ─► /dashboard
Manual "add lead" (phone/walk-in) ───┘                                  ┘       (the hub)
Google Ads API (LSA, hi-fidelity) ──────────────────────────────────────┘   (optional upgrade)
```

- **Email-as-bus** is the pragmatic backbone: one parser Worker, one regex/format per
  source, no OAuth. Tradeoff: provider email formats drift, so parsers need occasional care.
- **Google Ads API** (`local_services_lead`) is the high-fidelity upgrade for LSA: structured
  data, lead feedback, no parsing. Cost: needs a Google Ads developer token (approval),
  OAuth, and **access to whichever account runs the ads** (see discovery Q below). Heavy for
  a solo agent; do it only if email-parse proves too brittle.
- LSA has **no native webhook/CRM push** (confirmed: Google support 12080108). Calendly
  **does** have native webhooks, so that one can skip email entirely.

## Schema changes (makes the table source-agnostic)
The `leads` table is web-form-shaped today. To hold any channel, add:

| Column | Purpose |
|---|---|
| `channel` | Origin: `web-form` / `google-lsa` / `calendly` / `pm-referral` / `manual` … |
| `external_id` | Provider's lead ID → idempotent dedup (re-parsing/polling won't double-insert) |
| `status` + `status_at` | Server-side `new → contacted → won/lost`. Replaces the per-device localStorage "handled" toggle so it syncs across his phone + laptop. |
| `notes` | His private follow-up notes. |

Index `(channel, external_id)` for upsert. Needs an `ALTER TABLE ADD COLUMN` migration
(the current `schema.sql` uses `CREATE IF NOT EXISTS`, which won't alter an existing table).

## Build phases (once discovery is in)
1. **Foundation** — schema migration, server-side status, manual "add lead" form + CSV
   import in the dashboard. No external accounts needed. (This is the part that makes it a hub.)
2. **Calendly** — native webhook → ingest endpoint. Lowest-friction real source.
3. **Email-as-bus** — Email Routing + parser Worker; start with the LSA notification format.
4. **PM referrals** — route the brokerage handoff emails through the same parser, or manual add.
5. **(Optional) Google Ads API** — only if email-parse on LSA is too brittle.

---

## Discovery questions for Auguste
The answers gate the build. Group A + B are the unblockers.

**A. Where leads actually come from**
1. Besides Google Local Services Ads and the All East Bay PM portfolio, where else do leads
   reach you? (Zillow, realtor.com, homes.com, sphere/referrals, open houses, sign calls?)
2. Roughly what share comes from each, in a normal month?

**B. Google LSA + sample emails (the unblocker for parsing)**
3. Whose Google account runs the Local Services Ads — **yours**, or **All East Bay's**?
   (Decides whether we can connect directly or need the brokerage.)
4. How do you get told about an LSA lead today: email, the Local Services app, or both?
5. Can you forward me one real **LSA lead email** and one **Calendly booking email**, exactly
   as they arrive? Seeing the real format is what lets me build the parser.

**C. What he already uses**
6. Any CRM or lead tool today (Follow Up Boss, kvCORE, LionDesk, a spreadsheet, phone contacts)?
7. Is the Calendly on your current site still live, and is it your calendar or the brokerage's?
8. Do you use a separate ad/tracking phone number?

**D. What he wants from the dashboard**
9. Load in your past/existing leads, or start clean from launch?
10. How do you think about lead stages today (who you've called, who's hot)? What stages fit you?
11. Does anyone else need access (assistant, the brokerage)?
