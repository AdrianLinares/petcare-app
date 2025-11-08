# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Essential Development Commands

### Development Workflow
```bash
# Start development server (runs on http://localhost:5173)
pnpm run dev
# or: npm run dev

# Build for production
pnpm run build
# or: npm run build

# Preview production build
pnpm run preview
# or: npm run preview

# Lint code
pnpm run lint
# or: npm run lint
```

### Testing Access
This project uses localStorage-based demo data. No separate test command exists. Use the pre-configured demo accounts listed below to test functionality.

**Demo Credentials:**
- Super Admin: `admin@petcare.com` / `adminpass123`
- Veterinarian: `vet@petcare.com` / `vet123`
- Pet Owner: `owner@petcare.com` / `owner123`

## Core Architecture

### Data Storage Pattern
This application uses **localStorage** as the data persistence layer (development/demo mode). All CRUD operations go through service classes:

- **UserService** (`src/services/userService.ts`): User management, authentication
- **PetService** (`src/services/petService.ts`): Pet records, medical history, vaccinations, medications
- **AppointmentService** (`src/services/appointmentService.ts`): Appointment scheduling and status management

Data keys follow these patterns:
- Users: `user_${email}`
- Pets: `pets_${ownerId}`
- Appointments: `appointments_${userId}` or `appointments_vet_${vetId}`
- Clinical Records: `clinicalRecords_${petId}`
- Password Reset Tokens: `passwordResetTokens`
- Email Logs: `emailLogs`

### State Management
The app uses React hooks for state management:
- `App.tsx` maintains global state for `currentUser`
- Dashboard components manage their own local state
- No Redux or Context API—state is lifted to common ancestors when needed

### Component Structure
```
components/
├── ui/              # shadcn/ui primitives (Button, Card, Dialog, etc.)
├── Auth/            # Login, password recovery
├── Dashboard/       # Role-specific dashboards (PetOwner, Veterinarian, Admin)
├── Pet/             # Pet management features
├── Appointment/     # Appointment scheduling
├── Medical/         # Medical history management
└── Admin/           # User management (admin-only)
```

### Role-Based Access Control (RBAC)
The `roleManagement.ts` utility handles all permission checks:

**User Roles:**
1. `pet_owner`: Manages own pets and appointments
2. `veterinarian`: Manages patient records and clinical notes
3. `administrator`: User management with three access levels:
   - `standard`: Manage pet owners and veterinarians
   - `elevated`: Advanced features + clinical record editing
   - `super_admin`: Full system access, can manage other admins

**Key Permission Patterns:**
- Check permissions via `RoleManager.hasPermission(user, 'permissionName')`
- Check user management rights via `RoleManager.canManageUser(currentUser, targetUser)`
- Get creatable user types via `RoleManager.getCreatableUserTypes(currentUser)`

### TypeScript Types
All core types are defined in `src/types.ts`:
- `User`: Email, password, userType, accessLevel
- `Pet`: Owner reference, medical history arrays
- `Appointment`: Pet/owner/vet references, status tracking
- `MedicalRecord`, `VaccinationRecord`, `MedicationRecord`: Nested within Pet
- `PasswordResetToken`: Password recovery system
- `EmailLog`: Demo email tracking

### Authentication Flow
1. Login credentials checked against localStorage (`user_${email}`)
2. On success, user object saved to both state and localStorage (`currentUser`)
3. `App.tsx` renders appropriate dashboard based on `user.userType`
4. Logout clears `currentUser` from state and localStorage

### Password Recovery System
- Token generation: 64-character cryptographic tokens (`src/utils/passwordRecovery.ts`)
- Tokens expire after 1 hour
- Email logs stored in localStorage for demo purposes
- Reset URLs follow pattern: `#reset-password?token=abc123`

### Form Validation
- Forms use **React Hook Form** with **Zod** schemas
- Validation schemas in `src/schemas/` (e.g., `userSchema.ts`)
- Pattern: Define Zod schema → Use `zodResolver` in useForm → Access via `register` and `handleSubmit`

## Important Development Notes

### Adding New Features
1. **Define types** in `src/types.ts`
2. **Create/update service** in `src/services/` for business logic
3. **Add validation** schema in `src/schemas/` if needed
4. **Build UI** using shadcn/ui components from `components/ui/`
5. **Check permissions** using `RoleManager` for role-restricted features

### Working with localStorage
- Always use service classes (UserService, PetService, AppointmentService)
- Never directly access localStorage in components
- Service methods return `{ success: boolean, data?: T, error?: string }`

### Styling Approach
- **Tailwind CSS** utility classes for all styling
- **shadcn/ui** for pre-built components
- Component variants use `class-variance-authority` (CVA)
- Utility: `cn()` from `lib/utils.ts` for conditional class merging

### Path Aliases
- `@/` resolves to `src/` (configured in `vite.config.ts` and `tsconfig.json`)
- Use `@/components/`, `@/services/`, etc. in imports

### Demo Data Initialization
- `utils/testData.ts` contains `initializeTestData()` function
- Called on app mount in `App.tsx`
- Creates 9 demo users, multiple pets, and sample appointments
- Safe to call multiple times (checks for existing data)

## Key Patterns to Follow

### Service Layer Pattern
All data operations must go through service classes:
```typescript
// Good
const result = UserService.createUser(userData);
if (result.success) {
  // Handle success
}

// Bad
localStorage.setItem('user_' + email, JSON.stringify(user));
```

### Permission-Based Rendering
Always check permissions before showing admin features:
```typescript
const canManage = RoleManager.hasPermission(currentUser, 'canEditUsers');
{canManage && <EditButton />}
```

### Array Updates in Pet Records
When updating nested arrays (medical history, vaccinations, medications):
```typescript
// Use PetService methods
PetService.addVaccinationRecord(petId, vaccinationData);
PetService.updateMedicalRecord(petId, index, updatedRecord);
PetService.deleteVaccinationRecord(petId, index);
```

## Future Architecture Plans (from README)
- Database integration (PostgreSQL/MongoDB/Supabase)
- Real authentication (Supabase Auth, Auth0)
- Real email service (SendGrid, AWS SES)
- File uploads (AWS S3, Cloudinary)
- WebSockets for real-time updates
- Test coverage (Jest, React Testing Library, Playwright)

## Documentation
For detailed explanations aimed at beginners, see:
- `ARCHITECTURE.md`: System overview and concepts
- `BEGINNER_GUIDE.md`: Step-by-step code explanations
- `CODE_COMMENTS_GUIDE.md`: How to read inline comments
- `DOCUMENTATION_INDEX.md`: Navigation guide
