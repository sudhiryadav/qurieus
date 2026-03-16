# Google Sign-In Setup

Google Sign-In is integrated. The "Sign in with Google" button appears on the sign-in and sign-up pages. To activate it, add OAuth credentials from Google Cloud Console (one-time setup).

## One-time setup (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing one
3. Enable **Google+ API** (or **Google Identity Services**)
4. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
5. Configure the **OAuth consent screen** if prompted (External user type is fine for most apps)
6. Create **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:8000` (development)
     - `https://qurieus.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:8000/api/auth/callback/google`
     - `https://qurieus.com/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret**

## Environment variables

Add to your `.env`:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**Optional** – If you see "Email already used with another provider" in production (e.g. when using different OAuth clients for dev/staging/prod, or after Google passkey changes):

```
NEXTAUTH_ALLOW_EMAIL_ACCOUNT_LINKING=true
```

This allows linking Google OAuth to existing users by email. It is automatically enabled in development.

Restart the app after adding these variables.
