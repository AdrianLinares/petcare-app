# Quick Start Guide - Netlify Serverless

## 🚀 Get Started in 5 Steps

### 1. Install Dependencies

```bash
npm run install:all
# This installs dependencies for frontend and serverless functions
```

### 2. Configure Environment

Copy the example file and adjust values for your environment:

```bash
cp .env.example .env
```

The `.env.example` file documents the required variables.
Keep `.env.example` in sync whenever new variables are added.
Example:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/petcare_db
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:8888
NODE_ENV=development
```

### 3. Set Up Database Schema (LOCAL DEV)

For **local development**, the app uses `localStorage` automatically, so this step is optional.

For **production or to use a real database locally**:

```bash
# Apply schema first
psql "$DATABASE_URL" -f schema.sql

# Optionally load test data
psql "$DATABASE_URL" -f seed-database-fixed.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Visit **http://localhost:8888**

### 5. (Optional) Review Database Schema

Check that schema is correct:
- See [schema.sql](./schema.sql) for complete table definitions
- See [DATABASE_SCHEMA_VERIFICATION.md](./DATABASE_SCHEMA_VERIFICATION.md) for verification report

## Demo Credentials

- **Elevated Admin:** `admin@petcare.com` / `password123`
- **Veterinarian:** `vet@petcare.com` / `password123`
- **Pet Owner:** `owner@petcare.com` / `password123`

## Common Commands

```bash
# Development
npm run dev                    # Start Netlify Dev server
npx netlify dev                # Alternative command

# Build
npm run build                  # Build frontend for production

# Deployment
npx netlify deploy             # Preview deployment
npx netlify deploy --prod      # Production deployment
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
- Check function logs: `npx netlify logs`
- Verify environment variables are set in Netlify dashboard

**Build fails?**
- Clear cache: `rm -rf node_modules netlify/functions/node_modules frontend/node_modules`
- Reinstall: `npm run install:all`
