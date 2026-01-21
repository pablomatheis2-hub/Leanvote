# Authentication & Stripe Setup Guide

## 1. Supabase Authentication Setup

### Enable GitHub OAuth

1. Go to your **GitHub Settings** > **Developer settings** > **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: LeanVote
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**

6. In **Supabase Dashboard** > **Authentication** > **Providers** > **GitHub**:
   - Toggle **Enable**
   - Paste your **Client ID** and **Client Secret**
   - Save

### Enable Google OAuth

1. Go to **Google Cloud Console** > **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Fill in:
   - **Name**: LeanVote
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `https://YOUR_PROJECT_REF.supabase.co`
   - **Authorized redirect URIs**: 
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
5. Click **Create** and copy the **Client ID** and **Client Secret**

6. In **Supabase Dashboard** > **Authentication** > **Providers** > **Google**:
   - Toggle **Enable**
   - Paste your **Client ID** and **Client Secret**
   - Save

### Enable Email/Password (Optional)

1. In **Supabase Dashboard** > **Authentication** > **Providers** > **Email**
2. Toggle **Enable Email provider**
3. Configure options:
   - **Confirm email**: Enable for production
   - **Secure email change**: Enable

### Configure Redirect URLs

1. In **Supabase Dashboard** > **Authentication** > **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (production)

---

## 2. Stripe Setup

### Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification

### Get API Keys

1. Go to **Developers** > **API Keys**
2. Copy:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

### Create Products & Prices

#### For Lifetime Deal (Early Bird):

1. Go to **Products** > **Add product**
2. Fill in:
   - **Name**: Lifetime Access
   - **Description**: One-time payment, unlimited access forever
3. Under **Pricing**:
   - **Pricing model**: One-time
   - **Price**: $49.00 (or your preferred price)
4. Save and copy the **Price ID** (starts with `price_`)

#### For Subscription (Later):

1. Go to **Products** > **Add product**
2. Fill in:
   - **Name**: Pro Plan
   - **Description**: Monthly subscription with all features
3. Under **Pricing**:
   - **Pricing model**: Recurring
   - **Price**: $9.00/month
   - **Billing period**: Monthly
4. Save and copy the **Price ID**

### Set Up Webhook

1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Fill in:
   - **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`)

### For Local Development

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret it displays

---

## 3. Environment Variables

Add these to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_LIFETIME_PRICE_ID=price_...
STRIPE_SUBSCRIPTION_PRICE_ID=price_...

# Pricing Mode: 'lifetime' or 'subscription'
PRICING_MODE=lifetime
```

---

## 4. Database Setup

Run the purchases schema in Supabase SQL Editor:

1. Open `supabase/schema-purchases.sql`
2. Copy contents to SQL Editor
3. Run

---

## 5. Switching from Lifetime to Subscription

When you're ready to switch from lifetime deals to subscriptions:

1. Update your `.env.local`:
   ```env
   PRICING_MODE=subscription
   ```

2. Redeploy your application

That's it! The pricing component will automatically show subscription pricing.

---

## 6. Testing

### Test OAuth Login

1. Start dev server: `npm run dev`
2. Click "Log in" > "Continue with GitHub" or "Continue with Google"
3. Authorize the app
4. You should be redirected back and logged in

### Test Stripe (Test Mode)

1. Start Stripe CLI webhook forwarding
2. Click upgrade/purchase button
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC
5. Complete purchase
6. Check Supabase `purchases` table for new record

### Test Cards

| Scenario | Card Number |
|----------|-------------|
| Success | 4242 4242 4242 4242 |
| Decline | 4000 0000 0000 0002 |
| Requires Auth | 4000 0025 0000 3155 |

---

## Troubleshooting

### OAuth Redirect Issues

- Ensure redirect URLs match exactly in Supabase config
- Check that `NEXT_PUBLIC_SITE_URL` is correct
- Verify OAuth app callback URL includes Supabase project ref

### Stripe Webhook Failures

- Check webhook signing secret is correct
- Ensure webhook URL is publicly accessible (use ngrok for local)
- Check Stripe dashboard for failed webhook attempts

### "User already has active plan" Error

- Check `purchases` table for existing records
- Delete test records if needed during development
