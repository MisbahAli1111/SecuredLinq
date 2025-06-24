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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 60) / 2;

const SavedMediaModal = ({ isVisible, onClose }) => {
  const [savedMedia, setSavedMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create video player only when we have a video selected
  const player = useVideoPlayer(
    selectedMedia?.type === 'video' ? selectedMedia.uri : null,
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
  }, [isVisible]);

  // Cleanup video player when modal closes or media changes
  useEffect(() => {
    if (!isVisible || !selectedMedia) {
      player?.pause();
    }
  }, [isVisible, selectedMedia, player]);

  const loadSavedMedia = async () => {
    setIsLoading(true);
    try {
      const mediaData = await AsyncStorage.getItem('secureMedia');
      if (mediaData) {
        const parsedMedia = JSON.parse(mediaData);
        // Sort by timestamp, most recent first
        const sortedMedia = parsedMedia.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setSavedMedia(sortedMedia);
      } else {
        setSavedMedia([]);
      }
    } catch (error) {
      console.error('Error loading saved media:', error);
      Alert.alert('Error', 'Failed to load saved media');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedia = async (mediaId) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this media? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMedia = savedMedia.filter(item => item.id !== mediaId);
              await AsyncStorage.setItem('secureMedia', JSON.stringify(updatedMedia));
              setSavedMedia(updatedMedia);
              setSelectedMedia(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete media');
            }
          },
        },
      ]
    );
  };

  const clearAllMedia = async () => {
    Alert.alert(
      'Clear All Media',
      'Are you sure you want to delete all saved media? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('secureMedia');
              setSavedMedia([]);
              setSelectedMedia(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear media');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderMediaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => setSelectedMedia(item)}
      activeOpacity={0.8}
    >
      <View style={styles.mediaContainer}>
        {item.type === 'photo' ? (
          <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} />
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

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteMedia(selectedMedia.id)}
            >
              <Ionicons name="trash" size={24} color="#ff4757" />
            </TouchableOpacity>
          </View>

          <View style={styles.fullScreenContent}>
            {selectedMedia.type === 'photo' ? (
              <Image
                source={{ uri: selectedMedia.uri }}
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
                <Text style={styles.title}>Saved Media</Text>
              </View>
              
              <TouchableOpacity onPress={onClose} style={styles.headerCloseButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.subtitle}>
              {savedMedia.length} {savedMedia.length === 1 ? 'item' : 'items'} stored securely
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
                  Start capturing photos and videos to see them here
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

          {savedMedia.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllMedia}
              >
                <Ionicons name="trash-outline" size={20} color="#ff4757" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}
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