import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Footer from '@/components/ui/footer';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export default function LoginForm({ onLoginSuccess, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login with backend API
        const { user } = await authAPI.login(email, password);
        toast.success(`Welcome back, ${user.fullName}!`);
        onLoginSuccess(user);
      } else {
        // Registration logic
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (!userType) {
          setError('Please select a user type');
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters long');
          setLoading(false);
          return;
        }
        
        // Register with backend API
        const { user } = await authAPI.register({
          email,
          password,
          fullName,
          phone,
          userType,
        });
        
        toast.success(`Welcome to PetCare, ${user.fullName}!`);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-petcare-beige to-petcare-golden/20">
      <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/petcare-logo.png" 
              alt="PetCare Logo" 
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-petcare-navy">
            {isLogin ? 'Welcome to PetCare' : 'Join PetCare'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to manage your pet\'s healthcare' 
              : 'Create your account to get started'
            }
          </CardDescription>
          {isLogin && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-900 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-blue-800">
                <p><strong>Pet Owner:</strong> owner@petcare.com / password123</p>
                <p><strong>Veterinarian:</strong> vet@petcare.com / password123</p>
                <p><strong>Administrator:</strong> admin@petcare.com / password123</p>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="userType">I am a...</Label>
                <Select value={userType} onValueChange={setUserType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet_owner">Pet Owner</SelectItem>
                    <SelectItem value="veterinarian">Veterinarian</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-petcare-primary hover:text-petcare-navy text-sm transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                  setPhone('');
                  setUserType('');
                }}
                className="text-petcare-primary hover:text-petcare-navy text-sm transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      
      <Footer />
    </div>
  );
}