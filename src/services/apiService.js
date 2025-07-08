// Base API Service
// Handles all HTTP requests with proper error handling and configuration

class ApiService {
  constructor() {
    this.baseURL = 'https://videocall.securedlinq.com/api';
    this.timeout = 10000; // 10 seconds timeout
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`[API] ${config.method || 'GET'} ${url}`, config.body ? JSON.parse(config.body) : '');
      
      const response = await fetch(url, config);
      
      console.log(`[API] Response Status: ${response.status}`);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      console.log('[API] Response Data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`[API] Request failed for ${endpoint}:`, error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection');
      }
      
      // Handle timeout errors
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Request timeout: Please try again');
      }
      
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Health check method
  async healthCheck() {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      console.warn('[API] Health check failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService; 