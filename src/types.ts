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
  date: string;
  type: string;
  description: string;
  veterinarian: string;
}

export interface VaccinationRecord {
  vaccine: string;
  date: string;
  nextDue: string;
}

export interface MedicationRecord {
  name: string;
  dosage: string;
  startDate: string;
  endDate?: string;
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
  appointmentId: string;
  veterinarian: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medications?: string[];
  notes?: string;
  followUpDate?: string;
  createdAt: string;
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

export interface AuthState {
  view: 'login' | 'register' | 'forgot-password' | 'reset-password';
  resetToken?: string;
}
