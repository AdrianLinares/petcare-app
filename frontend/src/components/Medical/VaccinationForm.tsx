/**
 * VaccinationForm Component
 * 
 * BEGINNER EXPLANATION:
 * This form records vaccinations that pets receive. It helps track vaccination history
 * and reminds owners when booster shots are due.
 * 
 * Key Features:
 * - Records vaccine name and administration date
 * - Tracks when next booster shot is due
 * - Simple, focused form for quick data entry
 * 
 * Form Fields:
 * - Vaccine Name: The specific vaccine given (e.g., "Rabies", "DHPP")
 * - Date Administered: When the vaccine was given (defaults to today)
 * - Next Due Date: When the booster shot should be given (optional)
 * 
 * Common Vaccines:
 * - Rabies: Usually required by law, booster every 1-3 years
 * - DHPP: Distemper combo vaccine, booster every 1-3 years
 * - Bordetella: Kennel cough, often required for boarding
 * - Lyme: Tick-borne disease prevention
 * 
 * Next Due Date Logic:
 * - If provided, system can show alerts for upcoming vaccinations
 * - Dashboard shows count of overdue vaccinations
 * - Helps owners stay on top of pet health requirements
 * 
 * Workflow:
 * 1. Vet administers vaccine
 * 2. Records vaccine name and date
 * 3. Calculates next due date (e.g., 1 year from today)
 * 4. Form saves to database
 * 5. System can now remind owner when booster is needed
 * 
 * @param {string} petId - ID of the pet that received the vaccination
 * @param {Function} onClose - Callback to close the form dialog
 * @param {Function} onSuccess - Callback when vaccination record is successfully created
 */

import { useState } from 'react';
import { vaccinationAPI } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface VaccinationFormProps {
  petId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VaccinationForm({ petId, onClose, onSuccess }: VaccinationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vaccine: '',
    date: new Date().toISOString().split('T')[0],
    nextDue: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vaccinationAPI.create({
        petId,
        ...formData,
        nextDue: formData.nextDue || undefined,
      });
      toast.success('Vaccination record added successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add vaccination record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vaccination Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="vaccine">Vaccine Name</Label>
            <Input
              id="vaccine"
              value={formData.vaccine}
              onChange={(e) => setFormData({ ...formData, vaccine: e.target.value })}
              placeholder="e.g., Rabies, DHPP"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date Administered</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="nextDue">Next Due Date (Optional)</Label>
            <Input
              id="nextDue"
              type="date"
              value={formData.nextDue}
              onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Vaccination'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
