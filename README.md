# 🐾 PetCare Management System

A comprehensive pet care management system built with modern web technologies, offering role-based dashboards for pet owners, veterinarians, and administrators. Deployed as a serverless application on Netlify with Neon PostgreSQL database.

![PetCare](https://img.shields.io/badge/PetCare-Management%20System-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-cyan)
![Netlify](https://img.shields.io/badge/Netlify-Serverless-00C7B7)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-4F46E5)

## ⚡ Key Highlights

- ✅ **Complete Pet Management** with medical history, vaccinations, and medications
- ✅ **Comprehensive Appointment System** with scheduling, rescheduling, and status tracking
- ✅ **Role-Based Access Control** with three distinct user roles and hierarchical admin levels
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

## 📚 Documentation for Beginners

**New to programming or React? We've got comprehensive guides for you!**

### 🎯 Start Here: 

- **[BEGINNER_GUIDE.md](./BEGINNER_GUIDE.md)** - Step-by-step guide to understanding the codebase
  - Explains React, TypeScript, and all core concepts
  - Includes code examples and practice exercises
  - ~60 minutes reading time

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Overview of how the application is structured  
  - Big-picture view of the system
  - Technology explanations
  - Common patterns used throughout
  - ~30 minutes reading time

- **[CODE_COMMENTS_GUIDE.md](./CODE_COMMENTS_GUIDE.md)** - How to read code comments
  - Explains comment types and styles
  - Navigation strategies
  - Tips for learning from comments
  - ~20 minutes reading time

### ✨ What You'll Learn

- What React, TypeScript, and Tailwind CSS are and how they work
- How components, props, and state work
- How data flows through the application
- Common React patterns used in the code
- Step-by-step explanations of key features (login, pet management, appointments)
- How to read and navigate code comments
- Debugging tips and best practices

### 📝 Code Comments

All major code files include detailed inline comments explaining:
- What each section does
- Why it's written that way
- Step-by-step breakdowns of complex logic
- Beginner-friendly explanations of programming concepts

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Netlify CLI (optional for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd petcare-app
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   # This installs dependencies for frontend and serverless functions
   ```

3. **Configure environment variables**
   
  Copy the example file and adjust values for your environment:
  ```bash
  cp .env.example .env
  ```
   
  The `.env.example` file documents the required variables.
  Keep `.env.example` in sync whenever new variables are added.

4. **Start development server**
   ```bash
   npm run dev
   # Runs Netlify Dev on http://localhost:8888
   ```

5. **Open your browser**
   Navigate to `http://localhost:8888`

### Demo Data (Development)

- On first load, the app seeds demo data (users, pets, appointments)
  into `localStorage` via an initializer in `frontend/src/utils/testData.ts`.
- This makes the app usable without a real database during development.
- In production, configure the serverless API with a PostgreSQL database.

### Deployment to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize site**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

For detailed deployment instructions, see [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md).

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
npm run dev

# Build frontend for production
npm run build

# Install all dependencies (root, frontend, functions)
npm run install:all

# Install only functions dependencies
npm run install:functions
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
- Real-time notifications with WebSockets
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
- Real-time updates with WebSockets or Pusher
- Advanced caching strategies (Edge Functions)
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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation

---

**Built with ❤️ for better pet care management**
