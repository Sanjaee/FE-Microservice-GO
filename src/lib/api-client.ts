// Enhanced API client with JWT token management
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface User {
  id: string;
  username: string;
  email: string;
  image_url?: string;
  type: string;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp_code: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface OTPVerifyResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ResendOTPResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface VerifyResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyResetPasswordResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Product interfaces
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  user: User;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  next_cursor?: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  cursor?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Set access token for authenticated requests
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add Authorization header if access token is available
    if (this.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases with detailed messages
        if (response.status === 409) {
          throw new Error(
            errorData.message ||
              errorData.error ||
              "User with this email or username already exists"
          );
        } else if (response.status === 400) {
          throw new Error(
            errorData.message || errorData.error || "Invalid request data"
          );
        } else if (response.status === 401) {
          // For 401 errors, prioritize the message field for better user experience
          throw new Error(
            errorData.message || errorData.error || "Unauthorized"
          );
        } else if (response.status === 404) {
          throw new Error(
            errorData.message || errorData.error || "Resource not found"
          );
        } else if (response.status === 500) {
          throw new Error(
            errorData.message || errorData.error || "Internal server error"
          );
        }

        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: OTPVerifyRequest): Promise<OTPVerifyResponse> {
    return this.request<OTPVerifyResponse>("/api/v1/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    return this.request<ResendOTPResponse>("/api/v1/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async googleOAuth(data: {
    email: string;
    username: string;
    image_url: string;
    google_id: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/google-oauth", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async requestResetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>(
      "/api/v1/auth/request-reset-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async verifyResetPassword(
    data: VerifyResetPasswordRequest
  ): Promise<VerifyResetPasswordResponse> {
    return this.request<VerifyResetPasswordResponse>(
      "/api/v1/auth/verify-reset-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  // Protected endpoints
  async getProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>("/api/v1/user/profile", {
      method: "GET",
    });
  }

  async updateProfile(data: {
    username?: string;
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(
      "/api/v1/user/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  // Product endpoints
  async getProducts(
    query: ProductQuery = {}
  ): Promise<{ success: boolean; data: ProductListResponse; meta: any }> {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.cursor) params.append("cursor", query.cursor);
    if (query.search) params.append("search", query.search);
    if (query.min_price) params.append("min_price", query.min_price.toString());
    if (query.max_price) params.append("max_price", query.max_price.toString());
    if (query.is_active !== undefined)
      params.append("is_active", query.is_active.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/v1/products?${queryString}`
      : "/api/v1/products";

    return this.request<{
      success: boolean;
      data: ProductListResponse;
      meta: any;
    }>(endpoint, {
      method: "GET",
    });
  }

  async getProductById(
    id: string
  ): Promise<{ success: boolean; data: Product; meta: any }> {
    return this.request<{ success: boolean; data: Product; meta: any }>(
      `/api/v1/products/${id}`,
      {
        method: "GET",
      }
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request<{ status: string; service: string }>("/health");
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Token management utilities
export class TokenManager {
  private static ACCESS_TOKEN_KEY = "access_token";
  private static REFRESH_TOKEN_KEY = "refresh_token";

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.refreshToken(refreshToken);
      this.setTokens(response.access_token, response.refresh_token);
      return response.access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearTokens();
      return null;
    }
  }
}
