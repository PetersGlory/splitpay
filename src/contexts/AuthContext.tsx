import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthAPI, UserAPI, TokenManager, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshUserData: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferredCurrency?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!TokenManager.getToken();

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      if (TokenManager.hasValidToken()) {
        await refreshUserData();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      TokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await UserAPI.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      TokenManager.clearTokens();
      setUser(null);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await AuthAPI.login({ email, password });
      
      if (response.success && response.data) {
        TokenManager.setTokens(response.data.token, response.data.refreshToken);
        setUser(response.data.user);
        return { 
          success: true, 
          message: response.message || 'Login successful' 
        };
      } else {
        return {
          success: false,
          message: response.error?.message || 'Login failed. Please check your credentials.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Unable to connect to server. Please check your internet connection and try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await AuthAPI.register(userData);
      
      if (response.success && response.data) {
        TokenManager.setTokens(response.data.token, response.data.refreshToken);
        setUser(response.data.user);
        return { 
          success: true, 
          message: response.message || 'Registration successful' 
        };
      } else {
        return {
          success: false,
          message: response.error?.message || 'Registration failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Unable to connect to server. Please check your internet connection and try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      const response = await AuthAPI.verifyEmail({ email, otp });
      
      if (response.success) {
        // Refresh user data to update verification status
        await refreshUserData();
        return { 
          success: true, 
          message: response.message || 'Email verified successfully' 
        };
      } else {
        return {
          success: false,
          message: response.error?.message || 'Email verification failed'
        };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await AuthAPI.forgotPassword(email);
      
      return {
        success: response.success,
        message: response.success 
          ? response.message || 'Password reset link sent to your email'
          : response.error?.message || 'Failed to send reset link'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await AuthAPI.resetPassword({ token, newPassword });
      
      return {
        success: response.success,
        message: response.success 
          ? response.message || 'Password reset successfully'
          : response.error?.message || 'Password reset failed'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await UserAPI.updateProfile(data);
      
      if (response.success && response.data) {
        // Update local user data
        setUser(prevUser => prevUser ? { ...prevUser, ...response.data } : null);
        return { 
          success: true, 
          message: response.message || 'Profile updated successfully' 
        };
      } else {
        return {
          success: false,
          message: response.error?.message || 'Profile update failed'
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}