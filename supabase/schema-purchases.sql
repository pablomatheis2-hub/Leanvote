-- LeanVote Purchases Schema
-- Run this in Supabase SQL Editor AFTER the main schema

-- Purchases table for tracking payments
create table public.purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_type text not null check (plan_type in ('lifetime', 'subscription')),
  status text not null default 'active' check (status in ('active', 'inactive', 'canceled', 'past_due')),
  amount integer,
  currency text default 'usd',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for quick lookups
create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_stripe_customer_id_idx on public.purchases(stripe_customer_id);
create index purchases_stripe_subscription_id_idx on public.purchases(stripe_subscription_id);

-- Trigger for updated_at
create trigger handle_purchases_updated_at
  before update on public.purchases
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.purchases enable row level security;

-- Users can view their own purchases
create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- Only service role can insert/update (via webhook)
-- No insert/update policies for regular users

-- Helper function to check if user has active purchase
create or replace function public.has_active_purchase(user_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.purchases
    where user_id = user_uuid and status = 'active'
  );
$$ language sql stable security definer;
