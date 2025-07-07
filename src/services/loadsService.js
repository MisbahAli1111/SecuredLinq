// Loads Service - Handles load-related API calls
import API_CONFIG from '../config/api';

export const LoadsService = {
  /**
   * Fetch all loads from the API
   * @returns {Promise} Promise resolving to loads array
   */
  async fetchLoads() {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOADS}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const loads = await response.json();
      
      // Transform API response to match app's expected format
      return loads.map(load => ({
        id: load.ID,
        dbId: load.ID, // Database ID for API calls
        userId: load.userId,
        loadNumber: load.loadNumber,
        title: load.loadNumber,
        userName: load.userName,
        status: this.parseLoadStatus(load.status),
        mediaCount: 0, // Will be updated when media is loaded
        created_at: load.created_at,
      }));
    } catch (error) {
      console.error('LoadsService.fetchLoads error:', error);
      
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
   * Fetch loads for a specific user
   * @param {number} userId - User ID to filter loads
   * @returns {Promise} Promise resolving to user's loads array
   */
  async fetchLoadsByUserId(userId) {
    try {
      const allLoads = await this.fetchLoads();
      return allLoads.filter(load => load.userId === userId);
    } catch (error) {
      console.error('LoadsService.fetchLoadsByUserId error:', error);
      throw error;
    }
  },

  /**
   * Parse load status from API response
   * @param {Object} status - Status object from API
   * @returns {string} Parsed status
   */
  parseLoadStatus(status) {
    if (!status || !status.data || !Array.isArray(status.data)) {
      return 'unknown';
    }
    
    // Based on the API response, status.data contains buffer data
    // [0] might mean inactive, [1] might mean active
    const statusValue = status.data[0];
    
    switch (statusValue) {
      case 0:
        return 'inactive';
      case 1:
        return 'active';
      default:
        return 'unknown';
    }
  },

  /**
   * Get load by ID
   * @param {number} loadId - Load ID
   * @returns {Promise} Promise resolving to load object
   */
  async getLoadById(loadId) {
    try {
      const allLoads = await this.fetchLoads();
      return allLoads.find(load => load.id === loadId) || null;
    } catch (error) {
      console.error('LoadsService.getLoadById error:', error);
      throw error;
    }
  },
}; 