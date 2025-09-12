# 🐾 PetCare Management System

A comprehensive pet care management system built with modern web technologies, offering role-based dashboards for pet owners, veterinarians, and administrators.

![PetCare](https://img.shields.io/badge/PetCare-Management%20System-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.1-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-cyan)

## ✨ Features

### 🏠 **Pet Owner Dashboard**
- Pet profile management with complete medical history
- Vaccination tracking and reminders
- Medication management
- Appointment scheduling and management
- Medical record viewing
- Pet photo and document storage

### 👨‍⚕️ **Veterinarian Dashboard**
- Patient (pet) management
- Appointment scheduling and tracking
- Clinical record creation and management
- Medical history access
- Treatment plan management
- Practice analytics and reports

### 🛡️ **Administrator Dashboard**
- **Complete User Management System**:
  - Create, edit, and delete users of all types
  - Role-based access control (RBAC)
  - User search and filtering
  - Bulk operations support
- **System Analytics**:
  - User statistics and demographics
  - Appointment analytics
  - System performance metrics
- **Access Control**:
  - Hierarchical admin permissions
  - Super Admin, Elevated Admin, Standard Admin levels
  - Permission-based UI elements

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
│   ├── ui/                    # shadcn/ui components
│   ├── Auth/                  # Authentication components
│   ├── Dashboard/             # Role-based dashboards
│   └── Admin/                 # Admin-specific components
├── services/                  # Business logic and data services
│   └── userService.ts         # User management operations
├── schemas/                   # Zod validation schemas
│   └── userSchema.ts          # User form validation
├── utils/                     # Utility functions
│   ├── roleManagement.ts      # RBAC and permissions
│   └── testData.ts           # Demo data initialization
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

### Administrator
- **Email**: `admin@petcare.com`
- **Password**: `adminpass123`
- **Access Level**: Super Admin
- **Additional Admins**:
  - `admin.elevated@petcare.com` / `adminpass123` (Elevated Admin)
  - `admin.standard@petcare.com` / `adminpass123` (Standard Admin)

### Veterinarian
- **Primary**: `vet@petcare.com` / `vet123`
- **Additional**: 
  - `dr.martinez@petcare.com` / `vetpass123`
  - `dr.thompson@petcare.com` / `vetpass123`

### Pet Owner
- **Primary**: `owner@petcare.com` / `owner123`
- **Additional**:
  - `sarah.johnson@email.com` / `password123`
  - `michael.chen@email.com` / `password123`
  - `emma.rodriguez@email.com` / `password123`

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

### **Adding New Features**

1. **Create Types**: Add TypeScript interfaces in `src/types.ts`
2. **Service Layer**: Add business logic in `src/services/`
3. **Validation**: Create Zod schemas in `src/schemas/`
4. **Components**: Build UI components with shadcn/ui
5. **Permissions**: Update role management in `src/utils/roleManagement.ts`

## 🔒 Security Features

- **Role-Based Access Control (RBAC)**
- **Input validation and sanitization**
- **Permission-based UI rendering**
- **Secure user management operations**
- **Form validation with error handling**
- **Access level hierarchy enforcement**

## 📱 Responsive Design

- **Mobile-first approach**
- **Responsive grid layouts**
- **Touch-friendly interfaces**
- **Adaptive navigation**
- **Optimized for all screen sizes**

## 🧪 Testing

The application includes demo data for testing:
- Pre-loaded user accounts for each role
- Sample pet profiles with medical history
- Example appointments and clinical records
- Test data initialization on first launch

## 🔮 Future Enhancements

### **Planned Features**
- Real-time notifications and alerts
- Advanced reporting and analytics
- Multi-clinic support
- API integration for external services
- Mobile application
- File upload and document management
- Appointment reminders and notifications
- Payment processing integration

### **Technical Improvements**
- Database integration (PostgreSQL/MongoDB)
- Real-time updates with WebSockets
- Advanced caching strategies
- Performance optimizations
- Comprehensive test coverage
- Docker containerization
- CI/CD pipeline setup

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
