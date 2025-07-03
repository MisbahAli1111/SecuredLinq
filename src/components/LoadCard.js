import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoadCard = ({ load, userId, onPress, onViewMedia }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Use loadNumber if available, otherwise fall back to title
  const displayTitle = load.loadNumber || load.title;
  const displaySubtitle = load.description || `Load ID: ${load.id}`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(load)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#ffffff20', '#ffffff10']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{displayTitle}</Text>
              <Text style={styles.subtitle}>{displaySubtitle}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => onViewMedia && onViewMedia(load)}
              >
                <Ionicons name="images" size={18} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={() => onPress(load)}
              >
                <Ionicons name="camera" size={18} color="#667eea" />
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
              <View style={styles.statItem}>
                <Ionicons name="calendar" size={16} color="#ffffff80" />
                <Text style={styles.statText}>
                  {formatDate(load.createdAt || load.created_at)}
                </Text>
              </View>
              {load.status && (
                <View style={styles.statItem}>
                  <Ionicons 
                    name={load.status === 'active' ? 'checkmark-circle' : 'time'} 
                    size={16} 
                    color={load.status === 'active' ? '#4CAF50' : '#FFA726'} 
                  />
                  <Text style={[styles.statText, { 
                    color: load.status === 'active' ? '#4CAF50' : '#FFA726' 
                  }]}>
                    {load.status}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionIndicator}>
              <Ionicons name="chevron-forward" size={16} color="#ffffff80" />
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
  subtitle: {
    fontSize: 14,
    color: '#ffffff80',
    fontWeight: '400',
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