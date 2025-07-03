// Sample data service that mimics the database structure
// This will be replaced with actual API calls when backend is ready

const SAMPLE_USERS = [
  {
    ID: 1,
    name: 'Misbah',
    phone: '03001234567',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    ID: 2,
    name: 'Jane Smith',
    phone: '03008765432',
    created_at: '2024-01-16T14:20:00Z'
  },
  {
    ID: 3,
    name: 'Ahmed Ali',
    phone: '03151337051',
    created_at: '2024-01-17T09:15:00Z'
  },
  {
    ID: 4,
    name: 'Maria Garcia',
    phone: '03452222222',
    created_at: '2024-01-18T16:45:00Z'
  },
  {
    ID: 5,
    name: 'Hassan Khan',
    phone: '03331234567',
    created_at: '2024-01-19T08:30:00Z'
  },
  {
    ID: 6,
    name: 'Fatima Sheikh',
    phone: '03211111111',
    created_at: '2024-01-19T11:15:00Z'
  }
];

const SAMPLE_LOADS = [
  {
    ID: 1,
    userId: 1,
    loadNumber: 'LOAD001',
    created_at: '2024-01-15T11:00:00Z'
  },
  {
    ID: 2,
    userId: 1,
    loadNumber: 'LOAD002',
    created_at: '2024-01-16T09:30:00Z'
  },
  {
    ID: 3,
    userId: 2,
    loadNumber: 'LOAD003',
    created_at: '2024-01-17T13:15:00Z'
  },
  {
    ID: 4,
    userId: 1,
    loadNumber: 'LOAD004',
    created_at: '2024-01-18T08:00:00Z'
  },
  {
    ID: 5,
    userId: 2,
    loadNumber: 'LOAD005',
    created_at: '2024-01-18T15:30:00Z'
  },
  {
    ID: 6,
    userId: 3,
    loadNumber: 'LOAD006',
    created_at: '2024-01-19T10:45:00Z'
  },
  {
    ID: 7,
    userId: 4,
    loadNumber: 'LOAD007',
    created_at: '2024-01-19T12:20:00Z'
  },
  {
    ID: 8,
    userId: 5,
    loadNumber: 'LOAD008',
    created_at: '2024-01-19T14:30:00Z'
  },
  {
    ID: 9,
    userId: 5,
    loadNumber: 'LOAD009',
    created_at: '2024-01-19T16:45:00Z'
  },
  {
    ID: 10,
    userId: 6,
    loadNumber: 'LOAD010',
    created_at: '2024-01-19T18:00:00Z'
  }
];

const SAMPLE_MEDIA = [
  {
    ID: 1,
    loadID: 1,
    imageS3Url: 'https://example-bucket.s3.amazonaws.com/images/load1_image1.jpg',
    videoS3Url: 'https://example-bucket.s3.amazonaws.com/videos/load1_video1.mp4',
    created_at: '2024-01-15T11:30:00Z'
  },
  {
    ID: 2,
    loadID: 1,
    imageS3Url: 'https://example-bucket.s3.amazonaws.com/images/load1_image2.jpg',
    videoS3Url: 'https://example-bucket.s3.amazonaws.com/videos/load1_video2.mp4',
    created_at: '2024-01-15T11:45:00Z'
  },
  {
    ID: 3,
    loadID: 2,
    imageS3Url: 'https://example-bucket.s3.amazonaws.com/images/load2_image1.jpg',
    videoS3Url: null,
    created_at: '2024-01-16T10:00:00Z'
  },
  {
    ID: 4,
    loadID: 3,
    imageS3Url: 'https://example-bucket.s3.amazonaws.com/images/load3_image1.jpg',
    videoS3Url: 'https://example-bucket.s3.amazonaws.com/videos/load3_video1.mp4',
    created_at: '2024-01-17T14:00:00Z'
  },
  {
    ID: 5,
    loadID: 4,
    imageS3Url: 'https://example-bucket.s3.amazonaws.com/images/load4_image1.jpg',
    videoS3Url: 'https://example-bucket.s3.amazonaws.com/videos/load4_video1.mp4',
    created_at: '2024-01-18T08:30:00Z'
  }
];

export const SampleDataService = {
  // User operations
  async getAllUsers() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...SAMPLE_USERS]), 100);
    });
  },

  async getUserByPhone(phone) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = SAMPLE_USERS.find(u => u.phone === phone);
        resolve(user || null);
      }, 100);
    });
  },

  async createUser(userData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ID: Math.max(...SAMPLE_USERS.map(u => u.ID)) + 1,
          name: userData.name,
          phone: userData.phone,
          created_at: new Date().toISOString()
        };
        SAMPLE_USERS.push(newUser);
        resolve(newUser);
      }, 100);
    });
  },

  // Load operations
  async getAllLoads() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...SAMPLE_LOADS]), 100);
    });
  },

  async getLoadsByUserId(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userLoads = SAMPLE_LOADS.filter(load => load.userId === userId);
        resolve(userLoads);
      }, 100);
    });
  },

  async getLoadById(loadId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const load = SAMPLE_LOADS.find(l => l.ID === loadId);
        resolve(load || null);
      }, 100);
    });
  },

  async createLoad(loadData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLoad = {
          ID: Math.max(...SAMPLE_LOADS.map(l => l.ID)) + 1,
          userId: loadData.userId,
          loadNumber: loadData.loadNumber,
          created_at: new Date().toISOString()
        };
        SAMPLE_LOADS.push(newLoad);
        resolve(newLoad);
      }, 100);
    });
  },

  // Media operations
  async getAllMedia() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...SAMPLE_MEDIA]), 100);
    });
  },

  async getMediaByLoadId(loadId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const loadMedia = SAMPLE_MEDIA.filter(media => media.loadID === loadId);
        resolve(loadMedia);
      }, 100);
    });
  },

  async createMedia(mediaData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMedia = {
          ID: Math.max(...SAMPLE_MEDIA.map(m => m.ID)) + 1,
          loadID: mediaData.loadID,
          imageS3Url: mediaData.imageS3Url || null,
          videoS3Url: mediaData.videoS3Url || null,
          created_at: new Date().toISOString()
        };
        SAMPLE_MEDIA.push(newMedia);
        resolve(newMedia);
      }, 100);
    });
  },

  // Save multiple media items from S3 upload result
  async saveMediaFromS3Upload(loadId, s3UploadResults) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const savedMedia = [];
        
        s3UploadResults.forEach(uploadResult => {
          const originalMedia = uploadResult.originalMedia;
          const s3Url = uploadResult.location;
          
          // Create media entry based on type
          const newMedia = {
            ID: Math.max(...SAMPLE_MEDIA.map(m => m.ID)) + 1 + savedMedia.length,
            loadID: loadId,
            imageS3Url: originalMedia.type === 'photo' ? s3Url : null,
            videoS3Url: originalMedia.type === 'video' ? s3Url : null,
            step: originalMedia.step,
            type: originalMedia.type,
            s3Key: uploadResult.key,
            fileName: uploadResult.key.split('/').pop(),
            created_at: new Date().toISOString()
          };
          
          SAMPLE_MEDIA.push(newMedia);
          savedMedia.push(newMedia);
        });
        
        console.log(`Saved ${savedMedia.length} media items to database for load ${loadId}`);
        resolve(savedMedia);
      }, 100);
    });
  },

  // Get media with S3 signed URLs for a specific load
  async getLoadMediaWithSignedUrls(loadId) {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const loadMedia = SAMPLE_MEDIA.filter(media => media.loadID === loadId);
        
        // For each media item, get signed URL if S3 key exists
        const mediaWithUrls = loadMedia.map(media => {
          const mediaItem = {
            id: media.ID,
            loadId: loadId,
            type: media.imageS3Url ? 'photo' : 'video',
            s3Url: media.imageS3Url || media.videoS3Url,
            s3Key: media.s3Key,
            step: media.step,
            fileName: media.fileName,
            timestamp: media.created_at,
            lastModified: media.created_at,
          };

          // Add signed URL if we have S3 key
          if (media.s3Key) {
            try {
              // Import S3Service dynamically to avoid circular dependency
              const { default: S3Service } = require('./s3Service');
              mediaItem.signedUrl = S3Service.getSignedUrl(media.s3Key, 3600);
            } catch (error) {
              console.error('Error generating signed URL:', error);
              mediaItem.signedUrl = media.imageS3Url || media.videoS3Url;
            }
          } else {
            mediaItem.signedUrl = media.imageS3Url || media.videoS3Url;
          }

          return mediaItem;
        });
        
        resolve(mediaWithUrls);
      }, 100);
    });
  },

  // Update load media count after S3 upload
  async updateLoadMediaCount(loadId, newMediaCount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real database, this would update the load record
        // For now, we just calculate the count dynamically
        const currentMediaCount = SAMPLE_MEDIA.filter(media => media.loadID === loadId).length;
        console.log(`Load ${loadId} now has ${currentMediaCount} media items`);
        resolve(currentMediaCount);
      }, 100);
    });
  },

  // Utility functions to get enriched data
  async getLoadsWithMediaCount(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userLoads = SAMPLE_LOADS.filter(load => load.userId === userId);
        const loadsWithMediaCount = userLoads.map(load => {
          const mediaCount = SAMPLE_MEDIA.filter(media => media.loadID === load.ID).length;
          return {
            ...load,
            mediaCount
          };
        });
        resolve(loadsWithMediaCount);
      }, 100);
    });
  },

  async getLoadWithMedia(loadId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const load = SAMPLE_LOADS.find(l => l.ID === loadId);
        if (!load) {
          resolve(null);
          return;
        }
        
        const media = SAMPLE_MEDIA.filter(m => m.loadID === loadId);
        resolve({
          ...load,
          media
        });
      }, 100);
    });
  },

  async getUserWithLoadsAndMedia(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = SAMPLE_USERS.find(u => u.ID === userId);
        if (!user) {
          resolve(null);
          return;
        }

        const userLoads = SAMPLE_LOADS.filter(load => load.userId === userId);
        const loadsWithMedia = userLoads.map(load => {
          const media = SAMPLE_MEDIA.filter(m => m.loadID === load.ID);
          return {
            ...load,
            media,
            mediaCount: media.length
          };
        });

        resolve({
          ...user,
          loads: loadsWithMedia
        });
      }, 100);
    });
  },

  // Helper to get default loads for new users
  getDefaultLoads(userId) {
    return [
      {
        ID: Date.now(),
        userId: userId,
        loadNumber: `LOAD_${userId}_001`,
        created_at: new Date().toISOString()
      },
      {
        ID: Date.now() + 1,
        userId: userId,
        loadNumber: `LOAD_${userId}_002`,
        created_at: new Date().toISOString()
      },
      {
        ID: Date.now() + 2,
        userId: userId,
        loadNumber: `LOAD_${userId}_003`,
        created_at: new Date().toISOString()
      }
    ];
  }
}; 