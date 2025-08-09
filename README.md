## **Concept**

**x-index**: A user has a Twitter H-index of `h` if they have at least `h` tweets that each have at least `h` likes or retweets

### Best format for virality
- Website + X login + auto share-card + public leaderboard. (does a user even need to login, or can the interface just be put their username, although I'm thinking for leaderboards, etc., it's better for people to login)
- **Zero friction**: type handle → login → instant card.  
- **Built-in loops**: share image, leaderboard, bot replies, “quote-tweet your score” CTA.  
- **OG images**: cards look great in timelines; drives re-shares.

### MVP spec (fast)
- **Auth**: X OAuth (read-only).  
- **Compute**: last N tweets or all tweets, likes+RTs, H-index; monthly variant.  
- **Card**: dynamic PNG (name, avatar, H-index, rank, next target).  
- **Leaderboard**: global + by bio keyword (AI, crypto, etc.).  
- **Share flows**: “Tweet my X-index” prefilled; bot reply on request.

### Stack (pragmatic)
- Frontend/Backend: Next.js on Vercel (Edge/API routes).  
- Storage: Supabase free version (users, scores, tweets cache).
- Image: Satori/ResVG or Vercel OG.  
- X API: OAuth + recent tweets (Basic paid tier).

### Growth hooks
- Daily/weekly leaderboards; niche rankings.  
- Public profile pages (`/u/handle`) with OG image.  
- “Next target” nudge in share card.