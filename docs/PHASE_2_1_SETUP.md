# Phase 2.1: Supabase Auth Setup - Manual Configuration Required

## ✅ Completed (Code)

1. **Supabase Client Utilities Created:**
   - `src/lib/supabase/client.ts` - Browser client
   - `src/lib/supabase/server.ts` - Server client
   - `src/lib/supabase/admin.ts` - Admin client (service role)
   - `src/lib/supabase/middleware.ts` - Middleware for session refresh

2. **Middleware Configured:**
   - `src/middleware.ts` - Automatic session refresh on all routes

3. **Auth Routes Created:**
   - `/auth/callback` - Handles auth redirects (email confirmation, etc.)
   - `/auth/error` - Error page for failed auth attempts

4. **Helper Functions:**
   - `src/lib/utils/url.ts` - URL helpers for redirects

5. **Environment Variables:**
   - Added `NEXT_PUBLIC_SITE_URL` to .env.local and Netlify

## 🔧 TODO: Manual Configuration in Supabase Dashboard

### Step 1: URL Configuration

Open: https://supabase.com/dashboard/project/itygyugblzjrediyidol/auth/url-configuration

**Site URL:**
```
https://clubifymk.netlify.app
```

**Redirect URLs (add all three):**
```
http://localhost:3000/**
https://clubifymk.netlify.app/**
https://*--clubifymk.netlify.app/**
```

### Step 2: Enable Email Auth

Open: https://supabase.com/dashboard/project/itygyugblzjrediyidol/auth/providers

1. Click on "Email" provider
2. Enable the following:
   - ✅ Enable email provider
   - ✅ Confirm email (require verification)
   - ✅ Secure email change

### Step 3: Customize Email Templates

Open: https://supabase.com/dashboard/project/itygyugblzjrediyidol/auth/templates

See `docs/SUPABASE_AUTH_CONFIG.md` for full email template HTML.

**Quick templates to update:**
1. **Confirm Signup** - Subject: "Verify Your Clubify.mk Account"
2. **Reset Password** - Subject: "Reset Your Clubify.mk Password"
3. **Change Email** - Subject: "Confirm Your New Email Address"
4. **Magic Link** - Subject: "Your Clubify.mk Magic Link"

### Step 4: Configure Rate Limits

Open: https://supabase.com/dashboard/project/itygyugblzjrediyidol/auth/rate-limits

**Recommended:**
- Email/SMS OTP: 10 requests/hour
- Password sign-ins: 30 requests/hour
- Password recovery: 5 requests/hour
- Token refresh: 150 requests/hour
- User creation: 50 requests/hour

### Step 5: Test Authentication

Open: https://supabase.com/dashboard/project/itygyugblzjrediyidol/auth/users

1. Click "Add User"
2. Create a test user: `test@clubifymk.test`
3. Set a password
4. Note: For now, auto-confirm the email since we don't have login UI yet

## Next Steps (Phase 2.2)

After completing the manual configuration above:
- [ ] Build login page UI
- [ ] Build signup page UI
- [ ] Build password reset UI
- [ ] Test full authentication flows

## Reference

Full configuration details: `docs/SUPABASE_AUTH_CONFIG.md`
