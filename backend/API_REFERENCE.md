# PetCare API Reference

Complete API documentation for the PetCare backend.

## Base URL

```
http://localhost:3001/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "555-1234",
  "userType": "pet_owner",
  "address": "123 Main St (optional)"
}
```

**Response:** `201 Created`
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "pet_owner"
  }
}
```

### POST /auth/login
Login and receive JWT token.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

### POST /auth/forgot-password
Request password reset email.

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

### POST /auth/reset-password
Reset password using token.

**Body:**
```json
{
  "token": "reset_token_here",
  "password": "new_password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

---

## User Endpoints

### GET /users/me
Get current user profile.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "555-1234",
  "userType": "pet_owner",
  "address": "123 Main St",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### PATCH /users/me
Update current user profile.

**Auth:** Required

**Body:**
```json
{
  "fullName": "John Smith",
  "phone": "555-5678",
  "address": "456 Oak Ave"
}
```

**Response:** `200 OK`

### GET /users
List all users (Admin only).

**Auth:** Required (Administrator)

**Query Params:**
- `userType` - Filter by user type
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "users": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### POST /users
Create a new user (Admin only).

**Auth:** Required (Administrator)

**Body:** Same as register

**Response:** `201 Created`

### DELETE /users/:id
Delete user (Soft delete).

**Auth:** Required (Administrator)

**Response:** `204 No Content`

---

## Pet Endpoints

### GET /pets
Get pets for current user (owner) or all pets (vet/admin).

**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "ownerId": "uuid",
    "name": "Max",
    "species": "Dog",
    "breed": "Golden Retriever",
    "age": 5,
    "weight": 32.5,
    "gender": "Male",
    "microchipId": "CHIP123456",
    "allergies": ["Pollen"],
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### GET /pets/:id
Get single pet details.

**Auth:** Required

**Response:** `200 OK`

### POST /pets
Create a new pet.

**Auth:** Required (Pet Owner)

**Body:**
```json
{
  "name": "Max",
  "species": "Dog",
  "breed": "Golden Retriever",
  "age": 5,
  "weight": 32.5,
  "color": "Golden",
  "gender": "Male",
  "microchipId": "CHIP123456",
  "allergies": ["Pollen", "Dust"],
  "notes": "Very friendly"
}
```

**Response:** `201 Created`

### PATCH /pets/:id
Update pet information.

**Auth:** Required (Owner or Vet)

**Body:** Partial pet object

**Response:** `200 OK`

### DELETE /pets/:id
Delete pet.

**Auth:** Required (Owner)

**Response:** `204 No Content`

---

## Appointment Endpoints

### GET /appointments
Get appointments.

**Auth:** Required

**Query Params:**
- `status` - Filter by status (scheduled, completed, cancelled)
- `date` - Filter by date (YYYY-MM-DD)
- `petId` - Filter by pet

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "petName": "Max",
    "ownerId": "uuid",
    "veterinarianId": "uuid",
    "veterinarianName": "Dr. Smith",
    "type": "Checkup",
    "date": "2025-02-01",
    "time": "10:00",
    "status": "scheduled",
    "reason": "Annual checkup",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### POST /appointments
Create appointment.

**Auth:** Required (Pet Owner)

**Body:**
```json
{
  "petId": "uuid",
  "veterinarianId": "uuid",
  "type": "Checkup",
  "date": "2025-02-01",
  "time": "10:00",
  "reason": "Annual checkup"
}
```

**Response:** `201 Created`

### PATCH /appointments/:id
Update appointment.

**Auth:** Required

**Body:**
```json
{
  "status": "completed",
  "diagnosis": "Healthy",
  "treatment": "None needed",
  "notes": "All vitals normal"
}
```

**Response:** `200 OK`

### DELETE /appointments/:id
Cancel appointment.

**Auth:** Required

**Response:** `200 OK`

---

## Medical Records Endpoints

### GET /pets/:petId/medical-records
Get medical history for a pet.

**Auth:** Required (Owner or Vet)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "date": "2024-06-15",
    "type": "Surgery",
    "description": "Dental cleaning",
    "veterinarianName": "Dr. Smith",
    "createdAt": "2024-06-15T00:00:00Z"
  }
]
```

### POST /pets/:petId/medical-records
Add medical record.

**Auth:** Required (Veterinarian)

**Body:**
```json
{
  "date": "2024-06-15",
  "type": "Surgery",
  "description": "Dental cleaning",
  "veterinarianName": "Dr. Smith"
}
```

**Response:** `201 Created`

### PATCH /medical-records/:id
Update medical record.

**Auth:** Required (Vet or Elevated Admin)

**Response:** `200 OK`

### DELETE /medical-records/:id
Delete medical record.

**Auth:** Required (Elevated Admin)

**Response:** `204 No Content`

---

## Vaccination Endpoints

### GET /pets/:petId/vaccinations
Get vaccination records.

**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "vaccine": "Rabies",
    "date": "2024-01-15",
    "nextDue": "2025-01-15",
    "createdAt": "2024-01-15T00:00:00Z"
  }
]
```

### POST /pets/:petId/vaccinations
Add vaccination record.

**Auth:** Required (Veterinarian)

**Body:**
```json
{
  "vaccine": "Rabies",
  "date": "2024-01-15",
  "nextDue": "2025-01-15"
}
```

**Response:** `201 Created`

### PATCH /vaccinations/:id
Update vaccination record.

**Auth:** Required (Veterinarian)

**Response:** `200 OK`

### DELETE /vaccinations/:id
Delete vaccination record.

**Auth:** Required (Veterinarian)

**Response:** `204 No Content`

---

## Medication Endpoints

### GET /pets/:petId/medications
Get medications for a pet.

**Auth:** Required

**Query Params:**
- `active` - Filter active medications (true/false)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "name": "Heartgard Plus",
    "dosage": "1 tablet monthly",
    "startDate": "2024-01-01",
    "endDate": null,
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /pets/:petId/medications
Add medication.

**Auth:** Required (Veterinarian)

**Body:**
```json
{
  "name": "Heartgard Plus",
  "dosage": "1 tablet monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response:** `201 Created`

### PATCH /medications/:id
Update medication.

**Auth:** Required (Veterinarian)

**Body:**
```json
{
  "active": false,
  "endDate": "2024-12-31"
}
```

**Response:** `200 OK`

---

## Clinical Records Endpoints

### GET /pets/:petId/clinical-records
Get clinical records.

**Auth:** Required (Vet or Owner)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "petId": "uuid",
    "appointmentId": "uuid",
    "veterinarianId": "uuid",
    "date": "2024-06-15",
    "symptoms": "Coughing",
    "diagnosis": "Kennel cough",
    "treatment": "Antibiotics prescribed",
    "medications": ["Doxycycline"],
    "notes": "Follow up in 2 weeks",
    "followUpDate": "2024-06-29",
    "createdAt": "2024-06-15T00:00:00Z"
  }
]
```

### POST /pets/:petId/clinical-records
Create clinical record.

**Auth:** Required (Veterinarian)

**Body:**
```json
{
  "appointmentId": "uuid",
  "date": "2024-06-15",
  "symptoms": "Coughing",
  "diagnosis": "Kennel cough",
  "treatment": "Antibiotics prescribed",
  "medications": ["Doxycycline"],
  "notes": "Follow up in 2 weeks",
  "followUpDate": "2024-06-29"
}
```

**Response:** `201 Created`

---

## Notification Endpoints

### GET /notifications
Get user notifications.

**Auth:** Required

**Query Params:**
- `unreadOnly` - Show only unread (true/false)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "appointment_reminder",
    "title": "Appointment Reminder",
    "message": "You have an appointment tomorrow at 10:00 AM",
    "priority": "high",
    "read": false,
    "createdAt": "2025-01-07T00:00:00Z"
  }
]
```

### GET /notifications/unread-count
Get unread notification count.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "count": 5
}
```

### PATCH /notifications/:id/read
Mark notification as read.

**Auth:** Required

**Response:** `200 OK`

### PATCH /notifications/read-all
Mark all notifications as read.

**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5
}
```

### DELETE /notifications/:id
Delete notification.

**Auth:** Required

**Response:** `204 No Content`

### POST /notifications
Create notification (Admin/Testing).

**Auth:** Required

**Body:**
```json
{
  "userId": "uuid",
  "type": "system_alert",
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight at 10 PM",
  "priority": "normal"
}
```

**Response:** `201 Created`

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window per IP
- **Headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

---

## Pagination

For list endpoints:

**Query Params:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Webhook Events (Future)

Planned webhook support for:
- `appointment.created`
- `appointment.updated`
- `appointment.cancelled`
- `notification.created`
- `pet.updated`

---

## Best Practices

1. **Always include JWT token** for authenticated endpoints
2. **Use pagination** for large data sets
3. **Handle rate limits** with exponential backoff
4. **Validate input** on client side before sending
5. **Check response codes** and handle errors gracefully
6. **Use HTTPS** in production
7. **Keep tokens secure** - never expose in URLs or logs

---

## Example API Calls

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@petcare.com","password":"password123"}'

# Get pets (with token)
curl http://localhost:3001/api/pets \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create appointment
curl -X POST http://localhost:3001/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "petId": "uuid",
    "veterinarianId": "uuid",
    "type": "Checkup",
    "date": "2025-02-01",
    "time": "10:00"
  }'
```

### JavaScript/TypeScript Examples

```typescript
// Login
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'owner@petcare.com',
    password: 'password123'
  })
});
const { token, user } = await response.json();

// Get notifications with token
const notifications = await fetch('http://localhost:3001/api/notifications', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.json());
```

---

For implementation details, see `backend/README.md`
