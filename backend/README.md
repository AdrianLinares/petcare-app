# PetCare Backend API

Backend API server for the PetCare Application with PostgreSQL database, JWT authentication, and automated notifications system.

## Features

- **PostgreSQL Database** with comprehensive schema for all entities
- **JWT Authentication** with role-based access control (RBAC)
- **Automated Notifications** system with scheduled reminders
- **Email Service** for notification delivery
- **RESTful API** design with Express.js
- **Security** with Helmet, CORS, and rate limiting
- **Cron Jobs** for appointment and vaccination reminders

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Language**: TypeScript
- **ORM**: Native pg driver (no ORM)
- **Authentication**: JWT (jsonwebtoken + bcrypt)
- **Email**: Nodemailer
- **Scheduler**: node-cron
- **Security**: Helmet, CORS, express-rate-limit

## Prerequisites

1. **Node.js** 18+ and npm/pnpm
2. **PostgreSQL** 14+ installed and running
3. **Email account** (Gmail, SMTP) for notifications

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
# or
pnpm install
```

### 2. Configure Environment

Create `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=petcare_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=PetCare <noreply@petcare.com>

# App
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE petcare_db;

# Exit psql
\q
```

### 4. Run Migrations

```bash
npm run migrate
```

This creates all tables, indexes, and triggers.

### 5. Seed Demo Data

```bash
npm run seed
```

This creates demo users:
- **Admin**: admin@petcare.com / password123
- **Vet**: vet@petcare.com / password123
- **Owner**: owner@petcare.com / password123

### 6. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Database Schema

### Users Table
- `id` (UUID, PK)
- `email` (unique)
- `password_hash`
- `full_name`
- `phone`
- `user_type` (pet_owner | veterinarian | administrator)
- `access_level` (standard | elevated | super_admin) - for admins only
- `address`, `specialization`, `license_number`
- `created_at`, `updated_at`, `deleted_at` (soft delete)

### Pets Table
- `id` (UUID, PK)
- `owner_id` (FK → users)
- `name`, `species`, `breed`, `age`, `weight`, `color`, `gender`
- `microchip_id` (unique)
- `allergies` (text array)
- `notes`
- Timestamps

### Appointments Table
- `id` (UUID, PK)
- `pet_id` (FK → pets)
- `owner_id` (FK → users)
- `veterinarian_id` (FK → users)
- `appointment_type`, `date`, `time`
- `reason`, `notes`
- `status` (scheduled | completed | cancelled)
- `diagnosis`, `treatment`, `follow_up_date`
- Timestamps

### Notifications Table
- `id` (UUID, PK)
- `user_id` (FK → users)
- `type` (appointment_reminder | vaccination_due | medical_update | etc.)
- `title`, `message`
- `related_entity_type`, `related_entity_id`
- `priority` (low | normal | high | urgent)
- `read`, `read_at`
- `scheduled_for`, `sent`, `sent_at`
- `created_at`

### Other Tables
- **medical_records**: Pet medical history
- **vaccinations**: Vaccination records with next_due dates
- **medications**: Current and past medications
- **clinical_records**: Detailed clinical notes from appointments
- **password_reset_tokens**: Password recovery tokens
- **email_logs**: Audit trail for all emails sent

## API Endpoints

### Notifications API

All notification endpoints require authentication.

#### GET /api/notifications
Get user's notifications.

**Query Params:**
- `unreadOnly` (boolean) - Filter to unread only

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "appointment_reminder",
    "title": "Appointment Reminder",
    "message": "You have an appointment tomorrow...",
    "priority": "high",
    "read": false,
    "createdAt": "2025-01-08T10:00:00Z"
  }
]
```

#### GET /api/notifications/unread-count
Get count of unread notifications.

**Response:**
```json
{
  "count": 5
}
```

#### PATCH /api/notifications/:id/read
Mark a notification as read.

**Response:**
```json
{
  "success": true
}
```

#### PATCH /api/notifications/read-all
Mark all notifications as read.

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

#### DELETE /api/notifications/:id
Delete a notification.

**Response:**
```json
{
  "success": true
}
```

#### POST /api/notifications
Create a notification (admin/testing).

**Body:**
```json
{
  "userId": "uuid",
  "type": "system_alert",
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight...",
  "priority": "normal"
}
```

### Authentication (TODO)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Other Endpoints (TODO)
- `/api/users` - User management
- `/api/pets` - Pet CRUD operations
- `/api/appointments` - Appointment scheduling
- `/api/medical-records` - Medical history
- `/api/vaccinations` - Vaccination tracking
- `/api/medications` - Medication management

## Notification System

### Automated Notifications

The system automatically creates and sends notifications for:

1. **Appointment Reminders** - 24 hours before scheduled appointments
2. **Vaccination Due** - 7 days before vaccination due dates
3. **System Alerts** - Admin-triggered notifications

### Notification Scheduler

Runs every 15 minutes (configurable) to:
- Process scheduled notifications
- Check upcoming appointments
- Check due vaccinations
- Send notification emails

### Email Integration

Notifications are sent via email using Nodemailer. Email logs are stored in the database for audit purposes.

### Configuration

Set in `.env`:
```env
NOTIFICATION_CHECK_INTERVAL=*/15 * * * *  # Cron expression
APPOINTMENT_REMINDER_HOURS=24
VACCINATION_REMINDER_DAYS=7
```

## Authentication & Authorization

### JWT Tokens

Login returns a JWT token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

Include in requests:
```
Authorization: Bearer <token>
```

### Role-Based Access Control

Three user types with different permissions:

1. **pet_owner**: Manage own pets and appointments
2. **veterinarian**: Access patient records, create clinical notes
3. **administrator**: User management with three levels:
   - `standard`: Manage pet owners and vets
   - `elevated`: Advanced features + clinical editing
   - `super_admin`: Full system access

### Middleware

- `authenticate` - Verify JWT token
- `authorize(...roles)` - Check user role
- `authorizeAdmin(minLevel)` - Check admin access level

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.ts            # JWT auth middleware
│   ├── routes/
│   │   └── notifications.ts   # Notification routes
│   ├── services/
│   │   ├── notificationService.ts  # Notification logic
│   │   └── emailService.ts         # Email sending
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── database/
│   │   ├── migrate.ts         # Migration runner
│   │   └── seed.ts            # Seed data
│   └── server.ts              # Express app
├── database/
│   └── schema.sql             # PostgreSQL schema
├── .env.example               # Environment template
├── package.json
└── tsconfig.json
```

### Scripts

```bash
npm run dev        # Start with hot reload
npm run build      # Compile TypeScript
npm start          # Run production build
npm run migrate    # Run database migrations
npm run seed       # Seed demo data
npm run db:setup   # Migrate + seed
```

### Database Queries

Using native pg driver:

```typescript
import { query } from '../config/database.js';

const result = await query(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
);

const user = result.rows[0];
```

### Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "stack": "..." // Development only
}
```

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong JWT secret (64+ characters)
3. Configure production database
4. Set up real email service (SendGrid, AWS SES)
5. Enable SSL/TLS

### Database

1. Use connection pooling
2. Enable SSL for database connections
3. Set up automated backups
4. Configure read replicas for scaling

### Security Checklist

- [ ] Strong JWT secret in production
- [ ] Rate limiting configured
- [ ] CORS restricted to frontend domain
- [ ] Helmet security headers enabled
- [ ] Database credentials secured
- [ ] Email credentials secured
- [ ] HTTPS enabled
- [ ] SQL injection protection (parameterized queries)
- [ ] Input validation on all endpoints

### Scaling Considerations

- Horizontal scaling with load balancer
- Redis for session/cache management
- Message queue for notifications (RabbitMQ, SQS)
- CDN for static assets
- Database read replicas

## Testing

### Manual Testing

Use the health check:
```bash
curl http://localhost:3001/health
```

### API Testing

Use tools like:
- Postman
- Insomnia
- cURL
- Thunder Client (VS Code)

Example:
```bash
# Login (when implemented)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@petcare.com","password":"password123"}'

# Get notifications
curl http://localhost:3001/api/notifications \
  -H "Authorization: Bearer <your-token>"
```

## Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `.env`
- Check database exists: `psql -l`

### Migration Errors
- Drop database and recreate if needed
- Check PostgreSQL version (14+ required)
- Verify UUID extension is available

### Email Not Sending
- Check SMTP credentials
- For Gmail, use App Password (not account password)
- Enable "Less secure app access" or use OAuth2

### Port Already in Use
- Change PORT in `.env`
- Kill process using port: `lsof -ti:3001 | xargs kill`

## Next Steps

1. Implement remaining API endpoints (auth, users, pets, appointments)
2. Add comprehensive input validation
3. Implement unit and integration tests
4. Add API documentation (Swagger/OpenAPI)
5. Set up CI/CD pipeline
6. Implement file uploads for pet images
7. Add WebSocket support for real-time updates
8. Create admin dashboard

## Support

For issues or questions, check:
- Frontend README: `../README.md`
- Architecture docs: `../ARCHITECTURE.md`
- Beginner guide: `../BEGINNER_GUIDE.md`

## License

MIT
