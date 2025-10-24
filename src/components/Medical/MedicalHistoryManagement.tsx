import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, FileText, Syringe, Pill, AlertTriangle, ClipboardList } from 'lucide-react';
import { Pet, MedicalRecord, VaccinationRecord, MedicationRecord } from '../../types';
import { PetService } from '../../services/petService';
import { toast } from 'sonner';

interface MedicalHistoryManagementProps {
  pet: Pet;
  onUpdate: () => void;
  canEdit: boolean;
}

export default function MedicalHistoryManagement({ pet, onUpdate, canEdit }: MedicalHistoryManagementProps) {
  const [activeTab, setActiveTab] = useState('medical');
  
  // Medical Record states
  const [medicalRecordDialog, setMedicalRecordDialog] = useState(false);
  const [editingMedicalIndex, setEditingMedicalIndex] = useState<number | null>(null);
  const [medicalForm, setMedicalForm] = useState<MedicalRecord>({
    date: '',
    type: '',
    description: '',
    veterinarian: ''
  });
  
  // Vaccination states
  const [vaccinationDialog, setVaccinationDialog] = useState(false);
  const [editingVaccinationIndex, setEditingVaccinationIndex] = useState<number | null>(null);
  const [vaccinationForm, setVaccinationForm] = useState<VaccinationRecord>({
    vaccine: '',
    date: '',
    nextDue: ''
  });
  
  // Medication states
  const [medicationDialog, setMedicationDialog] = useState(false);
  const [editingMedicationIndex, setEditingMedicationIndex] = useState<number | null>(null);
  const [medicationForm, setMedicationForm] = useState<MedicationRecord>({
    name: '',
    dosage: '',
    startDate: '',
    endDate: ''
  });

  // Allergies state
  const [allergiesDialog, setAllergiesDialog] = useState(false);
  const [allergiesText, setAllergiesText] = useState('');

  // Notes state
  const [notesDialog, setNotesDialog] = useState(false);
  const [notesText, setNotesText] = useState('');

  // Weight state
  const [weightDialog, setWeightDialog] = useState(false);
  const [weightValue, setWeightValue] = useState('');

  // Delete confirmation states
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);

  // Medical Record handlers
  const handleOpenMedicalDialog = (index?: number) => {
    if (index !== undefined) {
      const record = pet.medicalHistory?.[index];
      if (record) {
        setMedicalForm(record);
        setEditingMedicalIndex(index);
      }
    } else {
      setMedicalForm({ date: '', type: '', description: '', veterinarian: '' });
      setEditingMedicalIndex(null);
    }
    setMedicalRecordDialog(true);
  };

  const handleSaveMedicalRecord = () => {
    try {
      if (editingMedicalIndex !== null) {
        PetService.updateMedicalRecord(pet.id, editingMedicalIndex, medicalForm);
        toast.success('Medical record updated successfully');
      } else {
        PetService.addMedicalRecord(pet.id, medicalForm);
        toast.success('Medical record added successfully');
      }
      onUpdate();
      setMedicalRecordDialog(false);
    } catch (error) {
      toast.error('Failed to save medical record');
    }
  };

  const handleDeleteMedicalRecord = (index: number) => {
    setDeleteAction(() => () => {
      try {
        PetService.deleteMedicalRecord(pet.id, index);
        toast.success('Medical record deleted');
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete medical record');
      }
    });
    setDeleteDialog(true);
  };

  // Vaccination handlers
  const handleOpenVaccinationDialog = (index?: number) => {
    if (index !== undefined) {
      const record = pet.vaccinations?.[index];
      if (record) {
        setVaccinationForm(record);
        setEditingVaccinationIndex(index);
      }
    } else {
      setVaccinationForm({ vaccine: '', date: '', nextDue: '' });
      setEditingVaccinationIndex(null);
    }
    setVaccinationDialog(true);
  };

  const handleSaveVaccination = () => {
    try {
      if (editingVaccinationIndex !== null) {
        PetService.updateVaccinationRecord(pet.id, editingVaccinationIndex, vaccinationForm);
        toast.success('Vaccination record updated successfully');
      } else {
        PetService.addVaccinationRecord(pet.id, vaccinationForm);
        toast.success('Vaccination record added successfully');
      }
      onUpdate();
      setVaccinationDialog(false);
    } catch (error) {
      toast.error('Failed to save vaccination record');
    }
  };

  const handleDeleteVaccination = (index: number) => {
    setDeleteAction(() => () => {
      try {
        PetService.deleteVaccinationRecord(pet.id, index);
        toast.success('Vaccination record deleted');
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete vaccination record');
      }
    });
    setDeleteDialog(true);
  };

  // Medication handlers
  const handleOpenMedicationDialog = (index?: number) => {
    if (index !== undefined) {
      const record = pet.medications?.[index];
      if (record) {
        setMedicationForm(record);
        setEditingMedicationIndex(index);
      }
    } else {
      setMedicationForm({ name: '', dosage: '', startDate: '', endDate: '' });
      setEditingMedicationIndex(null);
    }
    setMedicationDialog(true);
  };

  const handleSaveMedication = () => {
    try {
      if (editingMedicationIndex !== null) {
        PetService.updateMedicationRecord(pet.id, editingMedicationIndex, medicationForm);
        toast.success('Medication record updated successfully');
      } else {
        PetService.addMedicationRecord(pet.id, medicationForm);
        toast.success('Medication record added successfully');
      }
      onUpdate();
      setMedicationDialog(false);
    } catch (error) {
      toast.error('Failed to save medication record');
    }
  };

  const handleDeleteMedication = (index: number) => {
    setDeleteAction(() => () => {
      try {
        PetService.deleteMedicationRecord(pet.id, index);
        toast.success('Medication record deleted');
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete medication record');
      }
    });
    setDeleteDialog(true);
  };

  // Allergies handlers
  const handleOpenAllergiesDialog = () => {
    setAllergiesText((pet.allergies || []).join(', '));
    setAllergiesDialog(true);
  };

  const handleSaveAllergies = () => {
    try {
      const allergiesArray = allergiesText
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      PetService.updateAllergies(pet.id, allergiesArray);
      toast.success('Allergies updated successfully');
      onUpdate();
      setAllergiesDialog(false);
    } catch (error) {
      toast.error('Failed to update allergies');
    }
  };

  // Notes handlers
  const handleOpenNotesDialog = () => {
    setNotesText(pet.notes || '');
    setNotesDialog(true);
  };

  const handleSaveNotes = () => {
    try {
      PetService.updateNotes(pet.id, notesText);
      toast.success('Notes updated successfully');
      onUpdate();
      setNotesDialog(false);
    } catch (error) {
      toast.error('Failed to update notes');
    }
  };

  // Weight handlers
  const handleOpenWeightDialog = () => {
    setWeightValue(pet.weight.toString());
    setWeightDialog(true);
  };

  const handleSaveWeight = () => {
    try {
      const newWeight = parseFloat(weightValue);
      if (isNaN(newWeight) || newWeight <= 0) {
        toast.error('Please enter a valid weight');
        return;
      }
      
      const updatedPet = {
        ...pet,
        weight: newWeight
      };
      
      PetService.updatePet(updatedPet);
      toast.success('Weight updated successfully');
      onUpdate();
      setWeightDialog(false);
    } catch (error) {
      toast.error('Failed to update weight');
    }
  };

  return (
    <div className="space-y-6">
      {/* Pet Info Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="text-xl font-bold">{pet.name}</h3>
                <p className="text-sm text-gray-600">{pet.species} - {pet.breed}</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Age: {pet.age} years</p>
              <p>Owner: {pet.ownerId}</p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => canEdit && handleOpenAllergiesDialog()}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Allergies</p>
                <p className="text-lg font-bold">{pet.allergies?.length || 0}</p>
              </div>
              {canEdit && <Edit className="h-4 w-4 text-gray-400" />}
            </div>
            {pet.allergies && pet.allergies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {pet.allergies.map((allergy, idx) => (
                  <Badge key={idx} variant="destructive" className="text-xs">{allergy}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md" onClick={() => canEdit && handleOpenWeightDialog()}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weight</p>
                <p className="text-lg font-bold">{pet.weight} kg</p>
              </div>
              {canEdit && <Edit className="h-4 w-4 text-gray-400" />}
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md" onClick={() => canEdit && handleOpenNotesDialog()}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-sm text-gray-500 truncate">{pet.notes || 'No notes'}</p>
              </div>
              {canEdit && <Edit className="h-4 w-4 text-gray-400" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Records Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medical">
            <FileText className="h-4 w-4 mr-2" />
            Medical History
          </TabsTrigger>
          <TabsTrigger value="vaccinations">
            <Syringe className="h-4 w-4 mr-2" />
            Vaccinations
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="h-4 w-4 mr-2" />
            Medications
          </TabsTrigger>
        </TabsList>

        {/* Medical History Tab */}
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Medical History</CardTitle>
                {canEdit && (
                  <Button onClick={() => handleOpenMedicalDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {pet.medicalHistory.map((record, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{record.type}</Badge>
                            <span className="text-sm text-gray-600">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">{record.description}</p>
                          <p className="text-xs text-gray-600">Veterinarian: {record.veterinarian}</p>
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenMedicalDialog(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMedicalRecord(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No medical history records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vaccinations Tab */}
        <TabsContent value="vaccinations">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Vaccinations</CardTitle>
                {canEdit && (
                  <Button onClick={() => handleOpenVaccinationDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vaccination
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pet.vaccinations && pet.vaccinations.length > 0 ? (
                <div className="space-y-4">
                  {pet.vaccinations.map((record, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{record.vaccine}</p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(record.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Next Due: {new Date(record.nextDue).toLocaleDateString()}
                          </p>
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenVaccinationDialog(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteVaccination(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No vaccination records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Medications</CardTitle>
                {canEdit && (
                  <Button onClick={() => handleOpenMedicationDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pet.medications && pet.medications.length > 0 ? (
                <div className="space-y-4">
                  {pet.medications.map((record, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{record.name}</p>
                          <p className="text-sm text-gray-600">Dosage: {record.dosage}</p>
                          <p className="text-sm text-gray-600">
                            Start: {new Date(record.startDate).toLocaleDateString()}
                          </p>
                          {record.endDate && (
                            <p className="text-sm text-gray-600">
                              End: {new Date(record.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenMedicationDialog(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMedication(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No medication records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Medical Record Dialog */}
      <Dialog open={medicalRecordDialog} onOpenChange={setMedicalRecordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMedicalIndex !== null ? 'Edit' : 'Add'} Medical Record</DialogTitle>
            <DialogDescription>Add or update medical history for {pet.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={medicalForm.date}
                onChange={(e) => setMedicalForm({ ...medicalForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input
                placeholder="e.g., Checkup, Surgery, Emergency"
                value={medicalForm.type}
                onChange={(e) => setMedicalForm({ ...medicalForm, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Detailed description of the medical visit"
                value={medicalForm.description}
                onChange={(e) => setMedicalForm({ ...medicalForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Veterinarian</Label>
              <Input
                placeholder="Veterinarian name"
                value={medicalForm.veterinarian}
                onChange={(e) => setMedicalForm({ ...medicalForm, veterinarian: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMedicalRecordDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveMedicalRecord}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vaccination Dialog */}
      <Dialog open={vaccinationDialog} onOpenChange={setVaccinationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVaccinationIndex !== null ? 'Edit' : 'Add'} Vaccination</DialogTitle>
            <DialogDescription>Add or update vaccination record for {pet.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vaccine Name</Label>
              <Input
                placeholder="e.g., Rabies, Distemper"
                value={vaccinationForm.vaccine}
                onChange={(e) => setVaccinationForm({ ...vaccinationForm, vaccine: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date Administered</Label>
              <Input
                type="date"
                value={vaccinationForm.date}
                onChange={(e) => setVaccinationForm({ ...vaccinationForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Next Due Date</Label>
              <Input
                type="date"
                value={vaccinationForm.nextDue}
                onChange={(e) => setVaccinationForm({ ...vaccinationForm, nextDue: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setVaccinationDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveVaccination}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medication Dialog */}
      <Dialog open={medicationDialog} onOpenChange={setMedicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMedicationIndex !== null ? 'Edit' : 'Add'} Medication</DialogTitle>
            <DialogDescription>Add or update medication record for {pet.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medication Name</Label>
              <Input
                placeholder="e.g., Antibiotics, Pain Relief"
                value={medicationForm.name}
                onChange={(e) => setMedicationForm({ ...medicationForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input
                placeholder="e.g., 500mg twice daily"
                value={medicationForm.dosage}
                onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={medicationForm.startDate}
                onChange={(e) => setMedicationForm({ ...medicationForm, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Input
                type="date"
                value={medicationForm.endDate || ''}
                onChange={(e) => setMedicationForm({ ...medicationForm, endDate: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMedicationDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveMedication}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Allergies Dialog */}
      <Dialog open={allergiesDialog} onOpenChange={setAllergiesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Allergies</DialogTitle>
            <DialogDescription>Update allergies for {pet.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Allergies (comma-separated)</Label>
              <Textarea
                placeholder="e.g., Penicillin, Wheat, Chicken"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAllergiesDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveAllergies}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={notesDialog} onOpenChange={setNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
            <DialogDescription>Update notes for {pet.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes about the pet"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNotesDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveNotes}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weight Dialog */}
      <Dialog open={weightDialog} onOpenChange={setWeightDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Weight</DialogTitle>
            <DialogDescription>Update the weight for {pet.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g., 25.5"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setWeightDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveWeight}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteAction) deleteAction();
                setDeleteDialog(false);
                setDeleteAction(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
