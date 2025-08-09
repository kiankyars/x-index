MVP for x-index.

## Getting Started

Run dev server:

```bash
npm run dev
```

Env (`.env.local`):

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-random-32+ chars

# Twitter (X) OAuth 2.0
TWITTER_CLIENT_ID=replace
TWITTER_CLIENT_SECRET=replace

# Optional app-level bearer token for read-only calls when user not signed in
X_BEARER_TOKEN=replace

# Supabase (optional for leaderboard/caching)
SUPABASE_URL=replace
SUPABASE_SERVICE_ROLE_KEY=replace
```

Notes:
- OAuth 2.0 app on X must have scopes: tweet.read, users.read, offline.access, like.read, list.read
- In production, set the callback URL in your X app to `${NEXTAUTH_URL}/api/auth/callback/twitter`
- If you omit Supabase vars, features degrade gracefully (no leaderboard cache, recompute disabled)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
