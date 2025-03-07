// Auth service for handling API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  role?: string;
  fitnessGoal?: string;
  experienceLevel?: string;
  preferredWorkoutType?: string;
  activityLevel?: string;
  medicalConditions?: string;
  dietaryRestrictions?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    [key: string]: any; // For other user properties
  };
  token: string;
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };
  
  const response = await fetch(url, config);
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.message || 'Something went wrong');
  }
  
  return responseData;
}

// Auth functions
export const authService = {
  // Register a new user
  register: (userData: RegisterData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/auth/register', 'POST', userData);
  },
  
  // Login user
  login: (credentials: LoginData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/api/auth/login', 'POST', credentials);
  },
  
  // Get current user profile (if needed later)
  getCurrentUser: (): Promise<AuthResponse['user']> => {
    return apiRequest<AuthResponse['user']>('/api/auth/me');
  },
  
  // Logout (client-side only for now)
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};