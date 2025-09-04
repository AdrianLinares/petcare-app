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

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({ view: 'login' });

  useEffect(() => {
    // Initialize test data
    initializeTestData();

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
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('UserType:', userType);
      console.log('localStorage length:', localStorage.length);
      
      // Check if test data was initialized
      const testDataVersion = localStorage.getItem('testDataInitialized');
      console.log('Test data version:', testDataVersion);
      
      // Re-initialize test data if needed
      if (!testDataVersion) {
        console.log('Test data not found, re-initializing...');
        initializeTestData();
      }
      
      // Check if user exists
      const savedUser = localStorage.getItem('user_' + email);
      console.log('Looking for key:', 'user_' + email);
      console.log('Saved user data:', savedUser);
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('Parsed user data:', userData);
        console.log('Password comparison:', `"${userData.password}" === "${password}"`, userData.password === password);
        console.log('UserType comparison:', `"${userData.userType}" === "${userType}"`, userData.userType === userType);
        
        if (userData.password === password && userData.userType === userType) {
          console.log('✅ Login successful!');
          setCurrentUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
          return true;
        } else {
          console.log('❌ Password or userType mismatch');
          if (userData.password !== password) {
            console.log(`Password mismatch: expected "${userData.password}", got "${password}"`);
          }
          if (userData.userType !== userType) {
            console.log(`UserType mismatch: expected "${userData.userType}", got "${userType}"`);
          }
        }
      } else {
        console.log('❌ No saved user found for email:', email);
        
        // Debug: Show all localStorage keys
        console.log('All localStorage keys:', Object.keys(localStorage));
        console.log('User keys:', Object.keys(localStorage).filter(k => k.startsWith('user_')));
        
        // Show all user emails stored
        const userKeys = Object.keys(localStorage).filter(k => k.startsWith('user_'));
        console.log('Available users:');
        userKeys.forEach(key => {
          try {
            const user = JSON.parse(localStorage.getItem(key) || '{}');
            console.log(`- ${user.email} (${user.userType})`);
          } catch (e) {
            console.log(`- Invalid user data in ${key}`);
          }
        });
      }

      // For demo purposes, create some default users if they don't exist
      if (userType === 'administrator' && email === 'admin@petcare.com' && password === 'adminpass123') {
        const adminUser = {
          id: 'admin-1',
          email: 'admin@petcare.com',
          fullName: 'Admin User',
          phone: '+1234567890',
          userType: 'administrator',
          password: 'adminpass123',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('user_' + email, JSON.stringify(adminUser));
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        setCurrentUser(adminUser);
        return true;
      }

      if (userType === 'veterinarian' && email === 'vet@petcare.com' && password === 'vet123') {
        const vetUser = {
          id: 'vet-1',
          email: 'vet@petcare.com',
          fullName: 'Dr. Sarah Johnson',
          phone: '+1234567891',
          userType: 'veterinarian',
          password: 'vet123',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('user_' + email, JSON.stringify(vetUser));
        localStorage.setItem('currentUser', JSON.stringify(vetUser));
        setCurrentUser(vetUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
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
