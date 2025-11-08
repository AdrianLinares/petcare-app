import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import UserForm from './UserForm';
import { userAPI } from '@/lib/api';
import { User } from '../../types';
import { UserFormData } from '../../schemas/userSchema';
import { UserPlus, Edit, Trash2, AlertTriangle, Shield } from 'lucide-react';
import { RoleManager } from '../../utils/roleManagement';

interface UserManagementDialogsProps {
  users: User[];
  onUsersChange: () => void;
  currentUser: User; // Add current user for role management
}

export default function UserManagementDialogs({ users, onUsersChange, currentUser }: UserManagementDialogsProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      await userAPI.createUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        userType: data.userType,
        address: data.address,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        accessLevel: data.accessLevel,
      });
      toast.success('User created successfully!');
      setCreateDialogOpen(false);
      onUsersChange();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create user');
    }
    setIsLoading(false);
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await userAPI.updateUser(selectedUser.id, {
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        accessLevel: data.accessLevel,
        userType: data.userType,
      });
      toast.success('User updated successfully!');
      setEditDialogOpen(false);
      setSelectedUser(null);
      onUsersChange();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user');
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await userAPI.deleteUser(selectedUser.id);
      toast.success('User deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      onUsersChange();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    }
    setIsLoading(false);
  };

  const openEditDialog = (user: User) => {
    if (!RoleManager.canManageUser(currentUser, user)) {
      toast.error('You do not have permission to edit this user');
      return;
    }
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    if (!RoleManager.canManageUser(currentUser, user)) {
      toast.error('You do not have permission to delete this user');
      return;
    }
    setSelectedUser(user);
    setDeleteDialogOpen(true);
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
    <>
      {/* Create User Button */}
      {RoleManager.hasPermission(currentUser, 'canCreateUsers') && (
        <Button onClick={() => setCreateDialogOpen(true)} className="mb-4">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      )}

      {/* Users List with Action Buttons */}
      <div className="space-y-4">
        {users.map((user) => {
          const canEdit = RoleManager.canManageUser(currentUser, user);
          const canDelete = RoleManager.canManageUser(currentUser, user) && user.id !== currentUser.id;
          
          return (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                  {user.userType === 'administrator' && user.accessLevel && (
                    <p className="text-xs text-purple-600 font-medium">
                      {RoleManager.getAccessLevelDisplayName(user.accessLevel as any)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getUserTypeColor(user.userType)}>
                  {RoleManager.getUserTypeDisplayName(user.userType)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-1">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {user.id === currentUser.id && (
                    <Badge variant="outline" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreateUser}
            onCancel={() => setCreateDialogOpen(false)}
            isLoading={isLoading}
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user information. Make sure all required fields are filled.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSubmit={handleEditUser}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedUser(null);
              }}
              isLoading={isLoading}
              currentUser={currentUser}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Delete User</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action will permanently remove:
              {selectedUser && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedUser.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm text-gray-500">
                    User Type: {selectedUser.userType.replace('_', ' ')}
                  </p>
                </div>
              )}
              <div className="mt-3 text-sm text-red-600">
                <strong>Warning:</strong> This will also delete all associated data including:
                <ul className="list-disc list-inside mt-1">
                  <li>Pet records (if pet owner)</li>
                  <li>Appointment history</li>
                  <li>Clinical records</li>
                </ul>
                This action cannot be undone.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
