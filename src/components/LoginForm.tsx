import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert } from './ui/alert';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

export function LoginForm({ onSwitchToRegister, onLoginSuccess }: LoginFormProps) {
  const { login, verifyEmail, forgotPassword, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setSubmitting(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setSuccess(result.message || 'Login successful!');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        if (result.message?.includes('verify')) {
          setShowVerification(true);
          setError('Please verify your email first');
        } else {
          setError(result.message || 'Login failed');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await verifyEmail(formData.email, otpCode);
      
      if (result.success) {
        setSuccess(result.message || 'Email verified successfully!');
        setShowVerification(false);
        // Try login again after verification
        setTimeout(() => {
          handleSubmit(e);
        }, 1000);
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!formData.email) {
      setError('Please enter your email address');
      setSubmitting(false);
      return;
    }

    try {
      const result = await forgotPassword(formData.email);
      
      if (result.success) {
        setSuccess(result.message || 'Reset link sent to your email!');
        setShowForgotPassword(false);
      } else {
        setError(result.message || 'Failed to send reset link');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (showVerification) {
    return (
      <Card className="p-6 w-full max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Verify Your Email</h2>
            <p className="text-muted-foreground mt-2">
              Enter the verification code sent to {formData.email}
            </p>
          </div>

          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700">{error}</p>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-green-700">{success}</p>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || otpCode.length !== 6}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setShowVerification(false)}
            >
              Back to Login
            </Button>
          </form>
        </div>
      </Card>
    );
  }

  if (showForgotPassword) {
    return (
      <Card className="p-6 w-full max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Reset Password</h2>
            <p className="text-muted-foreground mt-2">
              Enter your email to receive a reset link
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-red-700">{error}</p>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-green-700">{success}</p>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !formData.email}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </Button>
          </form>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your SpleetPay account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading || submitting}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading || submitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-700">{error}</p>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-green-700">{success}</p>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || submitting || !formData.email || !formData.password}
          >
            {isLoading || submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="flex justify-between text-sm">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot password?
            </button>
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={onSwitchToRegister}
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}