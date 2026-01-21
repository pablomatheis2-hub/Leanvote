-- LeanVote Fix: Update changelog entries to be proper release announcements
-- Run this AFTER seed-leanvote-demo.sql
-- This updates completed posts to look like admin announcements, not user requests

-- =============================================================================
-- STEP 1: Update completed posts to be proper changelog entries
-- =============================================================================

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

  -- Update Google sign-in
  UPDATE posts 
  SET 
    user_id = leanvote_owner_id,
    title = 'Google Sign-In',
    description = 'You can now sign in with your Google account! One-click authentication means no more passwords to remember. Fast, secure, and seamless.'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%google sign%' 
    AND status = 'Complete';

  -- Update Widget
  UPDATE posts 
  SET 
    user_id = leanvote_owner_id,
    title = 'Embeddable Feedback Widget',
    description = 'Introducing our new embeddable widget! Add a feedback button to your website with just a few lines of code. Your users can submit feedback, view the roadmap, and check the changelog without leaving your site. Customize the position, colors, and button text to match your brand.'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%widget%' 
    AND status = 'Complete';

  -- Update Comments
  UPDATE posts 
  SET 
    user_id = leanvote_owner_id,
    title = 'Comment System',
    description = 'Comments are here! Users can now discuss feedback items, ask clarifying questions, and share additional context. Board owners can respond directly to engage with their community and gather more insights.'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%comment%' 
    AND status = 'Complete';

  -- Update Public Roadmap
  UPDATE posts 
  SET 
    user_id = leanvote_owner_id,
    title = 'Public Roadmap',
    description = 'Share your product roadmap with your users! The new roadmap page displays all your feedback items organized by status in a beautiful kanban-style layout. Let customers see what''s planned, in progress, and recently completed.'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%roadmap%' 
    AND status = 'Complete';

  -- Update Changelog
  UPDATE posts 
  SET 
    user_id = leanvote_owner_id,
    title = 'Changelog Page',
    description = 'Keep your users informed with the new changelog! All completed features are now automatically displayed in a beautiful timeline, organized by month. No more manually writing release notes.'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%changelog%' 
    AND status = 'Complete';

  -- Update Category Filter
  UPDATE posts 
  SET 
    user_id = leanvote_owner_id,
    title = 'Category Filtering',
    description = 'You can now filter feedback by category! Quickly focus on Feature requests, Bug reports, or Integration requests. Makes it easier to prioritize and review specific types of feedback.'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%filter%' 
    AND status = 'Complete';

  -- Update Lifetime Pricing
  UPDATE posts 
  SET 
    user_id = leanvote_owner_id,
    title = 'Lifetime Access Pricing',
    description = 'We''ve simplified our pricing! Pay once, own it forever. For just $49, you get lifetime access to LeanVote with all current and future features. No subscriptions, no recurring fees, no surprises.'
  WHERE board_owner_id = leanvote_owner_id 
    AND title ILIKE '%lifetime%' 
    AND status = 'Complete';

  RAISE NOTICE 'Changelog entries updated successfully!';
END $$;

-- =============================================================================
-- STEP 2: Add/fix comments on various posts
-- =============================================================================

DO $$
DECLARE
  leanvote_owner_id UUID;
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
  post_widget UUID;
  post_comments UUID;
  post_roadmap UUID;
  post_changelog UUID;
  post_lifetime UUID;
  post_darkmode UUID;
  post_email UUID;
  post_slack UUID;
  post_branding UUID;
  post_api UUID;
  post_search UUID;
  post_discord UUID;
  post_safari UUID;
  post_anon UUID;
BEGIN
  -- Get the leanvote board owner
  SELECT id INTO leanvote_owner_id FROM profiles WHERE board_slug = 'leanvote';
  
  -- Get user IDs
  SELECT id INTO user_dragonflame67 FROM profiles WHERE full_name = 'dragonflame67' LIMIT 1;
  SELECT id INTO user_codemonkey_dev FROM profiles WHERE full_name = 'codemonkey_dev' LIMIT 1;
  SELECT id INTO user_sarah_designs FROM profiles WHERE full_name = 'Sarah Chen' LIMIT 1;
  SELECT id INTO user_michael_t FROM profiles WHERE full_name = 'Michael Torres' LIMIT 1;
  SELECT id INTO user_pixelninja FROM profiles WHERE full_name = 'pixel_ninja' LIMIT 1;
  SELECT id INTO user_anxious_pm FROM profiles WHERE full_name = 'anxious_pm' LIMIT 1;
  SELECT id INTO user_startupgrind42 FROM profiles WHERE full_name = 'StartupGrind42' LIMIT 1;
  SELECT id INTO user_priya_s FROM profiles WHERE full_name = 'Priya Sharma' LIMIT 1;
  SELECT id INTO user_devops_dan FROM profiles WHERE full_name = 'devops_dan' LIMIT 1;
  SELECT id INTO user_luna_ux FROM profiles WHERE full_name = 'luna.ux' LIMIT 1;
  SELECT id INTO user_techbro99 FROM profiles WHERE full_name = 'techbro99' LIMIT 1;
  SELECT id INTO user_quietcoder FROM profiles WHERE full_name = 'quietcoder' LIMIT 1;
  SELECT id INTO user_jen_product FROM profiles WHERE full_name = 'Jen Martinez' LIMIT 1;
  SELECT id INTO user_hackerman2024 FROM profiles WHERE full_name = 'hackerman2024' LIMIT 1;
  SELECT id INTO user_indie_maker FROM profiles WHERE full_name = 'indie_maker' LIMIT 1;

  -- Get post IDs
  SELECT id INTO post_widget FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%widget%' AND status = 'Complete' LIMIT 1;
  SELECT id INTO post_comments FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%comment%' AND status = 'Complete' LIMIT 1;
  SELECT id INTO post_roadmap FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%roadmap%' AND status = 'Complete' LIMIT 1;
  SELECT id INTO post_changelog FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%changelog%' AND status = 'Complete' LIMIT 1;
  SELECT id INTO post_lifetime FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%lifetime%' AND status = 'Complete' LIMIT 1;
  SELECT id INTO post_darkmode FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%dark%' LIMIT 1;
  SELECT id INTO post_email FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%email%' OR title ILIKE '%notification%' LIMIT 1;
  SELECT id INTO post_slack FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%slack%' LIMIT 1;
  SELECT id INTO post_branding FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%brand%' LIMIT 1;
  SELECT id INTO post_api FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%api%' LIMIT 1;
  SELECT id INTO post_search FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%search%' LIMIT 1;
  SELECT id INTO post_discord FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%discord%' LIMIT 1;
  SELECT id INTO post_safari FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%safari%' LIMIT 1;
  SELECT id INTO post_anon FROM posts WHERE board_owner_id = leanvote_owner_id AND title ILIKE '%anon%' LIMIT 1;

  -- Delete existing comments to avoid duplicates
  DELETE FROM comments WHERE post_id IN (
    post_widget, post_comments, post_roadmap, post_changelog, post_lifetime,
    post_darkmode, post_email, post_slack, post_branding, post_api,
    post_search, post_discord, post_safari, post_anon
  );

  -- =============================================================================
  -- Comments on COMPLETED features (celebration/appreciation style)
  -- =============================================================================

  -- Widget comments
  IF post_widget IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_widget, user_codemonkey_dev, 'this is exactly what i needed. embedded it in 5 min. works great', NOW() - INTERVAL '138 days'),
      (post_widget, user_sarah_designs, 'Love how clean it looks! The roadmap tab in the widget is a nice touch.', NOW() - INTERVAL '136 days'),
      (post_widget, user_startupgrind42, 'Game changer for us. Our support tickets dropped since users can submit feedback directly now.', NOW() - INTERVAL '130 days'),
      (post_widget, user_pixelninja, 'is there a way to customize the button position?', NOW() - INTERVAL '125 days'),
      (post_widget, leanvote_owner_id, 'Yes! Check the position config option - supports bottom-right, bottom-left, top-right, and top-left.', NOW() - INTERVAL '124 days'),
      (post_widget, user_pixelninja, 'oh nice missed that. works perfectly now thx', NOW() - INTERVAL '123 days');
  END IF;

  -- Comment system comments
  IF post_comments IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_comments, user_michael_t, 'Finally! This makes discussions so much easier.', NOW() - INTERVAL '122 days'),
      (post_comments, user_priya_s, 'Would love threaded replies in the future, but this is great for now.', NOW() - INTERVAL '120 days'),
      (post_comments, leanvote_owner_id, 'Threading is on our radar! Keeping it simple for v1 but definitely considering it.', NOW() - INTERVAL '119 days');
  END IF;

  -- Roadmap comments
  IF post_roadmap IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_roadmap, user_anxious_pm, 'This is huge for us. Customers were always asking what we''re working on.', NOW() - INTERVAL '108 days'),
      (post_roadmap, user_indie_maker, 'love being able to share a link to show what''s coming', NOW() - INTERVAL '105 days');
  END IF;

  -- Lifetime pricing comments (mixed reactions)
  IF post_lifetime IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_lifetime, user_dragonflame67, 'bought immediately. so tired of subscription everything', NOW() - INTERVAL '68 days'),
      (post_lifetime, user_sarah_designs, 'Love this model! Instant purchase from me.', NOW() - INTERVAL '66 days'),
      (post_lifetime, user_techbro99, 'idk lifetime deals always make me nervous. what if the company shuts down?', NOW() - INTERVAL '64 days'),
      (post_lifetime, user_startupgrind42, 'That''s a risk with any SaaS though. At least here you''re not paying monthly for something that might disappear.', NOW() - INTERVAL '63 days'),
      (post_lifetime, user_priya_s, 'Valid concern but $49 is low enough risk for me. Already got value from the trial.', NOW() - INTERVAL '62 days'),
      (post_lifetime, leanvote_owner_id, 'Appreciate the honest feedback! We''re committed long-term. The lifetime model helps us focus on the product instead of chasing MRR.', NOW() - INTERVAL '61 days'),
      (post_lifetime, user_techbro99, 'fair enough. bought it', NOW() - INTERVAL '60 days');
  END IF;

  -- =============================================================================
  -- Comments on IN PROGRESS features
  -- =============================================================================

  -- Dark mode comments
  IF post_darkmode IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_darkmode, user_dragonflame67, 'FINALLY this is happening', NOW() - INTERVAL '55 days'),
      (post_darkmode, user_codemonkey_dev, 'will it auto detect system preference?', NOW() - INTERVAL '50 days'),
      (post_darkmode, leanvote_owner_id, 'Yes! Will respect system settings by default with manual override option.', NOW() - INTERVAL '48 days'),
      (post_darkmode, user_techbro99, 'unpopular opinion but i actually prefer light mode. as long as its optional im fine', NOW() - INTERVAL '40 days'),
      (post_darkmode, user_pixelninja, 'monster', NOW() - INTERVAL '39 days'),
      (post_darkmode, user_luna_ux, 'lol each to their own. Will the widget get dark mode too?', NOW() - INTERVAL '35 days'),
      (post_darkmode, leanvote_owner_id, 'Yes! Widget will inherit the board''s dark mode setting.', NOW() - INTERVAL '34 days'),
      (post_darkmode, user_hackerman2024, 'shipping soon? my eyes need this', NOW() - INTERVAL '12 days'),
      (post_darkmode, leanvote_owner_id, 'Very close! Should be live within the next week or two.', NOW() - INTERVAL '10 days');
  END IF;

  -- Email notifications comments
  IF post_email IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_email, user_sarah_designs, 'Please include option for daily digest vs instant. Don''t want inbox spam.', NOW() - INTERVAL '45 days'),
      (post_email, user_michael_t, 'Weekly digest would be ideal for me actually.', NOW() - INTERVAL '42 days'),
      (post_email, user_codemonkey_dev, 'webhook option would be nice too so we can build custom notifications', NOW() - INTERVAL '38 days'),
      (post_email, leanvote_owner_id, 'Planning instant + weekly digest options. Webhooks will come with the API!', NOW() - INTERVAL '36 days'),
      (post_email, user_anxious_pm, 'Can''t wait. Currently have a reminder to check this 3x daily lol', NOW() - INTERVAL '20 days');
  END IF;

  -- =============================================================================
  -- Comments on PLANNED features
  -- =============================================================================

  -- Slack integration comments
  IF post_slack IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_slack, user_startupgrind42, 'This would be huge for us. We basically live in Slack.', NOW() - INTERVAL '70 days'),
      (post_slack, user_dragonflame67, 'discord > slack but ok', NOW() - INTERVAL '65 days'),
      (post_slack, user_devops_dan, 'Need to be able to choose which channel. Don''t want it in #general.', NOW() - INTERVAL '55 days'),
      (post_slack, leanvote_owner_id, 'Slack first, then Discord! You''ll be able to configure specific channels and filter by category/status.', NOW() - INTERVAL '52 days'),
      (post_slack, user_techbro99, 'eta? this would make me upgrade', NOW() - INTERVAL '30 days'),
      (post_slack, leanvote_owner_id, 'Hoping to ship in the next few weeks. It''s high priority!', NOW() - INTERVAL '28 days');
  END IF;

  -- Custom branding comments
  IF post_branding IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_branding, user_sarah_designs, 'Would love to match our brand. The orange is nice but we''re a blue company lol', NOW() - INTERVAL '60 days'),
      (post_branding, user_luna_ux, 'Logo upload is must-have for us. Currently looks a bit generic.', NOW() - INTERVAL '50 days'),
      (post_branding, user_indie_maker, 'custom domain support would be amazing too. feedback.myapp.com', NOW() - INTERVAL '25 days'),
      (post_branding, leanvote_owner_id, 'All planned! Logo, colors, and custom domain support coming.', NOW() - INTERVAL '23 days');
  END IF;

  -- API comments
  IF post_api IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_api, user_devops_dan, 'What endpoints are planned? At minimum need to list posts and votes.', NOW() - INTERVAL '40 days'),
      (post_api, leanvote_owner_id, 'Full REST API covering posts, votes, comments, and users. Plus webhooks for real-time events.', NOW() - INTERVAL '38 days'),
      (post_api, user_quietcoder, 'graphql would be nice but rest is fine too', NOW() - INTERVAL '22 days'),
      (post_api, user_techbro99, 'rest is fine. dont overcomplicate it', NOW() - INTERVAL '20 days');
  END IF;

  -- =============================================================================
  -- Comments on OPEN features
  -- =============================================================================

  -- Search comments
  IF post_search IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_search, user_codemonkey_dev, 'yes please. scrolling through 50+ items is painful', NOW() - INTERVAL '30 days'),
      (post_search, user_luna_ux, 'Filter + search combo would be ideal', NOW() - INTERVAL '25 days'),
      (post_search, user_jen_product, 'Even just basic text search would help a lot', NOW() - INTERVAL '18 days');
  END IF;

  -- Discord comments (debate!)
  IF post_discord IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_discord, user_pixelninja, 'our whole community is on discord. this would be great', NOW() - INTERVAL '18 days'),
      (post_discord, user_devops_dan, 'Slack first please. Most companies use Slack not Discord.', NOW() - INTERVAL '15 days'),
      (post_discord, user_dragonflame67, 'depends on your audience. gaming/crypto = discord, b2b = slack', NOW() - INTERVAL '12 days'),
      (post_discord, user_luna_ux, 'both would be nice eventually!', NOW() - INTERVAL '8 days');
  END IF;

  -- Safari bug comments
  IF post_safari IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_safari, user_sarah_designs, 'Can confirm, seeing this too on Safari 17.2', NOW() - INTERVAL '10 days'),
      (post_safari, leanvote_owner_id, 'Thanks for reporting! Could you check browser console when this happens?', NOW() - INTERVAL '9 days'),
      (post_safari, user_codemonkey_dev, 'no errors. just doesnt render. refresh fixes it', NOW() - INTERVAL '7 days');
  END IF;

  -- Anonymous feedback comments (disagreement!)
  IF post_anon IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at) VALUES
      (post_anon, user_michael_t, 'Not sure about this. Anonymous feedback can get toxic real quick.', NOW() - INTERVAL '2 days'),
      (post_anon, user_priya_s, 'Disagree - people are more honest when anonymous. Especially for sensitive feedback.', NOW() - INTERVAL '2 days'),
      (post_anon, user_startupgrind42, 'Maybe make it board owner''s choice? Some products need it, others don''t.', NOW() - INTERVAL '1 day'),
      (post_anon, user_sarah_designs, 'Agreed with making it optional. Would use it for internal feedback boards.', NOW() - INTERVAL '12 hours');
  END IF;

  RAISE NOTICE 'Comments added successfully!';
END $$;

-- =============================================================================
-- Verification
-- =============================================================================
SELECT 
  p.title,
  p.status,
  pr.full_name as posted_by,
  (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id) as votes,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments
FROM posts p
JOIN profiles pr ON p.user_id = pr.id
JOIN profiles owner ON p.board_owner_id = owner.id
WHERE owner.board_slug = 'leanvote'
ORDER BY p.updated_at DESC
LIMIT 25;
