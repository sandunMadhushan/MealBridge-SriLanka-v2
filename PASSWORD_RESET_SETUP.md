# Password Reset Configuration Guide

## Issue Fixed ✅

The password reset emails were redirecting to the home page instead of the reset password page in production (Netlify). This has been resolved with automatic token detection and redirection.

## Solution Implemented

The issue was that Supabase was redirecting users to the home page (`/`) with auth tokens in the URL, instead of going directly to `/reset-password`. The solution includes:

1. **Environment-aware redirect URLs** in `ForgotPassword.tsx`
2. **Enhanced token extraction** in `ResetPassword.tsx` (handles both query params and URL hash)
3. **Auto-redirect component** (`AuthTokenRedirect.tsx`) that detects tokens on home page and redirects to reset page
4. **Updated Supabase settings** (as shown in your screenshot)

## Solution

### 1. Update Supabase Auth Settings

Go to your Supabase Dashboard → Authentication → Settings → Email Auth:

**Site URL:** Set this to your production URL when deployed, for development use:

```
http://localhost:3000
```

**Redirect URLs:** Add these URLs to allow password reset redirects:

```
http://localhost:3000/reset-password
http://localhost:3000/**
```

### 2. Email Link Validity

In the same Auth Settings section:

- **Email link validity:** Set to a reasonable time like `3600` seconds (1 hour)
- This prevents the "otp_expired" error

### 3. Email Templates (Optional)

Go to Authentication → Email Templates → Reset Password:

Update the template to use the correct redirect URL:

```html
<h2>Reset Your Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p>
  <a
    href="{{ .SiteURL }}/reset-password?access_token={{ .TokenHash }}&type=recovery"
    >Reset Password</a
  >
</p>
```

### 4. Testing the Flow

1. Navigate to `/forgot-password`
2. Enter your email address
3. Check your email for the reset link
4. Click the link - it should take you to `/reset-password`
5. Enter your new password
6. You should be redirected to login

### 5. Environment Variables

Make sure your `.env` file has the correct Supabase URLs:

```
VITE_SUPABASE_URL=https://yvwjralcrhqilwbwcume.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Files Updated

1. `src/pages/ForgotPassword.tsx` - Now includes proper redirectTo parameter
2. `src/pages/ResetPassword.tsx` - New component to handle password reset
3. `src/App.tsx` - Added route for `/reset-password`

## How It Works

1. User requests password reset → email sent with link to `/reset-password`
2. Link contains access tokens in URL parameters
3. ResetPassword component extracts tokens and sets the session
4. User can then update their password using `supabase.auth.updateUser()`
5. On success, redirects to login page
