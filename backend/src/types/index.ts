export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string | null;
  userType: 'pet_owner' | 'veterinarian' | 'administrator';
  accessLevel?: 'standard' | 'elevated' | 'super_admin';
  address?: string;
  specialization?: string;
  licenseNumber?: string;
  adminToken?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

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
  allergies?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  date: Date;
  recordType: string;
  description: string;
  veterinarianId?: string;
  veterinarianName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vaccination {
  id: string;
  petId: string;
  vaccine: string;
  date: Date;
  nextDue?: Date;
  administeredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  petId: string;
  ownerId: string;
  veterinarianId: string;
  appointmentType: string;
  date: Date;
  time: string;
  reason?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  diagnosis?: string;
  treatment?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicalRecord {
  id: string;
  petId: string;
  appointmentId?: string;
  veterinarianId: string;
  date: Date;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medications?: string[];
  notes?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date | null;
  createdAt: Date;
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
  readAt?: Date | null;
  scheduledFor?: Date;
  sent: boolean;
  sentAt?: Date | null;
  createdAt: Date;
}

export interface EmailLog {
  id: string;
  userId?: string;
  toEmail: string;
  subject: string;
  type: string;
  notificationId?: string;
  resetToken?: string;
  resetLink?: string;
  sentAt: Date;
  deliveryStatus: string;
  errorMessage?: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  userType: 'pet_owner' | 'veterinarian' | 'administrator';
  address?: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  userType: string;
}
