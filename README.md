# 🐾 PetCare Management System

A comprehensive pet care management system built with modern web technologies, offering role-based dashboards for pet owners, veterinarians, and administrators. Deployed as a serverless application on Netlify with Neon PostgreSQL database.

![PetCare](https://img.shields.io/badge/PetCare-Management%20System-blue)
![Version](https://img.shields.io/badge/Version-1.3.1-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-cyan)
![Netlify](https://img.shields.io/badge/Netlify-Serverless-00C7B7)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-4F46E5)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/AdrianLinares/petcare-app)

---

## 📋 Version History

| Versión | Fecha | Hito | Commits Clave |
|---|---|---|---|
| **v1.3.1** | May 2026 | **Deploy fixes** — vitest.config fuera de functions/, bcrypt → bcryptjs para compatibilidad Lambda | `077840a` → `d1b067b` |
| **v1.3.0** | May 2026 | **React Query + Modern Stack** — pnpm, React Query, ErrorBoundary, env validation, backend test suite, schema fixes | `0f96300` → `3dd317a` |
| **v1.2.0** | May 2026 | **Internationalization (i18n)** — framework i18next, LanguageSwitcher, dashboards traducidos, tests de traducción | `751fa98` → `eb31db4` |
| **v1.1.0** | Feb–Apr 2026 | **Real-time & Performance** — Pusher notifications, Edge caching, testing framework con Vitest, super_admin access level | `ffa07ca` → `a521a06` |
| **v1.0.0** | Nov 2025 | **Serverless Launch** — Migración a Neon PostgreSQL + Netlify Functions, autenticación JWT, API REST completa, despliegue en producción | `8ae9540` → `86acfdb` |
| **v0.2.0** | Nov 2025 | **RBAC + Services** — Sistema de roles (pet_owner, veterinarian, administrator), niveles de admin, capa de servicios API | `ac156e5` → `d32f1b2` |
| **v0.1.0** | Sep–Oct 2025 | **Foundations** — Primer commit, CRUD de mascotas, turnos, records médicos, recuperación de contraseña, datos de prueba | `dc9b7fd` → `40434e9` |

> **Convención:** Semver estricto — `MAJOR.minor.patch`. MAJOR = cambios disruptivos en API o BD. minor = features nuevas. patch = fixes y refactors. El versionamiento se inicia formalmente con este release.

---

## ⚡ Key Highlights

- ✅ **Complete Pet Management** with medical history, vaccinations, and medications
- ✅ **Comprehensive Appointment System** with scheduling, rescheduling, and status tracking
- ✅ **Role-Based Access Control** with three distinct user roles and hierarchical admin levels
- ✅ **Real-Time Notifications** with Pusher WebSocket integration
- ✅ **Password Recovery System** with secure token generation and email notifications
- ✅ **Medical Records Management** for veterinarians with clinical notes and treatment plans
- ✅ **Advanced Search & Filtering** across users, pets, and appointments
- ✅ **Real-Time Dashboard Analytics** for all user types
- ✅ **Full CRUD Operations** on users, pets, appointments, and medical records
- ✅ **Serverless API** with Netlify Functions and Neon PostgreSQL
- ✅ **Type-Safe Development** with TypeScript and Zod validation
- ✅ **Scalable Architecture** with serverless deployment

## ✨ Features

### 🏠 **Pet Owner Dashboard**

- **Pet Management**:
    - Complete pet profile management with detailed information
    - Support for multiple pets per owner
    - Pet species, breed, age, weight, and color tracking
    - Microchip ID storage
    - Gender tracking
- **Medical History Management**:
    - Comprehensive medical history records
    - Add, edit, and delete medical records
    - Track diagnoses, treatments, and veterinarian notes
    - View complete medical history timeline
- **Vaccination Tracking**:
    - Complete vaccination records management
    - Add, update, and delete vaccination entries
    - Track next due dates for vaccinations
    - Visual indicators for overdue vaccinations
    - Vaccination reminders
- **Medication Management**:
    - Active and past medication tracking
    - Add, update, and delete medication records
    - Dosage and administration schedule tracking
    - Start and end date management
- **Appointment Management**:
    - Schedule new appointments with veterinarians
    - View upcoming and past appointments
    - Appointment status tracking (scheduled, completed, cancelled)
    - Appointment details including date, time, type, and reason
- **Pet Health Overview**:
    - Allergy tracking and management
    - Custom notes for special care instructions
    - Quick stats dashboard with pet count, upcoming appointments, and overdue vaccines

### 👨‍⚕️ **Veterinarian Dashboard**

- **Patient Management**:
    - View all patient (pet) records
    - Search pets by name, species, or breed
    - Access complete pet medical history
    - Pet owner contact information
- **Appointment Management**:
    - Today's appointments view with real-time updates
    - Upcoming appointments calendar
    - Appointment status management (scheduled, completed, cancelled)
    - Reschedule appointments with date picker
    - Delete appointments
    - Time-based appointment sorting
- **Clinical Records**:
    - Create and edit clinical records
    - Add diagnosis and treatment information
    - Record symptoms and medical findings
    - Medication prescriptions
    - Follow-up date scheduling
    - Clinical notes management
- **Medical History Management**:
    - View complete pet medical history
    - Edit existing medical records
    - Add new medical entries
    - Update vaccination records
    - Manage medication prescriptions
- **Practice Analytics**:
    - Daily appointment statistics
    - Completed appointments tracking
    - Patient load overview
    - Upcoming schedule visibility
- **Search and Filter**:
    - Search appointments by pet name, owner, or type
    - Filter by appointment status
    - Advanced filtering options

### 🛡️ **Administrator Dashboard**

- **Complete User Management System**:
    - Create, edit, and delete users of all types (Pet Owners, Veterinarians, Administrators)
    - Role-based access control (RBAC)
    - User search and filtering by email, name, or user type
    - Bulk operations support
    - View detailed user information
    - User type management (Pet Owner, Veterinarian, Administrator)
    - Administrator access level management (Standard, Elevated, Super Admin)
- **Appointment Management**:
    - View all appointments across the system
    - Search appointments by pet name, owner, veterinarian, or type
    - Filter appointments by status (all, scheduled, completed, cancelled)
    - Update appointment status
    - Delete appointments
    - View detailed appointment information
    - Track appointment creation dates
- **Pet Management**:
    - View all pets in the system
    - Search pets by name, species, or breed
    - Access complete pet profiles and medical history
    - View pet owner information
- **Medical History Access**:
    - View and manage medical records for all pets
    - Edit vaccination records
    - Update medication information
    - Add clinical notes
- **System Analytics**:
    - Total user statistics (Pet Owners, Veterinarians, Administrators)
    - Appointment analytics (Total, Completed, Cancelled, Today's appointments)
    - Total pets in system
    - Real-time dashboard metrics
    - User demographics and distribution
- **Access Control**:
    - Hierarchical admin permissions
    - Super Admin: Full system access and administrator management
    - Elevated Admin: Advanced features and settings access
    - Standard Admin: Basic user and appointment management
    - Permission-based UI elements and feature visibility

### 🔐 **Authentication & Security**

- **User Authentication**:
    - Secure login system with email and password
    - Role-based authentication (Pet Owner, Veterinarian, Administrator)
    - Session management with localStorage
    - Automatic logout functionality
- **Password Recovery**:
    - "Forgot Password" functionality
    - Secure password reset token generation (64-character cryptographic tokens)
    - Email-based password reset links
    - Token expiration (1 hour validity)
    - One-time use tokens
    - Password reset confirmation emails
    - Demo email logging for development
- **Security Features**:
    - Password validation (minimum 8 characters)
    - Email enumeration protection
    - Expired token cleanup
    - Used token tracking
    - Secure token validation

## 🏗️ Architecture

### **Technology Stack**

#### Frontend

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **Styling**: Tailwind CSS 3.4.11
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: React hooks and context
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner
- **HTTP Client**: Axios

#### Backend

- **Runtime**: Netlify Serverless Functions
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: JWT (JSON Web Tokens)
- **API Architecture**: RESTful serverless endpoints

### **Project Structure**

```
petcare-app/
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Auth/         # Authentication components
│   │   │   ├── Dashboard/    # Role-based dashboards
│   │   │   ├── Admin/        # Admin components
│   │   │   ├── Pet/          # Pet management
│   │   │   ├── Appointment/  # Appointment scheduling
│   │   │   └── Medical/      # Medical records
│   │   ├── lib/              # External integrations
│   │   │   ├── api.ts        # API client
│   │   │   └── utils.ts      # Utilities
│   │   ├── schemas/          # Zod validation
│   │   ├── utils/            # Helper functions
│   │   ├── hooks/            # Custom React hooks
│   │   └── types.ts          # TypeScript types
│   └── package.json
├── netlify/
│   └── functions/            # Serverless API functions
│       ├── auth.ts           # Authentication endpoints
│       ├── users.ts          # User management
│       ├── pets.ts           # Pet endpoints
│       ├── appointments.ts   # Appointment management
│       ├── medical-records.ts
│       ├── medications.ts
│       ├── vaccinations.ts
│       ├── clinical-records.ts
│       ├── notifications.ts
│       └── utils/            # Shared utilities
│           ├── auth.ts       # JWT validation
│           ├── database.ts   # Neon connection
│           └── response.ts   # Response helpers
└── netlify.toml              # Netlify configuration
```

## 📚 Documentation

All guides are in the [`docs/`](./docs/) folder, numbered in the recommended reading order:

### 📖 For Beginners (Start Here)

| #   | Document                                                          | What It Covers                                                 | Reading Time |
| --- | ----------------------------------------------------------------- | -------------------------------------------------------------- | :----------: |
| 01  | **[01-ARCHITECTURE.md](./docs/01-ARCHITECTURE.md)**               | Big-picture overview, tech stack, project structure, data flow |   ~30 min    |
| 02  | **[02-BEGINNER_GUIDE.md](./docs/02-BEGINNER_GUIDE.md)**           | Step-by-step code walkthrough with examples and exercises      |   ~60 min    |
| 03  | **[03-CODE_COMMENTS_GUIDE.md](./docs/03-CODE_COMMENTS_GUIDE.md)** | How to read the inline code comments throughout the project    |   ~20 min    |

### 🚀 Getting Started

| #   | Document                                          | What It Covers                                                  |
| --- | ------------------------------------------------- | --------------------------------------------------------------- |
| 04  | **[04-QUICK-START.md](./docs/04-QUICK-START.md)** | Get the app running in 5 steps                                  |
| 05  | **[05-DEPLOYMENT.md](./docs/05-DEPLOYMENT.md)**   | Full deployment guide: Netlify, Neon PostgreSQL, custom domains |

### 🔌 Services & Troubleshooting

| #   | Document                                                                | What It Covers                                |
| --- | ----------------------------------------------------------------------- | --------------------------------------------- |
| 06  | **[06-REALTIME-NOTIFICATIONS.md](./docs/06-REALTIME-NOTIFICATIONS.md)** | Pusher real-time notification setup and usage |
| 07  | **[07-DEPENDENCY-FIX.md](./docs/07-DEPENDENCY-FIX.md)**                 | Fix npm installation issues                   |
| 08  | **[08-PLAN-MANTENIMIENTO.md](./docs/08-PLAN-MANTENIMIENTO.md)**         | Plan de mantenimiento ISO/IEC 14764           |

### 🗄️ Database Files

- **[schema.sql](./schema.sql)** — Complete table definitions (run this FIRST)
- **[seed-database-fixed.sql](./seed-database-fixed.sql)** — Demo data (run AFTER schema)

### 📝 Code Comments

All major code files include detailed inline comments explaining:

- What each section does
- Why it's written that way
- Step-by-step breakdowns of complex logic
- Beginner-friendly explanations of programming concepts

---

## 🚀 Quick Start

## Environment Setup

1. **Use Node.js 20.x** (>=20 <21) and **pnpm >= 10**.
2. **Run the setup script**:
    ```bash
    pnpm setup
    ```
    If you want to run it directly, do this once:
    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```
3. **Configure DATABASE_URL** in `.env` (Neon or a local Postgres).
4. **JWT_SECRET**: `setup.sh` auto-generates it if the placeholder is present.
5. **Start dev**:
    ```bash
    pnpm dev
    ```

### Prerequisites

- Node.js 20 LTS
- pnpm >= 10
- Netlify CLI (optional for local development)

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd petcare-app
    ```

2. **Install dependencies**

    ```bash
    # Option 1: Use the automated fix script (recommended if you encounter install errors)
    ./fix-dependencies.sh

    # Option 2: Standard installation
    pnpm install
    # Installs root, frontend, and functions dependencies via pnpm workspaces
    ```

> **Troubleshooting**: If you encounter install errors, run `fix-dependencies.sh` to resolve them. See [07-DEPENDENCY-FIX.md](./docs/07-DEPENDENCY-FIX.md) for details.

3. **Configure environment variables**

    This project uses multiple environment scopes:

- Root (`.env`) — variables used by serverless functions and tools (DATABASE_URL, JWT_SECRET, etc.)
- Netlify functions (`netlify/functions/.env`) — variables available to serverless functions at runtime when running locally with Netlify Dev
- Frontend (`frontend/.env`) — client-side config for Vite (VITE\_\* variables)

    Example files are provided. Copy the appropriate example to create your local `.env` files and DO NOT commit them.

    ```bash
    # Root env (server / functions)
    cp .env.example .env

    # Functions-specific env (local dev)
    cp netlify/functions/.env.example netlify/functions/.env || true

    # Frontend env (client-side Vite variables)
    cp frontend/.env.example frontend/.env || true
    ```

Notes:

- Never commit `.env` files. They are gitignored by default.
- `frontend/.env` values starting with `VITE_` are safe to expose in client bundles if they contain non-sensitive values.
- If you add a new environment variable to code, update the corresponding `.env.example` file immediately.

If you want to check that `.env` is ignored:

```bash
grep -E "^\.env(\b|\.|$)" .gitignore || true
```

4. **Start development server**
    ```bash
    pnpm dev
    # Runs Netlify Dev on http://localhost:8888 (functions available at /.netlify/functions/*)
    ```

Quick verification (after installing deps and copying env files):

```bash
# Check node/pnpm versions
node -v && pnpm --version

# Run Netlify Dev
pnpm dev

# (Optional) In a separate terminal: run frontend only
pnpm --filter ./frontend dev

# (Optional) Typecheck or build functions
pnpm --filter ./netlify/functions typecheck || pnpm --filter ./netlify/functions build
```

5. **Open your browser**
   Navigate to `http://localhost:8888`

### Demo Data (Development)

- On first load, the app seeds demo data (users, pets, appointments)
  into `localStorage` via an initializer in `frontend/src/utils/testData.ts`.
- This makes the app usable without a real database during development.
- In production, configure the serverless API with a PostgreSQL database.

### Deployment to Netlify

1. **Netlify CLI is already installed** (via project dependencies).

2. **Login to Netlify**

    ```bash
    pnpm exec netlify login
    ```

3. **Initialize site**

    ```bash
    pnpm exec netlify init
    ```

4. **Deploy**
    ```bash
    pnpm exec netlify deploy --prod
    ```

## Getting Started

For complete installation and deployment instructions, see [docs/05-DEPLOYMENT.md](./docs/05-DEPLOYMENT.md).

Learn how to read the codebase comments in [docs/03-CODE_COMMENTS_GUIDE.md](./docs/03-CODE_COMMENTS_GUIDE.md).

## Documentation links

The full documentation set is in the docs/ folder. Relevant files:

- [01-ARCHITECTURE.md](./docs/01-ARCHITECTURE.md)
- [02-BEGINNER_GUIDE.md](./docs/02-BEGINNER_GUIDE.md)
- [03-CODE_COMMENTS_GUIDE.md](./docs/03-CODE_COMMENTS_GUIDE.md)
- [04-QUICK-START.md](./docs/04-QUICK-START.md)
- [05-DEPLOYMENT.md](./docs/05-DEPLOYMENT.md)
- [06-REALTIME-NOTIFICATIONS.md](./docs/06-REALTIME-NOTIFICATIONS.md)
- [07-DEPENDENCY-FIX.md](./docs/07-DEPENDENCY-FIX.md)

## 🔑 Demo Credentials

These accounts are preloaded via demo data and can be used to explore each dashboard:

### Administrator

- **Elevated Admin:** `admin@petcare.com` / `password123`

### Veterinarian

- **Dr. Sarah Johnson:** `vet@petcare.com` / `password123`

### Pet Owner

- **John Smith:** `owner@petcare.com` / `password123`

**Note:** All demo accounts use the same password (`password123`) for simplicity. In production, enforce strong, unique passwords.

## 👥 User Roles & Permissions

### **Pet Owner**

- Manage own pets and their medical records
- Schedule and view appointments
- Access vaccination and medication tracking
- View clinical records from veterinarians

### **Veterinarian**

- Access patient (pet) information
- Create and manage clinical records
- Schedule and manage appointments
- View practice-related analytics

### **Administrator Levels**

#### **Standard Administrator**

- Create and manage Pet Owners and Veterinarians
- View system analytics and reports
- Access admin dashboard

#### **Elevated Administrator**

- All Standard Admin permissions
- Access to system settings
- Advanced clinical record management

#### **Super Administrator**

- All system permissions
- Manage other administrators
- Full system control and configuration

## 🛠️ Development

### **Available Scripts**

```bash
# Development server (Netlify Dev)
pnpm dev

# Build frontend for production
pnpm build

# Install all dependencies (root, frontend, functions)
pnpm install

# Run frontend tests
pnpm test:run

# Typecheck functions
pnpm --filter ./netlify/functions typecheck
```

### **Code Structure Guidelines**

1. **Components**: Use functional components with TypeScript
2. **Styling**: Tailwind CSS classes with shadcn/ui components
3. **State Management**: React hooks (useState, useEffect, useCallback)
4. **Forms**: React Hook Form with Zod validation
5. **Data Management**: Service layer pattern for business logic
6. **Type Safety**: Comprehensive TypeScript types and interfaces

### **API Architecture**

The application uses serverless functions deployed on Netlify:

**Serverless Functions** (`netlify/functions/`)

- **Authentication**: Login, registration, password reset
- **Users**: User CRUD operations, profile management
- **Pets**: Pet management with medical records
- **Appointments**: Scheduling and status management
- **Medical Records**: Clinical records management
- **Vaccinations**: Vaccination tracking
- **Medications**: Medication management
- **Clinical Records**: Veterinary clinical notes
- **Notifications**: System notifications

**Frontend API Client** (`frontend/src/lib/api.ts`)

- Axios-based HTTP client
- JWT token management
- Automatic authentication
- Error handling and interceptors
- Type-safe API calls

**Key Features:**

- Neon PostgreSQL (serverless database)
- JWT authentication for secure access
- RESTful serverless endpoints
- Auto-scaling and high availability
- Request/response validation
- Centralized error handling
- CORS support

### **Adding New Features**

1. **Serverless Functions**:
    - Create new function in `netlify/functions/`
    - Add database queries using Neon connection
    - Implement JWT authentication with `requireAuth`
    - Add validation and error handling
    - Update API documentation

2. **Frontend**:
    - Add TypeScript interfaces in `frontend/src/types.ts`
    - Update API client in `frontend/src/lib/api.ts`
    - Create Zod schemas in `frontend/src/schemas/`
    - Build UI components with shadcn/ui
    - Update role management in `frontend/src/utils/roleManagement.ts`

## 📊 Data Models

The application uses comprehensive TypeScript interfaces for type safety:

### **Core Entities**

**Pet**

- Complete pet profile (name, species, breed, age, weight, color, gender)
- Microchip ID tracking
- Medical history array
- Vaccination records array
- Medication records array
- Allergy list
- Custom notes

**User**

- Email, password, full name, phone
- User type (pet_owner, veterinarian, administrator)
- Address, specialization, license number (role-specific)
- Administrator access levels
- Admin tokens for elevated permissions

**Appointment**

- Pet and owner references
- Veterinarian assignment
- Date, time, and appointment type
- Status tracking (scheduled, completed, cancelled)
- Reason and notes
- Clinical information (diagnosis, treatment, follow-up)

**Medical Record**

- Date and type of medical event
- Description and diagnosis
- Attending veterinarian
- Treatment details

**Vaccination Record**

- Vaccine name and type
- Administration date
- Next due date for reminders

**Medication Record**

- Medication name and dosage
- Start and end dates
- Administration schedule

**Password Reset Token**

- Secure token generation
- Email reference
- Expiration timestamp
- Used status tracking
- User type association

## 🔒 Security Features

- **Role-Based Access Control (RBAC)**
    - Three distinct user roles with specific permissions
    - Hierarchical administrator access levels
    - Permission-based feature visibility
- **Authentication Security**
    - Secure password storage (development mode)
    - Session management with localStorage
    - Role-based login verification
- **Password Recovery Security**
    - Cryptographically secure token generation (64-character tokens)
    - Token expiration after 1 hour
    - One-time use tokens with usage tracking
    - Email enumeration protection
    - Automatic cleanup of expired tokens
- **Input Validation**
    - Zod schema validation for all forms
    - React Hook Form integration
    - Server-side validation simulation
    - Type-safe data handling
- **Access Control**
    - Permission-based UI rendering
    - Access level hierarchy enforcement
    - Protected routes and features
    - Secure user management operations

## 📱 Responsive Design

- **Mobile-first approach**
- **Responsive grid layouts**
- **Touch-friendly interfaces**
- **Adaptive navigation**
- **Optimized for all screen sizes**

## 🧪 Testing

The application includes comprehensive demo data for testing:

- **Pre-loaded User Accounts**: demo users across all three roles
- **Sample Pet Profiles**: Multiple pets with complete medical histories
- **Example Appointments**: Scheduled, completed, and cancelled appointments
- **Medical Records**: Vaccinations, medications, and clinical notes
- **Test Data Initialization**: Automatic demo data setup on first launch
- **Password Reset Testing**: Email logs stored in localStorage for verification
- **Console Logging**: Password reset emails logged to browser console

## 🔮 Future Enhancements

### **Planned Features**

-- ✅ ~~Real-time notifications with WebSockets~~ **COMPLETED** (see [06-REALTIME-NOTIFICATIONS.md](./docs/06-REALTIME-NOTIFICATIONS.md))

- Advanced reporting and analytics dashboards
- Multi-clinic support with clinic management
- External API integrations (labs, pharmacies)
- Mobile application (React Native)
- File upload and document management (medical records, x-rays)
- SMS and email appointment reminders
- Payment processing integration
- Prescription management system
- Inventory management for clinics
- Client portal with direct messaging
- Video consultation integration

### **Technical Improvements**

- ✅ ~~Database integration (Neon PostgreSQL)~~ **COMPLETED**
- ✅ ~~JWT authentication~~ **COMPLETED**
- ✅ ~~Serverless API with Netlify~~ **COMPLETED**
  -- ✅ ~~Real-time updates with Pusher WebSockets~~ **COMPLETED** (see [06-REALTIME-NOTIFICATIONS.md](./docs/06-REALTIME-NOTIFICATIONS.md))
- ✅ ~~Advanced caching strategies (Edge Functions)~~ **COMPLETED** (Edge cache for `GET /api/*`)
- Performance optimizations (lazy loading, code splitting)
- Comprehensive test coverage (Jest, React Testing Library, Playwright)
- CI/CD pipeline with Netlify automatic deploys
- Email service integration (SendGrid, AWS SES)
- Cloud storage for documents (AWS S3, Cloudinary)
- Monitoring and error tracking (Sentry, LogRocket)
- SEO optimization and meta tags
- Rate limiting and API protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Environment & secrets (IMPORTANT)

Do NOT commit `.env` files or any secrets to the repository. If you accidentally staged a `.env` file, remove it from the index and rotate the secret immediately:

```bash
# Remove from git index but keep the file locally
git rm --cached .env || true
# Commit the removal
git commit -m "chore: remove accidentally staged .env"
# Rotate any secrets that may have been exposed
```

Ensure `.gitignore` contains entries for `.env`, `.env.local`, and `.env.*.local` (this repo includes them by default).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- Open an issue on GitHub
- Check the documentation

---

**Built with ❤️ for better pet care management**
