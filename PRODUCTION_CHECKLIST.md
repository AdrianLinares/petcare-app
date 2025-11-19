# Production Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. **Code Fixed**
- [x] Appointments function column names corrected
- [x] API base URL configured for Netlify
- [x] Database schema matches Neon structure
- [x] Password hashes working correctly

### 2. **Test Locally**
```bash
npm run dev
```
- [x] Login works with all three user types
- [ ] Pet owner can view/add pets
- [ ] Pet owner can schedule appointments
- [ ] Veterinarian can view appointments
- [ ] Admin can manage users
- [ ] All CRUD operations work

### 3. **Environment Variables**
Set these in **Netlify Dashboard** → Site Settings → Environment variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_XZnEdqp0Ab8T@ep-curly-truth-ah35s8ox-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<generate-strong-secret-for-production>
FRONTEND_URL=https://your-site.netlify.app
NODE_ENV=production
```

**Generate production JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. **Database**
- [x] Neon database created
- [x] Schema applied
- [x] Test data populated
- [ ] Verify all tables exist
- [ ] Check foreign key constraints
- [ ] Test queries work

### 5. **Security**
- [ ] Change JWT_SECRET from dev to production value
- [ ] Verify .env is in .gitignore
- [ ] Check CORS settings in functions
- [ ] Review error messages (don't expose sensitive data)

### 6. **Build & Deploy**
```bash
# Test build locally
cd frontend && npm run build

# Deploy to Netlify
netlify deploy --prod
```

## 🚀 Deployment Steps

### Step 1: Generate Production JWT Secret
```bash
cd /mnt/4ECC9DB3CC9D9635/GitHub/petcare-app/netlify/functions
node -e "const crypto = require('crypto'); console.log('\nProduction JWT Secret:\n' + crypto.randomBytes(64).toString('hex') + '\n');"
```

### Step 2: Set Environment Variables in Netlify
1. Go to Netlify Dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add all variables listed above
5. Save changes

### Step 3: Deploy
```bash
# From project root
netlify deploy --prod
```

### Step 4: Verify Production
1. Visit your production URL
2. Test login with all three accounts
3. Test core features:
   - Pet management
   - Appointment scheduling
   - Medical records
   - User management (admin)

## 🐛 Known Issues to Monitor

1. **Appointments table** - Now fixed, but test thoroughly
2. **Password hashes** - Ensure bcrypt hashing works in production
3. **Database connections** - Monitor Neon connection limits
4. **Cold starts** - First request may be slow

## 📊 Production Monitoring

Once deployed, monitor:
- Netlify function logs
- Neon database performance
- Error rates in Netlify dashboard
- User feedback

## 🔧 Rollback Plan

If issues occur:
1. Check Netlify function logs
2. Verify environment variables
3. Test database connectivity
4. Roll back to previous deployment if needed:
   ```bash
   netlify deploy --alias=previous-version
   ```

## ✅ Post-Deployment

After successful deployment:
1. Update README with production URL
2. Document any production-specific settings
3. Set up monitoring/alerting (optional)
4. Test all features with real users
5. Keep test accounts active for debugging

---

**Current Status:** Ready for deployment after completing remaining local tests! ✅
