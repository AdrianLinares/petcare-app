# Netlify Deployment Guide

This guide will help you deploy the PetCare application to Netlify using serverless functions.

## Prerequisites

- A Netlify account (sign up at https://netlify.com)
- A PostgreSQL database (you can use services like Neon, Supabase, or Railway)
- Netlify CLI installed globally: `npm install -g netlify-cli`

## Local Development

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install function dependencies
cd ../netlify/functions && npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
# OR use individual variables:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=petcare_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:8888

# Node Environment
NODE_ENV=development
```

### 3. Set Up Database

```bash
# Run migrations and seed data
npm run db:setup
```

### 4. Run Local Development Server

```bash
# Start Netlify Dev (runs both frontend and serverless functions)
netlify dev
```

This will start:
- Frontend: http://localhost:8888
- Serverless functions: http://localhost:8888/.netlify/functions/*
- API routes (via redirects): http://localhost:8888/api/*

## Production Deployment

### 1. Connect Your Repository to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, Bitbucket)
4. Select your repository

### 2. Configure Build Settings

Netlify should automatically detect the `netlify.toml` configuration. Verify:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `../netlify/functions`

### 3. Set Environment Variables

Go to **Site settings** → **Environment variables** and add:

```
DATABASE_URL=<your_production_database_url>
JWT_SECRET=<your_production_jwt_secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<your_netlify_site_url>
NODE_ENV=production
```

**Important Security Notes:**
- Use a PostgreSQL database with SSL enabled in production
- Generate a strong, random JWT_SECRET (at least 32 characters)
- Never commit `.env` files to version control

### 4. Deploy

Push your code to the connected repository, and Netlify will automatically build and deploy.

You can also deploy manually:

```bash
# Build and deploy
netlify deploy --prod
```

### 5. Run Database Migrations

After initial deployment, you need to run migrations on your production database:

```bash
# Install dependencies and run migrations on your database host
# Or use a migration service/script
```

## API Routes

All API routes are automatically redirected to serverless functions:

- `/api/auth/*` → `/.netlify/functions/auth`
- `/api/users/*` → `/.netlify/functions/users`
- `/api/pets/*` → `/.netlify/functions/pets`
- `/api/appointments/*` → `/.netlify/functions/appointments`
- `/api/medical-records/*` → `/.netlify/functions/medical-records`
- `/api/vaccinations/*` → `/.netlify/functions/vaccinations`
- `/api/medications/*` → `/.netlify/functions/medications`
- `/api/clinical-records/*` → `/.netlify/functions/clinical-records`
- `/api/notifications/*` → `/.netlify/functions/notifications`

## Serverless Functions Structure

```
netlify/
└── functions/
    ├── utils/
    │   ├── database.ts      # Database connection pool
    │   ├── auth.ts          # Authentication helpers
    │   └── response.ts      # Response formatting
    ├── auth.ts              # Authentication endpoints
    ├── users.ts             # User management endpoints
    ├── pets.ts              # Pet management endpoints
    ├── appointments.ts      # Appointment endpoints
    ├── medical-records.ts   # Medical records endpoints
    ├── vaccinations.ts      # Vaccination endpoints
    ├── medications.ts       # Medication endpoints
    ├── clinical-records.ts  # Clinical records endpoints
    └── notifications.ts     # Notification endpoints
```

## Troubleshooting

### Database Connection Issues

- Ensure your DATABASE_URL is correct and includes SSL parameters if required
- Check that your database allows connections from Netlify's IP ranges
- Verify connection pool settings in `netlify/functions/utils/database.ts`

### Function Timeout

- Netlify free tier has a 10-second timeout for functions
- Optimize database queries to complete within this limit
- Consider upgrading to Pro for 26-second timeouts

### CORS Issues

- CORS headers are set in the `response.ts` utility
- Ensure `FRONTEND_URL` environment variable matches your deployment URL

### Build Failures

- Check that all dependencies are listed in `netlify/functions/package.json`
- Verify TypeScript compilation succeeds locally
- Review Netlify build logs for specific errors

## Monitoring and Logs

- **Function logs**: Site settings → Functions → View logs
- **Deploy logs**: Deploys tab → Select deploy → View logs
- **Real-time logs**: Use `netlify logs` CLI command

## Performance Optimization

- Use connection pooling (already configured in `database.ts`)
- Implement caching for frequently accessed data
- Monitor function execution time in Netlify analytics
- Consider CDN caching for static API responses

## Security Best Practices

1. **Always use HTTPS** in production (Netlify provides free SSL)
2. **Rotate JWT secrets** periodically
3. **Use environment variables** for all sensitive data
4. **Enable database SSL** in production
5. **Implement rate limiting** (consider Netlify Edge Functions)
6. **Regular security audits** of dependencies with `npm audit`

## Support

For issues:
- Check [Netlify Documentation](https://docs.netlify.com)
- Review [Netlify Functions Guide](https://docs.netlify.com/functions/overview/)
- Contact support through Netlify dashboard
