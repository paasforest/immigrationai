import { apiClient, ApiResponse } from './client';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  companyName: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  role?: string; // organizationRole: 'org_admin' | 'professional' | 'applicant'
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface SignupData {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
  subscriptionPlan?: string;
  tracking?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    referrer?: string;
    landingPage?: string;
    sessionId?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  // Sign up new user
  async signup(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', data);
    
    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  // Login user
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    
    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  // Logout user
  async logout(refreshToken: string): Promise<ApiResponse> {
    const response = await apiClient.post('/api/auth/logout', { refreshToken });
    apiClient.setToken(null);
    return response;
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<{ user: User }>('/api/auth/user');
  },

  // Request password reset
  async resetPassword(email: string): Promise<ApiResponse> {
    return apiClient.post('/api/auth/reset-password', { email });
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
      refreshToken,
    });
    
    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },
};


