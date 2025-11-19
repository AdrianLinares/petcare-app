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
This project uses a PostgreSQL database with seeded demo data. Use the pre-configured demo accounts listed below to test functionality.

**Demo Credentials:**
- Super Admin: `admin@petcare.com` / `password123`
- Veterinarian: `vet@petcare.com` / `password123`
- Pet Owner: `owner@petcare.com` / `password123`

## Core Architecture

### Data Storage Pattern
This application uses a **PostgreSQL database** as the data persistence layer. All CRUD operations go through the backend REST API:

- **Serverless API** (`netlify/functions/`): RESTful API with Netlify Functions
- **Frontend API Client** (`frontend/src/lib/api.ts`): Axios-based HTTP client with JWT authentication

**API Modules:**
- `authAPI`: Authentication, login, registration, password reset
- `userAPI`: User management (create, update, delete, list)
- `petAPI`: Pet CRUD operations
- `appointmentAPI`: Appointment scheduling and management
- `medicalRecordAPI`: Medical history records
- `vaccinationAPI`: Vaccination tracking
- `medicationAPI`: Medication management
- `notificationAPI`: System notifications

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
1. Login credentials sent to backend API (`/api/auth/login`)
2. Backend validates and returns JWT token + user object
3. Token stored in localStorage, attached to all subsequent API requests
4. `App.tsx` renders appropriate dashboard based on `user.userType`
5. Logout clears token and user data from localStorage

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

**Backend:**
1. **Define serverless endpoint** in `netlify/functions/`
2. **Add database queries** using Neon connection
3. **Add validation** in route handlers
4. **Test with API client** (Postman, Insomnia)

**Frontend:**
1. **Define types** in `frontend/src/types.ts`
2. **Update API client** in `frontend/src/lib/api.ts`
3. **Add validation schema** in `frontend/src/schemas/` if needed
4. **Build UI** using shadcn/ui components from `components/ui/`
5. **Check permissions** using `RoleManager` for role-restricted features

### Working with the API
- Always use the API client from `frontend/src/lib/api.ts`
- Never make direct axios calls in components
- API methods are async and return promises
- JWT token is automatically attached to requests
- Error handling is centralized in interceptors

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

### API Client Pattern
All data operations must go through the API client:
```typescript
// Good
import { userAPI } from '@/lib/api';

const handleCreateUser = async (userData) => {
  try {
    const user = await userAPI.createUser(userData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};

// Bad - Never make direct API calls
import axios from 'axios';
const response = await axios.post('http://localhost:3001/users', userData);
```

### Permission-Based Rendering
Always check permissions before showing admin features:
```typescript
const canManage = RoleManager.hasPermission(currentUser, 'canEditUsers');
{canManage && <EditButton />}
```

### Medical Records Management
When working with medical records, use the appropriate API:
```typescript
// Medical records
import { medicalRecordAPI } from '@/lib/api';
await medicalRecordAPI.create({ petId, date, recordType, description });
await medicalRecordAPI.update(recordId, updates);
await medicalRecordAPI.delete(recordId);

// Vaccinations
import { vaccinationAPI } from '@/lib/api';
await vaccinationAPI.create({ petId, vaccine, date, nextDue });
await vaccinationAPI.update(vaccinationId, updates);
await vaccinationAPI.delete(vaccinationId);

// Medications
import { medicationAPI } from '@/lib/api';
await medicationAPI.create({ petId, name, dosage, startDate, endDate });
await medicationAPI.update(medicationId, updates);
await medicationAPI.delete(medicationId);
```

## Migration Status

### ✅ Completed
- Database integration (PostgreSQL)
- JWT authentication
- RESTful API backend
- Full frontend-backend integration
- Medical records API
- User management API

### 🔄 Future Plans
- Real email service (SendGrid, AWS SES)
- File uploads (AWS S3, Cloudinary)
- WebSockets for real-time updates
- Test coverage (Jest, React Testing Library, Playwright)
- Docker containerization
- CI/CD pipeline

## Documentation
For detailed explanations aimed at beginners, see:
- `ARCHITECTURE.md`: System overview and concepts
- `BEGINNER_GUIDE.md`: Step-by-step code explanations
- `CODE_COMMENTS_GUIDE.md`: How to read inline comments
- `DOCUMENTATION_INDEX.md`: Navigation guide
