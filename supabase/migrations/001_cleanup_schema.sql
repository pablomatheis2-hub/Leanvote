-- Migration: Clean up database schema
-- Run this in your Supabase SQL editor

-- 1. Drop dependent objects that use is_default
DROP TRIGGER IF EXISTS sync_board_slug_on_project_change ON public.projects;
DROP TRIGGER IF EXISTS sync_slug_on_project_update ON public.projects;
DROP VIEW IF EXISTS public.projects_with_owner;

-- 2. Remove is_default column from projects (useless feature)
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_default;

-- 3. Add unique constraint on votes to prevent duplicate votes
-- (Already exists - run this only if needed)
-- ALTER TABLE public.votes ADD CONSTRAINT votes_user_post_unique UNIQUE (user_id, post_id);

-- 4. Add unique constraint on project slugs
-- (Already exists - run this only if needed)
-- ALTER TABLE public.projects ADD CONSTRAINT projects_slug_unique UNIQUE (slug);

-- 5. Fix comments FK to reference profiles instead of auth.users
-- First drop the old constraint
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- Add new constraint referencing profiles
ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);
