// Authentication Handler Component
// Handles login logic and error handling separately from UI

import { Alert } from 'react-native';
import { UserStorage } from '../utils/userStorage';

export class AuthHandler {
  constructor() {
    this.isLoading = false;
  }

  // Simplified validation - only check essentials
  validateInputs(name, phoneNumber) {
    const errors = [];
    
    // Name validation - just check if present and not too long
    if (!name || name.trim().length === 0) {
      errors.push('Please enter your name');
    }
    
    if (name && name.trim().length > 50) {
      errors.push('Name is too long (max 50 characters)');
    }
    
    // Phone validation - just check 11 digits
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length !== 11) {
      errors.push('Please enter a valid 11-digit phone number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Handle login/signup process
  async handleLogin(name, phoneNumber, onSuccess, onError) {
    // Validate inputs first
    const validation = this.validateInputs(name, phoneNumber);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      // Call error callback to stop loading
      if (onError) {
        onError(new Error('Validation failed'));
      }
      return;
    }

    this.isLoading = true;
    
    try {
      const userData = {
        name: name.trim(),
        phoneNumber: phoneNumber.replace(/\s/g, ''), // Remove spaces
      };

      console.log('[AuthHandler] Attempting to sign up user...');
      const savedUser = await UserStorage.saveUser(userData);
      
      console.log('[AuthHandler] User signed up successfully:', savedUser.name);
      
      // Determine if it's a new user or existing user
      const isNewUser = !savedUser.isExistingUser;
      const welcomeTitle = isNewUser ? 'Welcome!' : 'Welcome Back!';
      const welcomeMessage = isNewUser 
        ? `Hello ${savedUser.name}! Your account has been created successfully.`
        : `Hello ${savedUser.name}! You're logged in successfully.`;
      
      Alert.alert(
        welcomeTitle,
        welcomeMessage,
        [
          {
            text: 'Continue',
            onPress: () => {
              if (onSuccess) {
                onSuccess(savedUser);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Login error:', error);
      this.handleError(error, onError);
    } finally {
      this.isLoading = false;
    }
  }

  // Handle different types of errors
  handleError(error, onError) {
    let errorTitle = 'Login Error';
    let errorMessage = error.message || 'Failed to create account. Please try again.';
    
    // Categorize errors for better user experience
    if (error.message.includes('Network error') || error.message.includes('network')) {
      errorTitle = 'Connection Error';
      errorMessage = 'Please check your internet connection and try again.';
    } else if (error.message.includes('timeout')) {
      errorTitle = 'Request Timeout';
      errorMessage = 'The request timed out. Please try again.';
    } else if (error.message.includes('Server error') || error.message.includes('500')) {
      errorTitle = 'Server Error';
      errorMessage = 'Server is temporarily unavailable. Please try again later.';
    } else if (error.message.includes('400')) {
      errorTitle = 'Invalid Data';
      errorMessage = 'Please check your details and try again.';
    }
    
    Alert.alert(errorTitle, errorMessage);
    
    // Call optional error callback
    if (onError) {
      onError(error);
    }
  }
}

// Create singleton instance
const authHandler = new AuthHandler();
export default authHandler; 