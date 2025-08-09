MVP for x-index.

## Getting Started

Run dev server:

```bash
npm run dev
```

Env required (`.env.local`):

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-me
X_CLIENT_ID=replace
X_CLIENT_SECRET=replace
SUPABASE_URL=replace
SUPABASE_ANON_KEY=replace
```

Sign in at `/api/auth/signin`. Compute at `/api/xindex?username=...`.

OG image at `/api/og?name=...&h=...&rank=...`.

## Notes
- Replace env values. X app must have OAuth 2.0 enabled.
- Add DB schema in Supabase (see `supabase.sql`).
