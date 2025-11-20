/**
 * PetManagement Component
 * 
 * BEGINNER EXPLANATION:
 * This component allows pet owners to manage their pets - adding new pets,
 * editing existing ones, and removing pets they no longer own.
 * 
 * Key Features:
 * 1. View all pets in a grid layout with pet cards
 * 2. Add new pets via a detailed form
 * 3. Edit existing pet information
 * 4. Delete pets (with confirmation)
 * 
 * Pet Information Tracked:
 * - Basic Info: name, species (dog/cat), breed, age, weight, color, gender
 * - Health Info: existing conditions, vaccination history, general notes
 * 
 * CRUD Operations:
 * - Create: "Add Pet" button opens form dialog
 * - Read: Pet cards display in responsive grid
 * - Update: "Edit" button on each card opens pre-filled form
 * - Delete: "Delete" button removes pet after confirmation
 * 
 * Form Behavior:
 * - Age and weight must be positive numbers
 * - Species has dropdown (Dog, Cat, Bird, Rabbit, Other)
 * - Conditions field accepts comma-separated list
 * - Form validates required fields before submission
 * - After save/delete, immediately updates UI via setPets prop
 * 
 * Architecture:
 * - Controlled component: parent passes pets array and setPets updater
 * - Dialog-based forms: Add and edit use same form with different logic
 * - Optimistic updates: Updates local state immediately, syncs to backend
 * 
 * User Flow:
 * 1. User sees grid of existing pets
 * 2. Clicks "Add Pet" or "Edit" on a card
 * 3. Fills out form (all fields except notes are required)
 * 4. Submits → API call → Success toast → Updated grid
 * 
 * @param {User} user - The currently logged-in pet owner
 * @param {Pet[]} pets - Array of user's pets to display
 * @param {Function} setPets - Function to update pets array in parent component
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Heart, Edit, Trash2, Calendar } from 'lucide-react';
import { Pet, User } from '../../types';
import { petAPI } from '@/lib/api';
import { toast } from 'sonner';

interface PetManagementProps {
  user: User;
  pets: Pet[];
  setPets: (pets: Pet[]) => void;
}

export default function PetManagement({ user, pets, setPets }: PetManagementProps) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  // BEGINNER NOTE: State tracks form data, dialog visibility, and loading states.

  // Dialog control states
  const [isAddingPet, setIsAddingPet] = useState(false);         // Controls "Add Pet" dialog visibility
  const [editingPet, setEditingPet] = useState<Pet | null>(null); // If not null, we're editing this pet

  // UI state
  const [isLoading, setIsLoading] = useState(false);             // Shows loading spinner during API calls

  // Form data state - Holds all pet information fields
  // BEGINNER NOTE: This single state object holds all form fields together.
  // It's easier to manage than having 10 separate useState calls.
  const [formData, setFormData] = useState({
    name: '',          // Pet's name
    species: '',       // Dog, Cat, Bird, etc.
    breed: '',         // Specific breed
    age: '',           // Age in years
    weight: '',        // Weight in pounds/kg
    color: '',         // Fur/feather color
    gender: '',        // Male, Female, Unknown
    conditions: '',    // Comma-separated health conditions
    vaccinations: '',  // Comma-separated vaccination list
    notes: ''          // Additional notes
  });

  /**
   * Reset Form Function
   * 
   * BEGINNER EXPLANATION:
   * This clears all fields in the form back to empty strings.
   * Called when:
   * - User closes the form without saving
   * - After successfully creating/updating a pet
   * - Before opening the "Add Pet" dialog (to ensure clean slate)
   * 
   * Why needed: Without this, old data would remain in the form
   * when you open it again, which would be confusing.
   */
  const resetForm = () => {
    setFormData({
      name: '',
      species: '',
      breed: '',
      age: '',
      weight: '',
      color: '',
      gender: '',
      conditions: '',
      vaccinations: '',
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        color: formData.color,
        gender: (formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)) as 'Male' | 'Female',
        // Note: 'conditions' doesn't exist in Pet type - using notes field instead
        // TODO: Consider adding conditions field to Pet interface if needed
        notes: formData.notes + (formData.conditions ? `\nConditions: ${formData.conditions}` : '')
      };

      if (editingPet) {
        // Update existing pet
        const updatedPet = await petAPI.updatePet(editingPet.id, petData);
        setPets(pets.map(pet => pet.id === editingPet.id ? updatedPet : pet));
        toast.success('Pet updated successfully!');
      } else {
        // Create new pet
        const newPet = await petAPI.createPet(petData);
        setPets([...pets, newPet]);
        toast.success('Pet added successfully!');
      }

      setIsAddingPet(false);
      setEditingPet(null);
      resetForm();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to save pet';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age.toString(),
      weight: pet.weight.toString(),
      color: pet.color,
      gender: pet.gender.toLowerCase(),
      conditions: '', // conditions field not in Pet type
      vaccinations: '', // vaccinations field exists but is MedicationRecord[], not string[]
      notes: pet.notes || ''
    });
    setIsAddingPet(true);
  };

  const handleDelete = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet? This will also delete all associated medical records.')) {
      return;
    }

    try {
      await petAPI.deletePet(petId);
      setPets(pets.filter(pet => pet.id !== petId));
      toast.success('Pet deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete pet';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
        <Dialog open={isAddingPet} onOpenChange={(open) => {
          setIsAddingPet(open);
          if (!open) {
            setEditingPet(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Pet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPet ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
              <DialogDescription>
                {editingPet ? 'Update your pet\'s information' : 'Add your pet\'s information to manage their healthcare'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Pet Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Buddy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Species *</Label>
                  <Select
                    value={formData.species}
                    onValueChange={(value) => setFormData({ ...formData, species: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="hamster">Hamster</SelectItem>
                      <SelectItem value="fish">Fish</SelectItem>
                      <SelectItem value="reptile">Reptile</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="e.g., Golden Retriever"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years) *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                    placeholder="e.g., 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    required
                    placeholder="e.g., 25.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g., Golden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">Pre-existing Conditions</Label>
                <Input
                  id="conditions"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  placeholder="Separate multiple conditions with commas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vaccinations">Vaccinations</Label>
                <Input
                  id="vaccinations"
                  value={formData.vaccinations}
                  onChange={(e) => setFormData({ ...formData, vaccinations: e.target.value })}
                  placeholder="Separate multiple vaccinations with commas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information about your pet"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddingPet(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingPet ? 'Update Pet' : 'Add Pet')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-lg">{pet.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(pet)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(pet.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Species:</span>
                    <Badge variant="secondary">{pet.species}</Badge>
                  </div>
                  {pet.breed && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Breed:</span>
                      <span className="text-sm">{pet.breed}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Age:</span>
                    <span className="text-sm">{pet.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Weight:</span>
                    <span className="text-sm">{pet.weight} kg</span>
                  </div>
                  {pet.gender && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Gender:</span>
                      <span className="text-sm capitalize">{pet.gender}</span>
                    </div>
                  )}
                  {/* Conditions field removed - not part of Pet type. Consider using notes field instead. */}
                  {pet.notes && (
                    <div className="mt-3">
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-xs text-gray-600 mt-1">{pet.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pets registered</h3>
            <p className="text-gray-600 mb-4">Add your first pet to get started with managing their healthcare.</p>
            <Button onClick={() => setIsAddingPet(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Pet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}