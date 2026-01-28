# Authentication Setup for Blog Quote App

This document provides instructions for setting up authentication for the Blog Quote App using NextAuth.js with Google and Facebook OAuth providers.

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

## Setting Up OAuth Providers

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add your app name
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production URL (if deployed)
8. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-production-url.com/api/auth/callback/google` (for production)
9. Click "Create" and note your Client ID and Client Secret

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product to your app
4. In the settings for Facebook Login:
   - Add `http://localhost:3000` as a valid OAuth redirect URI
   - Add `https://your-production-url.com` for production
5. In the app settings, note your App ID and App Secret

## MongoDB Setup

1. Create a MongoDB Atlas account or use an existing one
2. Create a new cluster or use an existing one
3. In the "Database Access" section, create a new database user with read/write permissions
4. In the "Network Access" section, allow access from your IP address or from anywhere (0.0.0.0/0)
5. Get your connection string from the "Connect" button on your cluster
6. Replace `<username>`, `<password>`, and `<dbname>` in the connection string

## NextAuth Secret

Generate a secure random string for NEXTAUTH_SECRET using:

```bash
openssl rand -base64 32
```

## Testing Authentication

After setting up the environment variables and providers:

1. Start your development server: `npm run dev`
2. Navigate to `/login` or `/register` in your application
3. Test both social login buttons and email/password authentication

## Additional Configuration

- The authentication system is set up with the following features:
  - Google and Facebook OAuth login
  - Email/password credentials login
  - User sessions with JWT
  - MongoDB adapter for user persistence
  - Custom pages for sign-in, sign-out, and errors
  - User roles (user, admin)

- The session includes:
  - User ID
  - User role
  - User email
  - User name
  - User image (if available from OAuth provider)

## Troubleshooting

- If social login fails, check that your OAuth credentials are correct and that the redirect URIs are properly configured
- If you see database connection errors, verify your MongoDB connection string and network access settings
- For JWT errors, ensure your NEXTAUTH_SECRET is properly set
- Check browser console for client-side errors
- Check server logs for backend errors
