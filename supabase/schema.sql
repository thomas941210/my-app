-- Link-in-Bio schema for Supabase
-- Run in Supabase SQL Editor

create table if not exists public.profiles (
  username text primary key,
  password_hash text not null,
  image_url text,
  nickname text not null,
  bio text not null default '',
  theme text not null default 'auto' check (theme in ('light', 'dark', 'auto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.links (
  id text primary key,
  username text not null references public.profiles(username) on delete cascade,
  type text not null check (type in ('kakao', 'youtube', 'threads', 'linkedin', 'custom')),
  title text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_links_username_order
  on public.links(username, sort_order);

create table if not exists public.link_clicks (
  username text not null references public.profiles(username) on delete cascade,
  link_id text not null references public.links(id) on delete cascade,
  clicks bigint not null default 0,
  primary key (username, link_id)
);

create table if not exists public.contacts (
  id text primary key,
  username text references public.profiles(username) on delete set null,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Security baseline:
-- 1) Enable RLS for all tables
-- 2) Do NOT expose service role key to browser
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.link_clicks enable row level security;
alter table public.contacts enable row level security;

-- Minimal public read policy for profile/links pages (optional)
drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles"
  on public.profiles for select
  using (true);

drop policy if exists "public read links" on public.links;
create policy "public read links"
  on public.links for select
  using (true);

-- Writes are performed server-side with SUPABASE_SERVICE_ROLE_KEY,
-- so no client write policies are required for this app.

