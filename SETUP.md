# Link-in-bio setup (Supabase)

This feature adds login-protected link-in-bio pages backed by Supabase (Auth +
Postgres + Storage). There is **no public sign-up** — you create every account
yourself. Follow these steps once per environment.

## 1. Create the Supabase project and get the keys

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secret — server only)
3. Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```
   Also set:
   - `ADMIN_EMAILS` — comma-separated emails allowed to use the admin tool (your login email).
   - `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` locally, your real domain in production.

   `.env.local` is gitignored; never commit real keys.

## 2. Run the SQL migrations and create the storage bucket

In the Supabase dashboard open **SQL Editor** and run, in order:

1. `supabase/migrations/0001_init.sql` — tables, triggers, RLS, and the
   `username_available` function.
2. `supabase/migrations/0002_storage.sql` — creates the public **`avatars`**
   bucket and its per-user access policies.

Both are idempotent, so re-running them is safe.

## 3. Turn OFF public sign-up

**Authentication → Sign In / Providers** (or **Authentication → Settings**) →
disable **"Allow new users to sign up"**. This ensures only accounts you create
can exist. (Row Level Security still protects data regardless, but this closes
the sign-up endpoint entirely.)

## 4. Add a user

**Authentication → Users → Add user**:

- Enter their email and a temporary password.
- Tick **Auto Confirm User** so they can log in immediately.
- Share the temporary password with them. On first login they will be asked to
  **claim a username** (their `/u/<username>` page), then land on the editor.
  They can change their password from the dashboard afterwards.

A matching row in `public.profiles` is created automatically by a database
trigger the moment the auth user is added.

## 5. Set the password-reset redirect URL

**Authentication → URL Configuration**:

- **Site URL**: your site origin (e.g. `http://localhost:3000` or your domain).
- **Redirect URLs**: add the reset-password page for every environment you use:
  - `http://localhost:3000/auth/reset`
  - `https://<your-domain>/auth/reset`

The "Forgot password" flow emails a link that returns the user to `/auth/reset`,
where they set a new password.

## 6. Write the NFC tag

Once a user has claimed their username and saved their page, write this URL to
the NFC tag (any NFC-writer app):

```
https://<your-site>/u/<username>
```

Tapping the tag opens their public page. If they later change their username,
old tags keep working — the old username redirects to the new one.

---

### Environment variables reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Public anon key (RLS-guarded) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Admin password tool; never exposed to browser |
| `ADMIN_EMAILS` | server | Comma-separated admin emails |
| `NEXT_PUBLIC_SITE_URL` | client + server | Canonical site URL for OG tags / vCard / reset links |
