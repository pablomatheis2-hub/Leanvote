-- LeanVote Demo Data Seed Script
-- Creates realistic demo data spread over 5-6 months
-- Run this in your Supabase SQL Editor
--
-- WARNING: This temporarily disables foreign key constraint on profiles table

-- =============================================================================
-- STEP 1: Disable foreign key constraints
-- =============================================================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

DO $$
DECLARE
  leanvote_owner_id UUID;
  -- Users with mixed realistic names and internet handles
  user_dragonflame67 UUID;
  user_codemonkey_dev UUID;
  user_sarah_designs UUID;
  user_michael_t UUID;
  user_pixelninja UUID;
  user_anxious_pm UUID;
  user_startupgrind42 UUID;
  user_priya_s UUID;
  user_devops_dan UUID;
  user_luna_ux UUID;
  user_techbro99 UUID;
  user_quietcoder UUID;
  user_jen_product UUID;
  user_hackerman2024 UUID;
  user_indie_maker UUID;
  -- Post IDs
  p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID; p6 UUID; p7 UUID; p8 UUID;
  p9 UUID; p10 UUID; p11 UUID; p12 UUID; p13 UUID; p14 UUID; p15 UUID;
  p16 UUID; p17 UUID; p18 UUID; p19 UUID; p20 UUID; p21 UUID; p22 UUID;
  p23 UUID; p24 UUID; p25 UUID;
BEGIN
  -- Get the leanvote board owner
  SELECT id INTO leanvote_owner_id 
  FROM profiles 
  WHERE board_slug = 'leanvote';

  IF leanvote_owner_id IS NULL THEN
    RAISE EXCEPTION 'Board owner for slug "leanvote" not found!';
  END IF;

  RAISE NOTICE 'Found board owner: %', leanvote_owner_id;

  -- =============================================================================
  -- STEP 2: Create demo user profiles (mixed real names + internet handles)
  -- =============================================================================

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'dragonflame67', 'https://api.dicebear.com/7.x/identicon/svg?seed=dragonflame67', 'voter', true, NOW() - INTERVAL '180 days')
  RETURNING id INTO user_dragonflame67;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'codemonkey_dev', 'https://api.dicebear.com/7.x/identicon/svg?seed=codemonkey', 'voter', true, NOW() - INTERVAL '170 days')
  RETURNING id INTO user_codemonkey_dev;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'Sarah Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahc', 'voter', true, NOW() - INTERVAL '165 days')
  RETURNING id INTO user_sarah_designs;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'Michael Torres', 'https://api.dicebear.com/7.x/avataaars/svg?seed=michaelt', 'voter', true, NOW() - INTERVAL '160 days')
  RETURNING id INTO user_michael_t;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'pixel_ninja', 'https://api.dicebear.com/7.x/identicon/svg?seed=pixelninja', 'voter', true, NOW() - INTERVAL '150 days')
  RETURNING id INTO user_pixelninja;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'anxious_pm', 'https://api.dicebear.com/7.x/identicon/svg?seed=anxiouspm', 'voter', true, NOW() - INTERVAL '145 days')
  RETURNING id INTO user_anxious_pm;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'StartupGrind42', 'https://api.dicebear.com/7.x/identicon/svg?seed=startupgrind', 'voter', true, NOW() - INTERVAL '140 days')
  RETURNING id INTO user_startupgrind42;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'Priya Sharma', 'https://api.dicebear.com/7.x/avataaars/svg?seed=priyas', 'voter', true, NOW() - INTERVAL '130 days')
  RETURNING id INTO user_priya_s;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'devops_dan', 'https://api.dicebear.com/7.x/identicon/svg?seed=devopsdan', 'voter', true, NOW() - INTERVAL '120 days')
  RETURNING id INTO user_devops_dan;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'luna.ux', 'https://api.dicebear.com/7.x/identicon/svg?seed=lunadesign', 'voter', true, NOW() - INTERVAL '110 days')
  RETURNING id INTO user_luna_ux;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'techbro99', 'https://api.dicebear.com/7.x/identicon/svg?seed=techbro99', 'voter', true, NOW() - INTERVAL '100 days')
  RETURNING id INTO user_techbro99;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'quietcoder', 'https://api.dicebear.com/7.x/identicon/svg?seed=quietcoder', 'voter', true, NOW() - INTERVAL '90 days')
  RETURNING id INTO user_quietcoder;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'Jen Martinez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jenm', 'voter', true, NOW() - INTERVAL '75 days')
  RETURNING id INTO user_jen_product;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'hackerman2024', 'https://api.dicebear.com/7.x/identicon/svg?seed=hackerman', 'voter', true, NOW() - INTERVAL '60 days')
  RETURNING id INTO user_hackerman2024;

  INSERT INTO profiles (id, full_name, avatar_url, user_type, onboarding_completed, created_at)
  VALUES (gen_random_uuid(), 'indie_maker', 'https://api.dicebear.com/7.x/identicon/svg?seed=indiemaker', 'voter', true, NOW() - INTERVAL '45 days')
  RETURNING id INTO user_indie_maker;

  -- =============================================================================
  -- COMPLETED FEATURES (Changelog) - Spread over 5 months
  -- =============================================================================

  -- Google OAuth (oldest completed - 5.5 months ago)
  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), leanvote_owner_id, leanvote_owner_id,
    'Google sign-in',
    'Sign in with your Google account for faster, passwordless authentication. One click and you''re in.',
    'Feature', 'Complete', NOW() - INTERVAL '175 days', NOW() - INTERVAL '165 days')
  RETURNING id INTO p1;

  -- Widget launch (5 months ago)
  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_dragonflame67, leanvote_owner_id,
    'Embeddable feedback widget',
    'it would be sick to embed a feedback widget directly on our site instead of sending users to a separate page. like intercom but for feedback?',
    'Feature', 'Complete', NOW() - INTERVAL '160 days', NOW() - INTERVAL '140 days')
  RETURNING id INTO p2;

  -- Comment system (4.5 months ago)
  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_sarah_designs, leanvote_owner_id,
    'Comments on feedback posts',
    'Users should be able to comment on feedback items to add context or discuss implementation. Would help with clarifying requirements.',
    'Feature', 'Complete', NOW() - INTERVAL '150 days', NOW() - INTERVAL '125 days')
  RETURNING id INTO p3;

  -- Public roadmap (4 months ago)
  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_startupgrind42, leanvote_owner_id,
    'Public roadmap page',
    'Need a way to show customers what we''re working on. A public roadmap would help set expectations and build trust.',
    'Feature', 'Complete', NOW() - INTERVAL '135 days', NOW() - INTERVAL '110 days')
  RETURNING id INTO p4;

  -- Changelog (3.5 months ago)
  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_priya_s, leanvote_owner_id,
    'Changelog page',
    'Would be great to have an auto-generated changelog showing completed features. Saves time writing release notes manually.',
    'Feature', 'Complete', NOW() - INTERVAL '120 days', NOW() - INTERVAL '95 days')
  RETURNING id INTO p5;

  -- Category filtering (3 months ago)
  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_codemonkey_dev, leanvote_owner_id,
    'Filter by category',
    'need to filter by type. mixing bugs and features makes it hard to prioritize',
    'Feature', 'Complete', NOW() - INTERVAL '105 days', NOW() - INTERVAL '85 days')
  RETURNING id INTO p6;

  -- Lifetime pricing (2.5 months ago)
  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_indie_maker, leanvote_owner_id,
    'Lifetime pricing option',
    'Any chance of a lifetime deal? Would love to pay once and not worry about another subscription.',
    'Feature', 'Complete', NOW() - INTERVAL '90 days', NOW() - INTERVAL '70 days')
  RETURNING id INTO p7;

  -- =============================================================================
  -- IN PROGRESS - Currently being worked on (recent)
  -- =============================================================================

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_luna_ux, leanvote_owner_id,
    'Dark mode',
    'Please add dark mode! Working late and the white background is burning my retinas lol',
    'Feature', 'In Progress', NOW() - INTERVAL '65 days', NOW() - INTERVAL '8 days')
  RETURNING id INTO p8;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_anxious_pm, leanvote_owner_id,
    'Email notifications',
    'I need to know when things change status or get votes. Currently checking manually multiple times a day which is not ideal for my sanity.',
    'Feature', 'In Progress', NOW() - INTERVAL '55 days', NOW() - INTERVAL '5 days')
  RETURNING id INTO p9;

  -- =============================================================================
  -- PLANNED - On the roadmap
  -- =============================================================================

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_devops_dan, leanvote_owner_id,
    'Slack integration',
    'Would love Slack notifications when new feedback comes in. Our team lives there.',
    'Integration', 'Planned', NOW() - INTERVAL '80 days', NOW() - INTERVAL '20 days')
  RETURNING id INTO p10;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_pixelninja, leanvote_owner_id,
    'Custom branding',
    'would be nice to customize colors to match our brand. the orange is cool but doesn''t fit our style',
    'Feature', 'Planned', NOW() - INTERVAL '70 days', NOW() - INTERVAL '25 days')
  RETURNING id INTO p11;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_hackerman2024, leanvote_owner_id,
    'REST API',
    'Need API access to build custom integrations. Want to pull data into our internal tools and create automations.',
    'Integration', 'Planned', NOW() - INTERVAL '50 days', NOW() - INTERVAL '18 days')
  RETURNING id INTO p12;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_quietcoder, leanvote_owner_id,
    'Markdown support',
    'markdown in descriptions would help. want to add code snippets and formatting',
    'Feature', 'Planned', NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days')
  RETURNING id INTO p13;

  -- =============================================================================
  -- OPEN - Awaiting review (spread over last 2 months)
  -- =============================================================================

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_jen_product, leanvote_owner_id,
    'Export to CSV',
    'Need to export feedback data to spreadsheets for quarterly reviews and stakeholder presentations.',
    'Feature', 'Open', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days')
  RETURNING id INTO p14;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_michael_t, leanvote_owner_id,
    'Search functionality',
    'With 50+ feedback items now, it''s getting hard to find things. A search bar would be super helpful.',
    'Feature', 'Open', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days')
  RETURNING id INTO p15;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_techbro99, leanvote_owner_id,
    'Keyboard shortcuts',
    'J/K for navigation, U for upvote, C for comment. standard stuff. would make this 10x faster',
    'Feature', 'Open', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days')
  RETURNING id INTO p16;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_dragonflame67, leanvote_owner_id,
    'Discord integration',
    'discord > slack fight me. but seriously our community is on discord, would love integration there',
    'Integration', 'Open', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days')
  RETURNING id INTO p17;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_priya_s, leanvote_owner_id,
    'Merge duplicate feedback',
    'Users often submit similar requests. Would be helpful to merge them while preserving all the votes.',
    'Feature', 'Open', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days')
  RETURNING id INTO p18;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_startupgrind42, leanvote_owner_id,
    'Custom categories',
    'Feature/Bug/Integration is fine but I need a "Design" category. Half our feedback is UI/UX stuff.',
    'Feature', 'Open', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days')
  RETURNING id INTO p19;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_anxious_pm, leanvote_owner_id,
    'Priority labels',
    'Would like to tag items as High/Medium/Low priority. Status isn''t enough for our planning process.',
    'Feature', 'Open', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
  RETURNING id INTO p20;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_codemonkey_dev, leanvote_owner_id,
    'Widget doesn''t load on Safari sometimes',
    'works great on chrome but fails to load on safari 17 occasionally. maybe 1 in 10 times. no console errors just doesn''t appear',
    'Bug', 'Open', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days')
  RETURNING id INTO p21;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_luna_ux, leanvote_owner_id,
    'Vote count flickers briefly',
    'Minor UI bug - when I vote the count shows wrong number for a split second before correcting. Not blocking but noticeable.',
    'Bug', 'Open', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
  RETURNING id INTO p22;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_indie_maker, leanvote_owner_id,
    'Zapier integration',
    'Would be cool to connect LeanVote to other tools via Zapier. Could automate a lot of workflows.',
    'Integration', 'Open', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days')
  RETURNING id INTO p23;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_hackerman2024, leanvote_owner_id,
    'GitHub issues sync',
    'Would be amazing to sync feedback items with GitHub issues. We already use GH for tracking dev work.',
    'Integration', 'Open', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days')
  RETURNING id INTO p24;

  INSERT INTO posts (id, user_id, board_owner_id, title, description, category, status, created_at, updated_at)
  VALUES (gen_random_uuid(), user_sarah_designs, leanvote_owner_id,
    'Anonymous feedback option',
    'Some users might want to submit feedback anonymously. Could increase honesty in bug reports.',
    'Feature', 'Open', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
  RETURNING id INTO p25;

  -- =============================================================================
  -- VOTES - Realistic distribution across users
  -- =============================================================================

  -- Google OAuth votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_dragonflame67, p1, NOW() - INTERVAL '174 days'),
    (user_codemonkey_dev, p1, NOW() - INTERVAL '173 days'),
    (user_sarah_designs, p1, NOW() - INTERVAL '172 days'),
    (user_michael_t, p1, NOW() - INTERVAL '170 days'),
    (user_pixelninja, p1, NOW() - INTERVAL '168 days')
  ON CONFLICT DO NOTHING;

  -- Widget votes (popular!)
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_codemonkey_dev, p2, NOW() - INTERVAL '159 days'),
    (user_sarah_designs, p2, NOW() - INTERVAL '158 days'),
    (user_michael_t, p2, NOW() - INTERVAL '157 days'),
    (user_pixelninja, p2, NOW() - INTERVAL '155 days'),
    (user_anxious_pm, p2, NOW() - INTERVAL '154 days'),
    (user_startupgrind42, p2, NOW() - INTERVAL '152 days'),
    (user_priya_s, p2, NOW() - INTERVAL '150 days'),
    (user_devops_dan, p2, NOW() - INTERVAL '148 days'),
    (user_luna_ux, p2, NOW() - INTERVAL '145 days'),
    (leanvote_owner_id, p2, NOW() - INTERVAL '144 days')
  ON CONFLICT DO NOTHING;

  -- Comment system votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_dragonflame67, p3, NOW() - INTERVAL '149 days'),
    (user_codemonkey_dev, p3, NOW() - INTERVAL '147 days'),
    (user_michael_t, p3, NOW() - INTERVAL '145 days'),
    (user_anxious_pm, p3, NOW() - INTERVAL '142 days'),
    (user_startupgrind42, p3, NOW() - INTERVAL '140 days'),
    (user_priya_s, p3, NOW() - INTERVAL '138 days'),
    (leanvote_owner_id, p3, NOW() - INTERVAL '135 days')
  ON CONFLICT DO NOTHING;

  -- Roadmap votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_dragonflame67, p4, NOW() - INTERVAL '134 days'),
    (user_sarah_designs, p4, NOW() - INTERVAL '132 days'),
    (user_pixelninja, p4, NOW() - INTERVAL '130 days'),
    (user_anxious_pm, p4, NOW() - INTERVAL '128 days'),
    (user_priya_s, p4, NOW() - INTERVAL '125 days'),
    (user_devops_dan, p4, NOW() - INTERVAL '122 days'),
    (leanvote_owner_id, p4, NOW() - INTERVAL '120 days')
  ON CONFLICT DO NOTHING;

  -- Changelog votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_codemonkey_dev, p5, NOW() - INTERVAL '119 days'),
    (user_sarah_designs, p5, NOW() - INTERVAL '117 days'),
    (user_startupgrind42, p5, NOW() - INTERVAL '115 days'),
    (user_devops_dan, p5, NOW() - INTERVAL '112 days'),
    (user_luna_ux, p5, NOW() - INTERVAL '108 days')
  ON CONFLICT DO NOTHING;

  -- Category filter votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_dragonflame67, p6, NOW() - INTERVAL '104 days'),
    (user_sarah_designs, p6, NOW() - INTERVAL '102 days'),
    (user_anxious_pm, p6, NOW() - INTERVAL '98 days'),
    (user_priya_s, p6, NOW() - INTERVAL '95 days')
  ON CONFLICT DO NOTHING;

  -- Lifetime pricing votes (very popular!)
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_dragonflame67, p7, NOW() - INTERVAL '89 days'),
    (user_codemonkey_dev, p7, NOW() - INTERVAL '88 days'),
    (user_sarah_designs, p7, NOW() - INTERVAL '87 days'),
    (user_michael_t, p7, NOW() - INTERVAL '86 days'),
    (user_pixelninja, p7, NOW() - INTERVAL '85 days'),
    (user_anxious_pm, p7, NOW() - INTERVAL '84 days'),
    (user_startupgrind42, p7, NOW() - INTERVAL '83 days'),
    (user_priya_s, p7, NOW() - INTERVAL '82 days'),
    (user_devops_dan, p7, NOW() - INTERVAL '81 days'),
    (user_luna_ux, p7, NOW() - INTERVAL '80 days'),
    (user_techbro99, p7, NOW() - INTERVAL '79 days'),
    (user_quietcoder, p7, NOW() - INTERVAL '78 days')
  ON CONFLICT DO NOTHING;

  -- Dark mode votes (most popular request!)
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_dragonflame67, p8, NOW() - INTERVAL '64 days'),
    (user_codemonkey_dev, p8, NOW() - INTERVAL '62 days'),
    (user_sarah_designs, p8, NOW() - INTERVAL '60 days'),
    (user_michael_t, p8, NOW() - INTERVAL '58 days'),
    (user_pixelninja, p8, NOW() - INTERVAL '55 days'),
    (user_anxious_pm, p8, NOW() - INTERVAL '52 days'),
    (user_startupgrind42, p8, NOW() - INTERVAL '48 days'),
    (user_priya_s, p8, NOW() - INTERVAL '45 days'),
    (user_devops_dan, p8, NOW() - INTERVAL '40 days'),
    (user_techbro99, p8, NOW() - INTERVAL '35 days'),
    (user_quietcoder, p8, NOW() - INTERVAL '30 days'),
    (user_jen_product, p8, NOW() - INTERVAL '25 days'),
    (user_hackerman2024, p8, NOW() - INTERVAL '20 days'),
    (user_indie_maker, p8, NOW() - INTERVAL '15 days')
  ON CONFLICT DO NOTHING;

  -- Email notifications votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_codemonkey_dev, p9, NOW() - INTERVAL '54 days'),
    (user_sarah_designs, p9, NOW() - INTERVAL '52 days'),
    (user_michael_t, p9, NOW() - INTERVAL '48 days'),
    (user_startupgrind42, p9, NOW() - INTERVAL '44 days'),
    (user_priya_s, p9, NOW() - INTERVAL '40 days'),
    (user_jen_product, p9, NOW() - INTERVAL '35 days'),
    (user_indie_maker, p9, NOW() - INTERVAL '28 days')
  ON CONFLICT DO NOTHING;

  -- Slack integration votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_codemonkey_dev, p10, NOW() - INTERVAL '78 days'),
    (user_sarah_designs, p10, NOW() - INTERVAL '75 days'),
    (user_anxious_pm, p10, NOW() - INTERVAL '70 days'),
    (user_startupgrind42, p10, NOW() - INTERVAL '65 days'),
    (user_priya_s, p10, NOW() - INTERVAL '60 days'),
    (user_devops_dan, p10, NOW() - INTERVAL '55 days'),
    (user_techbro99, p10, NOW() - INTERVAL '48 days'),
    (user_jen_product, p10, NOW() - INTERVAL '40 days'),
    (user_hackerman2024, p10, NOW() - INTERVAL '32 days')
  ON CONFLICT DO NOTHING;

  -- Custom branding votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_sarah_designs, p11, NOW() - INTERVAL '68 days'),
    (user_luna_ux, p11, NOW() - INTERVAL '62 days'),
    (user_startupgrind42, p11, NOW() - INTERVAL '55 days'),
    (user_priya_s, p11, NOW() - INTERVAL '48 days'),
    (user_jen_product, p11, NOW() - INTERVAL '38 days'),
    (user_indie_maker, p11, NOW() - INTERVAL '30 days')
  ON CONFLICT DO NOTHING;

  -- API votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_codemonkey_dev, p12, NOW() - INTERVAL '48 days'),
    (user_devops_dan, p12, NOW() - INTERVAL '42 days'),
    (user_techbro99, p12, NOW() - INTERVAL '35 days'),
    (user_quietcoder, p12, NOW() - INTERVAL '28 days'),
    (user_indie_maker, p12, NOW() - INTERVAL '22 days')
  ON CONFLICT DO NOTHING;

  -- Markdown votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_codemonkey_dev, p13, NOW() - INTERVAL '44 days'),
    (user_devops_dan, p13, NOW() - INTERVAL '38 days'),
    (user_hackerman2024, p13, NOW() - INTERVAL '30 days')
  ON CONFLICT DO NOTHING;

  -- CSV export votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_anxious_pm, p14, NOW() - INTERVAL '38 days'),
    (user_startupgrind42, p14, NOW() - INTERVAL '35 days'),
    (user_priya_s, p14, NOW() - INTERVAL '32 days')
  ON CONFLICT DO NOTHING;

  -- Search votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_codemonkey_dev, p15, NOW() - INTERVAL '34 days'),
    (user_anxious_pm, p15, NOW() - INTERVAL '32 days'),
    (user_priya_s, p15, NOW() - INTERVAL '30 days'),
    (user_luna_ux, p15, NOW() - INTERVAL '28 days'),
    (user_jen_product, p15, NOW() - INTERVAL '25 days'),
    (user_indie_maker, p15, NOW() - INTERVAL '22 days')
  ON CONFLICT DO NOTHING;

  -- Keyboard shortcuts votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_codemonkey_dev, p16, NOW() - INTERVAL '27 days'),
    (user_hackerman2024, p16, NOW() - INTERVAL '24 days')
  ON CONFLICT DO NOTHING;

  -- Discord votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_pixelninja, p17, NOW() - INTERVAL '21 days'),
    (user_luna_ux, p17, NOW() - INTERVAL '18 days'),
    (user_techbro99, p17, NOW() - INTERVAL '15 days'),
    (user_hackerman2024, p17, NOW() - INTERVAL '12 days')
  ON CONFLICT DO NOTHING;

  -- Merge duplicates votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_anxious_pm, p18, NOW() - INTERVAL '17 days'),
    (user_jen_product, p18, NOW() - INTERVAL '15 days')
  ON CONFLICT DO NOTHING;

  -- Custom categories votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_luna_ux, p19, NOW() - INTERVAL '13 days'),
    (user_sarah_designs, p19, NOW() - INTERVAL '11 days'),
    (user_indie_maker, p19, NOW() - INTERVAL '9 days')
  ON CONFLICT DO NOTHING;

  -- Priority labels votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_jen_product, p20, NOW() - INTERVAL '9 days'),
    (user_startupgrind42, p20, NOW() - INTERVAL '7 days')
  ON CONFLICT DO NOTHING;

  -- Safari bug votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_sarah_designs, p21, NOW() - INTERVAL '11 days'),
    (user_pixelninja, p21, NOW() - INTERVAL '9 days')
  ON CONFLICT DO NOTHING;

  -- Zapier votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_anxious_pm, p23, NOW() - INTERVAL '7 days'),
    (user_startupgrind42, p23, NOW() - INTERVAL '5 days'),
    (user_jen_product, p23, NOW() - INTERVAL '4 days')
  ON CONFLICT DO NOTHING;

  -- GitHub sync votes
  INSERT INTO votes (user_id, post_id, created_at) VALUES
    (user_codemonkey_dev, p24, NOW() - INTERVAL '5 days'),
    (user_devops_dan, p24, NOW() - INTERVAL '4 days'),
    (user_quietcoder, p24, NOW() - INTERVAL '3 days')
  ON CONFLICT DO NOTHING;

  -- =============================================================================
  -- COMMENTS - Varied opinions and writing styles
  -- =============================================================================

  -- Widget comments
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p2, user_codemonkey_dev, 'this is exactly what i needed. embedded it in 5 min', NOW() - INTERVAL '139 days'),
    (p2, user_sarah_designs, 'Love how clean it looks! The roadmap tab is a nice touch.', NOW() - INTERVAL '138 days'),
    (p2, user_pixelninja, 'would be cool to customize the button position. bottom right doesnt work for all sites', NOW() - INTERVAL '137 days'),
    (p2, leanvote_owner_id, 'You can! Check the position config option - supports bottom-right, bottom-left, top-right, and top-left.', NOW() - INTERVAL '136 days'),
    (p2, user_pixelninja, 'oh nice missed that. works great now thx', NOW() - INTERVAL '135 days');

  -- Comment system feedback
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p3, user_michael_t, 'Would be nice to have threaded replies for longer discussions.', NOW() - INTERVAL '124 days'),
    (p3, user_codemonkey_dev, 'agreed, threading would help', NOW() - INTERVAL '122 days'),
    (p3, leanvote_owner_id, 'Threading is on our radar! Keeping it simple for now but will consider it for a future update.', NOW() - INTERVAL '120 days');

  -- Lifetime pricing comments (mixed opinions!)
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p7, user_dragonflame67, 'bought immediately. so tired of subscription everything', NOW() - INTERVAL '78 days'),
    (p7, user_sarah_designs, 'Love this model. Instant purchase from me.', NOW() - INTERVAL '77 days'),
    (p7, user_techbro99, 'idk lifetime deals always make me nervous. what if the company shuts down?', NOW() - INTERVAL '76 days'),
    (p7, user_startupgrind42, 'That''s a risk with any SaaS though. At least here you''re not paying monthly for something that might disappear.', NOW() - INTERVAL '75 days'),
    (p7, user_priya_s, 'Valid concern but $49 is low enough risk for me. Already got value from the trial.', NOW() - INTERVAL '74 days'),
    (p7, leanvote_owner_id, 'Appreciate the honest feedback! We''re committed to this long-term and the lifetime model actually helps with sustainability - we can focus on the product instead of chasing MRR.', NOW() - INTERVAL '73 days'),
    (p7, user_techbro99, 'fair enough. bought it', NOW() - INTERVAL '72 days');

  -- Dark mode comments
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p8, user_dragonflame67, 'FINALLY this is happening', NOW() - INTERVAL '63 days'),
    (p8, user_codemonkey_dev, 'will it auto detect system preference?', NOW() - INTERVAL '60 days'),
    (p8, leanvote_owner_id, 'Yes! Will respect system settings by default with manual override option.', NOW() - INTERVAL '58 days'),
    (p8, user_techbro99, 'unpopular opinion but i actually prefer light mode. as long as its optional im fine', NOW() - INTERVAL '50 days'),
    (p8, user_pixelninja, 'monster', NOW() - INTERVAL '49 days'),
    (p8, user_luna_ux, 'lol each to their own. Will the widget get dark mode too?', NOW() - INTERVAL '45 days'),
    (p8, leanvote_owner_id, 'Yes! Widget will inherit the board''s dark mode setting.', NOW() - INTERVAL '44 days'),
    (p8, user_hackerman2024, 'shipping soon? my eyes need this', NOW() - INTERVAL '18 days'),
    (p8, leanvote_owner_id, 'Very close! Should be live within the next week or two.', NOW() - INTERVAL '17 days');

  -- Email notifications comments
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p9, user_sarah_designs, 'Please include option for daily digest vs instant. Don''t want inbox spam.', NOW() - INTERVAL '50 days'),
    (p9, user_michael_t, 'Weekly digest would be ideal for me actually.', NOW() - INTERVAL '48 days'),
    (p9, user_codemonkey_dev, 'webhook option would be nice too so we can build custom notifications', NOW() - INTERVAL '45 days'),
    (p9, leanvote_owner_id, 'Planning instant + weekly digest options. Webhooks will come with the API!', NOW() - INTERVAL '42 days'),
    (p9, user_anxious_pm, 'Can''t wait. Currently have a reminder to check this 3x daily lol', NOW() - INTERVAL '30 days');

  -- Slack integration comments (mixed opinions on Slack vs Discord)
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p10, user_startupgrind42, 'This would be huge for us. We basically live in Slack.', NOW() - INTERVAL '74 days'),
    (p10, user_dragonflame67, 'discord > slack but ok', NOW() - INTERVAL '70 days'),
    (p10, user_devops_dan, 'Need to be able to choose which channel. Don''t want it in #general.', NOW() - INTERVAL '65 days'),
    (p10, leanvote_owner_id, 'Slack first, then Discord! You''ll be able to configure specific channels and filter by category/status.', NOW() - INTERVAL '62 days'),
    (p10, user_techbro99, 'eta? this would make me upgrade', NOW() - INTERVAL '45 days'),
    (p10, leanvote_owner_id, 'Hoping to ship in the next few weeks. It''s high priority!', NOW() - INTERVAL '44 days');

  -- Custom branding comments
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p11, user_sarah_designs, 'Would love to match our brand. The orange is nice but we''re a blue company lol', NOW() - INTERVAL '66 days'),
    (p11, user_luna_ux, 'Logo upload is must-have for us. Currently looks a bit generic.', NOW() - INTERVAL '60 days'),
    (p11, user_indie_maker, 'custom domain support would be amazing too. feedback.myapp.com', NOW() - INTERVAL '32 days'),
    (p11, leanvote_owner_id, 'All planned! Logo, colors, and custom domain support coming soon.', NOW() - INTERVAL '30 days');

  -- API comments
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p12, user_devops_dan, 'What endpoints are planned? At minimum need to list posts and votes.', NOW() - INTERVAL '46 days'),
    (p12, leanvote_owner_id, 'Full REST API covering posts, votes, comments, and users. Plus webhooks for real-time events.', NOW() - INTERVAL '44 days'),
    (p12, user_quietcoder, 'graphql would be nice but rest is fine too', NOW() - INTERVAL '26 days'),
    (p12, user_techbro99, 'rest is fine. dont overcomplicate it', NOW() - INTERVAL '24 days');

  -- Search comments
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p15, user_codemonkey_dev, 'yes please. scrolling through 50+ items is painful', NOW() - INTERVAL '33 days'),
    (p15, user_luna_ux, 'Filter + search combo would be ideal', NOW() - INTERVAL '27 days'),
    (p15, user_jen_product, 'Even just basic text search would help a lot', NOW() - INTERVAL '24 days');

  -- Discord vs Slack debate
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p17, user_pixelninja, 'our whole community is on discord. this would be great', NOW() - INTERVAL '20 days'),
    (p17, user_devops_dan, 'Slack first please. Most companies use Slack not Discord.', NOW() - INTERVAL '18 days'),
    (p17, user_dragonflame67, 'depends on your audience. gaming/crypto = discord, b2b = slack', NOW() - INTERVAL '15 days'),
    (p17, user_luna_ux, 'both would be nice eventually!', NOW() - INTERVAL '12 days');

  -- Safari bug comments
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p21, user_sarah_designs, 'Can confirm, seeing this too on Safari 17.2', NOW() - INTERVAL '10 days'),
    (p21, leanvote_owner_id, 'Thanks for reporting! Could you check browser console when this happens?', NOW() - INTERVAL '9 days'),
    (p21, user_codemonkey_dev, 'no errors. just doesnt render. refresh fixes it', NOW() - INTERVAL '8 days');

  -- GitHub integration comments
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p24, user_devops_dan, 'This would be amazing for our workflow. We track everything in GitHub.', NOW() - INTERVAL '5 days'),
    (p24, user_quietcoder, '+1 bidirectional sync would be ideal', NOW() - INTERVAL '4 days');

  -- Anonymous feedback comments (disagreement)
  INSERT INTO comments (post_id, user_id, content, created_at) VALUES
    (p25, user_michael_t, 'Not sure about this. Anonymous feedback can get toxic real quick.', NOW() - INTERVAL '2 days'),
    (p25, user_priya_s, 'Disagree - people are more honest when anonymous. Especially for sensitive feedback.', NOW() - INTERVAL '2 days'),
    (p25, user_startupgrind42, 'Maybe make it board owner''s choice? Some products need it, others don''t.', NOW() - INTERVAL '1 day'),
    (p25, user_sarah_designs, 'Agreed with making it optional. Would use it for internal feedback boards.', NOW() - INTERVAL '12 hours');

  RAISE NOTICE '';
  RAISE NOTICE '✓ Seed completed successfully!';
  RAISE NOTICE '✓ Created 15 demo users';
  RAISE NOTICE '✓ Created 25 posts spread over 6 months';
  RAISE NOTICE '✓ Added 90+ votes';
  RAISE NOTICE '✓ Added 50+ comments with varied opinions';

END $$;

-- =============================================================================
-- STEP 3: Re-enable foreign key (will leave orphaned profiles but they work fine)
-- =============================================================================
-- Note: We're NOT re-adding the constraint because the fake profiles 
-- don't have corresponding auth.users entries. This is fine for demo data.
-- The profiles will continue to work normally.

-- Verification query
SELECT 
  status,
  COUNT(*) as posts,
  SUM((SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id)) as total_votes,
  SUM((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id)) as total_comments
FROM posts p
JOIN profiles pr ON p.board_owner_id = pr.id
WHERE pr.board_slug = 'leanvote'
GROUP BY status
ORDER BY 
  CASE status 
    WHEN 'Complete' THEN 1
    WHEN 'In Progress' THEN 2
    WHEN 'Planned' THEN 3
    WHEN 'Open' THEN 4
  END;
