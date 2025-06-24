import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Dashboard = ({ navigation, onViewSavedMedia }) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={50} color="#fff" />
            <Text style={styles.title}>SecureCam</Text>
            <Text style={styles.subtitle}>
              Secure Media Capture & Storage
            </Text>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Capture and securely store your important moments with military-grade security.
              Take photos and record videos with confidence.
            </Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.featureText}>High-Quality Photos</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="videocam" size={20} color="#fff" />
                <Text style={styles.featureText}>HD Video Recording</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="lock-closed" size={20} color="#fff" />
                <Text style={styles.featureText}>Secure Storage</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('CaptureProcess')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ff7b7b', '#ff4757']}
                style={styles.buttonGradient}
              >
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.buttonText}>Start Capture</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onViewSavedMedia}
              activeOpacity={0.8}
            >
              <Ionicons name="folder-open" size={20} color="#667eea" />
              <Text style={styles.secondaryButtonText}>View Saved Media</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff80',
    marginTop: 8,
    textAlign: 'center',
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 20,
  },
  primaryButton: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryButton: {
    backgroundColor: '#ffffff20',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffffff30',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Dashboard; 