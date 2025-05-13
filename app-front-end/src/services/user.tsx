import authService from './auth';

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  last_login: string;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdatePayload {
  id: number;
  username?: string;
  email?: string;
  is_active?: boolean;
}

export interface ResetPasswordPayload {
  id: number;
  new_password: string;
  force_change: boolean;
}

const userService = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await authService.api.get<User[]>('/users/');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get a single user by ID
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await authService.api.get<User>(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: UserCreatePayload): Promise<User> => {
    try {
      const response = await authService.api.post<User>('/users/create/', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update a user
  updateUser: async (userData: UserUpdatePayload): Promise<User> => {
    try {
      const response = await authService.api.put<User>(`/users/${userData.id}/update/`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userData.id}:`, error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (userId: number): Promise<void> => {
    try {
      await authService.api.delete(`/users/${userId}/delete/`);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  // Reset user password
  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    try {
      await authService.api.post(`/users/${payload.id}/reset-password/`, {
        new_password: payload.new_password,
        force_change: payload.force_change
      });
    } catch (error) {
      console.error(`Error resetting password for user ${payload.id}:`, error);
      throw error;
    }
  }
};

export default userService;