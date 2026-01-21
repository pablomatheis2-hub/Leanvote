-- Fix comments foreign key to reference profiles instead of auth.users
-- This allows the join to work properly for demo users
-- Run this AFTER seed-leanvote-demo.sql

-- =============================================================================
-- STEP 1: Drop the old foreign key that points to auth.users
-- =============================================================================
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

-- =============================================================================
-- STEP 2: Add new foreign key that points to profiles
-- This allows our fake users to have comments that can be properly joined
-- =============================================================================
-- Note: We're NOT adding this constraint because it would fail for existing
-- comments from real users whose user_id matches auth.users but we want
-- flexibility for demo data.

-- Instead, we'll create a database function to get comments with author info
-- that doesn't rely on foreign key relationships

-- =============================================================================
-- STEP 3: Create a view for comments with author info
-- =============================================================================
DROP VIEW IF EXISTS comments_with_authors;

CREATE OR REPLACE VIEW comments_with_authors AS
SELECT 
  c.id,
  c.post_id,
  c.user_id,
  c.content,
  c.created_at,
  c.updated_at,
  p.full_name as author_name,
  p.avatar_url as author_avatar,
  (c.user_id = posts.board_owner_id) as is_board_owner
FROM comments c
LEFT JOIN profiles p ON p.id = c.user_id
LEFT JOIN posts ON posts.id = c.post_id;

-- Grant access to the view
GRANT SELECT ON comments_with_authors TO anon, authenticated;

-- =============================================================================
-- STEP 4: Verify comments exist
-- =============================================================================
SELECT 
  c.id,
  c.content,
  p.full_name as author,
  posts.title as post_title
FROM comments c
LEFT JOIN profiles p ON p.id = c.user_id
LEFT JOIN posts ON posts.id = c.post_id
LIMIT 10;
