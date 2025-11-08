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
