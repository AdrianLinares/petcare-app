# Netlify Database Setup Guide

Your Netlify deployment is failing because it's trying to connect to `localhost:5432`, but serverless functions don't have access to a local database. You need to set up a cloud-hosted PostgreSQL database.

## Step 1: Choose and Set Up a Cloud Database Provider

### Option A: Neon (Recommended - Free tier)
1. Go to https://neon.tech
2. Sign up with GitHub/Google
3. Create a new project (e.g., "petcare-production")
4. **Copy the connection string** - it looks like:
   ```
   postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Supabase (Free tier)
1. Go to https://supabase.com
2. Create a new project
3. Go to **Project Settings → Database**
4. Copy the **Connection string (URI)** under "Connection string"

### Option C: Railway (Simple, paid after trial)
1. Go to https://railway.app
2. Create a PostgreSQL database
3. Copy the `DATABASE_URL` from Variables tab

### Option D: Render (Free tier)
1. Go to https://render.com
2. Create a new PostgreSQL database
3. Copy the **External Database URL**

## Step 2: Initialize Your Database Schema

Once you have your `DATABASE_URL`, you need to create the tables. You have two options:

### Method 1: Use psql (if you have it installed)

```bash
# Set your database URL
export DATABASE_URL="your_connection_string_here"

# Run the schema
psql $DATABASE_URL -f backend/database/schema.sql
```

### Method 2: Use the Database Provider's Web Interface

Most providers have a SQL editor in their dashboard:

1. **Neon**: Go to SQL Editor in the dashboard
2. **Supabase**: Go to SQL Editor
3. **Railway**: Click on the database → Query tab
4. **Render**: Use the "Shell" or connect via psql

Then paste your database schema SQL and execute it.

### Method 3: Use a Database Client

1. Download **TablePlus**, **DBeaver**, or **pgAdmin**
2. Connect using your `DATABASE_URL`
3. Create your database schema using the SQL editor or import your schema file

## Step 3: Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Navigate to: **Site configuration → Environment variables**
3. Add the following variables:

```
DATABASE_URL = postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET = your_secure_random_string_here
FRONTEND_URL = https://your-site-name.netlify.app
NODE_ENV = production
```

**Important Notes:**
- Use a strong random string for `JWT_SECRET` (e.g., generate with: `openssl rand -base64 32`)
- Replace `your-site-name` in `FRONTEND_URL` with your actual Netlify site name
- Make sure `DATABASE_URL` includes `?sslmode=require` for SSL connections

## Step 4: Seed Initial Data (Optional)

If you want demo data, you can run the seed file:

```bash
# Make sure DATABASE_URL is set
export DATABASE_URL="your_connection_string_here"

# Run seed
cd backend
npm run seed
```

Or create an admin user manually via SQL:

```sql
INSERT INTO users (email, password_hash, full_name, phone, user_type, access_level)
VALUES (
  'admin@petcare.com',
  '$2b$10$YourHashedPasswordHere',  -- Use bcrypt to hash "password123"
  'Admin User',
  '123-456-7890',
  'administrator',
  'super_admin'
);
```

To hash a password with bcrypt, you can use this Node.js snippet:

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('password123', 10, (err, hash) => {
  console.log(hash);
});
```

## Step 5: Redeploy Your Site

After setting the environment variables in Netlify:

1. Go to **Deploys** tab
2. Click **Trigger deploy → Clear cache and deploy site**

Or push a new commit to trigger a deployment.

## Step 6: Test Your Deployment

1. Visit your Netlify site URL
2. Try logging in with your admin credentials
3. Check the **Functions** tab in Netlify dashboard to see logs if there are any errors

## Troubleshooting

### "Connection refused" or "timeout"
- Check that `DATABASE_URL` is correctly set in Netlify environment variables
- Verify the database is accessible from the internet (not localhost)
- Ensure SSL is enabled in the connection string

### "relation 'users' does not exist"
- You haven't run the schema.sql file yet
- Run it using one of the methods in Step 2

### "password authentication failed"
- Double-check your `DATABASE_URL` credentials
- Some providers require you to reset the password

### Check Function Logs
1. Go to Netlify dashboard
2. **Functions** tab
3. Click on a function (e.g., `auth`)
4. View real-time logs to see the actual error

## Security Notes

- **Never commit** `DATABASE_URL` to your git repository
- Use strong passwords for database users
- Enable SSL for database connections
- Regularly rotate your `JWT_SECRET`
- Use different databases for development/production

## Need Help?

- Check the database provider's documentation
- Review Netlify function logs
- Ensure all environment variables are set correctly
