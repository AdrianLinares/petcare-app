import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Footer from '@/components/ui/footer';
import { Users, Calendar, FileText, TrendingUp, Bell, Search, Shield, Edit, Trash2, Eye, Filter, AlertTriangle, X } from 'lucide-react';
import { Appointment, User, Pet } from '../../types';
import UserManagementDialogs from '../Admin/UserManagementDialogs';
import { UserService } from '../../services/userService';
import { PetService } from '../../services/petService';
import { toast } from 'sonner';
import MedicalHistoryManagement from '../Medical/MedicalHistoryManagement';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [petSearchTerm, setPetSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const loadData = useCallback(() => {
    // Load all users using UserService
    const users = UserService.getAllUsers();
    setAllUsers(users);

    // Load all appointments
    const appointments: Appointment[] = [];
    const appointmentKeys = Object.keys(localStorage).filter(key => key.startsWith('appointments_'));
    appointmentKeys.forEach(key => {
      const userAppointments = JSON.parse(localStorage.getItem(key) || '[]');
      appointments.push(...userAppointments);
    });
    setAllAppointments(appointments);

    // Load all pets
    const pets = PetService.getAllPets();
    setAllPets(pets);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter appointments based on search and status
  const filteredAppointments = allAppointments.filter(appointment => {
    const matchesSearch = appointmentSearchTerm === '' || 
      appointment.petName.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
      appointment.veterinarian.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
      appointment.ownerId.toLowerCase().includes(appointmentSearchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewDialogOpen(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    setIsLoading(true);
    try {
      // Remove appointment from owner's localStorage
      const ownerAppointments = JSON.parse(localStorage.getItem(`appointments_${selectedAppointment.ownerId}`) || '[]');
      const updatedOwnerAppointments = ownerAppointments.filter((apt: Appointment) => apt.id !== selectedAppointment.id);
      localStorage.setItem(`appointments_${selectedAppointment.ownerId}`, JSON.stringify(updatedOwnerAppointments));
      
      // Reload data
      loadData();
      
      toast.success('Appointment deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('Error deleting appointment');
    }
    setIsLoading(false);
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    const appointment = allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    try {
      // Update appointment in owner's localStorage
      const ownerAppointments = JSON.parse(localStorage.getItem(`appointments_${appointment.ownerId}`) || '[]');
      const updatedOwnerAppointments = ownerAppointments.map((apt: Appointment) =>
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      );
      localStorage.setItem(`appointments_${appointment.ownerId}`, JSON.stringify(updatedOwnerAppointments));
      
      // Reload data
      loadData();
      
      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Error updating appointment status');
    }
  };
  const totalUsers = allUsers.length;
  const petOwners = allUsers.filter(u => u.userType === 'pet_owner').length;
  const veterinarians = allUsers.filter(u => u.userType === 'veterinarian').length;
  const totalAppointments = allAppointments.length;
  const completedAppointments = allAppointments.filter(apt => apt.status === 'completed').length;
  const cancelledAppointments = allAppointments.filter(apt => apt.status === 'cancelled').length;

  const today = new Date().toDateString();
  const todayAppointments = allAppointments.filter(apt => 
    new Date(apt.date).toDateString() === today
  ).length;

  const recentAppointments = allAppointments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const filteredUsers = UserService.searchUsers(searchTerm);

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

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'pet_owner':
        return 'bg-blue-100 text-blue-800';
      case 'veterinarian':
        return 'bg-green-100 text-green-800';
      case 'administrator':
        return 'bg-purple-100 text-purple-800';
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
                <Shield className="h-8 w-8 text-red-600 mr-2" />
                <h1 className="text-xl font-bold text-red-600">PetCare Admin</h1>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Administrator: {user.fullName}</h2>
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medical">Medical History</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                      <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{completedAppointments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today</p>
                      <p className="text-2xl font-bold text-gray-900">{todayAppointments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pet Owners</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${totalUsers > 0 ? (petOwners / totalUsers) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{petOwners}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Veterinarians</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${totalUsers > 0 ? (veterinarians / totalUsers) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{veterinarians}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completed</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{completedAppointments}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cancelled</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{cancelledAppointments}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
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
                            <Calendar className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.petName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString()} - Dr. {appointment.veterinarian}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.type}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent appointments</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <UserManagementDialogs 
                  users={filteredUsers} 
                  onUsersChange={loadData}
                  currentUser={user}
                />
                {filteredUsers.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No users found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Medical Appointments Management</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search appointments..."
                        value={appointmentSearchTerm}
                        onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredAppointments.length} of {allAppointments.length} appointments
                </div>
                {filteredAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAppointments
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
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
                              <p className="text-sm text-gray-500">{appointment.type}</p>
                              <p className="text-xs text-gray-400">Owner: {appointment.ownerId}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewAppointment(appointment)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {appointment.status === 'scheduled' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                                    className="text-green-600 hover:text-green-700"
                                    title="Mark as completed"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                                    className="text-yellow-600 hover:text-yellow-700"
                                    title="Cancel appointment"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAppointment(appointment)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete appointment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-600">
                      {appointmentSearchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter criteria' 
                        : 'No medical appointments have been scheduled yet'}
                    </p>
                  </div>
                )}
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
                  ← Back to Pet List
                </Button>
                <MedicalHistoryManagement 
                  pet={selectedPet} 
                  onUpdate={loadData}
                  canEdit={true}
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Pet Medical History Management</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search pets by name, species, or owner..."
                        value={petSearchTerm}
                        onChange={(e) => setPetSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const filteredPets = allPets.filter(pet =>
                      pet.name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
                      pet.species.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
                      pet.breed.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
                      pet.ownerId.toLowerCase().includes(petSearchTerm.toLowerCase())
                    );

                    return filteredPets.length > 0 ? (
                      <div>
                        <div className="mb-4 text-sm text-gray-600">
                          Showing {filteredPets.length} of {allPets.length} pets
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredPets.map((pet) => (
                            <Card 
                              key={pet.id} 
                              className="cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => setSelectedPet(pet)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-bold text-lg">{pet.name}</h3>
                                  <Badge variant="secondary">{pet.species}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">Breed: {pet.breed}</p>
                                <p className="text-sm text-gray-600">Age: {pet.age} years</p>
                                <p className="text-sm text-gray-600">Weight: {pet.weight} kg</p>
                                <p className="text-xs text-gray-500 mt-2">Owner: {pet.ownerId}</p>
                                <div className="mt-3 flex gap-2 flex-wrap">
                                  {pet.medicalHistory && pet.medicalHistory.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <FileText className="h-3 w-3 mr-1" />
                                      {pet.medicalHistory.length} Records
                                    </Badge>
                                  )}
                                  {pet.vaccinations && pet.vaccinations.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {pet.vaccinations.length} Vaccines
                                    </Badge>
                                  )}
                                  {pet.medications && pet.medications.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {pet.medications.length} Meds
                                    </Badge>
                                  )}
                                  {pet.allergies && pet.allergies.length > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      {pet.allergies.length} Allergies
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pets found</h3>
                        <p className="text-gray-600">
                          {petSearchTerm 
                            ? 'Try adjusting your search criteria' 
                            : 'No pets have been registered yet'}
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Users:</span>
                      <span className="font-bold">{totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pet Owners:</span>
                      <span className="font-bold">{petOwners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Veterinarians:</span>
                      <span className="font-bold">{veterinarians}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Appointments:</span>
                      <span className="font-bold">{totalAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Appointments:</span>
                      <span className="font-bold text-green-600">{completedAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled Appointments:</span>
                      <span className="font-bold text-red-600">{cancelledAppointments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Completion Rate:</span>
                      <span className="font-bold">
                        {totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancellation Rate:</span>
                      <span className="font-bold">
                        {totalAppointments > 0 ? Math.round((cancelledAppointments / totalAppointments) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Today's Appointments:</span>
                      <span className="font-bold">{todayAppointments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Pets per Owner:</span>
                      <span className="font-bold">
                        {petOwners > 0 ? Math.round((Object.keys(localStorage).filter(key => key.startsWith('pets_')).length / petOwners) * 10) / 10 : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* View Appointment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about the medical appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Patient</h4>
                  <p className="font-medium">{selectedAppointment.petName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Owner</h4>
                  <p>{selectedAppointment.ownerId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Date & Time</h4>
                  <p>{new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Veterinarian</h4>
                  <p>Dr. {selectedAppointment.veterinarian}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Type</h4>
                  <p>{selectedAppointment.type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Status</h4>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>
              
              {selectedAppointment.reason && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Reason for Visit</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedAppointment.reason}</p>
                </div>
              )}
              
              {selectedAppointment.diagnosis && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Diagnosis</h4>
                  <p className="text-sm bg-green-50 p-3 rounded">{selectedAppointment.diagnosis}</p>
                </div>
              )}
              
              {selectedAppointment.treatment && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Treatment</h4>
                  <p className="text-sm bg-blue-50 p-3 rounded">{selectedAppointment.treatment}</p>
                </div>
              )}
              
              {selectedAppointment.notes && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Additional Notes</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="text-xs text-gray-500 pt-4 border-t">
                Created: {new Date(selectedAppointment.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Appointment Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Delete Appointment</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
              {selectedAppointment && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedAppointment.petName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                  </p>
                  <p className="text-sm text-gray-600">Dr. {selectedAppointment.veterinarian}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.type}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAppointment}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete Appointment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}