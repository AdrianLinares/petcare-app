# Deploy PetCare to Railway (FREE)

Railway offers **$5 free credit per month** - enough for small projects.

## Step-by-Step Guide

### 1. Create Railway Account
1. Go to https://railway.app
2. Click **"Login"** → Sign in with GitHub
3. You'll get $5 free credit monthly (no credit card required initially)

### 2. Deploy PostgreSQL Database

1. Click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Database will be created automatically
4. Copy the **`DATABASE_URL`** from the database settings (you'll need this)

### 3. Deploy Backend API

1. In the same project, click **"New"** → **"GitHub Repo"**
2. Connect your `petcare-app-v1` repository
3. Railway will detect the `railway.json` config

### 4. Configure Root Directory

1. Click on your backend service
2. Go to **Settings** tab
3. Under **"Root Directory"**, enter: `backend`
4. Click **"Update"**

### 5. Add Environment Variables

In the backend service, go to **Variables** tab and add:

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-netlify-url.netlify.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=PetCare <noreply@petcare.com>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**To link the database automatically:**
- Railway provides `${{Postgres.DATABASE_URL}}` variable
- Just use that exact syntax for DATABASE_URL

### 6. Run Database Migrations

1. In your backend service, go to **Settings**
2. Under **Deploy**, add to **Build Command**:
   ```
   npm install && npm run build && npm run migrate
   ```
3. Redeploy

### 7. Get Your Backend URL

After deployment:
1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://petcare-api-production.up.railway.app`)

### 8. Update Netlify Environment Variable

1. Go to your Netlify dashboard
2. **Site configuration** → **Environment variables**
3. Update `VITE_API_URL`:
   ```
   https://your-railway-app.up.railway.app/api
   ```
4. Redeploy Netlify

### 9. Update Railway CORS Settings

Go back to Railway backend service variables and update:
```
FRONTEND_URL=https://your-netlify-url.netlify.app
```

---

## Alternative: Use Supabase (Database Only)

If you want a **completely free database**:

### 1. Deploy Database to Supabase
1. Go to https://supabase.com
2. Create new project (free forever)
3. Get connection string from Settings → Database

### 2. Deploy Backend to Railway (Without DB)
Use Railway just for the Node.js API, connect to Supabase PostgreSQL

---

## Alternative: Netlify Functions (Serverless)

This requires **refactoring your Express API** to serverless functions.

**Pros:**
- Completely free
- Auto-scales

**Cons:**
- Requires code changes
- More complex setup
- No persistent PostgreSQL (need external DB)

Would you like me to help you refactor to Netlify Functions?

---

## Cost Comparison

| Service | Free Tier | Database | Best For |
|---------|-----------|----------|----------|
| **Railway** | $5/month credit | PostgreSQL included | Full-stack apps |
| **Render** | 750 hours/month | PostgreSQL included | Production apps |
| **Fly.io** | 3 VMs free | PostgreSQL extra | Docker apps |
| **Supabase** | 500MB database | PostgreSQL only | Database only |
| **Netlify Functions** | 125K requests/month | Need external DB | Serverless APIs |

---

## Troubleshooting

**Railway deployment failing?**
- Check build logs in Railway dashboard
- Verify `backend/` directory structure is correct
- Ensure all dependencies are in `backend/package.json`

**Database connection errors?**
- Verify `DATABASE_URL` environment variable is set
- Check that migrations ran successfully (look at build logs)

**CORS errors?**
- Ensure `FRONTEND_URL` matches your Netlify URL exactly
- Include `https://` in the URL

---

## Check if Backend is Running

Visit: `https://your-railway-app.up.railway.app/health`

Should return:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## Need Help?

- Railway docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
