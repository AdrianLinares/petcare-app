import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Footer from '@/components/ui/footer';
import { Calendar, Clock, Plus, Heart, Bell, FileText, User as UserIcon } from 'lucide-react';
import PetManagement from '../Pet/PetManagement';
import AppointmentScheduling from '../Appointment/AppointmentScheduling';
import PetMedicalRecords from '../Medical/PetMedicalRecords';
import { Pet, Appointment, User } from '../../types';
import { petAPI, appointmentAPI, vaccinationAPI } from '@/lib/api';
import { toast } from 'sonner';

interface PetOwnerDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function PetOwnerDashboard({ user, onLogout }: PetOwnerDashboardProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [overdueVaccines, setOverdueVaccines] = useState(0);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load pets
        const petsData = await petAPI.getPets();
        setPets(petsData);

        // Load appointments
        const appointmentsData = await appointmentAPI.getAppointments();
        setAppointments(appointmentsData);

        // Load upcoming vaccinations to count overdue
        const upcomingVaccinations = await vaccinationAPI.getUpcoming();
        const now = new Date();
        const overdue = upcomingVaccinations.filter(vacc => 
          vacc.nextDue && new Date(vacc.nextDue) < now
        ).length;
        setOverdueVaccines(overdue);
      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Failed to load some data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) > new Date() && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const recentAppointments = appointments
    .filter(apt => apt.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

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
                <h2 className="text-lg font-medium text-gray-900">Welcome, {user.fullName}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-600" />
              <Button variant="outline" onClick={onLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pets">My Pets</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medical">Medical Records</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">My Pets</p>
                      <p className="text-2xl font-bold text-gray-900">{pets.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Upcoming</p>
                      <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{recentAppointments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Bell className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Overdue Vaccines</p>
                      <p className="text-2xl font-bold text-gray-900">{overdueVaccines}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upcoming Appointments</span>
                  <Button onClick={() => setActiveTab('appointments')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
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
                            <p className="text-sm text-gray-600">Dr. {appointment.veterinarian}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{appointment.type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Medical History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.petName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.diagnosis || 'Routine checkup'}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No medical history available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pets">
            <PetManagement user={user} pets={pets} setPets={setPets} />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentScheduling 
              user={user} 
              pets={pets} 
              appointments={appointments}
              setAppointments={setAppointments}
            />
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            {pets.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    No pets added yet. Add a pet to view medical records.
                  </p>
                </CardContent>
              </Card>
            ) : selectedPetId ? (
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPetId(null)}
                  className="mb-4"
                >
                  ← Back to Pet Selection
                </Button>
                <PetMedicalRecords
                  petId={selectedPetId}
                  petName={pets.find(p => p.id === selectedPetId)?.name || 'Pet'}
                  currentUser={user}
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Select a Pet to View Medical Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pets.map((pet) => (
                      <Card
                        key={pet.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setSelectedPetId(pet.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Heart className="h-8 w-8 text-red-500" />
                            <div>
                              <p className="font-semibold">{pet.name}</p>
                              <p className="text-sm text-gray-600">
                                {pet.species} • {pet.breed}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}