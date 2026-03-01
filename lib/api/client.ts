// API Client for Immigration AI Backend

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.immigrationai.co.za'
    : 'http://localhost:4000');

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string; // e.g. 'TRIAL_EXPIRED'
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

  private async parseResponseBody(response: Response): Promise<{ parsed: any; text: string }> {
    const text = await response.text();
    if (!text) {
      return { parsed: {}, text };
    }

    try {
      return { parsed: JSON.parse(text), text };
    } catch {
      return { parsed: null, text };
    }
  }

  private buildFallbackBody(ok: boolean, text: string) {
    const message = text?.trim() || 'Unexpected response from server';
    return {
      success: ok,
      error: ok ? undefined : message,
      message,
    };
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

      const { parsed, text } = await this.parseResponseBody(response);
      const data = parsed ?? this.buildFallbackBody(response.ok, text);

      // Handle token expiration
      if (response.status === 401 && data && data.error === 'TOKEN_EXPIRED') {
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
              const retryParsed = await this.parseResponseBody(retryResponse);
              return retryParsed.parsed ?? this.buildFallbackBody(retryResponse.ok, retryParsed.text);
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
        // Trial expired — fire a global event so the dashboard can show the wall
        if (
          response.status === 402 &&
          (data?.error === 'TRIAL_EXPIRED' || data?.message === 'TRIAL_EXPIRED')
        ) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('trial:expired'));
          }
          return { success: false, error: 'TRIAL_EXPIRED', code: 'TRIAL_EXPIRED' };
        }

        return {
          success: false,
          error: data.error || data.message || 'Request failed',
          code: data.code,
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

    const { parsed, text } = await this.parseResponseBody(response);
    const data = parsed ?? this.buildFallbackBody(response.ok, text);

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

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_URL);


