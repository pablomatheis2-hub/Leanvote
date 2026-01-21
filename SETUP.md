# LeanVote Setup Guide

## Prerequisites

- Node.js 18+
- A Supabase account ([supabase.com](https://supabase.com))

## 1. Environment Variables

Create a `.env.local` file in the project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project:
- Go to Project Settings > API
- Copy the **Project URL** and **anon public** key

## 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `supabase/schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** to execute the schema

This will create:
- `profiles` table (linked to auth.users)
- `posts` table (feedback posts with category and status)
- `votes` table (prevents double voting)
- All necessary indexes, triggers, and RLS policies

## 3. Enable Authentication

In your Supabase dashboard:
1. Go to **Authentication** > **Providers**
2. Enable your preferred auth providers (Email, Google, GitHub, etc.)
3. Configure redirect URLs if using OAuth

## 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Schema Overview

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with `full_name`, `avatar_url`, `is_admin` |
| `posts` | Feedback posts with `title`, `description`, `category`, `status` |
| `votes` | Join table linking users to posts (unique constraint prevents double voting) |

### Categories
- Feature
- Bug
- Integration

### Statuses
- Open
- Planned
- In Progress
- Complete

### RLS Policies

| Action | Permission |
|--------|------------|
| Read posts | Public (everyone) |
| Create posts | Authenticated users only |
| Edit post description | Post author only |
| Update post status | Admins only (`is_admin = true`) |
| Vote on posts | Authenticated users only |

## Making a User Admin

To make a user an admin, run this SQL in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = 'user-uuid-here';
```

Or to find and update by email:

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
```
