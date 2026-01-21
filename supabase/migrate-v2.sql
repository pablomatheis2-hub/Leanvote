-- LeanVote Migration Script v2
-- Run this if you have an existing database and want to upgrade to v2 (multi-tenancy + user types)
-- WARNING: This will modify your existing tables. Backup your data first!

-- =============================================================================
-- STEP 1: Drop old RLS policies that depend on is_admin
-- =============================================================================

DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own post description" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Board owners with active access can create posts" ON public.posts;
DROP POLICY IF EXISTS "Board owners can update posts" ON public.posts;
DROP POLICY IF EXISTS "Board owners can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;

-- =============================================================================
-- STEP 2: Add new columns to profiles
-- =============================================================================

-- Add user type and onboarding columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'voter' CHECK (user_type IN ('voter', 'admin'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add board settings columns (if not exist)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS board_slug text UNIQUE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS board_name text;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_lifetime_access boolean DEFAULT false;

-- Now safe to drop old is_admin column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;

-- =============================================================================
-- STEP 3: Add board_owner_id to posts
-- =============================================================================

-- Add board_owner_id column (nullable first)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS board_owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Set board_owner_id to user_id for existing posts
UPDATE public.posts SET board_owner_id = user_id WHERE board_owner_id IS NULL;

-- Now make it required (only if there are no NULL values)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.posts WHERE board_owner_id IS NULL) THEN
    ALTER TABLE public.posts ALTER COLUMN board_owner_id SET NOT NULL;
  END IF;
END $$;

-- =============================================================================
-- STEP 4: Create indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS profiles_board_slug_idx ON public.profiles(board_slug);
CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS posts_board_owner_id_idx ON public.posts(board_owner_id);

-- =============================================================================
-- STEP 5: Create helper functions
-- =============================================================================

-- Function to generate a unique board slug
CREATE OR REPLACE FUNCTION public.generate_board_slug(base_text text)
RETURNS text AS $$
DECLARE
  slug text;
  counter int := 0;
BEGIN
  slug := lower(regexp_replace(base_text, '[^a-zA-Z0-9]+', '-', 'g'));
  slug := trim(both '-' from slug);
  
  -- Handle empty slug
  IF slug = '' OR slug IS NULL THEN
    slug := 'board';
  END IF;
  
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE board_slug = slug || CASE WHEN counter > 0 THEN '-' || counter::text ELSE '' END) LOOP
    counter := counter + 1;
  END LOOP;
  
  IF counter > 0 THEN
    slug := slug || '-' || counter::text;
  END IF;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has active access (admins only)
CREATE OR REPLACE FUNCTION public.has_active_access(user_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid 
    AND user_type = 'admin'
    AND (
      has_lifetime_access = true 
      OR trial_ends_at > timezone('utc'::text, now())
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to upgrade voter to admin
CREATE OR REPLACE FUNCTION public.upgrade_to_admin(user_uuid uuid)
RETURNS void AS $$
DECLARE
  user_name text;
  user_email text;
  slug_base text;
BEGIN
  SELECT full_name INTO user_name FROM public.profiles WHERE id = user_uuid;
  SELECT email INTO user_email FROM auth.users WHERE id = user_uuid;
  
  IF user_name IS NOT NULL AND user_name != '' THEN
    slug_base := user_name;
  ELSE
    slug_base := split_part(user_email, '@', 1);
  END IF;
  
  UPDATE public.profiles
  SET 
    user_type = 'admin',
    board_slug = public.generate_board_slug(slug_base),
    board_name = COALESCE(user_name, split_part(user_email, '@', 1)) || '''s Feedback',
    trial_ends_at = timezone('utc'::text, now()) + interval '7 days',
    onboarding_completed = true
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 6: Migrate existing users
-- =============================================================================

-- Users who have posts become admins with their existing data
UPDATE public.profiles p
SET 
  user_type = 'admin',
  board_slug = COALESCE(
    p.board_slug, 
    public.generate_board_slug(COALESCE(p.full_name, split_part((SELECT email FROM auth.users WHERE id = p.id), '@', 1)))
  ),
  board_name = COALESCE(
    p.board_name, 
    COALESCE(p.full_name, split_part((SELECT email FROM auth.users WHERE id = p.id), '@', 1)) || '''s Feedback'
  ),
  trial_ends_at = COALESCE(p.trial_ends_at, p.created_at + interval '7 days'),
  onboarding_completed = true
WHERE EXISTS (SELECT 1 FROM public.posts WHERE posts.board_owner_id = p.id);

-- Users without posts become voters (mark as onboarding completed so they don't see onboarding again)
UPDATE public.profiles p
SET 
  user_type = 'voter',
  onboarding_completed = true
WHERE NOT EXISTS (SELECT 1 FROM public.posts WHERE posts.board_owner_id = p.id)
  AND (user_type IS NULL OR user_type = 'voter');

-- =============================================================================
-- STEP 7: Update the handle_new_user trigger function
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name');
  
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url,
    user_type,
    onboarding_completed
  )
  VALUES (
    new.id,
    user_name,
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'voter',
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 8: Create new RLS policies for posts
-- =============================================================================

-- Users can create posts:
-- 1. Board owners with active access can create on their own board
-- 2. Any authenticated user can submit feedback to any board
CREATE POLICY "Users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    (auth.uid() = board_owner_id AND public.has_active_access(auth.uid()))
    OR (auth.uid() = user_id AND auth.uid() != board_owner_id)
  );

CREATE POLICY "Board owners can update posts"
  ON public.posts FOR UPDATE
  USING (
    auth.uid() = board_owner_id
    AND public.has_active_access(auth.uid())
  );

CREATE POLICY "Board owners can delete posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = board_owner_id);

-- =============================================================================
-- STEP 9: Update purchases table
-- =============================================================================

-- Update plan_type constraint to only allow lifetime
DO $$
BEGIN
  -- First update any existing subscription entries to lifetime
  UPDATE public.purchases SET plan_type = 'lifetime' WHERE plan_type = 'subscription';
  
  -- Drop old constraint
  ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_plan_type_check;
  
  -- Add new constraint
  ALTER TABLE public.purchases ADD CONSTRAINT purchases_plan_type_check CHECK (plan_type IN ('lifetime'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not update plan_type constraint: %', SQLERRM;
END $$;

-- Update status constraint
DO $$
BEGIN
  -- Update old statuses
  UPDATE public.purchases SET status = 'inactive' WHERE status IN ('canceled', 'past_due');
  
  -- Drop old constraint
  ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_status_check;
  
  -- Add new constraint
  ALTER TABLE public.purchases ADD CONSTRAINT purchases_status_check CHECK (status IN ('active', 'inactive', 'refunded'));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not update status constraint: %', SQLERRM;
END $$;

-- Add stripe_payment_intent_id if not exists
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Create index
CREATE INDEX IF NOT EXISTS purchases_stripe_payment_intent_id_idx ON public.purchases(stripe_payment_intent_id);

-- =============================================================================
-- DONE!
-- =============================================================================

SELECT 'Migration completed successfully!' as status;
