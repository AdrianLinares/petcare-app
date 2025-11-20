/**
 * MedicalRecordForm Component
 * 
 * BEGINNER EXPLANATION:
 * This is a simplified form for adding general medical records to a pet's history.
 * It's more basic than the ClinicalRecordForm - used for recording any type of
 * medical event (checkups, surgeries, emergencies, etc.).
 * 
 * Key Features:
 * - Simple 3-field form (date, type, description)
 * - Flexible record types (checkup, surgery, emergency, etc.)
 * - Quick data entry for veterinarians
 * 
 * Form Fields:
 * - Date: When the medical event occurred (defaults to today)
 * - Record Type: Category of medical record (e.g., "Checkup", "Surgery")
 * - Description: Detailed notes about the medical event
 * 
 * Use Cases:
 * - Recording routine checkups
 * - Documenting surgeries performed
 * - Logging emergency visits
 * - Adding historical medical events
 * 
 * Workflow:
 * 1. User fills out 3 simple fields
 * 2. Form validates required fields
 * 3. Data sent to backend API
 * 4. On success, parent refreshes medical records list
 * 5. Dialog closes automatically
 * 
 * @param {string} petId - ID of the pet this record is for
 * @param {Function} onClose - Callback to close the form dialog
 * @param {Function} onSuccess - Callback when record is successfully created
 */

import { useState } from 'react';
import { medicalRecordAPI } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface MedicalRecordFormProps {
  petId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MedicalRecordForm({
  petId,
  onClose,
  onSuccess,
}: MedicalRecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    recordType: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await medicalRecordAPI.create({
        petId,
        ...formData,
      });
      toast.success('Medical record added successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
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
            <Label htmlFor="recordType">Record Type</Label>
            <Input
              id="recordType"
              value={formData.recordType}
              onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
              placeholder="e.g., Checkup, Emergency, Surgery"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the medical record..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
