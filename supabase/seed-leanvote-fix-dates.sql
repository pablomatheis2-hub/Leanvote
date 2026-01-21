-- LeanVote Fix: Update changelog dates to be spread over 5-6 months
-- Run this AFTER seed-leanvote-fix-changelog.sql
-- Fixes the updated_at dates so changelog entries appear over time

-- =============================================================================
-- STEP 0: Disable the updated_at trigger so we can set custom dates
-- =============================================================================
ALTER TABLE posts DISABLE TRIGGER handle_posts_updated_at;

DO $$
DECLARE
  leanvote_owner_id UUID;
BEGIN
  -- Get the leanvote board owner
  SELECT id INTO leanvote_owner_id 
  FROM profiles 
  WHERE board_slug = 'leanvote';

  IF leanvote_owner_id IS NULL THEN
    RAISE EXCEPTION 'Board owner for slug "leanvote" not found!';
  END IF;

  -- =============================================================================
  -- Update COMPLETED posts dates (these appear in changelog)
  -- Spread over August - November 2025 (5-6 months ago)
  -- =============================================================================

  -- Google Sign-In - oldest completed feature (August 2025)
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '175 days',
    updated_at = NOW() - INTERVAL '160 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%google%sign%' 
    AND status = 'Complete';

  -- Embeddable Widget (September 2025)
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '155 days',
    updated_at = NOW() - INTERVAL '140 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%widget%' 
    AND status = 'Complete';

  -- Comment System (September 2025)
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '145 days',
    updated_at = NOW() - INTERVAL '125 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%comment%' 
    AND status = 'Complete';

  -- Public Roadmap (October 2025)
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '130 days',
    updated_at = NOW() - INTERVAL '110 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%roadmap%' 
    AND status = 'Complete';

  -- Changelog Page (October 2025)
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '115 days',
    updated_at = NOW() - INTERVAL '95 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%changelog%' 
    AND status = 'Complete';

  -- Category Filtering (November 2025)
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '100 days',
    updated_at = NOW() - INTERVAL '80 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%filter%' OR title ILIKE '%categor%filter%'
    AND status = 'Complete';

  -- Lifetime Access Pricing - most recent completed (November 2025)
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '85 days',
    updated_at = NOW() - INTERVAL '65 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%lifetime%' 
    AND status = 'Complete';

  -- =============================================================================
  -- Update IN PROGRESS posts dates (recent activity)
  -- =============================================================================

  -- Dark mode (started 2 months ago, actively worked on)
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '60 days',
    updated_at = NOW() - INTERVAL '5 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%dark%mode%';

  -- Email notifications (started 6 weeks ago)
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '50 days',
    updated_at = NOW() - INTERVAL '3 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%email%' OR title ILIKE '%notification%';

  -- =============================================================================
  -- Update PLANNED posts dates (on roadmap, not started yet)
  -- =============================================================================

  -- Slack integration
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '75 days',
    updated_at = NOW() - INTERVAL '15 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%slack%';

  -- Custom branding
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '65 days',
    updated_at = NOW() - INTERVAL '18 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%brand%';

  -- REST API
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '55 days',
    updated_at = NOW() - INTERVAL '12 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%api%';

  -- Markdown support
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '40 days',
    updated_at = NOW() - INTERVAL '10 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%markdown%';

  -- =============================================================================
  -- Update OPEN posts dates (recent submissions)
  -- =============================================================================

  -- Export CSV
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '35 days',
    updated_at = NOW() - INTERVAL '35 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%csv%' OR title ILIKE '%export%';

  -- Search functionality
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '28 days',
    updated_at = NOW() - INTERVAL '28 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%search%';

  -- Keyboard shortcuts
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '22 days',
    updated_at = NOW() - INTERVAL '22 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%keyboard%';

  -- Discord integration
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '18 days',
    updated_at = NOW() - INTERVAL '18 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%discord%';

  -- Merge duplicates
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '14 days',
    updated_at = NOW() - INTERVAL '14 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%merge%' OR title ILIKE '%duplicate%';

  -- Custom categories
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '11 days',
    updated_at = NOW() - INTERVAL '11 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%custom%categor%';

  -- Priority labels
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '8 days',
    updated_at = NOW() - INTERVAL '8 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%priority%';

  -- Safari bug
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '10 days',
    updated_at = NOW() - INTERVAL '10 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%safari%';

  -- Vote flicker bug
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '4 days',
    updated_at = NOW() - INTERVAL '4 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%vote%' AND title ILIKE '%flicker%';

  -- Zapier integration
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '7 days',
    updated_at = NOW() - INTERVAL '7 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%zapier%';

  -- GitHub integration
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '5 days',
    updated_at = NOW() - INTERVAL '5 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%github%';

  -- Anonymous feedback
  UPDATE posts 
  SET 
    created_at = NOW() - INTERVAL '2 days',
    updated_at = NOW() - INTERVAL '2 days'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%anon%';

  RAISE NOTICE '✓ Dates updated successfully!';
  RAISE NOTICE '✓ Changelog entries now spread over August - November';
  RAISE NOTICE '✓ Roadmap items have realistic activity dates';
  RAISE NOTICE '✓ Open feedback spread over last 5 weeks';

END $$;

-- =============================================================================
-- STEP FINAL: Re-enable the updated_at trigger
-- =============================================================================
ALTER TABLE posts ENABLE TRIGGER handle_posts_updated_at;

-- =============================================================================
-- Verification: Check the changelog dates
-- =============================================================================
SELECT 
  p.title,
  p.status,
  p.created_at::date as created,
  p.updated_at::date as updated,
  to_char(p.updated_at, 'Month YYYY') as changelog_month
FROM posts p
JOIN profiles pr ON p.board_owner_id = pr.id
WHERE pr.board_slug = 'leanvote'
  AND p.status = 'Complete'
ORDER BY p.updated_at DESC;
