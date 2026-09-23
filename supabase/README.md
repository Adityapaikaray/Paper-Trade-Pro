# TradePro Supabase Project Integration Guide
**Project Reference:** `ccnkvydgdrvzxfygkfjm`  
**Project URL:** `https://ccnkvydgdrvzxfygkfjm.supabase.co`

---

## 1. Environment Variables Setup
On the frontend, only public anonymous / publishable keys are permitted.
In your `.env` file (or deployment environment configuration):

```bash
VITE_SUPABASE_URL=https://ccnkvydgdrvzxfygkfjm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key_here
```

> **Security Requirements:**
> - Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or client-side files.
> - Never embed the PostgreSQL connection string or database password into frontend bundles.

---

## 2. Supabase Auth Configuration (Dashboard)
1. Go to your Supabase Project: https://supabase.com/dashboard/project/ccnkvydgdrvzxfygkfjm
2. Navigate to **Authentication** -> **Providers** -> **Email**:
   - Enable Email Provider: **ON**
   - Confirm email: **ON** (or default)
   - Secure email change: **ON**
3. Navigate to **Authentication** -> **Email Templates** -> **Magic Link** / **Confirmation**:
   - **Subject:** `Your TradePro verification code`
   - **Body:** Paste the contents of `supabase/email_template.html`.
   - Ensure the token variable `{{ .Token }}` is present so Supabase delivers the 6-digit one-time code.

---

## 3. Database Schema & Row Level Security (RLS)
1. Navigate to **SQL Editor** -> **New query**.
2. Open and paste `supabase/schema.sql`.
3. Click **Run**.

This provisions:
- `public.profiles` linked to `auth.users(id)` with RLS policies (`auth.uid() = id`).
- User-owned tables: `user_portfolios`, `user_watchlists`, `user_goals`, `user_preferences`, `user_wealth_data`, `user_paper_trades`, `user_ai_preferences`.
- Auto-provisioning trigger `on_auth_user_created` that populates `public.profiles` when new users authenticate via Email OTP.

---

## 4. Authentication Flow Summary
- **User enters email:** `signInWithOtp({ email, options: { shouldCreateUser: true } })`
- **User enters 6-digit OTP:** `verifyOtp({ email, token, type: 'email' })`
- **Authenticated Session:** Automatically saved in `localStorage` under `tradepro-supabase-auth` with auto-refresh token enabled.
- **Route Protection:** Directs unauthenticated requests on protected routes (`/portfolio`, `/trade`, `/wealth`, `/heatmap`, `/watchlist`, `/goals`, `/analytics`, `/settings`, etc.) to `/login` with clean redirect-back handling.
