/**
 * MedicationForm Component
 * 
 * BEGINNER EXPLANATION:
 * This form tracks medications that pets are taking. It's like a digital prescription
 * tracker that helps owners and vets keep track of what medications are active.
 * 
 * Key Features:
 * - Records medication name and dosage instructions
 * - Tracks start and end dates for medication course
 * - Shows whether medication is currently active
 * - Optional end date for ongoing medications
 * 
 * Form Fields:
 * - Name: Medication name (e.g., "Amoxicillin")
 * - Dosage: How much and how often (e.g., "500mg twice daily")
 * - Start Date: When medication course began (defaults to today)
 * - End Date: When medication course ends (optional - leave blank for ongoing)
 * - Active: Checkbox to mark if medication is currently being taken
 * 
 * Use Cases:
 * - Prescribing antibiotics after surgery
 * - Recording ongoing medications for chronic conditions
 * - Tracking pain medication courses
 * - Managing flea/tick prevention schedules
 * 
 * Active Checkbox Behavior:
 * - Checked = Pet is currently taking this medication
 * - Unchecked = Medication has been discontinued
 * - Vets can deactivate medications without deleting the record
 * 
 * @param {string} petId - ID of the pet this medication is for
 * @param {Function} onClose - Callback to close the form dialog
 * @param {Function} onSuccess - Callback when medication is successfully added
 */

import { useState } from 'react';
import { medicationAPI } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface MedicationFormProps {
  petId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MedicationForm({ petId, onClose, onSuccess }: MedicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await medicationAPI.create({
        petId,
        ...formData,
        endDate: formData.endDate || undefined,
      });
      toast.success('Medication added successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Medication Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Amoxicillin"
              required
            />
          </div>

          <div>
            <Label htmlFor="dosage">Dosage</Label>
            <Input
              id="dosage"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              placeholder="e.g., 500mg twice daily"
              required
            />
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked as boolean })}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active medication
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Medication'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
