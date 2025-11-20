/**
 * ClinicalRecordForm Component
 * 
 * BEGINNER EXPLANATION:
 * This form allows veterinarians to add detailed clinical records after examining a pet.
 * Think of it as a digital version of the notes a vet writes after each visit.
 * 
 * Key Features:
 * - Captures symptoms observed during visit
 * - Records diagnosis made by veterinarian
 * - Documents treatment provided
 * - Optionally lists medications prescribed
 * - Can schedule follow-up appointments
 * 
 * Form Fields:
 * - Date: When the visit occurred (defaults to today)
 * - Symptoms: What the owner/vet observed (required)
 * - Diagnosis: The vet's medical diagnosis (required)
 * - Treatment: What treatment was provided (required)
 * - Medications: List of prescribed drugs (optional, comma-separated)
 * - Notes: Any additional observations (optional)
 * - Follow-up Date: When pet should return (optional)
 * 
 * Workflow:
 * 1. Vet fills out form after examining pet
 * 2. Form validates required fields
 * 3. Medications string is split into array
 * 4. Data sent to backend API
 * 5. On success, parent component refreshes data
 * 
 * @param {string} petId - ID of the pet this record is for
 * @param {Function} onClose - Callback to close the form dialog
 * @param {Function} onSuccess - Callback when record is successfully created
 */

import { useState } from 'react';
import { clinicalRecordAPI } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ClinicalRecordFormProps {
  petId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClinicalRecordForm({ petId, onClose, onSuccess }: ClinicalRecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: '',
    followUpDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await clinicalRecordAPI.create({
        petId,
        date: formData.date,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : undefined,
        notes: formData.notes || undefined,
        followUpDate: formData.followUpDate || undefined,
      });
      toast.success('Clinical record added successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add clinical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Clinical Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Describe the symptoms observed..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Provide the diagnosis..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="treatment">Treatment</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="Describe the treatment provided..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="medications">Medications (Optional)</Label>
            <Input
              id="medications"
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              placeholder="Comma-separated list, e.g., Amoxicillin 500mg, Cough suppressant"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
            <Input
              id="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Clinical Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
