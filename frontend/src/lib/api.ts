import axios from 'axios';
import type { 
  User, 
  Pet, 
  Appointment, 
  Notification, 
  MedicalRecord, 
  VaccinationRecord, 
  MedicationRecord, 
  ClinicalRecord 
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/.netlify/functions';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
  },

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    userType: string;
    address?: string;
    specialization?: string;
    licenseNumber?: string;
  }) {
    const { data } = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string) {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },
};

// User API
export const userAPI = {
  async getCurrentUser() {
    const { data } = await api.get('/users/me');
    return data;
  },

  async updateProfile(updates: Partial<User>) {
    const { data } = await api.patch('/users/me', updates);
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.post('/users/me/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async listUsers(params?: { userType?: string; page?: number; limit?: number }) {
    const { data } = await api.get('/users', { params });
    return data;
  },

  async getUserById(id: string) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async createUser(userData: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    userType: string;
    address?: string;
    specialization?: string;
    licenseNumber?: string;
    accessLevel?: string;
  }) {
    const { data } = await api.post('/users', userData);
    return data;
  },

  async updateUser(id: string, updates: {
    email?: string;
    fullName?: string;
    phone?: string;
    address?: string;
    specialization?: string;
    licenseNumber?: string;
    accessLevel?: string;
    userType?: string;
  }) {
    const { data } = await api.patch(`/users/${id}`, updates);
    return data;
  },

  async deleteUser(id: string) {
    await api.delete(`/users/${id}`);
  },
};

// Pet API
export const petAPI = {
  async getPets() {
    const { data } = await api.get('/pets');
    return data as Pet[];
  },

  async getPetById(id: string) {
    const { data } = await api.get(`/pets/${id}`);
    return data as Pet;
  },

  async createPet(petData: Partial<Pet>) {
    const { data } = await api.post('/pets', petData);
    return data as Pet;
  },

  async updatePet(id: string, updates: Partial<Pet>) {
    const { data } = await api.patch(`/pets/${id}`, updates);
    return data as Pet;
  },

  async deletePet(id: string) {
    await api.delete(`/pets/${id}`);
  },
};

// Appointment API
export const appointmentAPI = {
  async getAppointments(params?: {
    status?: string;
    date?: string;
    petId?: string;
  }) {
    const { data } = await api.get('/appointments', { params });
    return data as Appointment[];
  },

  async createAppointment(appointmentData: {
    petId: string;
    veterinarianId: string;
    type: string;
    date: string;
    time: string;
    reason?: string;
  }) {
    const { data } = await api.post('/appointments', appointmentData);
    return data as Appointment;
  },

  async updateAppointment(
    id: string,
    updates: {
      status?: string;
      diagnosis?: string;
      treatment?: string;
      notes?: string;
      followUpDate?: string;
    }
  ) {
    const { data } = await api.patch(`/appointments/${id}`, updates);
    return data;
  },
};

// Notification API
export const notificationAPI = {
  async getNotifications(unreadOnly: boolean = false) {
    const { data } = await api.get('/notifications', {
      params: { unreadOnly },
    });
    return data as Notification[];
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count');
    return data.count as number;
  },

  async markAsRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await api.patch('/notifications/read-all');
  },

  async deleteNotification(id: string) {
    await api.delete(`/notifications/${id}`);
  },

  async createNotification(notificationData: {
    userId?: string;
    type: string;
    title: string;
    message: string;
    priority?: string;
  }) {
    const { data } = await api.post('/notifications', notificationData);
    return data;
  },
};

// Medical Records API
export const medicalRecordAPI = {
  async getByPet(petId: string) {
    const { data } = await api.get(`/medical-records/pet/${petId}`);
    return data as MedicalRecord[];
  },

  async getById(id: string) {
    const { data } = await api.get(`/medical-records/${id}`);
    return data as MedicalRecord;
  },

  async create(recordData: {
    petId: string;
    date: string;
    recordType: string;
    description: string;
  }) {
    const { data } = await api.post('/medical-records', recordData);
    return data as MedicalRecord;
  },

  async update(id: string, updates: {
    date?: string;
    recordType?: string;
    description?: string;
  }) {
    const { data } = await api.patch(`/medical-records/${id}`, updates);
    return data as MedicalRecord;
  },

  async delete(id: string) {
    await api.delete(`/medical-records/${id}`);
  },
};

// Vaccinations API
export const vaccinationAPI = {
  async getByPet(petId: string) {
    const { data } = await api.get(`/vaccinations/pet/${petId}`);
    return data as VaccinationRecord[];
  },

  async getUpcoming() {
    const { data } = await api.get('/vaccinations/upcoming');
    return data as VaccinationRecord[];
  },

  async getById(id: string) {
    const { data } = await api.get(`/vaccinations/${id}`);
    return data as VaccinationRecord;
  },

  async create(vaccinationData: {
    petId: string;
    vaccine: string;
    date: string;
    nextDue?: string;
  }) {
    const { data } = await api.post('/vaccinations', vaccinationData);
    return data as VaccinationRecord;
  },

  async update(id: string, updates: {
    vaccine?: string;
    date?: string;
    nextDue?: string;
  }) {
    const { data } = await api.patch(`/vaccinations/${id}`, updates);
    return data as VaccinationRecord;
  },

  async delete(id: string) {
    await api.delete(`/vaccinations/${id}`);
  },
};

// Medications API
export const medicationAPI = {
  async getByPet(petId: string) {
    const { data } = await api.get(`/medications/pet/${petId}`);
    return data as MedicationRecord[];
  },

  async getActive() {
    const { data } = await api.get('/medications/active');
    return data as MedicationRecord[];
  },

  async getById(id: string) {
    const { data } = await api.get(`/medications/${id}`);
    return data as MedicationRecord;
  },

  async create(medicationData: {
    petId: string;
    name: string;
    dosage: string;
    startDate: string;
    endDate?: string;
    active?: boolean;
  }) {
    const { data } = await api.post('/medications', medicationData);
    return data as MedicationRecord;
  },

  async update(id: string, updates: {
    name?: string;
    dosage?: string;
    startDate?: string;
    endDate?: string;
    active?: boolean;
  }) {
    const { data } = await api.patch(`/medications/${id}`, updates);
    return data as MedicationRecord;
  },

  async deactivate(id: string) {
    const { data } = await api.patch(`/medications/${id}/deactivate`);
    return data;
  },

  async delete(id: string) {
    await api.delete(`/medications/${id}`);
  },
};

// Clinical Records API
export const clinicalRecordAPI = {
  async getByPet(petId: string) {
    const { data } = await api.get(`/clinical-records/pet/${petId}`);
    return data as ClinicalRecord[];
  },

  async getById(id: string) {
    const { data } = await api.get(`/clinical-records/${id}`);
    return data as ClinicalRecord;
  },

  async create(recordData: {
    petId: string;
    appointmentId?: string;
    date: string;
    symptoms: string;
    diagnosis: string;
    treatment: string;
    medications?: string[];
    notes?: string;
    followUpDate?: string;
  }) {
    const { data } = await api.post('/clinical-records', recordData);
    return data as ClinicalRecord;
  },

  async update(id: string, updates: {
    date?: string;
    symptoms?: string;
    diagnosis?: string;
    treatment?: string;
    medications?: string[];
    notes?: string;
    followUpDate?: string;
  }) {
    const { data } = await api.patch(`/clinical-records/${id}`, updates);
    return data as ClinicalRecord;
  },

  async delete(id: string) {
    await api.delete(`/clinical-records/${id}`);
  },
};

export default api;
