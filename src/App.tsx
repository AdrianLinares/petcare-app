import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import LoginForm from './components/Auth/LoginForm';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import PasswordRecoveryDemo from './components/Auth/PasswordRecoveryDemo';
import PetOwnerDashboard from './components/Dashboard/PetOwnerDashboard';
import VeterinarianDashboard from './components/Dashboard/VeterinarianDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import { User, AuthState } from './types';
import { initializeTestData } from './utils/testData';
import { getResetTokenFromURL } from './utils/passwordRecovery';
import { toast } from 'sonner';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({ view: 'login' });

  useEffect(() => {
    // Initialize test data
    try {
      initializeTestData();
    } catch (error) {
      console.error('Error initializing test data:', error);
      toast.error('Error loading test data');
    }

    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    // Check if there's a reset token in the URL
    const resetToken = getResetTokenFromURL();
    if (resetToken) {
      setAuthState({ view: 'reset-password', resetToken });
    }
    
    // Check for demo dashboard access
    if (window.location.hash === '#demo') {
      setAuthState({ view: 'demo' } as any);
    }
    
    setLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string, userType: string): Promise<boolean> => {
    try {
      // Check if user exists
      const savedUser = localStorage.getItem('user_' + email);
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        if (userData.password === password && userData.userType === userType) {
          setCurrentUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
          toast.success(`Welcome back, ${userData.fullName}!`);
          return true;
        } else {
          toast.error('Invalid credentials or user type');
          return false;
        }
      } else {
        toast.error('User not found');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
  };

  const handleForgotPassword = () => {
    setAuthState({ view: 'forgot-password' });
  };

  const handleBackToLogin = () => {
    setAuthState({ view: 'login' });
    // Clear URL hash if present
    if (window.location.hash) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handlePasswordResetSuccess = () => {
    setAuthState({ view: 'login' });
    // Clear URL hash
    if (window.location.hash) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PetCare...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <TooltipProvider>
        <Toaster />
        {authState.view === 'login' && (
          <LoginForm 
            onLogin={handleLogin} 
            onSwitchToRegister={() => { }} 
            onForgotPassword={handleForgotPassword}
          />
        )}
        {authState.view === 'forgot-password' && (
          <ForgotPasswordForm onBack={handleBackToLogin} />
        )}
        {authState.view === 'reset-password' && (
          <ResetPasswordForm 
            resetToken={authState.resetToken}
            onSuccess={handlePasswordResetSuccess}
            onBack={handleBackToLogin}
          />
        )}
        {(authState as any).view === 'demo' && (
          <PasswordRecoveryDemo />
        )}
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      {currentUser.userType === 'pet_owner' && (
        <PetOwnerDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.userType === 'veterinarian' && (
        <VeterinarianDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.userType === 'administrator' && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </TooltipProvider>
  );
};

export default App;
