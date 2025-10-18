// API Configuration and Service Layer for SpleetPay
const API_BASE_URL = "https://backendapi.spleetpay.com/api";

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
  private static readonly TOKEN_KEY = 'SpleetPay_token';
  private static readonly REFRESH_TOKEN_KEY = 'SpleetPay_refresh_token';

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
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}


// HTTP Client
class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
      console.error('API request failed:', error);
      throw error;
    }
  }


  private async refreshToken(): Promise<boolean> {
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
      console.error('Token refresh failed:', error);
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
      isPayer?: boolean;
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
        cardNumber?: string;
        cvv?: string;
        expiryMonth?: string;
        expiryYear?: string;
        email?: string;
        reference?: string;
      };
    }
  ): Promise<ApiResponse<{
    transaction: Transaction;
    paymentUrl?: string;
    paystackUrl?: string;
  }>> {
    return apiClient.post(`/payments/${paymentId}/participants/${participantId}/pay`, data);
  },

  async initializePayment(
    paymentId: string,
    participantId: string,
    data: {
      amount: number;
      tipAmount?: number;
      paymentMethod: string;
      email: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ApiResponse<{
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  }>> {
    return apiClient.post(`/payments/${paymentId}/participants/${participantId}/initialize`, data);
  },

  async verifyPayment(
    paymentId: string,
    participantId: string,
    reference: string
  ): Promise<ApiResponse<{
    transaction: Transaction;
    paymentStatus: 'success' | 'failed' | 'pending';
  }>> {
    return apiClient.post(`/payments/${paymentId}/participants/${participantId}/verify`, {
      reference
    });
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