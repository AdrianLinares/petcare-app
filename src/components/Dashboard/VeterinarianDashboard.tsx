import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Footer from '@/components/ui/footer';
import { Calendar, Clock, Users, FileText, Bell, User as UserIcon } from 'lucide-react';
import { Appointment, User } from '../../types';

interface VeterinarianDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function VeterinarianDashboard({ user, onLogout }: VeterinarianDashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    // Load all appointments for the veterinarian
    const allAppointments: Appointment[] = [];
    
    try {
      // Get all users' appointments and filter for this veterinarian
      const appointmentKeys = Object.keys(localStorage).filter(key => key.startsWith('appointments_'));
      appointmentKeys.forEach(userKey => {
        try {
          const userAppointments = JSON.parse(localStorage.getItem(userKey) || '[]');
          const vetAppointments = userAppointments.filter((apt: Appointment) => 
            apt.veterinarian === user.fullName || apt.veterinarian.includes(user.fullName.split(' ')[1])
          );
          allAppointments.push(...vetAppointments);
        } catch (error) {
          console.error(`Error parsing appointments from ${userKey}:`, error);
        }
      });
    } catch (error) {
      console.error('Error loading veterinarian appointments:', error);
    }

    setAppointments(allAppointments);
  }, [user.fullName]);

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
    // Find the appointment and update it
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      const updatedAppointment = { ...appointment, status: 'completed' as const };
      
      // Update in the owner's localStorage
      const ownerAppointments = JSON.parse(localStorage.getItem(`appointments_${appointment.ownerId}`) || '[]');
      const updatedOwnerAppointments = ownerAppointments.map((apt: Appointment) =>
        apt.id === appointmentId ? updatedAppointment : apt
      );
      localStorage.setItem(`appointments_${appointment.ownerId}`, JSON.stringify(updatedOwnerAppointments));
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? updatedAppointment : apt
      ));
    }
  };

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
                <h2 className="text-lg font-medium text-gray-900">Dr. {user.fullName}</h2>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today's Schedule</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
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
                      <p className="text-sm font-medium text-gray-600">Completed Today</p>
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
                      <p className="text-sm font-medium text-gray-600">Pending</p>
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
                      <p className="text-sm font-medium text-gray-600">Total Patients</p>
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
                <CardTitle>Today's Schedule - {new Date().toLocaleDateString()}</CardTitle>
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
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                            <p className="text-sm text-gray-500">{appointment.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          {appointment.status === 'scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteAppointment(appointment.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
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
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                            <p className="text-sm text-gray-500">{appointment.reason}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{appointment.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments
                      .filter(apt => apt.status === 'completed')
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 10)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">{appointment.petName}</p>
                              <p className="text-sm text-gray-600">
                                Last visit: {new Date(appointment.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">{appointment.type}</p>
                              {appointment.diagnosis && (
                                <p className="text-sm text-gray-500">Diagnosis: {appointment.diagnosis}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No patient records available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}