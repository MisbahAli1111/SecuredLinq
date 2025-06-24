import AsyncStorage from '@react-native-async-storage/async-storage';
import { S3Service } from '../services';

const STORAGE_KEY = 'secureMedia';

export const StorageUtils = {
  // Get all media from local storage
  async getMedia() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting media from storage:', error);
      return [];
    }
  },

  // Save media to local storage
  async saveMedia(media) {
    try {
      const existingMedia = await this.getMedia();
      const updatedMedia = [...existingMedia, media];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMedia));
      return true;
    } catch (error) {
      console.error('Error saving media to storage:', error);
      return false;
    }
  },

  // Update media with S3 information
  async updateMediaWithS3Info(mediaId, s3Info) {
    try {
      const allMedia = await this.getMedia();
      const updatedMedia = allMedia.map(item => 
        item.id === mediaId 
          ? { ...item, ...s3Info, uploadedAt: new Date().toISOString() }
          : item
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMedia));
      return true;
    } catch (error) {
      console.error('Error updating media with S3 info:', error);
      return false;
    }
  },

  // Delete media from local storage
  async deleteMedia(mediaId) {
    try {
      const allMedia = await this.getMedia();
      const updatedMedia = allMedia.filter(item => item.id !== mediaId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMedia));
      return true;
    } catch (error) {
      console.error('Error deleting media from storage:', error);
      return false;
    }
  },

  // Clear all media from local storage
  async clearAllMedia() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing all media from storage:', error);
      return false;
    }
  },

  // Upload media to S3 and update local storage
  async uploadMediaToS3(mediaItems, onProgress) {
    try {
      const uploadResult = await S3Service.uploadMediaBatch(mediaItems, onProgress);
      
      if (uploadResult.success) {
        // Update local storage with S3 information
        for (let i = 0; i < mediaItems.length; i++) {
          const media = mediaItems[i];
          const s3Info = {
            s3Location: uploadResult.uploads[i].location,
            s3Key: uploadResult.uploads[i].key,
            s3ETag: uploadResult.uploads[i].etag,
          };
          await this.updateMediaWithS3Info(media.id, s3Info);
        }
      }

      return uploadResult;
    } catch (error) {
      console.error('Error uploading media to S3:', error);
      throw error;
    }
  },

  // Get media with S3 URLs for viewing
  async getMediaWithS3Urls(expiresIn = 3600) {
    try {
      const allMedia = await this.getMedia();
      const mediaWithUrls = allMedia.map(media => {
        if (media.s3Key) {
          try {
            const signedUrl = S3Service.getSignedUrl(media.s3Key, expiresIn);
            return {
              ...media,
              s3SignedUrl: signedUrl,
            };
          } catch (error) {
            console.error('Error generating signed URL for media:', media.id, error);
            return media;
          }
        }
        return media;
      });
      return mediaWithUrls;
    } catch (error) {
      console.error('Error getting media with S3 URLs:', error);
      return await this.getMedia();
    }
  },

  // Check if media is uploaded to S3
  isUploadedToS3(media) {
    return !!(media.s3Location && media.s3Key);
  },

  // Get upload status summary
  async getUploadStatus() {
    try {
      const allMedia = await this.getMedia();
      const total = allMedia.length;
      const uploaded = allMedia.filter(media => this.isUploadedToS3(media)).length;
      const pending = total - uploaded;

      return {
        total,
        uploaded,
        pending,
        uploadPercentage: total > 0 ? Math.round((uploaded / total) * 100) : 0,
      };
    } catch (error) {
      console.error('Error getting upload status:', error);
      return { total: 0, uploaded: 0, pending: 0, uploadPercentage: 0 };
    }
  },
}; 