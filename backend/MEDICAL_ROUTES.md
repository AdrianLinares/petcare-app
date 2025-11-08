# Medical Records API Routes

This document describes the newly added medical record routes for the PetCare backend API.

## Overview

Four new route modules have been added to handle medical records, vaccinations, medications, and clinical records:

1. **Medical Records** (`/api/medical-records`) - General medical history entries
2. **Vaccinations** (`/api/vaccinations`) - Vaccination records and reminders
3. **Medications** (`/api/medications`) - Medication prescriptions and tracking
4. **Clinical Records** (`/api/clinical-records`) - Detailed clinical notes from appointments

## Authentication & Authorization

All routes require JWT authentication. Authorization levels:
- **Pet Owners**: Read-only access to their own pets' records
- **Veterinarians**: Full CRUD access to all medical records
- **Administrators**: Full CRUD access including delete operations

## Medical Records Routes

### GET `/api/medical-records/pet/:petId`
Get all medical records for a specific pet.

**Authorization**: Authenticated users (owners see only their pets)

**Response**:
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "date": "2025-01-08",
    "recordType": "Checkup",
    "description": "Annual checkup completed",
    "veterinarianId": "uuid",
    "veterinarianName": "Dr. Smith",
    "createdAt": "2025-01-08T10:00:00Z",
    "updatedAt": "2025-01-08T10:00:00Z"
  }
]
```

### GET `/api/medical-records/:id`
Get a single medical record by ID.

**Authorization**: Authenticated users (owners see only their pets)

### POST `/api/medical-records`
Create a new medical record.

**Authorization**: Veterinarians and Administrators only

**Request Body**:
```json
{
  "petId": "uuid",
  "date": "2025-01-08",
  "recordType": "Checkup",
  "description": "Annual checkup completed"
}
```

### PATCH `/api/medical-records/:id`
Update an existing medical record.

**Authorization**: Veterinarians and Administrators only

**Request Body** (all fields optional):
```json
{
  "date": "2025-01-08",
  "recordType": "Emergency",
  "description": "Updated description"
}
```

### DELETE `/api/medical-records/:id`
Delete a medical record.

**Authorization**: Administrators only

---

## Vaccinations Routes

### GET `/api/vaccinations/pet/:petId`
Get all vaccination records for a specific pet.

**Authorization**: Authenticated users (owners see only their pets)

**Response**:
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "vaccine": "Rabies",
    "date": "2024-01-15",
    "nextDue": "2025-01-15",
    "administeredBy": "uuid",
    "administeredByName": "Dr. Smith",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### GET `/api/vaccinations/upcoming`
Get upcoming vaccinations due in the next 30 days.

**Authorization**: Authenticated users (owners see only their pets)

**Response**:
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "petName": "Max",
    "ownerId": "uuid",
    "ownerName": "John Doe",
    "vaccine": "Rabies",
    "date": "2024-01-15",
    "nextDue": "2025-02-01"
  }
]
```

### GET `/api/vaccinations/:id`
Get a single vaccination record by ID.

### POST `/api/vaccinations`
Create a new vaccination record.

**Authorization**: Veterinarians and Administrators only

**Request Body**:
```json
{
  "petId": "uuid",
  "vaccine": "Rabies",
  "date": "2025-01-08",
  "nextDue": "2026-01-08"
}
```

### PATCH `/api/vaccinations/:id`
Update a vaccination record.

**Authorization**: Veterinarians and Administrators only

### DELETE `/api/vaccinations/:id`
Delete a vaccination record.

**Authorization**: Administrators only

---

## Medications Routes

### GET `/api/medications/pet/:petId`
Get all medications for a specific pet (active and inactive).

**Authorization**: Authenticated users (owners see only their pets)

**Response**:
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "name": "Antibiotics",
    "dosage": "500mg twice daily",
    "startDate": "2025-01-01",
    "endDate": "2025-01-14",
    "prescribedBy": "uuid",
    "prescribedByName": "Dr. Smith",
    "active": true,
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  }
]
```

### GET `/api/medications/active`
Get all active medications across all pets.

**Authorization**: Authenticated users (owners see only their pets)

**Response**: Similar to above, includes `petName`, `ownerId`, `ownerName`

### GET `/api/medications/:id`
Get a single medication record by ID.

### POST `/api/medications`
Create a new medication record.

**Authorization**: Veterinarians and Administrators only

**Request Body**:
```json
{
  "petId": "uuid",
  "name": "Antibiotics",
  "dosage": "500mg twice daily",
  "startDate": "2025-01-08",
  "endDate": "2025-01-22",
  "active": true
}
```

### PATCH `/api/medications/:id`
Update a medication record.

**Authorization**: Veterinarians and Administrators only

### PATCH `/api/medications/:id/deactivate`
Deactivate a medication (soft delete).

**Authorization**: Veterinarians and Administrators only

**Response**:
```json
{
  "message": "Medication deactivated successfully",
  "id": "uuid"
}
```

### DELETE `/api/medications/:id`
Delete a medication record (hard delete).

**Authorization**: Administrators only

---

## Clinical Records Routes

### GET `/api/clinical-records/pet/:petId`
Get all clinical records for a specific pet.

**Authorization**: Authenticated users (owners see only their pets)

**Response**:
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "appointmentId": "uuid",
    "appointmentType": "Checkup",
    "veterinarianId": "uuid",
    "veterinarianName": "Dr. Smith",
    "date": "2025-01-08",
    "symptoms": "Coughing, lethargy",
    "diagnosis": "Upper respiratory infection",
    "treatment": "Antibiotics prescribed",
    "medications": ["Amoxicillin 500mg", "Cough suppressant"],
    "notes": "Follow up in 2 weeks",
    "followUpDate": "2025-01-22",
    "createdAt": "2025-01-08T10:00:00Z",
    "updatedAt": "2025-01-08T10:00:00Z"
  }
]
```

### GET `/api/clinical-records/:id`
Get a single clinical record by ID.

### POST `/api/clinical-records`
Create a new clinical record.

**Authorization**: Veterinarians and Administrators only

**Request Body**:
```json
{
  "petId": "uuid",
  "appointmentId": "uuid",
  "date": "2025-01-08",
  "symptoms": "Coughing, lethargy",
  "diagnosis": "Upper respiratory infection",
  "treatment": "Antibiotics prescribed",
  "medications": ["Amoxicillin 500mg"],
  "notes": "Follow up in 2 weeks",
  "followUpDate": "2025-01-22"
}
```

### PATCH `/api/clinical-records/:id`
Update a clinical record.

**Authorization**: Veterinarians and Administrators only

### DELETE `/api/clinical-records/:id`
Delete a clinical record.

**Authorization**: Administrators only

---

## Common Patterns

### Error Responses

All routes return standard error responses:

**400 Bad Request**:
```json
{
  "error": "Missing required fields"
}
```

**401 Unauthorized**:
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden**:
```json
{
  "error": "Access denied"
}
```

**404 Not Found**:
```json
{
  "error": "Record not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to perform operation"
}
```

### Authorization Checks

All routes perform the following authorization checks:
1. JWT token validation
2. User type verification
3. Pet ownership verification (for pet owners)
4. Soft-deleted record filtering (WHERE deleted_at IS NULL)

### Timestamps

All records include:
- `createdAt`: Automatically set on creation
- `updatedAt`: Automatically updated via database trigger

### Database Relationships

- Medical records → pets → users (owners)
- Vaccinations → pets → users (owners)
- Medications → pets → users (owners)
- Clinical records → pets, appointments → users

---

## Testing

### Example cURL Requests

**Get vaccinations for a pet**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/vaccinations/pet/PET_ID
```

**Create a medication record** (as veterinarian):
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "PET_ID",
    "name": "Antibiotics",
    "dosage": "500mg twice daily",
    "startDate": "2025-01-08",
    "active": true
  }' \
  http://localhost:3001/api/medications
```

**Get upcoming vaccinations**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/vaccinations/upcoming
```

---

## Integration with Frontend

To use these routes in the frontend, add the following to `frontend/src/lib/api.ts`:

```typescript
// Medical Records API
export const medicalRecordAPI = {
  getByPet: (petId: string) => apiClient.get(`/medical-records/pet/${petId}`),
  getById: (id: string) => apiClient.get(`/medical-records/${id}`),
  create: (data: any) => apiClient.post('/medical-records', data),
  update: (id: string, data: any) => apiClient.patch(`/medical-records/${id}`, data),
  delete: (id: string) => apiClient.delete(`/medical-records/${id}`),
};

// Vaccinations API
export const vaccinationAPI = {
  getByPet: (petId: string) => apiClient.get(`/vaccinations/pet/${petId}`),
  getUpcoming: () => apiClient.get('/vaccinations/upcoming'),
  getById: (id: string) => apiClient.get(`/vaccinations/${id}`),
  create: (data: any) => apiClient.post('/vaccinations', data),
  update: (id: string, data: any) => apiClient.patch(`/vaccinations/${id}`, data),
  delete: (id: string) => apiClient.delete(`/vaccinations/${id}`),
};

// Medications API
export const medicationAPI = {
  getByPet: (petId: string) => apiClient.get(`/medications/pet/${petId}`),
  getActive: () => apiClient.get('/medications/active'),
  getById: (id: string) => apiClient.get(`/medications/${id}`),
  create: (data: any) => apiClient.post('/medications', data),
  update: (id: string, data: any) => apiClient.patch(`/medications/${id}`, data),
  deactivate: (id: string) => apiClient.patch(`/medications/${id}/deactivate`),
  delete: (id: string) => apiClient.delete(`/medications/${id}`),
};

// Clinical Records API
export const clinicalRecordAPI = {
  getByPet: (petId: string) => apiClient.get(`/clinical-records/pet/${petId}`),
  getById: (id: string) => apiClient.get(`/clinical-records/${id}`),
  create: (data: any) => apiClient.post('/clinical-records', data),
  update: (id: string, data: any) => apiClient.patch(`/clinical-records/${id}`, data),
  delete: (id: string) => apiClient.delete(`/clinical-records/${id}`),
};
```

---

## Database Schema

These routes interact with the following database tables:

- `medical_records` - General medical history
- `vaccinations` - Vaccination records
- `medications` - Medication prescriptions
- `clinical_records` - Detailed clinical notes
- `pets` - Pet information
- `users` - User (owner/vet) information
- `appointments` - Appointment records (for clinical records)

All schemas are defined in `backend/database/schema.sql`.

---

## Status

✅ **Routes Implemented**: All 4 route modules complete
✅ **TypeScript Build**: Passing
✅ **Authentication**: JWT middleware integrated
✅ **Authorization**: Role-based access control implemented
✅ **Error Handling**: Standardized error responses
✅ **Database Integration**: PostgreSQL queries implemented

**Next Steps**:
1. Add frontend API integration
2. Create UI components for medical record management
3. Add unit tests for routes
4. Add integration tests

---

**Last Updated**: 2025-01-08
