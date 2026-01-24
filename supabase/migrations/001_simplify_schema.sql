-- Migration: Simplify Database Schema
-- This migration removes redundant board_slug and board_name from profiles table
-- All board information should come from the projects table

-- ============================================================================
-- STEP 1: Safety check - ensure all profiles with board_slug have a matching project
-- ============================================================================

-- First, let's verify data integrity before making changes
-- This query should return 0 rows if everything is synced properly
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM profiles p
    WHERE p.board_slug IS NOT NULL
    AND p.user_type = 'admin'
    AND NOT EXISTS (
        SELECT 1 FROM projects proj 
        WHERE proj.owner_id = p.id 
        AND proj.is_default = true
    );
    
    IF orphan_count > 0 THEN
        RAISE NOTICE 'Found % admin profiles without a default project. Creating projects for them...', orphan_count;
        
        -- Create missing default projects from profile data
        INSERT INTO projects (owner_id, name, slug, company_name, is_default, created_at, updated_at)
        SELECT 
            p.id,
            COALESCE(p.board_name, 'My Project'),
            p.board_slug,
            p.board_name,
            true,
            p.created_at,
            NOW()
        FROM profiles p
        WHERE p.board_slug IS NOT NULL
        AND p.user_type = 'admin'
        AND NOT EXISTS (
            SELECT 1 FROM projects proj 
            WHERE proj.owner_id = p.id 
            AND proj.is_default = true
        );
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Migrate any posts that don't have a project_id
-- ============================================================================

-- Update posts that have board_owner_id but no project_id
UPDATE posts p
SET project_id = (
    SELECT proj.id 
    FROM projects proj 
    WHERE proj.owner_id = p.board_owner_id 
    AND proj.is_default = true
    LIMIT 1
)
WHERE p.project_id IS NULL
AND EXISTS (
    SELECT 1 FROM projects proj 
    WHERE proj.owner_id = p.board_owner_id
);

-- ============================================================================
-- STEP 3: Drop the board_slug unique constraint and columns
-- ============================================================================

-- Drop any triggers that sync board_slug (if they exist)
DROP TRIGGER IF EXISTS sync_profile_board_slug ON projects;
DROP FUNCTION IF EXISTS sync_profile_board_slug_fn();

-- Remove the unique constraint on board_slug
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_board_slug_key;

-- Drop the columns (this will permanently remove the data!)
ALTER TABLE profiles DROP COLUMN IF EXISTS board_slug;
ALTER TABLE profiles DROP COLUMN IF EXISTS board_name;

-- ============================================================================
-- STEP 4: Clean up - add helpful comments
-- ============================================================================

COMMENT ON TABLE projects IS 'Projects represent individual feedback boards. Each user can have multiple projects.';
COMMENT ON COLUMN projects.is_default IS 'The default project shown when no specific project is selected in the dashboard.';
COMMENT ON COLUMN projects.slug IS 'URL-safe identifier for the public board (e.g., /b/my-project)';

-- ============================================================================
-- VERIFICATION QUERIES (run these manually to verify migration success)
-- ============================================================================

-- Check that all admin users have at least one project:
-- SELECT p.id, p.full_name FROM profiles p WHERE p.user_type = 'admin' AND NOT EXISTS (SELECT 1 FROM projects proj WHERE proj.owner_id = p.id);

-- Check that all posts have a project_id:
-- SELECT COUNT(*) FROM posts WHERE project_id IS NULL;

-- List all projects with their owners:
-- SELECT proj.slug, proj.name, prof.full_name FROM projects proj JOIN profiles prof ON proj.owner_id = prof.id ORDER BY proj.created_at;
