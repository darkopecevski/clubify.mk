# Supabase Auth Configuration

This document outlines the auth configuration settings for Clubify.mk in Supabase Dashboard.

## URL Configuration

Navigate to: **Authentication > URL Configuration**

### Site URL
Set to production URL:
```
https://clubifymk.netlify.app
```

### Redirect URLs
Add the following allowed redirect URLs:

**Local Development:**
```
http://localhost:3000/**
```

**Production:**
```
https://clubifymk.netlify.app/**
```

**Netlify Preview Deployments:**
```
https://*--clubifymk.netlify.app/**
```

## Email Auth Provider

Navigate to: **Authentication > Providers > Email**

### Settings:
- ✅ Enable email provider
- ✅ Confirm email: **ENABLED** (users must verify email before logging in)
- ✅ Secure email change: **ENABLED** (require verification for email changes)

## Email Templates

Navigate to: **Authentication > Email Templates**

### 1. Confirm Signup Template

**Subject:** `Verify Your Clubify.mk Account`

**Body:**
```html
<h2>Welcome to Clubify.mk!</h2>
<p>Hi there,</p>
<p>Thanks for signing up for Clubify.mk. Please verify your email address to complete your registration.</p>
<p><a href="{{ .ConfirmationURL }}">Verify your email</a></p>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create this account, you can safely ignore this email.</p>
<br>
<p>Best regards,<br>The Clubify.mk Team</p>
```

### 2. Reset Password Template

**Subject:** `Reset Your Clubify.mk Password`

**Body:**
```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>We received a request to reset your Clubify.mk password.</p>
<p><a href="{{ .ConfirmationURL }}">Reset your password</a></p>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
<br>
<p>Best regards,<br>The Clubify.mk Team</p>
```

### 3. Change Email Address Template

**Subject:** `Confirm Your New Email Address`

**Body:**
```html
<h2>Confirm Email Change</h2>
<p>Hi there,</p>
<p>You requested to change your email address on Clubify.mk.</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your new email</a></p>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't request this change, please contact us immediately.</p>
<br>
<p>Best regards,<br>The Clubify.mk Team</p>
```

### 4. Magic Link Template

**Subject:** `Your Clubify.mk Magic Link`

**Body:**
```html
<h2>Your Magic Link</h2>
<p>Hi there,</p>
<p>Here's your magic link to sign in to Clubify.mk:</p>
<p><a href="{{ .ConfirmationURL }}">Sign in with Magic Link</a></p>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this magic link, you can safely ignore this email.</p>
<br>
<p>Best regards,<br>The Clubify.mk Team</p>
```

## Rate Limits

Navigate to: **Authentication > Rate Limits**

### Recommended Settings:
- **Email/SMS OTP:** 10 requests per hour
- **Password sign-ins:** 30 requests per hour
- **Password recovery:** 5 requests per hour
- **Token refresh:** 150 requests per hour
- **User creation:** 50 requests per hour

## Security Settings

Navigate to: **Authentication > Policies**

### Recommended:
- **Minimum password strength:** Good (recommended)
- **Password requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number

## Auth Hooks (Optional)

Navigate to: **Authentication > Hooks** (BETA)

These can be configured later for:
- Custom validation logic
- User metadata enrichment
- Third-party integrations

## Configuration Checklist

- [ ] Site URL set to `https://clubifymk.netlify.app`
- [ ] Redirect URLs added (localhost + production + previews)
- [ ] Email provider enabled with confirmation required
- [ ] Email templates customized (Confirm Signup, Reset Password, Change Email, Magic Link)
- [ ] Rate limits configured
- [ ] Password policies set

## Testing

After configuration:
1. Create a test user in **Authentication > Users > Add User**
2. Verify email confirmation works
3. Test password reset flow
4. Test login/logout
5. Test token refresh
