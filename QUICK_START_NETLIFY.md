# Quick Start Guide - Netlify Serverless

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm run install:all
# This installs dependencies for frontend and serverless functions
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/petcare_db
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:8888
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

Visit **http://localhost:8888**

## Demo Credentials

- **Elevated Admin:** `admin@petcare.com` / `password123`
- **Veterinarian:** `vet@petcare.com` / `password123`
- **Pet Owner:** `owner@petcare.com` / `password123`

## Common Commands

```bash
# Development
npm run dev                    # Start Netlify Dev server
netlify dev                    # Alternative command

# Build
npm run build                  # Build frontend for production

# Deployment
netlify deploy                 # Preview deployment
netlify deploy --prod          # Production deployment
```

## Project Structure

```
netlify/functions/     # Serverless API functions
frontend/              # React app
```

## What Changed?

- ✅ API now runs on serverless functions (Netlify Functions)
- ✅ Database is Neon PostgreSQL (serverless, managed)
- ✅ Local dev uses `netlify dev` (integrated development)
- ✅ Deploys to Netlify with automatic builds
- ✅ Environment variables in root `.env` file
- ✅ Frontend API URL: `http://localhost:8888/.netlify/functions` (local dev)

## Need Help?

- 📖 **Full deployment guide:** `NETLIFY_DEPLOYMENT.md`

## Troubleshooting

**Can't connect to database?**
- Check `.env` file exists in project root
- Verify DATABASE_URL points to your Neon database
- Test connection with: `psql $DATABASE_URL`

**Functions not working?**
- Run `npm run install:functions`
- Check function logs: `netlify logs`
- Verify environment variables are set in Netlify dashboard

**Build fails?**
- Clear cache: `rm -rf node_modules netlify/functions/node_modules frontend/node_modules`
- Reinstall: `npm run install:all`
