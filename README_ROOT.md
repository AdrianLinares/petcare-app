# 🐾 PetCare - Full-Stack Veterinary Management System

A comprehensive veterinary clinic management system with automated notifications, appointment scheduling, and complete pet medical record tracking.

## 📋 Project Structure

```
petcare-app-v1/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── lib/
│   │   │   └── api.ts   # ✅ Backend API integration
│   │   ├── services/    # Business logic
│   │   └── types.ts     # TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
├── backend/              # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── routes/      # ✅ Auth, Users, Pets, Appointments
│   │   ├── services/    # ✅ Notifications, Email
│   │   ├── middleware/  # ✅ JWT Authentication
│   │   └── config/      # Database connection
│   ├── database/
│   │   └── schema.sql   # PostgreSQL schema
│   ├── package.json
│   └── README.md
│
├── package.json          # Root scripts
├── README_ROOT.md        # This file
└── IMPLEMENTATION_SUMMARY.md
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git**

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd petcare-app-v1

# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. Setup Database

```bash
# Create PostgreSQL database
sudo -u postgres psql -c "CREATE DATABASE petcare_db;"

# Set PostgreSQL password
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'petcare_dev_2025';"

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 3. Configure Environment

Backend `.env` is already configured. If you need custom settings:

```bash
cd backend
nano .env
```

Update these if needed:
- `DB_PASSWORD` - Your PostgreSQL password
- `EMAIL_USER` - Your email for notifications
- `EMAIL_PASSWORD` - Your email app password

### 4. Start the Application

```bash
# From root directory - starts both frontend and backend
npm run dev
```

This will start:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

## 🎯 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Pet Owner | owner@petcare.com | password123 |
| Veterinarian | vet@petcare.com | password123 |
| Super Admin | admin@petcare.com | password123 |

## ✨ Features

### Implemented ✅

- **Authentication System**
  - JWT-based login/register
  - Password reset via email
  - Role-based access control (RBAC)

- **User Management**
  - Pet owners, veterinarians, administrators
  - Profile management
  - Access level control

- **Pet Management**
  - Complete pet profiles
  - Medical history
  - Vaccination records
  - Medication tracking
  - Allergy management

- **Appointment System**
  - Schedule appointments
  - Automated reminders (24h before)
  - Status tracking (scheduled/completed/cancelled)
  - Clinical notes for vets

- **Notification System**
  - Real-time notifications
  - Email integration
  - Automated reminders:
    - Appointments (24h before)
    - Vaccinations (7 days before)
  - Priority levels (low/normal/high/urgent)
  - **Cron scheduler** runs every 15 minutes

- **Email Service**
  - Welcome emails
  - Password reset emails
  - Appointment notifications
  - System alerts

### Security Features

- JWT authentication (7-day tokens)
- Bcrypt password hashing (10 rounds)
- Rate limiting (100 req/15min)
- CORS protection
- Helmet security headers
- SQL injection prevention
- Environment-based secrets

## 📚 Available Commands

### Root Level

```bash
# Start both frontend and backend
npm run dev

# Build both for production
npm run build

# Install all dependencies
npm run install:all

# Database commands
npm run db:migrate    # Run migrations
npm run db:seed       # Seed demo data
npm run db:setup      # Migrate + Seed
```

### Frontend Only

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Backend Only

```bash
cd backend

# Development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run compiled code
npm start

# Database operations
npm run migrate
npm run seed
```

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Axios** - HTTP client
- **React Hook Form** - Forms
- **Zod** - Validation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **node-cron** - Task scheduling

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update profile
- `POST /api/users/me/change-password` - Change password
- `GET /api/users` - List users (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Pets
- `GET /api/pets` - List pets
- `GET /api/pets/:id` - Get pet
- `POST /api/pets` - Create pet
- `PATCH /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id` - Update appointment

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

**Full API documentation**: `backend/API_REFERENCE.md`

## 🧪 Testing the Integration

### 1. Test Backend API

```bash
# Login and get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@petcare.com","password":"password123"}'

# Get pets (use token from login)
curl http://localhost:3001/api/pets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Frontend

1. Open http://localhost:5173
2. Login with: `owner@petcare.com` / `password123`
3. You should see the dashboard with backend data

## 📖 Documentation

- **Root README**: `README_ROOT.md` (this file)
- **Frontend README**: `README.md` (original)
- **Backend README**: `backend/README.md`
- **API Reference**: `backend/API_REFERENCE.md`
- **Quick Start**: `backend/QUICK_START.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Architecture**: `ARCHITECTURE.md`
- **Beginner Guide**: `BEGINNER_GUIDE.md`

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check port 3001
lsof -ti:3001 | xargs kill

# Check environment
cat backend/.env
```

### Frontend won't connect

- Ensure backend is running on port 3001
- Check `frontend/.env` has correct API URL
- Check browser console for errors

### Database errors

```bash
# Recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS petcare_db;"
sudo -u postgres psql -c "CREATE DATABASE petcare_db;"
npm run db:setup
```

### "Cannot find module" errors

```bash
# Reinstall dependencies
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

## 🔒 Security Notes

### Development
- Demo passwords are simple for testing
- Database password is in `.env` (not committed)
- JWT secret should be changed in production

### Production
- Use strong passwords
- Enable HTTPS
- Set secure JWT secrets
- Configure real email service
- Enable database SSL
- Set up proper CORS
- Use environment variables
- Regular security audits

## 🚢 Deployment

### Backend
1. Set `NODE_ENV=production`
2. Update database credentials
3. Set strong JWT secret
4. Configure email service
5. Deploy to server (Heroku, Railway, AWS, etc.)

### Frontend
1. Update `VITE_API_URL` to production backend URL
2. Build: `npm run build`
3. Deploy `dist/` folder (Vercel, Netlify, etc.)

### Database
1. Use managed PostgreSQL (AWS RDS, Supabase, etc.)
2. Enable SSL connections
3. Set up automated backups
4. Configure read replicas for scaling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT

## 🆘 Support

- **Issues**: Use GitHub Issues
- **Documentation**: Check `/backend/README.md` and `/backend/API_REFERENCE.md`
- **Email**: [Your email]

## 🎉 What's Next?

### Immediate Todos
- [ ] Integrate frontend Auth components with backend API
- [ ] Replace localStorage services with API calls
- [ ] Add error handling for API requests
- [ ] Implement loading states
- [ ] Add success/error toasts

### Future Features
- [ ] Medical records CRUD endpoints
- [ ] File uploads for pet images
- [ ] Real-time notifications (WebSocket)
- [ ] Analytics dashboard
- [ ] Export to PDF
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

**Status**: ✅ Fully operational backend + Frontend ready for integration  
**Version**: 1.0.0  
**Last Updated**: 2025-01-08
