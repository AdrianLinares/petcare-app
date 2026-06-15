import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Footer from '@/components/ui/footer';
import { Calendar, Clock, Users, FileText, Edit, Save, X, Search, Filter, Trash2 } from 'lucide-react';
import NotificationBell from '../Notification/NotificationBell';
import LanguageSwitcher from '../LanguageSwitcher';
import { Appointment, User, Pet } from '../../types';
import { useAppointments, useUpdateAppointment } from '@/hooks/use-appointments';
import { usePets } from '@/hooks/use-pets';
import { toast } from 'sonner';
import { translateAppointmentType, translateAppointmentStatus } from '@/i18n/appointment';
import { translateSpecies } from '@/i18n/pets';
import { format } from 'date-fns';
import MedicalHistoryManagement from '../Medical/MedicalHistoryManagement';
import ClinicalRecordForm from '../Medical/ClinicalRecordForm';

interface VeterinarianDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function VeterinarianDashboard({ user, onLogout }: VeterinarianDashboardProps) {
  const { t } = useTranslation();

  // React Query data fetching
  const { data: allAppointmentsData = [], isLoading: appointmentsLoading, isError: appointmentsError, refetch: refetchAppointments } = useAppointments();
  const { data: allPetsData = [], refetch: refetchPets, isLoading: petsLoading, isError: petsError } = usePets();
  const updateAppointmentMutation = useUpdateAppointment();

  // Filter appointments for this veterinarian
  const appointments = useMemo(
    () => allAppointmentsData.filter((apt: Appointment) => apt.veterinarianId === user.id),
    [allAppointmentsData, user.id]
  );

  // Navigation and selection states
  const [activeTab, setActiveTab] = useState('today');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Clinical record form state
  const [clinicalRecordPetId, setClinicalRecordPetId] = useState<string | null>(null);

  // Editing states
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);

  // Form states
  const [medicalForm, setMedicalForm] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
    followUpDate: ''
  });
  const [rescheduleForm, setRescheduleForm] = useState({
    date: new Date(),
    time: ''
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [petSearchTerm, setPetSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(apt =>
    new Date(apt.date).toDateString() === today && apt.status !== 'cancelled'
  ).sort((a, b) => a.time.localeCompare(b.time));

  const upcomingAppointments = appointments.filter(apt =>
    new Date(apt.date) > new Date() && apt.status !== 'cancelled'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedToday = appointments.filter(apt =>
    new Date(apt.date).toDateString() === today && apt.status === 'completed'
  ).length;

  const handleCompleteAppointment = (appointmentId: string) => {
    updateAppointmentMutation.mutate(
      { id: appointmentId, data: { status: 'completed' } },
      {
        onSuccess: () => {
          toast.success(t('dashboard.appointmentCompleted'));
        },
      }
    );
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (!confirm(t('dashboard.confirmCancelAppointment'))) {
      return;
    }
    updateAppointmentMutation.mutate(
      { id: appointmentId, data: { status: 'cancelled' } },
      {
        onSuccess: () => {
          toast.success(t('dashboard.appointmentCancelled'));
        },
      }
    );
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (!confirm(t('dashboard.confirmDeleteAppointment'))) {
      return;
    }
    // Backend doesn't have a delete endpoint, so we mark as cancelled
    updateAppointmentMutation.mutate(
      { id: appointmentId, data: { status: 'cancelled' } },
      {
        onSuccess: () => {
          toast.success(t('dashboard.appointmentCancelled'));
        },
      }
    );
  };

  const handleEditMedicalHistory = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setMedicalForm({
      diagnosis: appointment.diagnosis || '',
      treatment: appointment.treatment || '',
      notes: appointment.notes || '',
      followUpDate: appointment.followUpDate || ''
    });
  };

  const handleSaveMedicalHistory = () => {
    if (!editingAppointment) return;

    updateAppointmentMutation.mutate(
      {
        id: editingAppointment.id,
        data: {
          diagnosis: medicalForm.diagnosis,
          treatment: medicalForm.treatment,
          notes: medicalForm.notes,
          followUpDate: medicalForm.followUpDate
        }
      },
      {
        onSuccess: () => {
          setEditingAppointment(null);
          toast.success(t('dashboard.medicalHistoryUpdated'));
        },
      }
    );
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setReschedulingAppointment(appointment);
    setRescheduleForm({
      date: new Date(appointment.date),
      time: appointment.time
    });
  };

  const handleSaveReschedule = () => {
    if (!reschedulingAppointment) return;

    updateAppointmentMutation.mutate(
      {
        id: reschedulingAppointment.id,
        data: {
          date: format(rescheduleForm.date, 'yyyy-MM-dd'),
          time: rescheduleForm.time
        }
      },
      {
        onSuccess: () => {
          setReschedulingAppointment(null);
          toast.success(t('dashboard.rescheduleSuccess'));
        },
      }
    );
  };

  const handleCancelReschedule = () => {
    setReschedulingAppointment(null);
    setRescheduleForm({ date: new Date(), time: '' });
  };

  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setMedicalForm({ diagnosis: '', treatment: '', notes: '', followUpDate: '' });
  };

  const isLoading = appointmentsLoading || petsLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{t('dashboard.loading') || 'Loading...'}</div>
      </div>
    );
  }

  // Show error state if any query failed
  if (appointmentsError || petsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img src="/petcare-logo.png" alt="PetCare" className="h-8 w-auto mr-3" />
                <h1 className="text-xl font-bold text-blue-600">PetCare</h1>
              </div>
              <Button variant="outline" onClick={onLogout}>{t('dashboard.signOut')}</Button>
            </div>
          </div>
        </header>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <h3 className="text-red-800 font-medium">Connection Error</h3>
          <p className="text-red-600 text-sm mt-1">Unable to load data from the server.</p>
          <Button onClick={() => { refetchAppointments(); refetchPets(); }} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img
                  src="/petcare-logo.png"
                  alt="PetCare"
                  className="h-8 w-auto mr-3"
                />
                <h1 className="text-xl font-bold text-blue-600">PetCare</h1>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">{t('dashboard.doctorPrefix', { name: user.fullName })}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <NotificationBell userId={user.id} />
              <Button variant="outline" onClick={onLogout}>
                {t('dashboard.signOut')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">{t('dashboard.todaySchedule')}</TabsTrigger>
            <TabsTrigger value="upcoming">{t('dashboard.upcomingTab')}</TabsTrigger>
            <TabsTrigger value="manage">{t('dashboard.manageAppointments')}</TabsTrigger>
            <TabsTrigger value="medical">{t('dashboard.medicalHistory')}</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t('dashboard.todayAppointments')}</p>
                      <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t('dashboard.completedToday')}</p>
                      <p className="text-2xl font-bold text-gray-900">{completedToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t('dashboard.pending')}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {todayAppointments.filter(apt => apt.status === 'scheduled').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{t('dashboard.totalPatients')}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Set(appointments.map(apt => apt.petId)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.todaySchedule')} - {new Date().toLocaleDateString()}</CardTitle>
              </CardHeader>
              <CardContent>
                {todayAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Clock className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.time}</p>
                            <p className="text-sm text-gray-600">{appointment.petName}</p>
                            <p className="text-sm text-gray-600">{translateAppointmentType(t, appointment.type)}</p>
                            <p className="text-sm text-gray-500">{appointment.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {translateAppointmentStatus(t, appointment.status)}
                          </Badge>
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setClinicalRecordPetId(appointment.petId)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                {t('medical.addClinicalRecord')}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleCompleteAppointment(appointment.id)}
                              >
                                {t('dashboard.markComplete')}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t('dashboard.noAppointmentsToday')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.upcomingAppointments')}</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 10).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Calendar className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.petName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                            <p className="text-sm text-gray-600">{translateAppointmentType(t, appointment.type)}</p>
                            <p className="text-sm text-gray-500">{appointment.reason}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{translateAppointmentStatus(t, appointment.status)}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">{t('dashboard.noUpcomingAppointments')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Search and Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t('dashboard.searchByPetOwnerType')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder={t('dashboard.filterByStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('dashboard.allAppointmentsOption')}</SelectItem>
                        <SelectItem value="scheduled">{t('dashboard.scheduled')}</SelectItem>
                        <SelectItem value="completed">{t('dashboard.completed')}</SelectItem>
                        <SelectItem value="cancelled">{t('dashboard.cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Appointments Management */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.allAppointments')}</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const filteredAppointments = appointments
                    .filter(apt => {
                      const matchesSearch = searchTerm === '' ||
                        apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        apt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (apt.reason && apt.reason.toLowerCase().includes(searchTerm.toLowerCase()));

                      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

                      return matchesSearch && matchesStatus;
                    })
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  return filteredAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {filteredAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              <Calendar className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{appointment.petName}</p>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {translateAppointmentStatus(t, appointment.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                              </p>
                              <p className="text-sm text-gray-600">{translateAppointmentType(t, appointment.type)}</p>
                              {appointment.reason && (
                                <p className="text-sm text-gray-500">{appointment.reason}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.status === 'scheduled' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRescheduleAppointment(appointment)}
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  {t('dashboard.reschedule')}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleCompleteAppointment(appointment.id)}
                                >
                                  {t('dashboard.complete')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {appointment.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditMedicalHistory(appointment)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                {t('dashboard.editHistory')}
                              </Button>
                            )}
                            {(appointment.status === 'cancelled' || appointment.status === 'completed') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      {searchTerm || statusFilter !== 'all'
                        ? t('dashboard.noAppointmentsMatch')
                        : t('dashboard.noAppointmentsAvailable')}
                    </p>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-6">
            {selectedPet ? (
              <div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPet(null)}
                  className="mb-4"
                >
                  {t('dashboard.backToPatientList')}
                </Button>
                <MedicalHistoryManagement
                  pet={selectedPet}
                  onUpdate={async () => { await refetchPets(); }}
                  canEdit={true}
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{t('dashboard.patientMedicalHistory')}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t('dashboard.searchPatients')}
                        value={petSearchTerm}
                        onChange={(e) => setPetSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const filteredPets = allPetsData.filter((pet: Pet) =>
                      pet.name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
                      pet.species.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
                      pet.breed.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
                      pet.ownerId.toLowerCase().includes(petSearchTerm.toLowerCase())
                    );

                    return filteredPets.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPets.map((pet: Pet) => (
                          <Card
                            key={pet.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => setSelectedPet(pet)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">{pet.name}</h3>
                                <Badge variant="secondary">{translateSpecies(t, pet.species)}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{t('dashboard.breed')}: {pet.breed}</p>
                              <p className="text-sm text-gray-600">{t('dashboard.age')}: {pet.age} years</p>
                              <p className="text-sm text-gray-600">{t('dashboard.weight')}: {pet.weight} kg</p>
                              <p className="text-xs text-gray-500 mt-2">{t('dashboard.owner')}: {pet.ownerId}</p>
                              <div className="mt-3 flex gap-2">
                                {pet.medicalHistory && pet.medicalHistory.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {t('dashboard.recordsCount', { count: pet.medicalHistory.length })}
                                  </Badge>
                                )}
                                {pet.allergies && pet.allergies.length > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {t('dashboard.allergiesCount', { count: pet.allergies.length })}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        {petSearchTerm ? t('dashboard.noPatientsMatch') : t('dashboard.noPatientsAvailable')}
                      </p>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={!!reschedulingAppointment} onOpenChange={(open) => !open && handleCancelReschedule()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('dashboard.rescheduleTitle')}</DialogTitle>
            <DialogDescription>
              {reschedulingAppointment && (
                <>
                  {t('dashboard.patient')}: <strong>{reschedulingAppointment.petName}</strong> -
                  {t('dashboard.type')}: <strong>{reschedulingAppointment.type}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {reschedulingAppointment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('dashboard.newDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(rescheduleForm.date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={rescheduleForm.date}
                      onSelect={(date) => date && setRescheduleForm(prev => ({ ...prev, date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reschedule-time">{t('dashboard.newTime')}</Label>
                <Select
                  value={rescheduleForm.time}
                  onValueChange={(value) => setRescheduleForm(prev => ({ ...prev, time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('dashboard.selectTime')} />
                  </SelectTrigger>
                  <SelectContent>
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'].map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelReschedule}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSaveReschedule}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('dashboard.saveChanges')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Medical History Edit Dialog */}
      <Dialog open={!!editingAppointment} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('dashboard.editMedicalHistoryTitle')}</DialogTitle>
            <DialogDescription>
              {editingAppointment && (
                <>
                  {t('dashboard.patient')}: <strong>{editingAppointment.petName}</strong> -
                  {t('dashboard.appointmentDate')}: <strong>{new Date(editingAppointment.date).toLocaleDateString()}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {editingAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('dashboard.typeOfAppointment')}</Label>
                  <Input value={editingAppointment.type} disabled />
                </div>
                <div className="space-y-2">
                  <Label>{t('dashboard.reasonForVisit')}</Label>
                  <Input value={editingAppointment.reason || ''} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">{t('dashboard.diagnosis')}</Label>
                <Textarea
                  id="diagnosis"
                  value={medicalForm.diagnosis}
                  onChange={(e) => setMedicalForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder={t('dashboard.diagnosisPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">{t('dashboard.treatment')}</Label>
                <Textarea
                  id="treatment"
                  value={medicalForm.treatment}
                  onChange={(e) => setMedicalForm(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder={t('dashboard.treatmentPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('dashboard.additionalNotes')}</Label>
                <Textarea
                  id="notes"
                  value={medicalForm.notes}
                  onChange={(e) => setMedicalForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('dashboard.notesPlaceholder')}
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSaveMedicalHistory}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('dashboard.saveMedicalHistory')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Clinical Record Form Dialog */}
      {clinicalRecordPetId && (
        <ClinicalRecordForm
          petId={clinicalRecordPetId}
          onClose={() => setClinicalRecordPetId(null)}
          onSuccess={() => {
            setClinicalRecordPetId(null);
            refetchPets();
          }}
        />
      )}

      <Footer />
    </div>
  );
}