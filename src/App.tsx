/**
 * =============================================================================
 * APP.TSX - THE MAIN APPLICATION COMPONENT
 * =============================================================================
 * 
 * BEGINNER EXPLANATION:
 * This is the heart of our application! Think of it as the conductor of an orchestra.
 * It decides what to show based on whether someone is logged in or not.
 * 
 * What this file does:
 * 1. Manages who is logged in (the currentUser)
 * 2. Shows login forms if no one is logged in
 * 3. Shows the appropriate dashboard if someone IS logged in
 * 4. Handles password recovery
 * 5. Loads demo data for testing
 * 
 * =============================================================================
 */

// ==================== IMPORTS ====================
// "Import" means: bring in code from other files so we can use it here

// React imports - The core framework we're using
import React, { useState, useEffect } from 'react';
// - useState: Creates state variables (data that can change)
// - useEffect: Runs code when component loads or data changes

// UI Component imports - Pre-built components for notifications and tooltips
import { Toaster } from '@/components/ui/sonner';        // Shows toast notifications (popup messages)
import { TooltipProvider } from '@/components/ui/tooltip'; // Provides tooltip functionality

// Authentication components - All the login/password screens
import LoginForm from './components/Auth/LoginForm';                 // The login screen
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm'; // "Forgot password" screen
import ResetPasswordForm from './components/Auth/ResetPasswordForm';   // Reset password screen
import PasswordRecoveryDemo from './components/Auth/PasswordRecoveryDemo'; // Demo for testing

// Dashboard components - What users see after logging in
import PetOwnerDashboard from './components/Dashboard/PetOwnerDashboard';     // Pet owner view
import VeterinarianDashboard from './components/Dashboard/VeterinarianDashboard'; // Vet view
import AdminDashboard from './components/Dashboard/AdminDashboard';           // Admin view

// Type definitions - Tells TypeScript what shape our data should be
import { User, AuthState } from './types';

// Utility imports - Helper functions
import { initializeTestData } from './utils/testData';              // Creates demo data
import { getResetTokenFromURL } from './utils/passwordRecovery';    // Gets password reset token from URL
import { toast } from 'sonner';                                      // Function to show popup messages

// ==================== MAIN APP COMPONENT ====================
/**
 * This is the main component that runs the entire application.
 * Think of it as the "main()" function in other programming languages.
 */
const App = () => {
  
  // ==================== STATE VARIABLES ====================
  // State is data that can change and will cause the component to re-render
  // Think of it as the app's memory
  
  /**
   * currentUser: Stores information about who is logged in
   * - If null: No one is logged in (show login form)
   * - If User object: Someone is logged in (show their dashboard)
   * 
   * Example: { id: '1', email: 'owner@petcare.com', fullName: 'John Doe', userType: 'pet_owner' }
   */
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  /**
   * loading: Tracks if the app is still loading
   * - true: Show loading spinner
   * - false: Show actual content
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * authState: Tracks which authentication screen to show
   * - 'login': Show login form
   * - 'forgot-password': Show forgot password form
   * - 'reset-password': Show reset password form
   */
  const [authState, setAuthState] = useState<AuthState>({ view: 'login' });

  // ==================== SIDE EFFECTS (useEffect) ====================
  /**
   * useEffect: Runs code after the component renders
   * The empty array [] means: run this code ONCE when the component first loads
   * 
   * Think of this as the "startup" or "initialization" code that runs
   * when the app first opens.
   */
  useEffect(() => {
    
    // STEP 1: Load demo data
    // This creates sample users, pets, and appointments for testing
    try {
      initializeTestData();
    } catch (error) {
      // If something goes wrong, log it and show an error message
      console.error('Error initializing test data:', error);
      toast.error('Error loading test data');
    }

    // STEP 2: Check if someone was already logged in before
    // When you log in, we save your info. When you come back, we check if it's still there.
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      // Found saved user! Convert from text to JavaScript object and log them in
      setCurrentUser(JSON.parse(savedUser));
    }
    
    // STEP 3: Check if URL has a password reset token
    // Example URL: http://localhost:5173/#reset-password?token=abc123
    const resetToken = getResetTokenFromURL();
    if (resetToken) {
      // Found a reset token! Show the reset password form
      setAuthState({ view: 'reset-password', resetToken });
    }
    
    // STEP 4: Check if accessing demo dashboard
    // Example URL: http://localhost:5173/#demo
    if (window.location.hash === '#demo') {
      setAuthState({ view: 'demo' } as any);
    }
    
    // STEP 5: Finished loading, show the app!
    setLoading(false);
    
  }, []); // Empty array = run once on component mount

  // ==================== EVENT HANDLER FUNCTIONS ====================
  // These functions respond to user actions (clicking, typing, etc.)
  
  /**
   * handleLogin: Attempts to log a user in
   * 
   * HOW IT WORKS:
   * 1. User enters email and password in the login form
   * 2. This function checks localStorage to see if that user exists
   * 3. If found, checks if password matches
   * 4. If everything is correct, logs them in
   * 
   * PARAMETERS:
   * @param email - The user's email address
   * @param password - The user's password
   * @param userType - What type of user (pet_owner, veterinarian, administrator)
   * 
   * RETURNS:
   * @returns true if login successful, false if login failed
   * 
   * BEGINNER NOTE:
   * "async" means this function can wait for things (like checking storage)
   * "Promise<boolean>" means it will eventually return true or false
   */
  const handleLogin = async (email: string, password: string, userType: string): Promise<boolean> => {
    try {
      // STEP 1: Look for this user in localStorage
      // Each user is saved with key "user_" + their email
      // Example: "user_owner@petcare.com"
      const savedUser = localStorage.getItem('user_' + email);
      
      if (savedUser) {
        // STEP 2: User exists! Convert their data from text to JavaScript object
        const userData = JSON.parse(savedUser);
        
        // STEP 3: Check if password AND user type match
        // Both must be correct to log in
        if (userData.password === password && userData.userType === userType) {
          // SUCCESS! Log them in
          setCurrentUser(userData);  // Update state with user info
          localStorage.setItem('currentUser', JSON.stringify(userData)); // Save for next visit
          toast.success(`Welcome back, ${userData.fullName}!`); // Show success message
          return true; // Tell the form: login worked!
        } else {
          // Password or user type doesn't match
          toast.error('Invalid credentials or user type');
          return false; // Tell the form: login failed
        }
      } else {
        // No user found with this email
        toast.error('User not found');
        return false;
      }
    } catch (error) {
      // Something went wrong (maybe localStorage is broken?)
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  /**
   * handleLogout: Logs the current user out
   * 
   * HOW IT WORKS:
   * 1. Clear the currentUser from state (app forgets who's logged in)
   * 2. Remove the saved user from localStorage (won't auto-login next time)
   * 3. Show a success message
   * 4. React will re-render and show the login form again
   */
  const handleLogout = () => {
    setCurrentUser(null);                      // Clear state: no one is logged in
    localStorage.removeItem('currentUser');    // Clear saved data
    toast.success('Logged out successfully');  // Show goodbye message
  };

  /**
   * handleForgotPassword: User clicked "Forgot Password?"
   * 
   * This changes the view to show the forgot password form
   */
  const handleForgotPassword = () => {
    setAuthState({ view: 'forgot-password' }); // Switch to forgot password screen
  };

  /**
   * handleBackToLogin: User wants to go back to login screen
   * 
   * This is called from password reset forms when user clicks "Back to Login"
   */
  const handleBackToLogin = () => {
    setAuthState({ view: 'login' }); // Switch back to login screen
    
    // Clean up the URL (remove any #reset-password or #demo)
    if (window.location.hash) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  /**
   * handlePasswordResetSuccess: Password was successfully reset
   * 
   * After user resets their password, take them back to login
   */
  const handlePasswordResetSuccess = () => {
    setAuthState({ view: 'login' }); // Go to login screen
    
    // Clean up the URL hash
    if (window.location.hash) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // ==================== RENDERING ====================
  /**
   * This is where we decide what to show on the screen
   * React will call this section whenever state changes
   * 
   * There are 3 possible things to show:
   * 1. Loading spinner (while app initializes)
   * 2. Authentication screens (if no one is logged in)
   * 3. Dashboard (if someone is logged in)
   */

  // SCENARIO 1: Still loading? Show a spinner
  if (loading) {
    return (
      // Full-screen centered container
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Spinning loading icon */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          {/* Loading text */}
          <p className="text-gray-600">Loading PetCare...</p>
        </div>
      </div>
    );
  }

  // SCENARIO 2: No one logged in? Show authentication forms
  if (!currentUser) {
    return (
      <TooltipProvider>  {/* Wraps app to provide tooltip functionality */}
        <Toaster />      {/* Component that shows toast notifications */}
        
        {/* Show LOGIN FORM if authState.view === 'login' */}
        {authState.view === 'login' && (
          <LoginForm 
            onLogin={handleLogin}              // Pass login function
            onSwitchToRegister={() => { }}     // Register not implemented yet
            onForgotPassword={handleForgotPassword}  // Pass forgot password function
          />
        )}
        
        {/* Show FORGOT PASSWORD FORM if authState.view === 'forgot-password' */}
        {authState.view === 'forgot-password' && (
          <ForgotPasswordForm onBack={handleBackToLogin} />  // Pass back button function
        )}
        
        {/* Show RESET PASSWORD FORM if authState.view === 'reset-password' */}
        {authState.view === 'reset-password' && (
          <ResetPasswordForm 
            resetToken={authState.resetToken}           // Pass the token from URL
            onSuccess={handlePasswordResetSuccess}      // What to do after success
            onBack={handleBackToLogin}                  // Back button
          />
        )}
        
        {/* Show DEMO PAGE if authState.view === 'demo' */}
        {(authState as any).view === 'demo' && (
          <PasswordRecoveryDemo />  // Demo page for testing password recovery
        )}
      </TooltipProvider>
    );
  }

  // SCENARIO 3: Someone IS logged in! Show their dashboard
  /**
   * Different users see different dashboards:
   * - Pet Owner: See their pets, appointments, medical records
   * - Veterinarian: See all appointments, patient records
   * - Administrator: See everything, manage users
   */
  return (
    <TooltipProvider>
      <Toaster />
      
      {/* If user is a PET OWNER, show Pet Owner Dashboard */}
      {currentUser.userType === 'pet_owner' && (
        <PetOwnerDashboard 
          user={currentUser}        // Pass user info to dashboard
          onLogout={handleLogout}   // Pass logout function
        />
      )}
      
      {/* If user is a VETERINARIAN, show Veterinarian Dashboard */}
      {currentUser.userType === 'veterinarian' && (
        <VeterinarianDashboard 
          user={currentUser}
          onLogout={handleLogout}
        />
      )}
      
      {/* If user is an ADMINISTRATOR, show Admin Dashboard */}
      {currentUser.userType === 'administrator' && (
        <AdminDashboard 
          user={currentUser}
          onLogout={handleLogout}
        />
      )}
    </TooltipProvider>
  );
};

// Export this component so other files can import and use it
export default App;
