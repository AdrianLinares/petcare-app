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

interface PetManagementProps {
  user: User;
  pets: Pet[];
  setPets: (pets: Pet[]) => void;
}

export default function PetManagement({ user, pets, setPets }: PetManagementProps) {
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const petData: Pet = {
      id: editingPet ? editingPet.id : Date.now().toString(),
      ownerId: user.email,
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      color: formData.color,
      gender: formData.gender as 'male' | 'female',
      conditions: formData.conditions ? formData.conditions.split(',').map(c => c.trim()) : [],
      vaccinations: formData.vaccinations ? formData.vaccinations.split(',').map(v => v.trim()) : [],
      notes: formData.notes,
      createdAt: editingPet ? editingPet.createdAt : new Date().toISOString()
    };

    let updatedPets;
    if (editingPet) {
      updatedPets = pets.map(pet => pet.id === editingPet.id ? petData : pet);
    } else {
      updatedPets = [...pets, petData];
    }

    setPets(updatedPets);
    localStorage.setItem(`pets_${user.email}`, JSON.stringify(updatedPets));
    
    setIsAddingPet(false);
    setEditingPet(null);
    resetForm();
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
      gender: pet.gender,
      conditions: pet.conditions?.join(', ') || '',
      vaccinations: pet.vaccinations?.join(', ') || '',
      notes: pet.notes || ''
    });
    setIsAddingPet(true);
  };

  const handleDelete = (petId: string) => {
    if (confirm('Are you sure you want to delete this pet?')) {
      const updatedPets = pets.filter(pet => pet.id !== petId);
      setPets(updatedPets);
      localStorage.setItem(`pets_${user.email}`, JSON.stringify(updatedPets));
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
                <Button type="button" variant="outline" onClick={() => setIsAddingPet(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPet ? 'Update Pet' : 'Add Pet'}
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
                  {pet.conditions && pet.conditions.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium">Conditions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pet.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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