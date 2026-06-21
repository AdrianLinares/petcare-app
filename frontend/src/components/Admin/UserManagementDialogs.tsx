/**
 * User Management Dialogs Component (Admin)
 * 
 * Provides a complete user management interface with dialogs for:
 * - Creating new users
 * - Editing existing users
 * - Deleting users with confirmation
 * - Displaying users list with role badges
 * 
 * BEGINNER EXPLANATION:
 * This component is like an admin control panel for managing people in the system.
 * It shows a list of all users and provides buttons to add, edit, or remove them.
 * Each action opens a dialog (popup) to perform that operation safely.
 * 
 * ROLE-BASED SECURITY:
 * - Uses RoleManager to check permissions before allowing actions
 * - Prevents privilege escalation (can't create higher-level admins)
 * - Users can't delete themselves (prevents self-lockout)
 * - Shows appropriate error messages if action not allowed
 * 
 * COMPONENT FLOW:
 * 1. Displays list of users with info (name, email, role)
 * 2. User clicks "Add/Edit/Delete" button
 * 3. Permission check runs (RoleManager)
 * 4. If allowed, opens appropriate dialog
 * 5. User fills form or confirms action
 * 6. API call executes the operation
 * 7. List refreshes to show changes
 * 
 * @param users - Array of all users in the system
 * @param onUsersChange - Callback to refresh user list after changes
 * @param currentUser - The logged-in admin (for permission checks)
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  currentUser: User;
}

export default function UserManagementDialogs({ users, onUsersChange, currentUser }: UserManagementDialogsProps) {
  const { t } = useTranslation();
  // STATE: Controls visibility of create user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // STATE: Controls visibility of edit user dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // STATE: Controls visibility of delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // STATE: The user currently being edited or deleted
  // Null when no user is selected
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // STATE: Loading indicator during API operations
  // Disables buttons to prevent duplicate submissions
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle Create User
   * 
   * Creates a new user account by sending form data to the backend API.
   * On success, closes dialog and refreshes the user list.
   * 
   * FLOW:
   * 1. Set loading state (disables submit button)
   * 2. Call API to create user with all form data
   * 3. Show success message
   * 4. Close the create dialog
   * 5. Trigger parent component to refresh user list
   * 6. If error occurs, show error message
   * 7. Always clear loading state at the end
   * 
   * @param data - Form data from UserForm component
   */
  const handleCreateUser = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      // Call backend API to create new user
      await userAPI.createUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        userType: data.userType,
        address: data.address,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        ...(data.userType === 'administrator' && data.accessLevel ? { accessLevel: data.accessLevel } : {}),
      });

      // Show success notification to admin
      toast.success(t('admin.userCreated'));

      // Close the dialog
      setCreateDialogOpen(false);

      // Tell parent component to refresh the user list
      onUsersChange();
    } catch (error: any) {
      // Extract error message from API response or use default
      toast.error(error?.response?.data?.message || t('admin.failedCreate'));
    }
    setIsLoading(false);
  };

  /**
   * Handle Edit User
   * 
   * Updates an existing user's information.
   * Note: Password is not included in update (handled separately).
   * 
   * @param data - Updated form data from UserForm
   */
  const handleEditUser = async (data: UserFormData) => {
    // Safety check: ensure we have a user selected
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      // Call API to update user (notice: no password field)
      await userAPI.updateUser(selectedUser.id, {
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        userType: data.userType,
        ...(data.userType === 'administrator' && data.accessLevel ? { accessLevel: data.accessLevel } : {}),
      });

      toast.success(t('admin.userUpdated'));
      setEditDialogOpen(false);
      setSelectedUser(null); // Clear selection
      onUsersChange(); // Refresh list
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('admin.failedUpdate'));
    }
    setIsLoading(false);
  };

  /**
   * Handle Delete User
   * 
   * Permanently removes a user from the system.
   * This also deletes all associated data (pets, appointments, etc.).
   * 
   * SECURITY:
   * - User cannot delete themselves (checked in openDeleteDialog)
   * - Requires confirmation dialog before executing
   * - Cannot be undone!
   */
  const handleDeleteUser = async () => {
    // Safety check
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      // Permanently delete user and all their data
      await userAPI.deleteUser(selectedUser.id);

      toast.success(t('admin.userDeleted'));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      onUsersChange();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('admin.failedDelete'));
    }
    setIsLoading(false);
  };

  /**
   * Open Edit Dialog with Permission Check
   * 
   * Before opening the edit dialog, verifies that the current admin
   * has permission to manage the target user.
   * 
   * PERMISSION RULES:
   * - Standard admins can only edit pet owners and vets
   * - Elevated admins can edit other standard admins
   * - Super admins can edit anyone
   * - No one can edit users with higher privilege than themselves
   * 
   * @param user - The user to edit
   */
  const openEditDialog = (user: User) => {
    // Check if current admin has permission to manage this user
    if (!RoleManager.canManageUser(currentUser, user)) {
      toast.error(t('admin.noPermissionEdit'));
      return;
    }

    // Permission granted - open dialog
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  /**
   * Open Delete Dialog with Permission Check
   * 
   * Similar to edit, but with additional check to prevent self-deletion.
   * 
   * SECURITY:
   * This function only opens the dialog. The actual permission check
   * for showing the delete button is in the render section below.
   * 
   * @param user - The user to delete
   */
  const openDeleteDialog = (user: User) => {
    // Permission check
    if (!RoleManager.canManageUser(currentUser, user)) {
      toast.error(t('admin.noPermissionDelete'));
      return;
    }

    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  /**
   * Get Badge Color for User Type
   * 
   * Returns Tailwind CSS classes for coloring user type badges.
   * 
   * BEGINNER EXPLANATION:
   * This is a helper function that returns different colors based on user type:
   * - Pet Owner = Blue
   * - Veterinarian = Green
   * - Administrator = Purple
   * 
   * The returned string is CSS classes that style the badge.
   * 
   * @param userType - The type of user (pet_owner, veterinarian, administrator)
   * @returns Tailwind CSS classes for background and text color
   */
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
          {t('admin.addNewUser')}
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
                       title={t('admin.editTooltip')}
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
                       title={t('admin.deleteTooltip')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {user.id === currentUser.id && (
                    <Badge variant="outline" className="text-xs">
                      {t('admin.you')}
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
            <DialogTitle>{t('admin.createNewUser')}</DialogTitle>
            <DialogDescription>
              {t('admin.createUserDesc')}
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
            <DialogTitle>{t('admin.editUser')}</DialogTitle>
            <DialogDescription>
              {t('admin.editUserDesc')}
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
              <span>{t('admin.deleteUser')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.deleteUserConfirm')}
              {selectedUser && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedUser.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  <p className="text-sm text-gray-500">
                    {t('admin.userType')} {RoleManager.getUserTypeDisplayName(selectedUser.userType)}
                  </p>
                </div>
              )}
              <div className="mt-3 text-sm text-red-600">
                <strong>{t('admin.deleteWarningTitle')}:</strong> {t('admin.deleteWarningText')}
                <ul className="list-disc list-inside mt-1">
                  <li>{t('admin.deleteWarningPets')}</li>
                  <li>{t('admin.deleteWarningAppointments')}</li>
                  <li>{t('admin.deleteWarningClinical')}</li>
                </ul>
                {t('admin.deleteWarningUndo')}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? t('admin.deleting') : t('admin.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
