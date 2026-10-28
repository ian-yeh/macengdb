# MacEngDB 
The all-in-one hub for career and course resources for McMaster Engineers.

## API (Cloudflare Workers)

The API is a Hono + TypeScript Worker in `api/`, served at `https://api.macengdb.ca`. It talks to the Supabase Postgres database through Hyperdrive. `backend/` (FastAPI) is legacy and no longer deployed.

```
api/
  src/index.ts          app, CORS, error handlers, Env bindings
  src/db.ts             per-request postgres.js client, validation hook, rate limit middleware
  src/admin.ts          X-Admin-Key check
  src/routes/*.ts       companies, experiences, company-requests, design-teams
  migrations/           plain SQL schema files (0000_baseline.sql is the reference schema)
  test/                 vitest tests that run inside workerd
  wrangler.jsonc        Worker config: Hyperdrive, rate limits, custom domain
```

### Local dev

```bash
docker run -d --name macengdb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=macengdb -p 5432:5432 postgres:16
psql postgres://postgres:postgres@localhost:5432/macengdb -f api/migrations/0000_baseline.sql
echo 'ADMIN_SECRET_KEY=dev-key' > api/.dev.vars   # gitignored
cd api && npm ci && npm run dev                   # http://localhost:8788
```

`wrangler dev` connects to the docker database via `localConnectionString` in `wrangler.jsonc`. To run locally against Supabase instead:

```bash
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE='postgres://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require'
npm run dev
```

### Tests

```bash
cd api && npx tsc --noEmit && npx vitest run
```

`test/api.test.ts` needs no database. `test/db.test.ts` truncates and uses the local docker database (baseline loaded). CI runs both against a Postgres service container.

### One-time setup

Run from `api/`:

```bash
npx wrangler login
# Use the Supabase Session pooler string (port 5432, user postgres.<project-ref>), URL-encode the password.
npx wrangler hyperdrive create macengdb-db --caching-disabled \
  --connection-string="postgres://postgres.<ref>:<url-encoded-password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
# paste the returned id into wrangler.jsonc hyperdrive[0].id (replacing REPLACE_WITH_HYPERDRIVE_ID) and commit it
npx wrangler secret put ADMIN_SECRET_KEY   # same value the admin UI uses
```

The `api.macengdb.ca` custom domain only deploys once the `macengdb.ca` zone is active on Cloudflare.

### Deploy

Pushes to `main` that touch `api/**` deploy via `.github/workflows/cd.yml` (`cloudflare/wrangler-action`). Required GitHub repo secrets:

- `CLOUDFLARE_API_TOKEN` (the "Edit Cloudflare Workers" token template)
- `CLOUDFLARE_ACCOUNT_ID`

Manual deploy: `cd api && npx wrangler deploy`.

### Schema changes

Write plain SQL in `api/migrations/NNNN_name.sql` and apply it by hand with `psql` against Supabase (and in CI, add it after the baseline step).

### Rollback

Point the frontend's `VITE_API_URL` back at the legacy VM API (`backend/`), or `npx wrangler rollback` for a bad Worker version.
