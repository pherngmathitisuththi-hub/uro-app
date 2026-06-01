-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Profiles (auto-created on signup via trigger)
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  username   text unique,
  full_name  text,
  avatar_url text,
  phone      text,
  created_at timestamptz default now()
);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Listings
create table if not exists public.listings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  description      text,
  price            numeric(10,2) not null,
  original_price   numeric(10,2),
  category         text not null default 'other',
  expiry_date      date,
  images           text[] default '{}',
  location         text,
  status           text not null default 'active',
  freshness_score  integer check (freshness_score between 0 and 100),
  freshness_notes  text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_listings_updated on public.listings;
create trigger on_listings_updated
  before update on public.listings
  for each row execute procedure public.handle_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.listings enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Listings policies
create policy "Active listings are viewable by everyone"
  on public.listings for select using (status = 'active' or auth.uid() = user_id);

create policy "Authenticated users can create listings"
  on public.listings for insert with check (auth.uid() = user_id);

create policy "Users can update their own listings"
  on public.listings for update using (auth.uid() = user_id);

create policy "Users can delete their own listings"
  on public.listings for delete using (auth.uid() = user_id);

-- Index for performance
create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_category_idx on public.listings(category);
create index if not exists listings_user_idx on public.listings(user_id);
create index if not exists listings_created_idx on public.listings(created_at desc);
