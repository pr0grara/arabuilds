# Contractor intake — backend setup

The intake form (`/contractor-intake`) posts to a Cloudflare Pages Function that stores
each submission in **D1** and emails you an alert via **Resend**. A password-protected
**`/admin`** page lets you read, filter, and export submissions.

```
contractor-intake.html      the form (posts to /api/intake; mailto fallback if API down)
functions/api/intake.js     POST handler -> validate, store in D1, email alert
functions/admin.js          GET /admin -> Basic-Auth dashboard + CSV export
functions/_lib.js           shared labels / helpers
schema.sql                  D1 table + indexes
wrangler.toml               D1 binding + non-secret vars
```

## Prerequisites

Wrangler needs **Node ≥ 16.13**. This machine's default is v15, so select a newer one first:

```sh
nvm use 22          # or any Node >= 16.13
```

> Note: `wrangler pages dev` and `--local` D1 run the `workerd` runtime, which requires
> **macOS 13.5+**. This machine is 13.1, so test on Cloudflare's deploy previews instead of
> locally. Deployment itself is unaffected — it runs on Cloudflare.

## One-time setup

```sh
# 1. Create the database, then paste the printed database_id into wrangler.toml
npx wrangler d1 create arabuilds-intake

# 2. Create the table (remote)
npm run db:init

# 3. First deploy (creates/links the Pages project so secrets can attach)
npm run deploy

# 4. Add secrets (prompts for the value; stored encrypted on the project)
npx wrangler pages secret put RESEND_API_KEY   # from resend.com
npx wrangler pages secret put ADMIN_PASS        # password for /admin

# 5. Redeploy so the function picks everything up
npm run deploy
```

`ADMIN_USER`, `ALERT_TO`, and `ALERT_FROM` are set as plain vars in `wrangler.toml` — edit
them there. Everything sensitive (`RESEND_API_KEY`, `ADMIN_PASS`) is a secret.

## Resend (email alerts)

1. Sign up at [resend.com](https://resend.com), create an API key → use it in step 4 above.
2. For testing, the default `ALERT_FROM` (`onboarding@resend.dev`) can only deliver to the
   email you signed up with. Make sure that matches `ALERT_TO` (azbaghda@gmail.com).
3. For production, verify `arabuilds.com` in Resend and set `ALERT_FROM` to something like
   `Intake <intake@arabuilds.com>` in `wrangler.toml`.

Email is best-effort: if Resend fails, the submission is still saved to D1.

## Reading submissions

- **Dashboard:** visit `https://arabuilds.com/admin` (Basic Auth with `ADMIN_USER` /
  `ADMIN_PASS`). Click a row to expand the full intake. Filter by tier chips, search by
  name/email/area, and "download CSV ↓" for the current view.
- **CLI / ad-hoc:**
  ```sh
  npx wrangler d1 execute arabuilds-intake --remote \
    --command "SELECT classification, COUNT(*) n FROM intakes GROUP BY classification"
  ```
- **CSV export:** `https://arabuilds.com/admin?format=csv` (open in Sheets/Excel).
