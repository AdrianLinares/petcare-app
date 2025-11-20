import React, { useState, useEffect } from 'react';
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
import { petAPI, medicalRecordAPI, vaccinationAPI, medicationAPI } from '@/lib/api';
import { toast } from 'sonner';

interface MedicalHistoryManagementProps {
  pet: Pet;
  onUpdate: () => void;
  canEdit: boolean;
}

export default function MedicalHistoryManagement({ pet, onUpdate, canEdit }: MedicalHistoryManagementProps) {
  const [activeTab, setActiveTab] = useState('medical');
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [medications, setMedications] = useState<MedicationRecord[]>([]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [m, v, md] = await Promise.all([
        medicalRecordAPI.getByPet(pet.id),
        vaccinationAPI.getByPet(pet.id),
        medicationAPI.getByPet(pet.id),
      ]);
      setMedicalRecords(m);
      setVaccinations(v);
      setMedications(md);
    } catch (e) {
      toast.error('Failed to load medical history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.id]);

  // Medical Record states
  const [medicalRecordDialog, setMedicalRecordDialog] = useState(false);
  const [editingMedicalId, setEditingMedicalId] = useState<string | null>(null);
  const [medicalForm, setMedicalForm] = useState<Partial<MedicalRecord>>({
    date: '',
    recordType: '',
    description: ''
  });

  // Vaccination states
  const [vaccinationDialog, setVaccinationDialog] = useState(false);
  const [editingVaccinationId, setEditingVaccinationId] = useState<string | null>(null);
  const [vaccinationForm, setVaccinationForm] = useState<Partial<VaccinationRecord>>({
    vaccine: '',
    date: '',
    nextDue: ''
  });

  // Medication states
  const [medicationDialog, setMedicationDialog] = useState(false);
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [medicationForm, setMedicationForm] = useState<Partial<MedicationRecord>>({
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
  const handleOpenMedicalDialog = (record?: MedicalRecord) => {
    if (record) {
      setMedicalForm({
        date: record.date,
        recordType: record.recordType,
        description: record.description
      });
      setEditingMedicalId(record.id);
    } else {
      setMedicalForm({ date: '', recordType: '', description: '' });
      setEditingMedicalId(null);
    }
    setMedicalRecordDialog(true);
  };

  const handleSaveMedicalRecord = async () => {
    try {
      if (editingMedicalId) {
        await medicalRecordAPI.update(editingMedicalId, {
          date: medicalForm.date,
          recordType: medicalForm.recordType,
          description: medicalForm.description
        });
        toast.success('Medical record updated successfully');
      } else {
        await medicalRecordAPI.create({
          petId: pet.id,
          date: medicalForm.date!,
          recordType: medicalForm.recordType!,
          description: medicalForm.description!
        });
        toast.success('Medical record added successfully');
      }
      await loadAll();
      onUpdate();
      setMedicalRecordDialog(false);
    } catch (error) {
      toast.error('Failed to save medical record');
    }
  };

  const handleDeleteMedicalRecord = (id: string) => {
    setDeleteAction(() => async () => {
      try {
        await medicalRecordAPI.delete(id);
        toast.success('Medical record deleted');
        await loadAll();
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete medical record');
      }
    });
    setDeleteDialog(true);
  };

  // Vaccination handlers
  const handleOpenVaccinationDialog = (record?: VaccinationRecord) => {
    if (record) {
      setVaccinationForm({
        vaccine: record.vaccine,
        date: record.date,
        nextDue: record.nextDue
      });
      setEditingVaccinationId(record.id);
    } else {
      setVaccinationForm({ vaccine: '', date: '', nextDue: '' });
      setEditingVaccinationId(null);
    }
    setVaccinationDialog(true);
  };

  const handleSaveVaccination = async () => {
    try {
      if (editingVaccinationId) {
        await vaccinationAPI.update(editingVaccinationId, {
          vaccine: vaccinationForm.vaccine,
          date: vaccinationForm.date,
          nextDue: vaccinationForm.nextDue
        });
        toast.success('Vaccination record updated successfully');
      } else {
        await vaccinationAPI.create({
          petId: pet.id,
          vaccine: vaccinationForm.vaccine!,
          date: vaccinationForm.date!,
          nextDue: vaccinationForm.nextDue
        });
        toast.success('Vaccination record added successfully');
      }
      await loadAll();
      onUpdate();
      setVaccinationDialog(false);
    } catch (error) {
      toast.error('Failed to save vaccination record');
    }
  };

  const handleDeleteVaccination = (id: string) => {
    setDeleteAction(() => async () => {
      try {
        await vaccinationAPI.delete(id);
        toast.success('Vaccination record deleted');
        await loadAll();
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete vaccination record');
      }
    });
    setDeleteDialog(true);
  };

  // Medication handlers
  const handleOpenMedicationDialog = (record?: MedicationRecord) => {
    if (record) {
      setMedicationForm({
        name: record.name,
        dosage: record.dosage,
        startDate: record.startDate,
        endDate: record.endDate
      });
      setEditingMedicationId(record.id);
    } else {
      setMedicationForm({ name: '', dosage: '', startDate: '', endDate: '' });
      setEditingMedicationId(null);
    }
    setMedicationDialog(true);
  };

  const handleSaveMedication = async () => {
    try {
      if (editingMedicationId) {
        await medicationAPI.update(editingMedicationId, {
          name: medicationForm.name,
          dosage: medicationForm.dosage,
          startDate: medicationForm.startDate,
          endDate: medicationForm.endDate
        });
        toast.success('Medication record updated successfully');
      } else {
        await medicationAPI.create({
          petId: pet.id,
          name: medicationForm.name!,
          dosage: medicationForm.dosage!,
          startDate: medicationForm.startDate!,
          endDate: medicationForm.endDate
        });
        toast.success('Medication record added successfully');
      }
      await loadAll();
      onUpdate();
      setMedicationDialog(false);
    } catch (error) {
      toast.error('Failed to save medication record');
    }
  };

  const handleDeleteMedication = (id: string) => {
    setDeleteAction(() => async () => {
      try {
        await medicationAPI.delete(id);
        toast.success('Medication record deleted');
        await loadAll();
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

  const handleSaveAllergies = async () => {
    try {
      const allergiesArray = allergiesText
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      await petAPI.updatePet(pet.id, { allergies: allergiesArray });
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

  const handleSaveNotes = async () => {
    try {
      await petAPI.updatePet(pet.id, { notes: notesText });
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

  const handleSaveWeight = async () => {
    try {
      const newWeight = parseFloat(weightValue);
      if (isNaN(newWeight) || newWeight <= 0) {
        toast.error('Please enter a valid weight');
        return;
      }

      await petAPI.updatePet(pet.id, { weight: newWeight });
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
              {loading ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
              ) : medicalRecords && medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{record.recordType}</Badge>
                            <span className="text-sm text-gray-600">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">{record.description}</p>
                          <p className="text-xs text-gray-600">Veterinarian: {record.veterinarianName}</p>
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenMedicalDialog(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMedicalRecord(record.id)}
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
              {loading ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
              ) : vaccinations && vaccinations.length > 0 ? (
                <div className="space-y-4">
                  {vaccinations.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{record.vaccine}</p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(record.date).toLocaleDateString()}
                          </p>
                          {record.nextDue && (
                            <p className="text-sm text-gray-600">
                              Next Due: {new Date(record.nextDue).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenVaccinationDialog(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteVaccination(record.id)}
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
              {loading ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
              ) : medications && medications.length > 0 ? (
                <div className="space-y-4">
                  {medications.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
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
                              onClick={() => handleOpenMedicationDialog(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMedication(record.id)}
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
            <DialogTitle>{editingMedicalId ? 'Edit' : 'Add'} Medical Record</DialogTitle>
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
                value={medicalForm.recordType}
                onChange={(e) => setMedicalForm({ ...medicalForm, recordType: e.target.value })}
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
            <DialogTitle>{editingVaccinationId ? 'Edit' : 'Add'} Vaccination</DialogTitle>
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
            <DialogTitle>{editingMedicationId ? 'Edit' : 'Add'} Medication</DialogTitle>
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
