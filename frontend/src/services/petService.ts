import { Pet, MedicalRecord, VaccinationRecord, MedicationRecord } from '../types';

export class PetService {
  /**
   * Get all pets for a specific owner
   */
  static getPetsByOwner(ownerId: string): Pet[] {
    try {
      const pets = localStorage.getItem(`pets_${ownerId}`);
      return pets ? JSON.parse(pets) : [];
    } catch (error) {
      console.error('Error loading pets:', error);
      return [];
    }
  }

  /**
   * Get all pets across all owners
   */
  static getAllPets(): Pet[] {
    const allPets: Pet[] = [];
    
    try {
      const petKeys = Object.keys(localStorage).filter(key => key.startsWith('pets_'));
      petKeys.forEach(userKey => {
        try {
          const userPets = JSON.parse(localStorage.getItem(userKey) || '[]');
          allPets.push(...userPets);
        } catch (error) {
          console.error(`Error parsing pets from ${userKey}:`, error);
        }
      });
    } catch (error) {
      console.error('Error loading all pets:', error);
    }
    
    return allPets;
  }

  /**
   * Get a specific pet by ID
   */
  static getPetById(petId: string): Pet | null {
    const allPets = this.getAllPets();
    return allPets.find(pet => pet.id === petId) || null;
  }

  /**
   * Update a pet's information
   */
  static updatePet(pet: Pet): void {
    try {
      const ownerPets = this.getPetsByOwner(pet.ownerId);
      const updatedPets = ownerPets.map(p => p.id === pet.id ? pet : p);
      localStorage.setItem(`pets_${pet.ownerId}`, JSON.stringify(updatedPets));
    } catch (error) {
      console.error('Error updating pet:', error);
      throw error;
    }
  }

  /**
   * Add a medical record to a pet
   */
  static addMedicalRecord(petId: string, medicalRecord: MedicalRecord): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const updatedPet = {
        ...pet,
        medicalHistory: [...(pet.medicalHistory || []), medicalRecord]
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error adding medical record:', error);
      throw error;
    }
  }

  /**
   * Update a medical record
   */
  static updateMedicalRecord(petId: string, recordIndex: number, medicalRecord: MedicalRecord): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const medicalHistory = pet.medicalHistory || [];
      medicalHistory[recordIndex] = medicalRecord;

      const updatedPet = {
        ...pet,
        medicalHistory
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  }

  /**
   * Delete a medical record
   */
  static deleteMedicalRecord(petId: string, recordIndex: number): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const medicalHistory = pet.medicalHistory || [];
      medicalHistory.splice(recordIndex, 1);

      const updatedPet = {
        ...pet,
        medicalHistory
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  }

  /**
   * Add a vaccination record to a pet
   */
  static addVaccinationRecord(petId: string, vaccination: VaccinationRecord): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const updatedPet = {
        ...pet,
        vaccinations: [...(pet.vaccinations || []), vaccination]
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error adding vaccination record:', error);
      throw error;
    }
  }

  /**
   * Update a vaccination record
   */
  static updateVaccinationRecord(petId: string, recordIndex: number, vaccination: VaccinationRecord): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const vaccinations = pet.vaccinations || [];
      vaccinations[recordIndex] = vaccination;

      const updatedPet = {
        ...pet,
        vaccinations
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error updating vaccination record:', error);
      throw error;
    }
  }

  /**
   * Delete a vaccination record
   */
  static deleteVaccinationRecord(petId: string, recordIndex: number): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const vaccinations = pet.vaccinations || [];
      vaccinations.splice(recordIndex, 1);

      const updatedPet = {
        ...pet,
        vaccinations
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error deleting vaccination record:', error);
      throw error;
    }
  }

  /**
   * Add a medication record to a pet
   */
  static addMedicationRecord(petId: string, medication: MedicationRecord): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const updatedPet = {
        ...pet,
        medications: [...(pet.medications || []), medication]
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error adding medication record:', error);
      throw error;
    }
  }

  /**
   * Update a medication record
   */
  static updateMedicationRecord(petId: string, recordIndex: number, medication: MedicationRecord): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const medications = pet.medications || [];
      medications[recordIndex] = medication;

      const updatedPet = {
        ...pet,
        medications
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error updating medication record:', error);
      throw error;
    }
  }

  /**
   * Delete a medication record
   */
  static deleteMedicationRecord(petId: string, recordIndex: number): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const medications = pet.medications || [];
      medications.splice(recordIndex, 1);

      const updatedPet = {
        ...pet,
        medications
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error deleting medication record:', error);
      throw error;
    }
  }

  /**
   * Update pet allergies
   */
  static updateAllergies(petId: string, allergies: string[]): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const updatedPet = {
        ...pet,
        allergies
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error updating allergies:', error);
      throw error;
    }
  }

  /**
   * Update pet notes
   */
  static updateNotes(petId: string, notes: string): void {
    try {
      const pet = this.getPetById(petId);
      if (!pet) throw new Error('Pet not found');

      const updatedPet = {
        ...pet,
        notes
      };

      this.updatePet(updatedPet);
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  }

  /**
   * Search pets by name, species, or breed
   */
  static searchPets(query: string): Pet[] {
    const allPets = this.getAllPets();
    const lowerQuery = query.toLowerCase();
    
    return allPets.filter(pet =>
      pet.name.toLowerCase().includes(lowerQuery) ||
      pet.species.toLowerCase().includes(lowerQuery) ||
      pet.breed.toLowerCase().includes(lowerQuery) ||
      pet.ownerId.toLowerCase().includes(lowerQuery)
    );
  }
}
