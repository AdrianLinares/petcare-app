import { Appointment } from '../types';

export class AppointmentService {
  /**
   * Get all appointments for a specific user (owner)
   */
  static getAppointmentsByOwner(ownerId: string): Appointment[] {
    try {
      const appointments = localStorage.getItem(`appointments_${ownerId}`);
      return appointments ? JSON.parse(appointments) : [];
    } catch (error) {
      console.error('Error loading appointments:', error);
      return [];
    }
  }

  /**
   * Get all appointments across all users
   */
  static getAllAppointments(): Appointment[] {
    const allAppointments: Appointment[] = [];
    
    try {
      const appointmentKeys = Object.keys(localStorage).filter(key => key.startsWith('appointments_'));
      appointmentKeys.forEach(userKey => {
        try {
          const userAppointments = JSON.parse(localStorage.getItem(userKey) || '[]');
          allAppointments.push(...userAppointments);
        } catch (error) {
          console.error(`Error parsing appointments from ${userKey}:`, error);
        }
      });
    } catch (error) {
      console.error('Error loading all appointments:', error);
    }
    
    return allAppointments;
  }

  /**
   * Get all appointments for a specific veterinarian
   */
  static getAppointmentsByVeterinarian(veterinarianName: string): Appointment[] {
    const allAppointments = this.getAllAppointments();
    return allAppointments.filter(apt => 
      apt.veterinarian === veterinarianName || 
      apt.veterinarian.includes(veterinarianName.split(' ')[1])
    );
  }

  /**
   * Update an appointment
   */
  static updateAppointment(appointment: Appointment): void {
    try {
      // Get the owner's appointments
      const ownerAppointments = this.getAppointmentsByOwner(appointment.ownerId);
      
      // Update the specific appointment
      const updatedAppointments = ownerAppointments.map(apt =>
        apt.id === appointment.id ? appointment : apt
      );
      
      // Save back to localStorage
      localStorage.setItem(
        `appointments_${appointment.ownerId}`,
        JSON.stringify(updatedAppointments)
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  static updateAppointmentStatus(
    appointmentId: string, 
    ownerId: string, 
    status: 'scheduled' | 'completed' | 'cancelled'
  ): void {
    try {
      const ownerAppointments = this.getAppointmentsByOwner(ownerId);
      const updatedAppointments = ownerAppointments.map(apt =>
        apt.id === appointmentId ? { ...apt, status } : apt
      );
      
      localStorage.setItem(
        `appointments_${ownerId}`,
        JSON.stringify(updatedAppointments)
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  /**
   * Delete an appointment
   */
  static deleteAppointment(appointmentId: string, ownerId: string): void {
    try {
      const ownerAppointments = this.getAppointmentsByOwner(ownerId);
      const updatedAppointments = ownerAppointments.filter(apt => apt.id !== appointmentId);
      
      localStorage.setItem(
        `appointments_${ownerId}`,
        JSON.stringify(updatedAppointments)
      );
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  /**
   * Reschedule an appointment
   */
  static rescheduleAppointment(
    appointmentId: string,
    ownerId: string,
    newDate: string,
    newTime: string
  ): void {
    try {
      const ownerAppointments = this.getAppointmentsByOwner(ownerId);
      const updatedAppointments = ownerAppointments.map(apt =>
        apt.id === appointmentId ? { ...apt, date: newDate, time: newTime } : apt
      );
      
      localStorage.setItem(
        `appointments_${ownerId}`,
        JSON.stringify(updatedAppointments)
      );
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  /**
   * Get appointments by status
   */
  static getAppointmentsByStatus(status: 'scheduled' | 'completed' | 'cancelled'): Appointment[] {
    const allAppointments = this.getAllAppointments();
    return allAppointments.filter(apt => apt.status === status);
  }

  /**
   * Get appointments by date range
   */
  static getAppointmentsByDateRange(startDate: Date, endDate: Date): Appointment[] {
    const allAppointments = this.getAllAppointments();
    return allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= endDate;
    });
  }
}
