// Authentication Service
// Handles user authentication (signup/login) operations

import apiService from './apiService';

class AuthService {
  constructor() {
    this.endpoints = {
      signup: '/user/signup',
    };
  }

  /**
   * Signup/Login user (the API handles both cases)
   * @param {Object} userData - User data
   * @param {string} userData.name - User's full name
   * @param {string} userData.phoneNumber - User's phone number
   * @returns {Promise<Object>} - User data and response
   */
  async signupUser(userData) {
    try {
      // Validate input data
      if (!userData.name || !userData.phoneNumber) {
        throw new Error('Name and phone number are required');
      }

      // Prepare request data
      const requestData = {
        name: userData.name.trim(),
        phoneNumber: userData.phoneNumber.trim(),
      };

      console.log('[AuthService] Signing up user:', { ...requestData, phoneNumber: '***' });

      // Make API call
      const response = await apiService.post(this.endpoints.signup, requestData);

      // Validate response structure
      if (!response.success) {
        throw new Error(response.message || 'Signup failed');
      }

      if (!response.user) {
        throw new Error('Invalid response: User data missing');
      }

      // Transform response to match existing user structure
      const user = {
        userId: response.user.ID,
        dbUserId: response.user.ID,
        name: response.user.name,
        phoneNumber: response.user.phoneNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('[AuthService] Signup successful:', {
        message: response.message,
        userId: user.userId,
        name: user.name,
      });

      return {
        success: true,
        message: response.message,
        user: user,
        isExistingUser: response.message.includes('already registered'),
      };
    } catch (error) {
      console.error('[AuthService] Signup failed:', error);
      
      // Transform error messages for better UX
      let errorMessage = error.message;
      
      if (error.message.includes('Network error')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid data provided. Please check your details.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Simplified validation for signup data
   * @param {Object} userData - User data to validate
   * @returns {Object} - Validation result
   */
  validateSignupData(userData) {
    const errors = [];

    // Simple name validation - just check if present and not too long
    if (!userData.name || userData.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (userData.name && userData.name.trim().length > 50) {
      errors.push('Name is too long (max 50 characters)');
    }

    // Simple phone validation - just check 11 digits
    const cleanPhone = userData.phoneNumber ? userData.phoneNumber.replace(/\s/g, '') : '';
    if (!cleanPhone || cleanPhone.length !== 11) {
      errors.push('Phone number must be exactly 11 digits');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService; 