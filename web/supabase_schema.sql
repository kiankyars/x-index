-- Create table for scores (username+window unique)
create table if not exists public.scores (
  id bigserial primary key,
  username text not null,
  name text,
  avatar_url text,
  h_index integer not null default 0,
  window text not null default 'all',
  computed_at timestamptz not null default now(),
  constraint scores_username_window_key unique (username, window)
);

-- Optional index for leaderboard queries
create index if not exists scores_window_hindex_idx on public.scores (window, h_index desc);


