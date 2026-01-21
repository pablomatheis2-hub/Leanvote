# LeanVote Setup Guide

## Overview

LeanVote is a feedback board SaaS where users can:
- Create their own feedback board with a unique shareable URL
- Get a 7-day free trial upon signup
- Upgrade to lifetime access for $49 (one-time payment via Stripe)
- Share their board with users who can submit feedback and vote

## Prerequisites

- Node.js 18+
- A Supabase account ([supabase.com](https://supabase.com))
- A Stripe account ([stripe.com](https://stripe.com))

## 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_or_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_LIFETIME_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_xxx

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Getting the values:

**Supabase:**
1. Go to your Supabase project dashboard
2. Navigate to Project Settings > API
3. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

**Stripe:**
1. Go to Stripe Dashboard > Developers > API keys
2. Copy your Secret key → `STRIPE_SECRET_KEY`
3. Copy your Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Create a product with a one-time price of $49
5. Copy the Price ID → `STRIPE_LIFETIME_PRICE_ID`
6. Set up a webhook endpoint at `/api/stripe/webhook` and copy the signing secret → `STRIPE_WEBHOOK_SECRET`

## 2. Database Setup

### Fresh Install

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the contents of `supabase/schema.sql`
4. Run the contents of `supabase/schema-purchases.sql`

### Upgrading from v1

If you have an existing database, run:
```
supabase/migrate-v2.sql
```

This will:
- Add multi-tenancy columns to profiles
- Add board_owner_id to posts
- Set up trial periods for existing users
- Update RLS policies

## 3. Enable Authentication

In your Supabase dashboard:

1. Go to **Authentication** > **Providers**
2. Enable **Email** (for email/password auth)
3. Enable **GitHub**:
   - Create a GitHub OAuth app at https://github.com/settings/developers
   - Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase
4. Enable **Google**:
   - Create OAuth credentials at https://console.cloud.google.com/
   - Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

## 4. Stripe Webhook Setup

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `charge.refunded`
4. Copy the webhook signing secret to your environment

For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 5. Run the Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

### User Types

There are two types of users:

1. **Voters** - Public users who sign up to vote and submit feedback on someone else's board
   - Free forever
   - Can vote on any board
   - Can submit feedback to any board
   - No trial or time limit

2. **Admins** (Board Owners) - Users who create their own feedback board
   - Get a 7-day free trial upon upgrading
   - Can create posts, manage roadmap, customize their board
   - After trial expires, need to purchase lifetime access ($49)

### User Flow

1. **Sign Up**: New users sign up and see an onboarding screen
2. **Choose Path**: 
   - "Vote & Give Feedback" → Becomes a **Voter** (free forever)
   - "Create a Feedback Board" → Becomes an **Admin** (7-day trial)
3. **Admins**: Can manage their dashboard, share their board URL
4. **Voters**: Can browse boards and vote/submit feedback
5. **Upgrade**: Voters can upgrade to Admin anytime via `/upgrade`

### Access Control

| User Type | Can Create Posts | Can Vote | Can View Board | Trial |
|-----------|-----------------|----------|----------------|-------|
| Admin (trial active) | ✓ | ✓ | ✓ | 7 days |
| Admin (trial expired) | ✗ | ✓ | ✓ | - |
| Admin (lifetime access) | ✓ | ✓ | ✓ | - |
| Voter (any) | ✗ | ✓ | ✓ | None needed |
| Not logged in | ✗ | ✗ | ✓ | - |

### URLs

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/auth/login` | Login/signup page |
| `/onboarding` | Choose user type (voter or admin) |
| `/upgrade` | Upgrade from voter to admin |
| `/dashboard` | Admin dashboard (board owners only) |
| `/dashboard/roadmap` | Kanban roadmap management |
| `/dashboard/settings` | Board settings & subscription |
| `/b/[slug]` | Public feedback board |
| `/b/[slug]/roadmap` | Public roadmap view |
| `/b/[slug]/changelog` | Public changelog |

## Schema Overview

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with board settings, trial dates, access status |
| `posts` | Feedback posts with category, status, board owner reference |
| `votes` | Join table for votes (unique per user per post) |
| `purchases` | Stripe purchase records for lifetime access |

### Categories
- Feature
- Bug
- Integration

### Statuses
- Open
- Planned
- In Progress
- Complete

## Granting Lifetime Access Manually

To manually grant a user lifetime access (e.g., for testing):

```sql
UPDATE public.profiles
SET has_lifetime_access = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

## Troubleshooting

### Webhook not receiving events
- Check that your webhook URL is publicly accessible
- Verify the webhook secret is correct
- Check Stripe webhook logs for errors

### OAuth redirect issues
- Ensure `NEXT_PUBLIC_SITE_URL` matches your actual domain
- Check that callback URLs are configured correctly in providers

### Trial not working
- Ensure `trial_ends_at` is set correctly in the profiles table
- Check that `has_active_access` function exists and returns correct values
