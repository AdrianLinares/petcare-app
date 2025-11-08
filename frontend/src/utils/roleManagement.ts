import { User } from '../types';

export type UserRole = 'pet_owner' | 'veterinarian' | 'administrator';
export type AdminAccessLevel = 'standard' | 'elevated' | 'super_admin';

export interface RolePermissions {
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewAllUsers: boolean;
  canManageAppointments: boolean;
  canViewReports: boolean;
  canAccessAdminPanel: boolean;
  canManageSystemSettings: boolean;
  canViewClinicalRecords: boolean;
  canEditClinicalRecords: boolean;
}

export class RoleManager {
  // Define role-based permissions
  static getRolePermissions(userType: UserRole, accessLevel?: AdminAccessLevel): RolePermissions {
    switch (userType) {
      case 'pet_owner':
        return {
          canCreateUsers: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewAllUsers: false,
          canManageAppointments: false, // Can only manage their own
          canViewReports: false,
          canAccessAdminPanel: false,
          canManageSystemSettings: false,
          canViewClinicalRecords: false, // Can only view their pets' records
          canEditClinicalRecords: false
        };

      case 'veterinarian':
        return {
          canCreateUsers: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewAllUsers: false, // Can only view pet owners they work with
          canManageAppointments: true,
          canViewReports: false, // Can view their own practice reports
          canAccessAdminPanel: false,
          canManageSystemSettings: false,
          canViewClinicalRecords: true,
          canEditClinicalRecords: true
        };

      case 'administrator':
        // Base administrator permissions
        const baseAdminPermissions: RolePermissions = {
          canCreateUsers: true,
          canEditUsers: true,
          canDeleteUsers: true,
          canViewAllUsers: true,
          canManageAppointments: true,
          canViewReports: true,
          canAccessAdminPanel: true,
          canManageSystemSettings: false,
          canViewClinicalRecords: true,
          canEditClinicalRecords: false
        };

        // Enhance permissions based on access level
        switch (accessLevel) {
          case 'elevated':
            return {
              ...baseAdminPermissions,
              canManageSystemSettings: true,
              canEditClinicalRecords: true
            };

          case 'super_admin':
            return {
              ...baseAdminPermissions,
              canManageSystemSettings: true,
              canEditClinicalRecords: true,
              // Super admin has all permissions
            };

          default: // 'standard'
            return baseAdminPermissions;
        }

      default:
        // No permissions for unknown roles
        return {
          canCreateUsers: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewAllUsers: false,
          canManageAppointments: false,
          canViewReports: false,
          canAccessAdminPanel: false,
          canManageSystemSettings: false,
          canViewClinicalRecords: false,
          canEditClinicalRecords: false
        };
    }
  }

  // Check if a user has a specific permission
  static hasPermission(
    user: User, 
    permission: keyof RolePermissions
  ): boolean {
    const permissions = this.getRolePermissions(user.userType, user.accessLevel as AdminAccessLevel);
    return permissions[permission];
  }

  // Check if a user can perform an action on another user
  static canManageUser(currentUser: User, targetUser: User): boolean {
    // Super admin can manage anyone
    if (currentUser.userType === 'administrator' && currentUser.accessLevel === 'super_admin') {
      return true;
    }

    // Standard/elevated admins cannot manage other administrators
    if (currentUser.userType === 'administrator' && targetUser.userType === 'administrator') {
      // Only super admin can manage other admins
      return currentUser.accessLevel === 'super_admin';
    }

    // Admins can manage pet owners and veterinarians
    if (currentUser.userType === 'administrator') {
      return targetUser.userType === 'pet_owner' || targetUser.userType === 'veterinarian';
    }

    // Non-admins cannot manage other users
    return false;
  }

  // Get available user types that a user can create
  static getCreatableUserTypes(currentUser: User): UserRole[] {
    if (currentUser.userType !== 'administrator') {
      return [];
    }

    switch (currentUser.accessLevel) {
      case 'super_admin':
        return ['pet_owner', 'veterinarian', 'administrator'];
      case 'elevated':
        return ['pet_owner', 'veterinarian'];
      case 'standard':
      default:
        return ['pet_owner', 'veterinarian'];
    }
  }

  // Get available access levels for administrator users
  static getAvailableAccessLevels(currentUser: User): AdminAccessLevel[] {
    if (currentUser.userType !== 'administrator') {
      return [];
    }

    switch (currentUser.accessLevel) {
      case 'super_admin':
        return ['standard', 'elevated', 'super_admin'];
      case 'elevated':
        return ['standard'];
      case 'standard':
      default:
        return [];
    }
  }

  // Validate if a user can assign a specific role/access level
  static canAssignRole(
    currentUser: User, 
    targetUserType: UserRole, 
    targetAccessLevel?: AdminAccessLevel
  ): boolean {
    const creatableTypes = this.getCreatableUserTypes(currentUser);
    
    // Check if the current user can create this type of user
    if (!creatableTypes.includes(targetUserType)) {
      return false;
    }

    // If assigning administrator role, check access level permissions
    if (targetUserType === 'administrator' && targetAccessLevel) {
      const availableAccessLevels = this.getAvailableAccessLevels(currentUser);
      return availableAccessLevels.includes(targetAccessLevel);
    }

    return true;
  }

  // Get user type display name
  static getUserTypeDisplayName(userType: UserRole): string {
    switch (userType) {
      case 'pet_owner':
        return 'Pet Owner';
      case 'veterinarian':
        return 'Veterinarian';
      case 'administrator':
        return 'Administrator';
      default:
        return 'Unknown';
    }
  }

  // Get access level display name
  static getAccessLevelDisplayName(accessLevel: AdminAccessLevel): string {
    switch (accessLevel) {
      case 'standard':
        return 'Standard Admin';
      case 'elevated':
        return 'Elevated Admin';
      case 'super_admin':
        return 'Super Administrator';
      default:
        return 'Standard Admin';
    }
  }

  // Check if user can access admin dashboard
  static canAccessAdminDashboard(user: User): boolean {
    return this.hasPermission(user, 'canAccessAdminPanel');
  }

  // Get user's effective permissions as a summary
  static getUserPermissionsSummary(user: User): string[] {
    const permissions = this.getRolePermissions(user.userType, user.accessLevel as AdminAccessLevel);
    const summary: string[] = [];

    if (permissions.canCreateUsers) summary.push('Create Users');
    if (permissions.canEditUsers) summary.push('Edit Users');
    if (permissions.canDeleteUsers) summary.push('Delete Users');
    if (permissions.canViewAllUsers) summary.push('View All Users');
    if (permissions.canManageAppointments) summary.push('Manage Appointments');
    if (permissions.canViewReports) summary.push('View Reports');
    if (permissions.canAccessAdminPanel) summary.push('Admin Panel Access');
    if (permissions.canManageSystemSettings) summary.push('System Settings');
    if (permissions.canViewClinicalRecords) summary.push('View Clinical Records');
    if (permissions.canEditClinicalRecords) summary.push('Edit Clinical Records');

    return summary;
  }
}
