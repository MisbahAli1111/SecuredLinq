import AWS from 'aws-sdk';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { 
  AWS_ACCESS_KEY_ID, 
  AWS_SECRET_ACCESS_KEY, 
  AWS_REGION, 
  S3_BUCKET_NAME 
} from '@env';
import { AWS_CONFIG } from '../config/aws';

// Use environment variables if available, otherwise use config file
const awsConfig = {
  accessKeyId: AWS_ACCESS_KEY_ID || AWS_CONFIG.accessKeyId,
  secretAccessKey: AWS_SECRET_ACCESS_KEY || AWS_CONFIG.secretAccessKey,
  region: AWS_REGION || AWS_CONFIG.region,
};

const bucketName = S3_BUCKET_NAME || AWS_CONFIG.bucketName;

// Debug: Log configuration status
console.log('AWS Configuration Status:');
console.log('Access Key:', awsConfig.accessKeyId ? 'Set' : 'Not Set');
console.log('Secret Key:', awsConfig.secretAccessKey ? 'Set' : 'Not Set');
console.log('Region:', awsConfig.region);
console.log('Bucket Name:', bucketName);
console.log('Platform:', Platform.OS);

// Configure AWS SDK
AWS.config.update(awsConfig);

const s3 = new AWS.S3();

class S3Service {
  /**
   * Upload a file to S3 bucket with memory-efficient streaming
   * @param {string} fileUri - Local file URI
   * @param {string} fileName - Name for the file in S3
   * @param {string} contentType - MIME type of the file
   * @param {function} onProgress - Progress callback function
   * @returns {Promise} Upload result
   */
  static async uploadFile(fileUri, fileName, contentType, onProgress = null) {
    try {
      // Check if bucket name is available
      if (!bucketName) {
        throw new Error('S3_BUCKET_NAME environment variable is not set');
      }

      console.log('Uploading file:', fileUri);

      // Get file info first to check size
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      console.log('File info:', { size: fileInfo.size, exists: fileInfo.exists });

      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // For small files (<5MB), use the traditional approach
      if (fileInfo.size < 5 * 1024 * 1024) {
        console.log('Using memory approach for small file');
        return await this.uploadFileMemory(fileUri, fileName, contentType, onProgress);
      }

      // For large files, use streaming approach with fetch
      console.log('Using streaming approach for large file');
      return await this.uploadFileStream(fileUri, fileName, contentType, onProgress);

    } catch (error) {
      console.error('File upload preparation error:', error);
      throw error;
    }
  }

  /**
   * Upload small files using memory approach
   */
  static async uploadFileMemory(fileUri, fileName, contentType, onProgress = null) {
    try {
      // Read file using Expo FileSystem as base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('File read successfully, base64 length:', base64Data.length);

      // Convert base64 to Buffer for AWS SDK
      const fileBuffer = Buffer.from(base64Data, 'base64');

      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'private',
      };

      console.log('Upload Params:', {
        Bucket: uploadParams.Bucket,
        Key: uploadParams.Key,
        ContentType: uploadParams.ContentType,
        BodySize: fileBuffer.length,
      });

      return new Promise((resolve, reject) => {
        const upload = s3.upload(uploadParams);

        // Track upload progress
        if (onProgress) {
          upload.on('httpUploadProgress', (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            onProgress(percentage);
          });
        }

        upload.send((err, data) => {
          if (err) {
            console.error('S3 Upload Error:', err);
            reject(err);
          } else {
            console.log('S3 Upload Success:', data.Location);
            resolve({
              success: true,
              location: data.Location,
              key: data.Key,
              etag: data.ETag,
            });
          }
        });
      });
    } catch (error) {
      console.error('Memory upload error:', error);
      throw error;
    }
  }

  /**
   * Upload large files using streaming approach
   */
  static async uploadFileStream(fileUri, fileName, contentType, onProgress = null) {
    try {
      // Use fetch to get a blob without loading into memory as base64
      const response = await fetch(fileUri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('File blob created, size:', blob.size);

      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: blob,
        ContentType: contentType,
        ACL: 'private',
      };

      console.log('Stream Upload Params:', {
        Bucket: uploadParams.Bucket,
        Key: uploadParams.Key,
        ContentType: uploadParams.ContentType,
        BodySize: blob.size,
      });

      return new Promise((resolve, reject) => {
        const upload = s3.upload(uploadParams);

        // Track upload progress
        if (onProgress) {
          upload.on('httpUploadProgress', (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            console.log(`Upload progress for ${fileName}: ${percentage}%`);
            onProgress(percentage);
          });
        }

        upload.send((err, data) => {
          if (err) {
            console.error('S3 Stream Upload Error:', err);
            reject(err);
          } else {
            console.log('S3 Stream Upload Success:', data.Location);
            resolve({
              success: true,
              location: data.Location,
              key: data.Key,
              etag: data.ETag,
            });
          }
        });
      });
    } catch (error) {
      console.error('Stream upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple media files (photos and videos) with better error handling
   * @param {Array} mediaItems - Array of media objects with uri, type, etc.
   * @param {function} onProgressUpdate - Progress callback for all uploads
   * @returns {Promise} Array of upload results
   */
  static async uploadMediaBatch(mediaItems, onProgressUpdate = null) {
    const results = [];
    const errors = [];
    let completedUploads = 0;

    console.log(`Starting batch upload of ${mediaItems.length} files`);

    // Process uploads sequentially to avoid memory issues
    for (let i = 0; i < mediaItems.length; i++) {
      const media = mediaItems[i];
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `securecam/${timestamp}-step${media.step}-${media.type}.${media.type === 'photo' ? 'jpg' : 'mp4'}`;
      const contentType = media.type === 'photo' ? 'image/jpeg' : 'video/mp4';

      try {
        console.log(`Uploading file ${i + 1}/${mediaItems.length}: ${fileName}`);
        
        const result = await this.uploadFile(
          media.uri,
          fileName,
          contentType,
          (progress) => {
            // Individual file progress
            console.log(`Upload progress for ${fileName}: ${progress}%`);
          }
        );

        completedUploads++;
        const overallProgress = Math.round((completedUploads / mediaItems.length) * 100);
        
        if (onProgressUpdate) {
          onProgressUpdate(overallProgress, completedUploads, mediaItems.length);
        }

        results.push({
          ...result,
          originalMedia: media,
        });

        console.log(`Successfully uploaded ${fileName}`);

      } catch (error) {
        console.error(`Failed to upload ${fileName}:`, error);
        errors.push({
          media,
          fileName,
          error: error.message,
        });

        // Still count as completed for progress tracking
        completedUploads++;
        const overallProgress = Math.round((completedUploads / mediaItems.length) * 100);
        
        if (onProgressUpdate) {
          onProgressUpdate(overallProgress, completedUploads, mediaItems.length);
        }
      }
    }

    // Return results even if some uploads failed
    if (results.length > 0) {
      return {
        success: true,
        uploads: results,
        totalFiles: mediaItems.length,
        successfulUploads: results.length,
        failedUploads: errors.length,
        errors: errors,
      };
    } else {
      // All uploads failed
      throw new Error(`All uploads failed. Errors: ${errors.map(e => e.error).join(', ')}`);
    }
  }

  /**
   * Delete a file from S3 bucket
   * @param {string} key - S3 object key
   * @returns {Promise} Delete result
   */
  static async deleteFile(key) {
    try {
      const deleteParams = {
        Bucket: bucketName,
        Key: key,
      };

      const result = await s3.deleteObject(deleteParams).promise();
      return {
        success: true,
        result,
      };
    } catch (error) {
      console.error('S3 Delete Error:', error);
      throw error;
    }
  }

  /**
   * Get a signed URL for private file access
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns {string} Signed URL
   */
  static getSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
        Expires: expiresIn,
      };

      return s3.getSignedUrl('getObject', params);
    } catch (error) {
      console.error('Signed URL Error:', error);
      throw error;
    }
  }

  /**
   * Check if S3 service is properly configured
   * @returns {Promise} Configuration status
   */
  static async checkConfiguration() {
    try {
      console.log('Checking S3 Configuration...');
      console.log('Bucket Name for check:', bucketName);
      
      if (!bucketName) {
        return {
          success: false,
          error: 'S3_BUCKET_NAME environment variable is not set',
        };
      }

      const params = {
        Bucket: bucketName,
      };

      await s3.headBucket(params).promise();
      return {
        success: true,
        message: 'S3 service is properly configured',
      };
    } catch (error) {
      console.error('S3 Configuration Error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default S3Service; 