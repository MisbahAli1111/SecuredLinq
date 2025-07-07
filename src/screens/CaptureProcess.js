import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { S3Service, SampleDataService } from '../services';
import { LoadsService } from '../services/loadsService';
import { UserStorage } from '../utils/userStorage';
import { StorageUtils } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const STEPS = [
  { id: 1, title: 'First Photo', description: 'Take your first secure photo', type: 'photo' },
  { id: 2, title: 'Second Photo', description: 'Take your second secure photo', type: 'photo' },
  { id: 3, title: 'Security Video', description: 'Record a 20-second security video', type: 'video' },
];

const CaptureProcess = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  
  // Load information from route params
  const loadId = route?.params?.loadId;
  const loadTitle = route?.params?.loadTitle;
  const loadNumber = route?.params?.loadNumber;
  const [loadData, setLoadData] = useState(null);
  const [loadStatusChecked, setLoadStatusChecked] = useState(false);
  
  const cameraRef = useRef(null);
  const recordingTimer = useRef(null);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Check if all required permissions are granted
  const hasAllPermissions = () => {
    const currentStepData = STEPS[currentStep];
    if (currentStepData.type === 'video') {
      return cameraPermission?.granted && microphonePermission?.granted;
    }
    return cameraPermission?.granted;
  };

  const requestAllPermissions = async () => {
    const currentStepData = STEPS[currentStep];
    
    if (!cameraPermission?.granted) {
      const cameraResult = await requestCameraPermission();
      if (!cameraResult.granted) {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to take photos and videos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }

    if (currentStepData.type === 'video' && !microphonePermission?.granted) {
      const micResult = await requestMicrophonePermission();
      if (!micResult.granted) {
        Alert.alert(
          'Microphone Permission Required',
          'This app needs microphone access to record videos with audio. You can still record silent videos.',
          [
            { text: 'Record Silent Video', onPress: () => startVideoRecording(true) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    // Check load status when component mounts
    const checkLoadStatus = async () => {
      if (loadId) {
        try {
          const load = await LoadsService.getLoadById(loadId);
          setLoadData(load);
          
          // Check if load is completed
          const isCompleted = load && (load.status === 'active' || (load.status && load.status.data && load.status.data[0] === 1));
          
          if (isCompleted) {
            Alert.alert(
              'Load Already Completed',
              'This load has already been processed and cannot be modified.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
            return;
          }
        } catch (error) {
          console.error('Error checking load status:', error);
        }
      }
      setLoadStatusChecked(true);
    };

    checkLoadStatus();
  }, [loadId, navigation]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: (currentStep + 1) / STEPS.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isRecording) pulse();
        });
      };
      pulse();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isRecording]);

  const startRecordingTimer = () => {
    setRecordingTime(0);
    recordingTimer.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 19) {
          stopVideoRecording();
          return 20;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    setIsLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: true,
      });

      const newMedia = {
        id: Date.now(),
        type: 'photo',
        uri: photo.uri,
        timestamp: new Date().toISOString(),
        step: currentStep + 1,
      };

      const updatedCapturedMedia = [...capturedMedia, newMedia];
      setCapturedMedia(updatedCapturedMedia);
      await saveMediaToStorage(newMedia);
      
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        completeProcess(updatedCapturedMedia);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
      console.error('Photo capture error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startVideoRecording = async (muteAudio = false) => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      startRecordingTimer();
      
      const recordingOptions = {
        maxDuration: 20,
      };

      // Only mute if we don't have microphone permission or explicitly requested
      if (muteAudio || !microphonePermission?.granted) {
        recordingOptions.mute = true;
      }
      
      const video = await cameraRef.current.recordAsync(recordingOptions);

      const newMedia = {
        id: Date.now(),
        type: 'video',
        uri: video.uri,
        timestamp: new Date().toISOString(),
        step: currentStep + 1,
        duration: recordingTime,
        muted: muteAudio || !microphonePermission?.granted,
      };

      // Update captured media state
      const updatedCapturedMedia = [...capturedMedia, newMedia];
      setCapturedMedia(updatedCapturedMedia);
      await saveMediaToStorage(newMedia);
      
      // Pass the complete media array to ensure video is included
      completeProcess(updatedCapturedMedia);
    } catch (error) {
      Alert.alert('Error', 'Failed to record video');
      console.error('Video recording error:', error);
    } finally {
      setIsRecording(false);
      stopRecordingTimer();
    }
  };

  const stopVideoRecording = async () => {
    if (!isRecording || !cameraRef.current) return;

    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const saveMediaToStorage = async (media) => {
    try {
      const mediaWithLoad = {
        ...media,
        loadId: loadId, // Associate media with the current load
        loadTitle: loadTitle,
      };
      
      // Save to local storage (original functionality)
      const success = await StorageUtils.saveMedia(mediaWithLoad);
      console.log('Media saved to storage:', success);
      
      // Also save reference to database-like structure for future database integration
      try {
        if (loadId) {
          const mediaData = {
            loadId: loadId,
            imageUrl: media.type === 'photo' ? media.uri : null,
            videoUrl: media.type === 'video' ? media.uri : null,
          };
          await UserStorage.saveMediaToDatabase(mediaData);
          console.log('Media reference saved to database structure');
        }
      } catch (dbError) {
        console.error('Error saving media reference to database:', dbError);
        // Don't fail the whole operation if database save fails
      }
      
      return success;
    } catch (error) {
      console.error('Error saving media to storage:', error);
      return false;
    }
  };

  const uploadToS3 = async (mediaItems) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Check S3 configuration first
      const configCheck = await S3Service.checkConfiguration();
      if (!configCheck.success) {
        throw new Error(`S3 Configuration Error: ${configCheck.error}`);
      }

      // Get loadNumber from route params or generate one
      const loadNumberToUse = loadNumber || `LOAD_${Date.now()}`;
      console.log('Uploading to S3 for load:', loadNumberToUse);

      // Upload all media files to S3 with load-based folder structure
      const uploadResult = await S3Service.uploadMediaBatch(
        mediaItems,
        loadNumberToUse,
        (progress, completed, total) => {
          setUploadProgress(progress);
          console.log(`Upload Progress: ${progress}% (${completed}/${total} files)`);
        }
      );

      if (uploadResult.success) {
        // Save media URLs to database instead of AsyncStorage
        try {
          const savedMedia = await SampleDataService.saveMediaFromS3Upload(loadId, uploadResult.uploads);
          console.log('Saved media URLs to database:', savedMedia.length, 'items');
          
          return {
            success: true,
            uploadedFiles: uploadResult.totalFiles,
            locations: uploadResult.uploads.map(upload => upload.location),
            savedMedia: savedMedia,
          };
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Still return success since S3 upload worked
          return {
            success: true,
            uploadedFiles: uploadResult.totalFiles,
            locations: uploadResult.uploads.map(upload => upload.location),
            dbError: dbError.message,
          };
        }
      }
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const completeProcess = async (mediaItems) => {
    try {
      // Use passed mediaItems or fallback to state
      const mediaToUpload = mediaItems || capturedMedia;
      
      console.log('Complete Process - Media to upload:', mediaToUpload.length, 'items');
      console.log('Media details:', mediaToUpload.map(m => ({ type: m.type, step: m.step, uri: m.uri.substring(m.uri.lastIndexOf('/') + 1) })));

      // Update load media count if we have a loadId
      if (loadId && mediaToUpload.length > 0) {
        try {
          await UserStorage.updateLoadMediaCount(loadId, mediaToUpload.length);
          console.log('Updated load media count for load:', loadId);
        } catch (error) {
          console.error('Error updating load media count:', error);
        }
      }

      // Show upload progress dialog
      Alert.alert(
        'Uploading to Cloud',
        `Uploading ${mediaToUpload.length} media files from ${loadTitle || 'your load'} to secure cloud storage...`,
        [],
        { cancelable: false }
      );

      // Upload all captured media to S3
      const uploadResult = await uploadToS3(mediaToUpload);

      if (uploadResult.success) {
        // Update load status after successful upload
        try {
          if (loadId) {
            await LoadsService.updateLoadStatus(loadId);
            console.log('Load status updated successfully for load:', loadId);
          }
        } catch (error) {
          console.error('Error updating load status:', error);
          // Don't fail the whole process if status update fails
        }

        if (uploadResult.failedUploads && uploadResult.failedUploads > 0) {
          // Partial success
          Alert.alert(
            'Partially Successful',
            `${uploadResult.successfulUploads} of ${uploadResult.totalFiles} files uploaded successfully from ${loadTitle || 'your load'}.\n\n${uploadResult.failedUploads} files failed to upload (likely due to large file size). Media has been saved locally.`,
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        } else {
          // Complete success
          Alert.alert(
            'Success!',
            `All media from ${loadTitle || 'your load'} has been captured and securely uploaded to the cloud!\n\n${uploadResult.successfulUploads} files uploaded successfully.`,
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      }
    } catch (error) {
      // If upload fails, still save locally and inform user
      Alert.alert(
        'Upload Failed',
        `Media from ${loadTitle || 'your load'} has been saved locally, but cloud upload failed: ${error.message}\n\nYou can try uploading again later.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleCapture = async () => {
    const currentStepData = STEPS[currentStep];
    
    // Check permissions before proceeding
    const hasPermissions = await requestAllPermissions();
    if (!hasPermissions && currentStepData.type === 'photo') {
      return; // Don't proceed if camera permission is missing for photos
    }

    if (currentStepData.type === 'photo') {
      takePicture();
    } else if (currentStepData.type === 'video') {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    }
  };

  if (!cameraPermission || !loadStatusChecked) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {!cameraPermission ? 'Requesting camera permissions...' : 'Checking load status...'}
        </Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="camera-outline" size={80} color="#ccc" />
        <Text style={styles.noPermissionText}>
          Camera permission is required to use this feature
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStepData = STEPS[currentStep];
  const needsMicPermission = currentStepData.type === 'video' && !microphonePermission?.granted;

  return (
    <SafeAreaView  style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          {loadTitle && (
            <Text style={styles.loadTitle}>{loadTitle}</Text>
          )}
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepDescription}>{currentStepData.description}</Text>
          {needsMicPermission && (
            <Text style={styles.permissionWarning}>
              Microphone permission needed for audio
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {STEPS.length}
        </Text>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing='back'
          mode={currentStepData.type === 'video' ? 'video' : 'picture'}
          ref={cameraRef}
        >
          {/* Recording Overlay */}
          {isRecording && (
            <View style={styles.recordingOverlay}>
              <Animated.View
                style={[
                  styles.recordingIndicator,
                  { transform: [{ scale: pulseAnimation }] },
                ]}
              >
                <Ionicons name="radio-button-on" size={20} color="#ff4757" />
                <Text style={styles.recordingText}>REC {recordingTime}s</Text>
                {!microphonePermission?.granted && (
                  <Ionicons name="mic-off" size={16} color="#fff" style={{ marginLeft: 8 }} />
                )}
              </Animated.View>
            </View>
          )}

          {/* Upload Progress Overlay */}
          {isUploading && (
            <View style={styles.uploadOverlay}>
              <View style={styles.uploadIndicator}>
                <Ionicons name="cloud-upload" size={24} color="#667eea" />
                <Text style={styles.uploadText}>Uploading to Cloud</Text>
                <View style={styles.uploadProgressBar}>
                  <View 
                    style={[
                      styles.uploadProgressFill, 
                      { width: `${uploadProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.uploadPercentage}>{uploadProgress}%</Text>
              </View>
            </View>
          )}
        </CameraView>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.controlsGradient}
        >
          {/* Capture Button - Centered */}
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                isRecording && styles.captureButtonRecording,
              ]}
              onPress={handleCapture}
              disabled={isLoading}
            >
              <View style={styles.captureButtonInner}>
                {isLoading ? (
                  <Ionicons name="hourglass" size={32} color="#fff" />
                ) : currentStepData.type === 'photo' ? (
                  <Ionicons name="camera" size={32} color="#fff" />
                ) : isRecording ? (
                  <Ionicons name="stop" size={32} color="#fff" />
                ) : (
                  <Ionicons name="videocam" size={32} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  noPermissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  loadTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepDescription: {
    color: '#ffffff80',
    fontSize: 14,
    marginTop: 4,
  },
  permissionWarning: {
    color: '#ffa500',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ffffff20',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  progressText: {
    color: '#ffffff80',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  recordingOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  controlsContainer: {
    height: 150,
  },
  controlsGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 30,
  },
  captureButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  captureButtonRecording: {
    backgroundColor: '#ff4757',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  uploadIndicator: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  uploadProgressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  uploadProgressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  uploadPercentage: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CaptureProcess; 