# 🐾 PetCare Management System

A comprehensive pet care management system built with modern web technologies, offering role-based dashboards for pet owners, veterinarians, and administrators.

![PetCare](https://img.shields.io/badge/PetCare-Management%20System-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-cyan)

## ⚡ Key Highlights

- ✅ **Complete Pet Management** with medical history, vaccinations, and medications
- ✅ **Comprehensive Appointment System** with scheduling, rescheduling, and status tracking
- ✅ **Role-Based Access Control** with three distinct user roles and hierarchical admin levels
- ✅ **Password Recovery System** with secure token generation and email notifications
- ✅ **Medical Records Management** for veterinarians with clinical notes and treatment plans
- ✅ **Advanced Search & Filtering** across users, pets, and appointments
- ✅ **Real-Time Dashboard Analytics** for all user types
- ✅ **Full CRUD Operations** on users, pets, appointments, and medical records
- ✅ **Service Layer Architecture** with dedicated services for data management
- ✅ **Type-Safe Development** with TypeScript and Zod validation

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
- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **Styling**: Tailwind CSS 3.4.11
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: React hooks and context
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Data Storage**: localStorage (demo/development)

### **Project Structure**
```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (40+ components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── table.tsx
│   │   └── ... (and more)
│   ├── Auth/                  # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── PasswordRecoveryDemo.tsx
│   ├── Dashboard/             # Role-based dashboards
│   │   ├── PetOwnerDashboard.tsx
│   │   ├── VeterinarianDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── Admin/                 # Admin-specific components
│   │   ├── UserForm.tsx
│   │   └── UserManagementDialogs.tsx
│   ├── Pet/                   # Pet management components
│   │   └── PetManagement.tsx
│   ├── Appointment/           # Appointment components
│   │   └── AppointmentScheduling.tsx
│   └── Medical/               # Medical history components
│       └── MedicalHistoryManagement.tsx
├── services/                  # Business logic and data services
│   ├── userService.ts         # User management operations
│   ├── petService.ts          # Pet CRUD operations
│   └── appointmentService.ts  # Appointment management
├── schemas/                   # Zod validation schemas
│   └── userSchema.ts          # User form validation
├── utils/                     # Utility functions
│   ├── roleManagement.ts      # RBAC and permissions
│   ├── passwordRecovery.ts    # Password reset utilities
│   └── testData.ts           # Demo data initialization
├── lib/                       # External integrations
│   ├── supabase.ts            # Supabase client & email service
│   └── utils.ts               # General utilities
├── hooks/                     # Custom React hooks
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── pages/                     # Page components
│   ├── Index.tsx
│   └── NotFound.tsx
├── types.ts                   # TypeScript type definitions
└── App.tsx                    # Main application component
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd petcare-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm run dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 Demo Credentials

These accounts are preloaded via demo data and can be used to explore each dashboard:

### Administrator
- Super Admin: `admin@petcare.com` / `adminpass123`
- Elevated Admin: `admin.elevated@petcare.com` / `adminpass123`
- Standard Admin: `admin.standard@petcare.com` / `adminpass123`

### Veterinarian
- Primary: `vet@petcare.com` / `vet123`
- Dr. Martinez: `dr.martinez@petcare.com` / `vetpass123`
- Dr. Thompson: `dr.thompson@petcare.com` / `vetpass123`

### Pet Owner
- Primary: `owner@petcare.com` / `owner123`
- Sarah Johnson: `sarah.johnson@email.com` / `password123`
- Michael Chen: `michael.chen@email.com` / `password123`
- Emma Rodriguez: `emma.rodriguez@email.com` / `password123`

Note: Password reset demo emails are logged in localStorage and visible in the console.

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
# Development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Lint code
pnpm run lint
```

### **Code Structure Guidelines**

1. **Components**: Use functional components with TypeScript
2. **Styling**: Tailwind CSS classes with shadcn/ui components
3. **State Management**: React hooks (useState, useEffect, useCallback)
4. **Forms**: React Hook Form with Zod validation
5. **Data Management**: Service layer pattern for business logic
6. **Type Safety**: Comprehensive TypeScript types and interfaces

### **Service Layer Architecture**

The application uses a service layer pattern for data management:

**UserService** (`userService.ts`)
- Create, read, update, delete user operations
- User search and filtering
- Administrator privilege management
- Role-based user queries

**PetService** (`petService.ts`)
- Pet CRUD operations
- Medical record management (add, update, delete)
- Vaccination record management (add, update, delete)
- Medication record management (add, update, delete)
- Allergy and notes management
- Pet search functionality
- Owner-based and system-wide pet queries

**AppointmentService** (`appointmentService.ts`)
- Appointment CRUD operations
- Status management (scheduled, completed, cancelled)
- Appointment rescheduling
- Veterinarian-based appointment queries
- Date range filtering
- Status-based filtering

**Email Service** (`supabase.ts`)
- Password reset email generation
- Password change confirmation emails
- Demo email logging for development
- Email history tracking

### **Adding New Features**

1. **Create Types**: Add TypeScript interfaces in `src/types.ts`
2. **Service Layer**: Add business logic in `src/services/`
3. **Validation**: Create Zod schemas in `src/schemas/`
4. **Components**: Build UI components with shadcn/ui
5. **Permissions**: Update role management in `src/utils/roleManagement.ts`

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
- **Pre-loaded User Accounts**: 9 demo users across all three roles
- **Sample Pet Profiles**: Multiple pets with complete medical histories
- **Example Appointments**: Scheduled, completed, and cancelled appointments
- **Medical Records**: Vaccinations, medications, and clinical notes
- **Test Data Initialization**: Automatic demo data setup on first launch
- **Password Reset Testing**: Email logs stored in localStorage for verification
- **Console Logging**: Password reset emails logged to browser console

## 🔮 Future Enhancements

### **Planned Features**
- Real-time notifications and alerts system
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
- Database integration (PostgreSQL/MongoDB/Supabase)
- Real-time updates with WebSockets or Supabase Realtime
- Advanced caching strategies (Redis)
- Performance optimizations (lazy loading, code splitting)
- Comprehensive test coverage (Jest, React Testing Library, Playwright)
- Docker containerization for development and deployment
- CI/CD pipeline setup (GitHub Actions)
- Production-ready authentication (Supabase Auth, Auth0)
- Email service integration (SendGrid, AWS SES)
- Cloud storage for documents (AWS S3, Cloudinary)
- Monitoring and error tracking (Sentry, LogRocket)
- SEO optimization and meta tags

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
- Contact the development team
- Check the documentation

---

**Built with ❤️ for better pet care management**
