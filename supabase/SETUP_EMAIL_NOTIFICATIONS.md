# Email Notification Setup

Sends you an email whenever a player RSVPs, updates, or drops out.

## 1 — Get a free Resend API key

1. Go to [resend.com](https://resend.com) and create a free account
2. In the dashboard → **API Keys** → **Create API Key**
3. Copy the key (starts with `re_`)

## 2 — Deploy the Edge Function

### Option A: Supabase CLI (recommended)

```bash
# Install CLI if you don't have it
npm install -g supabase

# Log in
supabase login

# Link to your project (find ref in Supabase → Project Settings → General)
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set NOTIFY_EMAIL=your@email.com

# Deploy the function
supabase functions deploy notify-email --no-verify-jwt
```

### Option B: Supabase Dashboard

1. Go to **Edge Functions** in your Supabase dashboard
2. Click **New Function** → name it `notify-email`
3. Paste the contents of `functions/notify-email/index.ts`
4. Go to **Settings → Edge Function Secrets** and add:
   - `RESEND_API_KEY` = your Resend key
   - `NOTIFY_EMAIL` = the email address to notify

## 3 — Create the Database Webhook

In your Supabase dashboard:

1. Go to **Database → Webhooks**
2. Click **Create a new hook**
3. Fill in:
   - **Name**: `attendance-email-notify`
   - **Table**: `public.attendance`
   - **Events**: check ✅ INSERT, ✅ UPDATE, ✅ DELETE
   - **Type**: Supabase Edge Functions
   - **Edge Function**: select `notify-email`
4. Click **Confirm**

That's it. The next RSVP change will trigger an email.

## What the emails look like

- **New RSVP**: `⚽ Ahmed just joined the game` — Ahmed marked themselves as ✅ confirmed
- **Status change**: `🔄 Khalid changed: maybe → confirmed`
- **Drop out**: `❌ Omar dropped out`
