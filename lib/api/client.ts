// API Client for Immigration AI Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && data.error === 'TOKEN_EXPIRED') {
        const refreshToken = typeof window !== 'undefined' 
          ? localStorage.getItem('refresh_token') 
          : null;
        
        if (refreshToken) {
          try {
            const refreshResponse = await this.refreshToken(refreshToken);
            if (refreshResponse.success && refreshResponse.data) {
              // Retry the original request with new token
              (headers as Record<string, string>)['Authorization'] = `Bearer ${refreshResponse.data.token}`;
              const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
              });
              const retryData = await retryResponse.json();
              return retryData;
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear tokens and continue with original error
            this.setToken(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('refresh_token');
            }
          }
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
      };
    }
  }

  // Helper method to refresh token
  private async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string; user: any }>> {
    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok && data.success && data.data) {
      // Update stored tokens
      this.setToken(data.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', data.data.refreshToken);
      }
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_URL);


