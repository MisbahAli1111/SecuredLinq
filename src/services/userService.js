// User Service - Handles user authentication (signup/login)
import API_CONFIG from '../config/api';

export const UserService = {
  /**
   * Signup/Login user - The API handles both cases automatically
   * @param {Object} userData - User data containing name and phoneNumber
   * @returns {Promise} Promise resolving to user data and success status
   */
  async signupUser(userData) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_SIGNUP}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          phoneNumber: userData.phoneNumber,
        }),
        timeout: API_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          user: result.user,
          message: result.message,
          isNewUser: result.message === 'User registered successfully',
        };
      } else {
        throw new Error(result.message || 'Signup failed');
      }
    } catch (error) {
      console.error('UserService.signupUser error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      // Re-throw other errors
      throw error;
    }
  },

  /**
   * Validate user input before making API call
   * @param {Object} userData - User data to validate
   * @returns {Object} Validation result
   */
  validateUserData(userData) {
    const errors = [];

    if (!userData.name || !userData.name.trim()) {
      errors.push('Name is required');
    }

    if (!userData.phoneNumber || !userData.phoneNumber.trim()) {
      errors.push('Phone number is required');
    } else {
      // Pakistani phone number validation
      const cleanPhone = userData.phoneNumber.replace(/\s/g, '');
      if (cleanPhone.length !== 11) {
        errors.push('Phone number must be 11 digits');
      }
      if (!cleanPhone.startsWith('03')) {
        errors.push('Phone number must start with 03');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
}; 