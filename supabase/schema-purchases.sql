-- LeanVote Purchases Schema
-- Run this in Supabase SQL Editor AFTER the main schema

-- Purchases table for tracking payments
create table public.purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  plan_type text not null default 'lifetime' check (plan_type in ('lifetime')),
  status text not null default 'active' check (status in ('active', 'inactive', 'refunded')),
  amount integer,
  currency text default 'usd',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for quick lookups
create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_stripe_customer_id_idx on public.purchases(stripe_customer_id);
create index purchases_stripe_payment_intent_id_idx on public.purchases(stripe_payment_intent_id);

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
