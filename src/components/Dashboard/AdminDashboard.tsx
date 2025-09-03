import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Footer from '@/components/ui/footer';
import { Users, Calendar, FileText, TrendingUp, Bell, Search, Shield } from 'lucide-react';
import { Appointment, User } from '../../types';
import UserManagementDialogs from '../Admin/UserManagementDialogs';
import { UserService } from '../../services/userService';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
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
                <CardTitle>All Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {allAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {allAppointments
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 20)
                      .map((appointment) => (
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
                  <p className="text-gray-500 text-center py-8">No appointments found</p>
                )}
              </CardContent>
            </Card>
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
      
      <Footer />
    </div>
  );
}