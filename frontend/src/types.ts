export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  gender: 'Male' | 'Female';
  microchipId?: string;
  medicalHistory?: MedicalRecord[];
  vaccinations?: VaccinationRecord[];
  allergies?: string[];
  medications?: MedicationRecord[];
  notes?: string;
  createdAt?: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  date: string;
  recordType: string;
  description: string;
  veterinarianId?: string;
  veterinarianName: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccine: string;
  date: string;
  nextDue?: string;
  administeredBy?: string;
  administeredByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationRecord {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  prescribedByName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  veterinarian: string;
  type: string;
  date: string;
  time: string;
  reason?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  diagnosis?: string;
  treatment?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  userType: 'pet_owner' | 'veterinarian' | 'administrator';
  createdAt: string;
  address?: string;
  specialization?: string;
  licenseNumber?: string;
  accessLevel?: string;
  adminToken?: string;
}

export interface ClinicalRecord {
  id: string;
  petId: string;
  appointmentId?: string;
  appointmentType?: string;
  veterinarianId: string;
  veterinarianName: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medications?: string[];
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordResetToken {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
  userType?: string;
}

export interface EmailLog {
  to: string;
  subject: string;
  resetToken?: string;
  resetLink?: string;
  sentAt: string;
  type: 'password-reset' | 'password-changed' | 'welcome' | 'notification';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment_reminder' | 'appointment_cancelled' | 'appointment_rescheduled' | 
        'vaccination_due' | 'medication_reminder' | 'medical_update' | 
        'system_alert' | 'welcome' | 'password_changed';
  title: string;
  message: string;
  relatedEntityType?: 'appointment' | 'pet' | 'medication' | 'vaccination';
  relatedEntityId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  readAt?: string;
  scheduledFor?: string;
  sent: boolean;
  sentAt?: string;
  createdAt: string;
}

export interface AuthState {
  view: 'login' | 'register' | 'forgot-password' | 'reset-password';
  resetToken?: string;
}
