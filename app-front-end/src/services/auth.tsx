import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Auth functions
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login/', credentials);
    
    // Store auth data in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: LoginCredentials & { email: string }): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register/', userData);
  
  // Store auth data in localStorage
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    // Call the backend logout endpoint if token exists
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/auth/logout/');
    }
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with logout even if API call fails
  } finally {
    // Always clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  api
};