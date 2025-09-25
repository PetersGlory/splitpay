// API Configuration and Service Layer for SpleetPay
const API_BASE_URL ='https://spleetpay-backend.onrender.com/api';

// Mock data for development/demo when API is not available
const MOCK_MODE = true; // Set to false when real API is available

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferredCurrency: string;
  isVerified: boolean;
  accountStatus: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  wallet?: {
    id: string;
    balance: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
  message: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  type: 'pay_for_me' | 'group_split';
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'partial' | 'completed' | 'failed' | 'cancelled';
  paymentLink: string;
  qrCodeUrl: string;
  allowTips: boolean;
  expiresAt?: string;
  totalCollected?: number;
  createdAt: string;
  participants?: Participant[];
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  amount: number;
  hasPaid: boolean;
  paidAt?: string;
  participantLink?: string;
  paymentMethod?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  tipAmount?: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentProvider?: string;
  createdAt: string;
  paymentRequest?: {
    id: string;
    description: string;
    type: string;
  };
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  balanceAfter: number;
  reference: string;
  createdAt: string;
  transaction?: Transaction;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = 'spleetpay_token';
  private static readonly REFRESH_TOKEN_KEY = 'spleetpay_refresh_token';

  static setTokens(token: string, refreshToken: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // In mock mode, mock tokens are always valid
    if (MOCK_MODE && token.startsWith('mock_token_')) {
      return true;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      // If token parsing fails but we have a token, assume it's valid in demo mode
      return MOCK_MODE;
    }
  }
}

// Mock Data Generator
class MockDataGenerator {
  static generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generatePaymentId() {
    return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateToken() {
    return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  static createMockUser(userData: any): User {
    return {
      id: this.generateUserId(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || '',
      preferredCurrency: userData.preferredCurrency || 'NGN',
      isVerified: true,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wallet: {
        id: `wallet_${Date.now()}`,
        balance: 25000.00,
        currency: userData.preferredCurrency || 'NGN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  static createMockPaymentRequest(data: any): PaymentRequest {
    const id = this.generatePaymentId();
    return {
      id,
      userId: this.generateUserId(),
      type: data.type,
      description: data.description,
      amount: data.amount || data.totalAmount,
      currency: data.currency,
      status: 'pending',
      paymentLink: `https://pay.spleetpay.com/p/${id.substr(-8)}`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://pay.spleetpay.com/p/${id.substr(-8)}`,
      allowTips: data.allowTips || false,
      expiresAt: new Date(Date.now() + (data.expiresInHours || 24) * 60 * 60 * 1000).toISOString(),
      totalCollected: 0,
      createdAt: new Date().toISOString(),
      participants: data.participants?.map((p: any, index: number) => ({
        id: `participant_${Date.now()}_${index}`,
        name: p.name,
        email: p.email,
        phone: p.phone,
        amount: p.amount,
        hasPaid: false,
        participantLink: `https://pay.spleetpay.com/split/${id.substr(-8)}_${index}`
      }))
    };
  }
}

// HTTP Client
class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // If in mock mode or API is unavailable, return mock data
    if (MOCK_MODE) {
      return this.getMockResponse<T>(endpoint, options);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          const newToken = TokenManager.getToken();
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          const retryResponse = await fetch(url, retryConfig);
          return await retryResponse.json();
        } else {
          TokenManager.clearTokens();
          window.location.reload(); // Force re-login
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed, falling back to mock data:', error);
      // Fallback to mock data when API is unavailable
      return this.getMockResponse<T>(endpoint, options);
    }
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let mockData: any = null;
        let success = true;
        let message = '';

        try {
          const body = options.body ? JSON.parse(options.body as string) : {};
          
          if (endpoint === '/auth/register') {
            const user = MockDataGenerator.createMockUser(body);
            mockData = {
              user,
              token: MockDataGenerator.generateToken(),
              refreshToken: MockDataGenerator.generateToken()
            };
            message = 'Registration successful! (Demo Mode)';
          } else if (endpoint === '/auth/login') {
            const user = MockDataGenerator.createMockUser({
              email: body.email,
              firstName: 'Demo',
              lastName: 'User',
              preferredCurrency: 'NGN'
            });
            mockData = {
              user,
              token: MockDataGenerator.generateToken(),
              refreshToken: MockDataGenerator.generateToken()
            };
            message = 'Login successful! (Demo Mode)';
          } else if (endpoint === '/auth/verify-email') {
            mockData = null;
            message = 'Email verified successfully! (Demo Mode)';
          } else if (endpoint === '/users/profile') {
            mockData = MockDataGenerator.createMockUser({
              email: 'demo@spleetpay.com',
              firstName: 'Demo',
              lastName: 'User',
              preferredCurrency: 'NGN'
            });
          } else if (endpoint === '/users/payments/create') {
            mockData = MockDataGenerator.createMockPaymentRequest(body);
            message = 'Payment request created successfully! (Demo Mode)';
          } else if (endpoint === '/users/payments/split/create') {
            mockData = MockDataGenerator.createMockPaymentRequest(body);
            message = 'Group split created successfully! (Demo Mode)';
          } else if (endpoint.startsWith('/users/payments/history')) {
            mockData = {
              payments: [
                {
                  id: 'payment_1',
                  type: 'pay_for_me',
                  description: 'Lunch at Pizza Palace',
                  amount: 2500,
                  status: 'completed',
                  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                },
                {
                  id: 'payment_2',
                  type: 'group_split',
                  description: 'Weekend Trip',
                  amount: 15000,
                  status: 'pending',
                  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                  participants: [
                    { name: 'Alice', amount: 5000, hasPaid: true },
                    { name: 'Bob', amount: 5000, hasPaid: false },
                    { name: 'Charlie', amount: 5000, hasPaid: false }
                  ]
                }
              ],
              pagination: {
                total: 2,
                page: 1,
                limit: 20,
                totalPages: 1
              }
            };
          } else if (endpoint === '/users/wallet') {
            mockData = {
              balance: 25000.00,
              currency: 'NGN',
              lastUpdated: new Date().toISOString()
            };
          } else if (endpoint.startsWith('/users/wallet/transactions')) {
            mockData = {
              transactions: [
                {
                  id: 'txn_1',
                  type: 'credit',
                  amount: 2500,
                  currency: 'NGN',
                  description: 'Payment received for Lunch',
                  balanceAfter: 25000,
                  reference: 'CREDIT_123',
                  createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
                }
              ],
              pagination: {
                total: 1,
                page: 1,
                limit: 20,
                totalPages: 1
              }
            };
          } else {
            success = false;
            mockData = null;
          }

          resolve({
            success,
            data: mockData,
            message: message || undefined,
            error: success ? undefined : {
              code: 'MOCK_ERROR',
              message: 'Mock endpoint not implemented'
            }
          } as ApiResponse<T>);
        } catch (error) {
          resolve({
            success: false,
            error: {
              code: 'MOCK_ERROR',
              message: 'Mock data generation failed'
            }
          } as ApiResponse<T>);
        }
      }, 500); // Simulate network delay
    });
  }

  private async refreshToken(): Promise<boolean> {
    if (MOCK_MODE) {
      // In mock mode, always succeed with new tokens
      TokenManager.setTokens(
        MockDataGenerator.generateToken(),
        MockDataGenerator.generateToken()
      );
      return true;
    }

    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        TokenManager.setTokens(data.data.token, data.data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed, using mock tokens:', error);
      // Fallback to mock tokens
      TokenManager.setTokens(
        MockDataGenerator.generateToken(),
        MockDataGenerator.generateToken()
      );
      return true;
    }

    return false;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// Authentication API
export const AuthAPI = {
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    preferredCurrency?: string;
  }): Promise<ApiResponse<LoginResponse['data']>> {
    return apiClient.post('/auth/register', userData);
  },

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse['data']>> {
    return apiClient.post('/auth/login', credentials);
  },

  async verifyEmail(data: {
    email: string;
    otp: string;
  }): Promise<ApiResponse<null>> {
    return apiClient.post('/auth/verify-email', data);
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> {
    return apiClient.post('/auth/reset-password', data);
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post('/auth/logout');
  },
};

// User Profile API
export const UserAPI = {
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get('/users/profile');
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    preferredCurrency?: string;
  }): Promise<ApiResponse<Partial<User>>> {
    return apiClient.put('/users/profile', data);
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> {
    return apiClient.put('/users/change-password', data);
  },

  async deleteAccount(password: string): Promise<ApiResponse<null>> {
    return apiClient.delete('/users/account');
  },
};

// Payment Request API
export const PaymentAPI = {
  async createPaymentRequest(data: {
    type: 'pay_for_me';
    description: string;
    amount: number;
    currency: string;
    expiresInHours?: number;
    allowTips?: boolean;
  }): Promise<ApiResponse<PaymentRequest>> {
    return apiClient.post('/users/payments/create', data);
  },

  async createGroupSplit(data: {
    description: string;
    totalAmount: number;
    currency: string;
    participants: Array<{
      name: string;
      email?: string;
      phone?: string;
      amount: number;
    }>;
    splitType: 'equal' | 'custom';
    expiresInHours?: number;
    allowTips?: boolean;
  }): Promise<ApiResponse<PaymentRequest>> {
    return apiClient.post('/users/payments/split/create', data);
  },

  async getPaymentRequest(paymentId: string): Promise<ApiResponse<PaymentRequest>> {
    return apiClient.get(`/users/payments/${paymentId}`);
  },

  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    type?: 'pay_for_me' | 'group_split';
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    payments: PaymentRequest[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get(`/users/payments/history${query ? `?${query}` : ''}`);
  },

  async getPaymentByLink(linkToken: string): Promise<ApiResponse<PaymentRequest & { user: User }>> {
    return apiClient.get(`/payments/link/${linkToken}`);
  },

  async processParticipantPayment(
    paymentId: string,
    participantId: string,
    data: {
      amount: number;
      tipAmount?: number;
      paymentMethod: string;
      paymentDetails: {
        cardNumber: string;
        cvv: string;
        expiryMonth: string;
        expiryYear: string;
      };
    }
  ): Promise<ApiResponse<{
    transaction: Transaction;
    paymentUrl?: string;
  }>> {
    return apiClient.post(`/payments/${paymentId}/participants/${participantId}/pay`, data);
  },
};

// Wallet API
export const WalletAPI = {
  async getBalance(): Promise<ApiResponse<{
    balance: number;
    currency: string;
    lastUpdated: string;
  }>> {
    return apiClient.get('/users/wallet');
  },

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: 'credit' | 'debit';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    transactions: WalletTransaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get(`/users/wallet/transactions${query ? `?${query}` : ''}`);
  },

  async withdraw(data: {
    amount: number;
    withdrawalMethod: string;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  }): Promise<ApiResponse<{
    reference: string;
    amount: number;
    currency: string;
    newBalance: number;
    status: string;
  }>> {
    return apiClient.post('/users/wallet/withdraw', data);
  },

  async getStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    currentBalance: number;
    totalCredits: number;
    totalDebits: number;
    creditTransactions: number;
    debitTransactions: number;
    netBalance: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get(`/users/wallet/stats${query ? `?${query}` : ''}`);
  },
};

// Transaction API
export const TransactionAPI = {
  async getUserTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    transactions: Transaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get(`/users/transactions${query ? `?${query}` : ''}`);
  },
};

// Export token manager for use in components
export { TokenManager };