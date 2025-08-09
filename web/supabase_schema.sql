-- Create table for scores (username+window unique)
create table if not exists public.scores (
  id bigserial primary key,
  username text not null,
  name text,
  avatar_url text,
  h_index integer not null default 0,
  h_index_likes integer not null default 0,
  h_index_retweets integer not null default 0,
  time_window text not null default 'all',
  computed_at timestamptz not null default now(),
  constraint scores_username_time_window_key unique (username, time_window)
);

-- Indexes for leaderboard queries
create index if not exists scores_time_window_hindex_idx on public.scores (time_window, h_index desc);
create index if not exists scores_time_window_hindex_likes_idx on public.scores (time_window, h_index_likes desc);
create index if not exists scores_time_window_hindex_retweets_idx on public.scores (time_window, h_index_retweets desc);