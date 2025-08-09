-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  x_user_id text unique,
  username text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Scores cache
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  x_user_id text references public.users(x_user_id) on delete cascade,
  h_index int not null,
  computed_at timestamp with time zone default now(),
  period text default 'all'
);

-- Tweets cache (optional)
create table if not exists public.tweets (
  id text primary key,
  x_user_id text not null,
  like_count int not null default 0,
  retweet_count int not null default 0,
  created_at timestamp with time zone
);


