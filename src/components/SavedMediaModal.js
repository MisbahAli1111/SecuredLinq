import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { S3Service } from '../services';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 60) / 2;

const SavedMediaModal = ({ isVisible, onClose, loadId = null, loadTitle = null, loadNumber = null }) => {
  const [savedMedia, setSavedMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create video player only when we have a video selected
  const player = useVideoPlayer(
    selectedMedia?.type === 'video' ? (selectedMedia.signedUrl || selectedMedia.uri) : null,
    (player) => {
      if (selectedMedia?.type === 'video') {
        player.loop = true;
        player.play();
      }
    }
  );

  useEffect(() => {
    if (isVisible) {
      loadSavedMedia();
    }
  }, [isVisible, loadId, loadNumber]);

  // Cleanup video player when modal closes or media changes
  useEffect(() => {
    if (!isVisible || !selectedMedia) {
      player?.pause();
    }
  }, [isVisible, selectedMedia, player]);

  const loadSavedMedia = async () => {
    setIsLoading(true);
    try {
      if (loadNumber) {
        // Load media directly from S3 using loadNumber
        console.log('Loading media from S3 for load number:', loadNumber);
        const s3Result = await S3Service.listLoadMedia(loadNumber);
        
        if (s3Result.success) {
          // Sort by step, then by timestamp
          const sortedMedia = s3Result.media.sort((a, b) => {
            if (a.step !== b.step) {
              return (a.step || 0) - (b.step || 0);
            }
            return new Date(b.lastModified) - new Date(a.lastModified);
          });
          
          // Transform S3 media objects to match expected format
          const transformedMedia = sortedMedia.map(media => ({
            id: media.key, // Use S3 key as unique ID
            type: media.type,
            step: media.step,
            timestamp: media.lastModified,
            fileName: media.fileName,
            size: media.size,
            loadNumber: media.loadNumber,
            signedUrl: media.signedUrl,
            s3Key: media.key,
            uri: media.signedUrl, // For compatibility with existing video player code
          }));
          
          setSavedMedia(transformedMedia);
          console.log('Loaded media from S3:', transformedMedia.length, 'items');
        } else {
          console.error('Failed to load media from S3:', s3Result.error);
          setSavedMedia([]);
        }
      } else {
        // No loadNumber provided - cannot fetch media
        console.log('No loadNumber provided - cannot fetch media from S3');
        setSavedMedia([]);
      }
    } catch (error) {
      console.error('Error loading saved media:', error);
      Alert.alert('Error', 'Failed to load saved media');
      setSavedMedia([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderMediaItem = ({ item }) => {
    // Use signedUrl for S3 media, fallback to uri for local media
    const mediaUri = item.signedUrl || item.uri;
    
    return (
      <TouchableOpacity
        style={styles.mediaItem}
        onPress={() => setSelectedMedia(item)}
        activeOpacity={0.8}
      >
        <View style={styles.mediaContainer}>
          {item.type === 'photo' ? (
            <Image source={{ uri: mediaUri }} style={styles.mediaThumbnail} />
          ) : (
            <View style={styles.videoContainer}>
              <View style={styles.videoThumbnail}>
                <Ionicons name="videocam" size={40} color="#667eea" />
              </View>
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={40} color="#fff" />
              </View>
            </View>
          )}
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.mediaOverlay}
          >
            <View style={styles.mediaInfo}>
              <Ionicons 
                name={item.type === 'photo' ? 'camera' : 'videocam'} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.stepText}>Step {item.step}</Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedMedia = () => {
    if (!selectedMedia) return null;

    return (
      <Modal
        isVisible={!!selectedMedia}
        onBackdropPress={() => setSelectedMedia(null)}
        style={styles.fullScreenModal}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedMedia(null)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                {selectedMedia.type === 'photo' ? 'Photo' : 'Video'} - Step {selectedMedia.step}
              </Text>
              <Text style={styles.headerDate}>
                {formatDate(selectedMedia.timestamp)}
              </Text>
            </View>

            {/* Empty view to maintain header layout balance */}
            <View style={styles.closeButton} />
          </View>

          <View style={styles.fullScreenContent}>
            {selectedMedia.type === 'photo' ? (
              <Image
                source={{ uri: selectedMedia.signedUrl || selectedMedia.uri }}
                style={styles.fullScreenMedia}
                resizeMode="contain"
              />
            ) : (
              <VideoView
                style={styles.fullScreenMedia}
                player={player}
                contentFit="contain"
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.container}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Ionicons name="folder-open" size={24} color="#fff" />
                <Text style={styles.title}>
                  {loadTitle ? `${loadTitle} Media` : 'Saved Media'}
                </Text>
              </View>
              
              <TouchableOpacity onPress={onClose} style={styles.headerCloseButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.subtitle}>
              {loadTitle 
                ? `${savedMedia.length} ${savedMedia.length === 1 ? 'item' : 'items'} from this load`
                : `${savedMedia.length} ${savedMedia.length === 1 ? 'item' : 'items'} stored securely`
              }
            </Text>
          </LinearGradient>

          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="hourglass" size={40} color="#667eea" />
                <Text style={styles.loadingText}>Loading media...</Text>
              </View>
            ) : savedMedia.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="camera-outline" size={80} color="#ccc" />
                <Text style={styles.emptyTitle}>No Media Found</Text>
                <Text style={styles.emptyDescription}>
                  {loadTitle 
                    ? `No media has been captured for ${loadTitle} yet`
                    : 'Start capturing photos and videos to see them here'
                  }
                </Text>
              </View>
            ) : (
              <FlatList
                data={savedMedia}
                renderItem={renderMediaItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.mediaGrid}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>


        </View>
      </Modal>

      {renderSelectedMedia()}
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    minHeight: height * 0.6,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#ffffff80',
  },
  headerCloseButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  mediaGrid: {
    paddingVertical: 20,
  },
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: 20,
    marginRight: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mediaContainer: {
    flex: 1,
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  mediaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff4757',
    backgroundColor: '#fff',
  },
  clearButtonText: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Full screen modal styles
  fullScreenModal: {
    margin: 0,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerDate: {
    color: '#ffffff80',
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  fullScreenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenMedia: {
    width: width,
    height: height * 0.7,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default SavedMediaModal; 