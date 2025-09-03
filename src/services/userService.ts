import { User } from '../types';

export class UserService {
  // Generate a unique ID for new users
  private static generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get all users from localStorage
  static getAllUsers(): User[] {
    const users: User[] = [];
    const userKeys = Object.keys(localStorage).filter(key => key.startsWith('user_'));
    
    userKeys.forEach(key => {
      try {
        const userData = JSON.parse(localStorage.getItem(key) || '{}');
        if (userData.email && userData.id) {
          users.push(userData);
        }
      } catch (error) {
        console.error(`Error parsing user data for key ${key}:`, error);
      }
    });

    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get user by ID
  static getUserById(userId: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.id === userId) || null;
  }

  // Get user by email
  static getUserByEmail(email: string): User | null {
    try {
      const userData = localStorage.getItem('user_' + email);
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
    }
    return null;
  }

  // Create a new user
  static createUser(userData: Omit<User, 'id' | 'createdAt'>): { success: boolean; user?: User; error?: string } {
    try {
      // Check if user with this email already exists
      if (this.getUserByEmail(userData.email)) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Validate required fields
      if (!userData.email || !userData.fullName || !userData.userType || !userData.password) {
        return { success: false, error: 'Missing required fields' };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate user type
      const validUserTypes = ['pet_owner', 'veterinarian', 'administrator'];
      if (!validUserTypes.includes(userData.userType)) {
        return { success: false, error: 'Invalid user type' };
      }

      const newUser: User = {
        ...userData,
        id: this.generateUserId(),
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('user_' + newUser.email, JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  // Update an existing user
  static updateUser(userId: string, updateData: Partial<Omit<User, 'id' | 'createdAt'>>): { success: boolean; user?: User; error?: string } {
    try {
      const existingUser = this.getUserById(userId);
      if (!existingUser) {
        return { success: false, error: 'User not found' };
      }

      // If email is being changed, check if new email already exists
      if (updateData.email && updateData.email !== existingUser.email) {
        if (this.getUserByEmail(updateData.email)) {
          return { success: false, error: 'User with this email already exists' };
        }

        // Validate new email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          return { success: false, error: 'Invalid email format' };
        }
      }

      // Validate user type if provided
      if (updateData.userType) {
        const validUserTypes = ['pet_owner', 'veterinarian', 'administrator'];
        if (!validUserTypes.includes(updateData.userType)) {
          return { success: false, error: 'Invalid user type' };
        }
      }

      const updatedUser: User = {
        ...existingUser,
        ...updateData
      };

      // If email changed, remove old entry and create new one
      if (updateData.email && updateData.email !== existingUser.email) {
        localStorage.removeItem('user_' + existingUser.email);
        localStorage.setItem('user_' + updatedUser.email, JSON.stringify(updatedUser));
      } else {
        localStorage.setItem('user_' + existingUser.email, JSON.stringify(updatedUser));
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update user' };
    }
  }

  // Delete a user
  static deleteUser(userId: string): { success: boolean; error?: string } {
    try {
      const user = this.getUserById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Remove user from localStorage
      localStorage.removeItem('user_' + user.email);

      // Also remove any related data (pets, appointments)
      // Remove pets owned by this user
      const petKeys = Object.keys(localStorage).filter(key => key.startsWith('pets_'));
      petKeys.forEach(key => {
        if (key === 'pets_' + userId) {
          localStorage.removeItem(key);
        }
      });

      // Remove appointments for this user
      const appointmentKeys = Object.keys(localStorage).filter(key => key.startsWith('appointments_'));
      appointmentKeys.forEach(key => {
        if (key === 'appointments_' + userId) {
          localStorage.removeItem(key);
        }
      });

      // Remove clinical records for this user's pets
      const clinicalKeys = Object.keys(localStorage).filter(key => key.startsWith('clinicalRecords_'));
      clinicalKeys.forEach(key => {
        if (key === 'clinicalRecords_' + userId) {
          localStorage.removeItem(key);
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }

  // Get users by type
  static getUsersByType(userType: User['userType']): User[] {
    return this.getAllUsers().filter(user => user.userType === userType);
  }

  // Get user statistics
  static getUserStats() {
    const allUsers = this.getAllUsers();
    const petOwners = allUsers.filter(u => u.userType === 'pet_owner');
    const veterinarians = allUsers.filter(u => u.userType === 'veterinarian');
    const administrators = allUsers.filter(u => u.userType === 'administrator');

    return {
      total: allUsers.length,
      petOwners: petOwners.length,
      veterinarians: veterinarians.length,
      administrators: administrators.length,
      recentUsers: allUsers.slice(0, 5) // Last 5 users
    };
  }

  // Search users
  static searchUsers(query: string): User[] {
    const allUsers = this.getAllUsers();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return allUsers;

    return allUsers.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.userType.toLowerCase().includes(searchTerm) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.specialization && user.specialization.toLowerCase().includes(searchTerm)) ||
      (user.licenseNumber && user.licenseNumber.toLowerCase().includes(searchTerm))
    );
  }
}
