# Troubleshooting Guide - Netlify + Neon Deployment

## "An error occurred. Please try again." on Login

This generic error can have several causes. Follow these steps to diagnose:

### 1. Check Netlify Function Logs

```bash
# View real-time logs
netlify logs:function auth --follow

# Or check in Netlify Dashboard:
# Site → Functions → auth → Recent logs
```

**What to look for:**
- "CRITICAL: No database configuration found!" → Missing `DATABASE_URL`
- "Database query error:" → Database connection issue
- "password verification" or "User not found" → Logic working, check credentials
- No logs at all → Function not being invoked (check routing)

### 2. Verify Environment Variables

**Required in Netlify Dashboard (Site settings → Environment variables):**

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/petcare_db?sslmode=require
JWT_SECRET=<your-strong-random-secret>
FRONTEND_URL=https://your-site.netlify.app
NODE_ENV=production
```

**Test locally with Netlify CLI:**

```bash
# Create .env file in root (gitignored)
DATABASE_URL="your-neon-connection-string"
JWT_SECRET="test-secret-123"
FRONTEND_URL="http://localhost:8888"

# Run locally
netlify dev
```

### 3. Test Database Connection

**Connect to Neon from terminal:**

```bash
psql "postgresql://user:password@host.neon.tech/petcare_db?sslmode=require"

# Check if users table exists
\dt

# Check if there are any users
SELECT id, email, user_type FROM users LIMIT 5;
```

**If table doesn't exist**, run migrations:

```bash
# Upload schema to Neon
psql $DATABASE_URL < backend/database/schema.sql
```

### 4. Common Issues & Solutions

#### Issue: "Database connection timeout"
**Solution:** 
- Neon project may be paused (free tier auto-pauses after inactivity)
- Visit Neon dashboard to wake it up
- Or upgrade to paid tier for always-on database

#### Issue: "Too many connections"
**Solution:**
- Neon free tier has connection limits (100 connections)
- We've set `max: 5` in pool config to help with this
- Consider using Neon's connection pooler: `pooler.neon.tech` endpoint

#### Issue: "SSL/TLS error"
**Solution:**
- Ensure connection string has `?sslmode=require`
- Our code has `rejectUnauthorized: false` which should handle this

#### Issue: Function timeout (10 seconds)
**Solution:**
- Cold starts can be slow on free tier
- First request after inactivity will be slower
- Consider Netlify Pro for faster cold starts

### 5. Test Login with Sample User

**Create a test user directly in database:**

```sql
-- Connect to your Neon database first
INSERT INTO users (email, password_hash, full_name, phone, user_type)
VALUES (
  'test@example.com',
  '$2b$10$rBV2x9vNXz.Ld7yZ8kK3SeEd8cLF2JR5.H8b7mLEoQfxHOXEfk6e2', -- password: "Test1234"
  'Test User',
  '1234567890',
  'pet_owner'
);
```

Then try logging in with:
- Email: `test@example.com`
- Password: `Test1234`

### 6. Check Frontend Configuration

**Verify `frontend/.env.production`:**

```env
VITE_API_URL=/api
```

**In browser console (F12):**

```javascript
// Check if API calls are going to the right place
console.log(import.meta.env.VITE_API_URL); // Should be "/api"

// Check localStorage for errors
localStorage.getItem('token');
localStorage.getItem('currentUser');
```

### 7. CORS Issues

If you see CORS errors in browser console:

**Check Netlify function response headers** (in `utils/response.ts`):
```typescript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
```

**Check `netlify.toml` redirects:**
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 8. Enhanced Logging (Already Added)

The updated code now includes detailed logging:

1. **Request logging**: See incoming requests
2. **Database connection**: See pool initialization
3. **Login flow**: Step-by-step progress through login
4. **Environment checks**: Warnings for missing critical config

**View these logs in Netlify:**
```bash
netlify logs:function auth
```

### 9. Quick Deployment Test

**Test if functions are deployed correctly:**

```bash
# Test OPTIONS (CORS preflight)
curl -X OPTIONS https://your-site.netlify.app/api/auth/login

# Test login with dummy data
curl -X POST https://your-site.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}'

# Should return: {"error":"Invalid email or password"}
# Not a 500 error or timeout
```

### 10. Re-deploy with Logs

After checking all above:

```bash
# Commit your changes
git add .
git commit -m "Add enhanced logging for debugging"
git push

# Or manually trigger deploy in Netlify Dashboard

# Watch the build logs carefully for any errors
```

## Still Not Working?

**Collect this information:**

1. Full error from Netlify function logs
2. Browser console errors (F12)
3. Response from: `curl https://your-site.netlify.app/api/auth/login -v`
4. Confirmation that `DATABASE_URL` is set in Netlify
5. Confirmation that Neon database has the `users` table

Then share these details for more specific help.

## Success Checklist

- [ ] Netlify function logs show "Initializing database connection pool"
- [ ] No "CRITICAL" or "Database query error" in logs
- [ ] Environment variables set in Netlify Dashboard
- [ ] Database schema uploaded to Neon (`\dt` shows tables)
- [ ] At least one test user exists in database
- [ ] Can connect to Neon from local machine with `psql`
- [ ] `frontend/.env.production` has `VITE_API_URL=/api`
- [ ] `netlify.toml` redirects `/api/*` to functions

Once all checks pass, login should work! 🎉
