import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoadCard = ({ load, userId, onPress, onViewMedia }) => {
  // Check if load is completed (status = 1 means completed)
  const isCompleted = load.status === 'active' || (load.status && load.status.data && load.status.data[0] === 1);
  
  // Use loadNumber if available, otherwise fall back to title
  const displayTitle = load.loadNumber || load.title;
  const displaySubtitle = load.description || `User: ${load.userName || 'Unknown'}`;

  const handlePress = () => {
    if (isCompleted) {
      // Show alert for completed loads
      Alert.alert(
        'Load Completed',
        'This load has already been processed and cannot be modified.',
        [{ text: 'OK' }]
      );
      return;
    }
    onPress(load);
  };

  const handleCapturePress = () => {
    if (isCompleted) {
      return; // Don't do anything for completed loads
    }
    onPress(load);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={handlePress}
      activeOpacity={isCompleted ? 1 : 0.8}
    >
      <LinearGradient
        colors={isCompleted ? ['#4CAF5020', '#4CAF5010'] : ['#ffffff20', '#ffffff10']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, isCompleted && styles.completedTitle]}>
                {displayTitle}
              </Text>
              <Text style={[styles.subtitle, isCompleted && styles.completedSubtitle]}>
                {displaySubtitle}
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => onViewMedia && onViewMedia(load)}
              >
                <Ionicons name="images" size={18} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.captureButton, isCompleted && styles.disabledButton]}
                onPress={handleCapturePress}
                disabled={isCompleted}
              >
                <Ionicons 
                  name={isCompleted ? "checkmark-circle" : "camera"} 
                  size={18} 
                  color={isCompleted ? "#4CAF50" : "#667eea"} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* User ID Row */}
          <View style={styles.userRow}>
            <Ionicons name="person" size={16} color="#ffffff80" />
            <Text style={styles.userId}>User ID: {userId}</Text>
          </View>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="images" size={16} color="#ffffff80" />
                <Text style={styles.statText}>
                  {load.mediaCount || 0} media
                </Text>
              </View>
              {/* Status indicator */}
              <View style={styles.statItem}>
                <Ionicons 
                  name={isCompleted ? 'checkmark-circle' : 'time'} 
                  size={16} 
                  color={isCompleted ? '#4CAF50' : '#FFA726'} 
                />
                <Text style={[styles.statText, { 
                  color: isCompleted ? '#4CAF50' : '#FFA726' 
                }]}>
                  {isCompleted ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
            
            <View style={styles.actionIndicator}>
              <Ionicons 
                name={isCompleted ? "checkmark-circle" : "chevron-forward"} 
                size={16} 
                color={isCompleted ? "#4CAF50" : "#ffffff80"} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  completedContainer: {
    opacity: 0.8,
  },
  gradient: {
    borderWidth: 1,
    borderColor: '#ffffff30',
    borderRadius: 8,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaButton: {
    backgroundColor: '#ffffff20',
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: '#4CAF5030',
    minWidth: 34,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  completedTitle: {
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 14,
    color: '#ffffff80',
    fontWeight: '400',
  },
  completedSubtitle: {
    color: '#4CAF5080',
  },
  captureButton: {
    backgroundColor: '#ffffff20',
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ffffff30',
    minWidth: 34,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#4CAF5020',
    borderColor: '#4CAF5030',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userId: {
    fontSize: 14,
    color: '#ffffff80',
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#ffffff80',
    marginLeft: 4,
    fontWeight: '500',
  },
  actionIndicator: {
    padding: 4,
  },
});

export default LoadCard; 