# PetCare Deployment Guide

This guide will help you deploy the PetCare application with the backend on **Render** and frontend on **Netlify**.

## Prerequisites

- GitHub account
- Render account (sign up at https://render.com)
- Netlify account (sign up at https://netlify.com)

---

## Part 1: Deploy Backend to Render

### Step 1: Push to GitHub (if not already done)

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Render Account & Deploy

1. Go to https://render.com and sign up (use GitHub to sign in)

2. Click **"New +"** → **"Blueprint"**

3. Connect your GitHub repository: `petcare-app-v1`

4. Render will automatically detect the `render.yaml` file and create:
   - PostgreSQL database (`petcare-db`)
   - Web service (`petcare-api`)

5. Click **"Apply"** to start deployment

### Step 3: Configure Environment Variables

After deployment starts, go to your `petcare-api` service:

1. Go to **Environment** tab
2. Add these additional variables:
   - `EMAIL_HOST` = `smtp.gmail.com`
   - `EMAIL_PORT` = `587`
   - `EMAIL_USER` = `your-email@gmail.com`
   - `EMAIL_PASSWORD` = `your-app-password` (see Gmail setup below)
   - `EMAIL_FROM` = `PetCare <noreply@petcare.com>`
   - `NOTIFICATION_CHECK_INTERVAL` = `*/15 * * * *`
   - `APPOINTMENT_REMINDER_HOURS` = `24`
   - `VACCINATION_REMINDER_DAYS` = `7`

3. After adding variables, click **"Manual Deploy"** → **"Deploy latest commit"**

### Step 4: Get Your Backend URL

Once deployed, your backend URL will be something like:
```
https://petcare-api-xxxx.onrender.com
```

Copy this URL - you'll need it for Netlify!

### Step 5: Run Database Migrations

The `render.yaml` automatically runs migrations during build. To verify:

1. Go to your `petcare-api` service
2. Click **"Logs"** tab
3. Look for: `✓ Database connected`

If you need to manually run migrations or seed data:

1. Go to **Shell** tab in Render dashboard
2. Run:
```bash
cd backend
npm run migrate
npm run seed
```

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Deploy Site

1. Go to https://netlify.com and sign in

2. Click **"Add new site"** → **"Import an existing project"**

3. Connect to GitHub and select `petcare-app-v1`

4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

5. Click **"Deploy site"**

### Step 2: Configure Environment Variables

1. Go to **Site configuration** → **Environment variables**

2. Add variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://petcare-api-xxxx.onrender.com/api` 
     (Replace with your actual Render backend URL from Part 1, Step 4)

3. Click **"Save"**

### Step 3: Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

### Step 4: Get Your Frontend URL

Your site will be live at something like:
```
https://your-app-name.netlify.app
```

---

## Part 3: Connect Frontend & Backend

### Update Backend CORS

1. Go back to **Render dashboard** → `petcare-api` service

2. Go to **Environment** tab

3. Update `FRONTEND_URL` variable:
   - Value: `https://your-app-name.netlify.app` (your Netlify URL)

4. Save and redeploy

---

## Part 4: Test Your Deployment

1. Visit your Netlify URL: `https://your-app-name.netlify.app`

2. Try logging in with demo credentials:
   - **Pet Owner**: `owner@petcare.com` / `password123`
   - **Veterinarian**: `vet@petcare.com` / `password123`
   - **Admin**: `admin@petcare.com` / `password123`

3. If login works, you're all set! 🎉

---

## Troubleshooting

### Backend Issues

**Database connection errors:**
- Check logs in Render dashboard
- Verify DATABASE_URL is set correctly
- Ensure migrations ran successfully

**CORS errors:**
- Verify FRONTEND_URL matches your Netlify URL exactly
- Check browser console for specific error messages

### Frontend Issues

**"An error occurred. Please try again" on login:**
- Verify VITE_API_URL is set in Netlify
- Check that it includes `/api` at the end
- Redeploy after changing environment variables

**404 errors on page refresh:**
- The `netlify.toml` file should handle this
- Verify it's in the root directory

### Check Backend Health

Visit: `https://petcare-api-xxxx.onrender.com/health`

Should return:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

---

## Gmail Setup (for Email Notifications)

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Generate a new app password for "Mail"
5. Use this password in `EMAIL_PASSWORD` environment variable

---

## Free Tier Limitations

**Render Free Tier:**
- Service spins down after 15 min of inactivity
- First request may be slow (cold start)
- Database limited to 1GB

**Netlify Free Tier:**
- 100GB bandwidth/month
- 300 build minutes/month

---

## Custom Domain (Optional)

### Netlify:
1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration instructions

### Render:
1. Go to **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as instructed

---

## Environment Variables Summary

### Backend (Render)
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `DATABASE_URL` = (auto-generated)
- `JWT_SECRET` = (auto-generated)
- `JWT_EXPIRES_IN` = `7d`
- `FRONTEND_URL` = `https://your-app.netlify.app`
- `EMAIL_HOST` = `smtp.gmail.com`
- `EMAIL_PORT` = `587`
- `EMAIL_USER` = your email
- `EMAIL_PASSWORD` = app password
- `EMAIL_FROM` = `PetCare <noreply@petcare.com>`

### Frontend (Netlify)
- `VITE_API_URL` = `https://petcare-api-xxxx.onrender.com/api`

---

## Monitoring

**Render:**
- Check logs: Dashboard → Your service → Logs
- View metrics: Dashboard → Your service → Metrics

**Netlify:**
- Check deploys: Dashboard → Deploys
- View analytics: Dashboard → Analytics

---

## Need Help?

- Render docs: https://render.com/docs
- Netlify docs: https://docs.netlify.com
- Check browser console for frontend errors
- Check Render logs for backend errors
