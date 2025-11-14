# Quick Start Guide - Netlify Serverless

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
./setup-netlify.sh
# OR manually:
npm install && cd frontend && npm install && cd ../netlify/functions && npm install
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

- **Super Admin:** `admin@petcare.com` / `password123`
- **Veterinarian:** `vet@petcare.com` / `password123`
- **Pet Owner:** `owner@petcare.com` / `password123`

## Common Commands

```bash
# Development
npm run dev                    # Start Netlify Dev server
netlify dev                    # Alternative command

# Database
npm run db:setup               # Run migrations + seed data
npm run db:migrate             # Run migrations only
npm run db:seed                # Seed data only

# Build
npm run build                  # Build for production

# Deployment
netlify deploy                 # Preview deployment
netlify deploy --prod          # Production deployment
```

## Project Structure

```
netlify/functions/     # Serverless API functions
frontend/              # React app
backend/               # Old Express backend (can archive)
```

## What Changed?

- ✅ API now runs on serverless functions (not Express)
- ✅ Local dev now uses `netlify dev` (not separate backend/frontend)
- ✅ Deploys to Netlify (not traditional hosting)
- ✅ Environment variables in root `.env` (not backend/.env)
- ✅ Frontend API URL: `http://localhost:8888/api` (was `http://localhost:3001/api`)

## Need Help?

- 📖 **Full deployment guide:** `NETLIFY_DEPLOYMENT.md`
- 📋 **Migration details:** `SERVERLESS_MIGRATION_SUMMARY.md`
- 🛠️ **Development guide:** `WARP.md`

## Troubleshooting

**Can't connect to database?**
- Check `.env` file exists in project root
- Verify DATABASE_URL or DB_* credentials
- Ensure PostgreSQL is running

**Functions not working?**
- Run `cd netlify/functions && npm install`
- Check function logs: `netlify logs`

**Build fails?**
- Clear cache: `rm -rf node_modules netlify/functions/node_modules frontend/node_modules`
- Reinstall: `npm run install:all`
