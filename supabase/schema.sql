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
  -- User type: 'voter' (public user) or 'admin' (board owner)
  user_type text not null default 'voter' check (user_type in ('voter', 'admin')),
  -- Workspace/board settings for admins (null for voters)
  board_slug text unique,
  board_name text,
  -- Trial and subscription status (only applies to admins)
  trial_ends_at timestamp with time zone,
  has_lifetime_access boolean default false,
  -- Onboarding
  onboarding_completed boolean default false,
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Posts table (belongs to a board owner)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  board_owner_id uuid references public.profiles(id) on delete cascade not null,
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

create index profiles_board_slug_idx on public.profiles(board_slug);
create index posts_user_id_idx on public.posts(user_id);
create index posts_board_owner_id_idx on public.posts(board_owner_id);
create index posts_category_idx on public.posts(category);
create index posts_status_idx on public.posts(status);
create index posts_created_at_idx on public.posts(created_at desc);
create index votes_post_id_idx on public.votes(post_id);
create index votes_user_id_idx on public.votes(user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to generate a unique board slug from email/name
create or replace function public.generate_board_slug(base_text text)
returns text as $$
declare
  slug text;
  counter int := 0;
begin
  -- Create initial slug from base text
  slug := lower(regexp_replace(base_text, '[^a-zA-Z0-9]+', '-', 'g'));
  slug := trim(both '-' from slug);
  
  -- Check if slug exists and add counter if needed
  while exists (select 1 from public.profiles where board_slug = slug || case when counter > 0 then '-' || counter::text else '' end) loop
    counter := counter + 1;
  end loop;
  
  if counter > 0 then
    slug := slug || '-' || counter::text;
  end if;
  
  return slug;
end;
$$ language plpgsql;

-- Function to automatically create a profile when a new user signs up
-- New users start as 'voter' type until they complete onboarding
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_name text;
begin
  user_name := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name');
  
  insert into public.profiles (
    id, 
    full_name, 
    avatar_url,
    user_type,
    onboarding_completed
  )
  values (
    new.id,
    user_name,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'voter',
    false
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

-- Function to check if user has active access (trial or lifetime) - only for admins
create or replace function public.has_active_access(user_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = user_uuid 
    and user_type = 'admin'
    and (
      has_lifetime_access = true 
      or trial_ends_at > timezone('utc'::text, now())
    )
  );
$$ language sql stable security definer;

-- Function to check if user is in trial period
create or replace function public.is_in_trial(user_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = user_uuid 
    and user_type = 'admin'
    and has_lifetime_access = false
    and trial_ends_at > timezone('utc'::text, now())
  );
$$ language sql stable security definer;

-- Function to upgrade a voter to admin with trial
create or replace function public.upgrade_to_admin(user_uuid uuid)
returns void as $$
declare
  user_name text;
  user_email text;
  slug_base text;
begin
  -- Get user info
  select full_name into user_name from public.profiles where id = user_uuid;
  select email into user_email from auth.users where id = user_uuid;
  
  -- Determine slug base
  if user_name is not null and user_name != '' then
    slug_base := user_name;
  else
    slug_base := split_part(user_email, '@', 1);
  end if;
  
  -- Update profile to admin
  update public.profiles
  set 
    user_type = 'admin',
    board_slug = public.generate_board_slug(slug_base),
    board_name = coalesce(user_name, split_part(user_email, '@', 1)) || '''s Feedback',
    trial_ends_at = timezone('utc'::text, now()) + interval '7 days',
    onboarding_completed = true
  where id = user_uuid;
end;
$$ language plpgsql security definer;

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

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Posts Policies
-- -----------------------------------------------------------------------------

-- Anyone can view posts (public read access for boards)
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

-- Users can create posts:
-- 1. Board owners with active access can create on their own board
-- 2. Any authenticated user can submit feedback to any board (user_id != board_owner_id)
create policy "Users can create posts"
  on public.posts for insert
  with check (
    -- Either: board owner with active access creating on their own board
    (auth.uid() = board_owner_id and public.has_active_access(auth.uid()))
    -- Or: any authenticated user submitting feedback to someone else's board
    or (auth.uid() = user_id and auth.uid() != board_owner_id)
  );

-- Board owners can update posts on their board
create policy "Board owners can update posts"
  on public.posts for update
  using (
    auth.uid() = board_owner_id
    and public.has_active_access(auth.uid())
  );

-- Board owners can delete posts on their board
create policy "Board owners can delete posts"
  on public.posts for delete
  using (auth.uid() = board_owner_id);

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
-- VIEWS
-- =============================================================================

-- View to get posts with vote counts and author info
create or replace view public.posts_with_details as
select 
  p.*,
  pr.full_name as author_name,
  pr.avatar_url as author_avatar,
  bo.board_slug,
  bo.board_name,
  (select count(*) from public.votes v where v.post_id = p.id)::integer as vote_count
from public.posts p
left join public.profiles pr on p.user_id = pr.id
left join public.profiles bo on p.board_owner_id = bo.id;
