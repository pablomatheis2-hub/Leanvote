-- LeanVote Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null check (category in ('Feature', 'Bug', 'Integration')),
  status text not null default 'Open' check (status in ('Open', 'Planned', 'In Progress', 'Complete')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Votes table (join table for user votes on posts)
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index posts_user_id_idx on public.posts(user_id);
create index posts_category_idx on public.posts(category);
create index posts_status_idx on public.posts(status);
create index posts_created_at_idx on public.posts(created_at desc);
create index votes_post_id_idx on public.votes(post_id);
create index votes_user_id_idx on public.votes(user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Function to update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Function to get vote count for a post
create or replace function public.get_vote_count(post_uuid uuid)
returns integer as $$
  select count(*)::integer from public.votes where post_id = post_uuid;
$$ language sql stable;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Triggers to update updated_at timestamp
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.votes enable row level security;

-- -----------------------------------------------------------------------------
-- Profiles Policies
-- -----------------------------------------------------------------------------

-- Anyone can view profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can update their own profile (except is_admin)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Posts Policies
-- -----------------------------------------------------------------------------

-- Anyone can view posts (public read access)
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

-- Authenticated users can create posts
create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Authors can update their post description only
create policy "Authors can update own post description"
  on public.posts for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and title = (select title from public.posts where id = posts.id)
    and category = (select category from public.posts where id = posts.id)
    and status = (select status from public.posts where id = posts.id)
  );

-- Admins can update post status
create policy "Admins can update post status"
  on public.posts for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Authors can delete their own posts
create policy "Authors can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Votes Policies
-- -----------------------------------------------------------------------------

-- Anyone can view votes
create policy "Votes are viewable by everyone"
  on public.votes for select
  using (true);

-- Authenticated users can create votes (for themselves only)
create policy "Authenticated users can vote"
  on public.votes for insert
  with check (auth.uid() = user_id);

-- Users can delete their own votes (to unvote)
create policy "Users can remove own votes"
  on public.votes for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- VIEWS (Optional - for easier querying)
-- =============================================================================

-- View to get posts with vote counts and author info
create or replace view public.posts_with_details as
select 
  p.*,
  pr.full_name as author_name,
  pr.avatar_url as author_avatar,
  (select count(*) from public.votes v where v.post_id = p.id)::integer as vote_count
from public.posts p
left join public.profiles pr on p.user_id = pr.id;
