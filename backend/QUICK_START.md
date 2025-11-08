# Quick Start Guide

Get the PetCare backend running in 5 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed (`psql --version`)
- [ ] PostgreSQL server running
- [ ] Email account for notifications (Gmail recommended)

## Step-by-Step Setup

### 1. Install Dependencies (1 min)

```bash
cd backend
npm install
```

### 2. Setup PostgreSQL (2 min)

```bash
# Start PostgreSQL (if not running)
sudo systemctl start postgresql  # Linux
# or: brew services start postgresql  # macOS

# Create database
psql -U postgres -c "CREATE DATABASE petcare_db;"
```

### 3. Configure Environment (1 min)

```bash
# Copy example
cp .env.example .env

# Edit .env with your settings (minimum required)
nano .env
```

**Minimum `.env` configuration:**
```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=$(openssl rand -hex 32)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

### 4. Initialize Database (30 sec)

```bash
# Run migrations
npm run migrate

# Seed demo data
npm run seed
```

### 5. Start Server (10 sec)

```bash
npm run dev
```

You should see:
```
✓ Connected to PostgreSQL database
✓ Database connected
✓ Notification scheduler started (*/15 * * * *)
✓ Server running on http://localhost:3001
✓ Environment: development
```

### 6. Test It Works

Open another terminal:

```bash
# Health check
curl http://localhost:3001/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Demo Accounts

Use these credentials to test:

| Role | Email | Password |
|------|-------|----------|
| Pet Owner | owner@petcare.com | password123 |
| Veterinarian | vet@petcare.com | password123 |
| Super Admin | admin@petcare.com | password123 |

## Next Steps

1. **Connect Frontend**: Update frontend API URL to `http://localhost:3001/api`
2. **Test Notifications**: Check notification endpoints work
3. **Implement Auth Routes**: See `API_REFERENCE.md` for specs
4. **Read Full Docs**: See `README.md` for complete documentation

## Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -c "SELECT version();"
```

### Port 3001 Already in Use
```bash
# Find and kill process
lsof -ti:3001 | xargs kill

# Or change PORT in .env
echo "PORT=3002" >> .env
```

### Migration Failed
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS petcare_db;"
psql -U postgres -c "CREATE DATABASE petcare_db;"
npm run migrate
npm run seed
```

### Gmail Authentication Error
For Gmail, you need an **App Password**, not your regular password:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use that password in `.env`

## Common Commands

```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start            # Run production build

# Database
npm run migrate      # Run migrations
npm run seed         # Seed demo data
npm run db:setup     # Migrate + seed

# PostgreSQL
psql petcare_db      # Connect to database
\dt                  # List tables
\d users             # Describe users table
```

## File Structure

```
backend/
├── src/
│   ├── server.ts              # Main Express app
│   ├── config/database.ts     # PostgreSQL config
│   ├── middleware/auth.ts     # JWT middleware
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   └── types/                 # TypeScript types
├── database/
│   └── schema.sql             # Database schema
├── .env                       # Your configuration
└── package.json
```

## What's Implemented

✅ PostgreSQL database with full schema  
✅ JWT authentication middleware  
✅ Notification system with email  
✅ Automated appointment reminders  
✅ Automated vaccination reminders  
✅ Notification API endpoints  
✅ Role-based access control  
✅ Rate limiting & security  
✅ Database migrations & seeding  

## What's TODO

⬜ Auth endpoints (login, register, password reset)  
⬜ User management endpoints  
⬜ Pet CRUD endpoints  
⬜ Appointment scheduling endpoints  
⬜ Medical records endpoints  
⬜ Input validation with Zod  
⬜ Unit & integration tests  
⬜ API documentation (Swagger)  
⬜ File upload support  

## Resources

- **Full Documentation**: `README.md`
- **API Reference**: `API_REFERENCE.md`
- **Database Schema**: `database/schema.sql`
- **Frontend Docs**: `../README.md`

---

Need help? Check the troubleshooting section in `README.md`
