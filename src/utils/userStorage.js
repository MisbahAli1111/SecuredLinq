import AsyncStorage from '@react-native-async-storage/async-storage';
import { SampleDataService } from '../services/sampleDataService';
import { LoadsService } from '../services/loadsService';

const USER_KEY = 'currentUser';
const LOADS_KEY = 'userLoads';

export const UserStorage = {
  // Save user credentials from API response
  async saveUser(apiUserData) {
    try {
      // Map API response to local storage format
      const userWithId = {
        userId: apiUserData.ID, // Use API user ID
        dbUserId: apiUserData.ID, // Store database ID separately
        name: apiUserData.name,
        phoneNumber: apiUserData.phoneNumber,
        createdAt: apiUserData.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userWithId));
      return userWithId;
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Update user information
  async updateUser(updatedData) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found to update');
      }
      
      const updatedUser = {
        ...currentUser,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  },

  // Update user phone number
  async updatePhoneNumber(newPhoneNumber) {
    try {
      return await this.updateUser({ 
        phoneNumber: newPhoneNumber,
      });
    } catch (error) {
      console.error('Error updating phone number:', error);
      throw error;
    }
  },

  // Clear user data (logout)
  async clearUser() {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  },

  // Check if user is logged in
  async isUserLoggedIn() {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Get loads for current user from API
  async getUserLoads() {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser || !currentUser.dbUserId) {
        return [];
      }

      // Get loads from API service
      const loads = await LoadsService.fetchLoadsByUserId(currentUser.dbUserId);
      
      // Transform to UI-friendly format (LoadsService already does most of this)
      return loads.map(load => ({
        ...load,
        description: `Load ${load.loadNumber}`,
      }));
    } catch (error) {
      console.error('Error getting user loads:', error);
      // Return empty array on error to prevent app crash
      return [];
    }
  },

  // Save loads (for backward compatibility - now mostly read-only from sample data)
  async saveLoads(loads) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found');
      }

      // Store loads locally for offline access
      const userLoads = {
        userId: currentUser.userId,
        loads: loads,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(`${LOADS_KEY}_${currentUser.userId}`, JSON.stringify(userLoads));
      return userLoads;
    } catch (error) {
      console.error('Error saving loads:', error);
      throw error;
    }
  },

  // Create default loads for new users (updated to match database structure)
  createDefaultLoads() {
    const timestamp = new Date().toISOString();
    return [
      {
        id: `temp_load_1_${Date.now()}`,
        title: 'Security Load #1',
        description: 'Main entrance monitoring',
        status: 'active',
        createdAt: timestamp,
        mediaCount: 0,
        loadNumber: 'TEMP_LOAD_001',
      },
      {
        id: `temp_load_2_${Date.now()}`,
        title: 'Security Load #2', 
        description: 'Perimeter check',
        status: 'pending',
        createdAt: timestamp,
        mediaCount: 0,
        loadNumber: 'TEMP_LOAD_002',
      },
      {
        id: `temp_load_3_${Date.now()}`,
        title: 'Security Load #3',
        description: 'Emergency backup', 
        status: 'active',
        createdAt: timestamp,
        mediaCount: 0,
        loadNumber: 'TEMP_LOAD_003',
      },
    ];
  },

  // Add a new load (creates in sample data)
  async addLoad(loadData) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser || !currentUser.dbUserId) {
        throw new Error('No user found or user not properly initialized');
      }

      // Create load in sample data
      const newDbLoad = await SampleDataService.createLoad({
        userId: currentUser.dbUserId,
        loadNumber: loadData.loadNumber || `LOAD_${currentUser.dbUserId}_${Date.now()}`,
      });

      // Transform to UI format
      const newLoad = {
        id: newDbLoad.ID,
        dbId: newDbLoad.ID,
        title: newDbLoad.loadNumber,
        description: loadData.description || `Load ${newDbLoad.loadNumber}`,
        status: 'active',
        createdAt: newDbLoad.created_at,
        mediaCount: 0,
        userId: newDbLoad.userId,
        loadNumber: newDbLoad.loadNumber,
      };
      
      return newLoad;
    } catch (error) {
      console.error('Error adding load:', error);
      throw error;
    }
  },

  // Update load media count
  async updateLoadMediaCount(loadId, increment = 1) {
    try {
      // This would typically update the database
      // For now, we'll just refresh the loads from sample data
      const loads = await this.getUserLoads();
      return loads;
    } catch (error) {
      console.error('Error updating load media count:', error);
      throw error;
    }
  },

  async deleteLoad(loadId) {
    try {
      // In a real implementation, this would delete from database
      console.log('Delete load functionality would be implemented with database');
      const loads = await this.getUserLoads();
      return loads.filter(load => load.id !== loadId);
    } catch (error) {
      console.error('Error deleting load:', error);
      throw error;
    }
  },

  // Get load details with media
  async getLoadWithMedia(loadId) {
    try {
      const loadData = await SampleDataService.getLoadWithMedia(loadId);
      if (!loadData) {
        return null;
      }

      return {
        id: loadData.ID,
        dbId: loadData.ID,
        title: loadData.loadNumber,
        description: `Load ${loadData.loadNumber}`,
        status: 'active',
        createdAt: loadData.created_at,
        mediaCount: loadData.media ? loadData.media.length : 0,
        userId: loadData.userId,
        loadNumber: loadData.loadNumber,
        media: loadData.media || [],
      };
    } catch (error) {
      console.error('Error getting load with media:', error);
      return null;
    }
  },

  // Save media to database
  async saveMediaToDatabase(mediaData) {
    try {
      const newMedia = await SampleDataService.createMedia({
        loadID: mediaData.loadId,
        imageS3Url: mediaData.imageUrl,
        videoS3Url: mediaData.videoUrl,
      });
      
      return {
        id: newMedia.ID,
        loadId: newMedia.loadID,
        imageUrl: newMedia.imageS3Url,
        videoUrl: newMedia.videoS3Url,
        createdAt: newMedia.created_at,
      };
    } catch (error) {
      console.error('Error saving media to database:', error);
      throw error;
    }
  },
}; 