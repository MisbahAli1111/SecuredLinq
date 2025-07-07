import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Dimensions,
  ScrollView,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { UserStorage } from '../utils/userStorage';
import LoadCard from '../components/LoadCard';
import { SavedMediaModal } from '../components';

const { width, height } = Dimensions.get('window');

const Dashboard = ({ navigation, onLogout }) => {
  const [user, setUser] = useState(null);
  const [loads, setLoads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [showLoadMediaModal, setShowLoadMediaModal] = useState(false);
  const [selectedLoadForMedia, setSelectedLoadForMedia] = useState(null);

  useEffect(() => {
    loadUserData();
    loadUserLoads();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await UserStorage.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserLoads = async () => {
    try {
      const userLoads = await UserStorage.getUserLoads();
      setLoads(userLoads);
    } catch (error) {
      console.error('Error loading user loads:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadUserLoads()]);
    setRefreshing(false);
  };

  const handleLoadPress = (load) => {
    // Check if load is completed (status = 1 means completed)
    const isCompleted = load.status === 'active' || (load.status && load.status.data && load.status.data[0] === 1);
    
    if (isCompleted) {
      Alert.alert(
        'Load Completed',
        'This load has already been processed and cannot be modified.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedLoad(load);
    navigation.navigate('CaptureProcess', { 
      loadId: load.dbId || load.id, // Use database ID if available
      loadTitle: load.title || load.loadNumber,
      loadNumber: load.loadNumber,
    });
  };

  const handleViewLoadMedia = (load) => {
    setSelectedLoadForMedia(load);
    setShowLoadMediaModal(true);
  };

  const handleCloseLoadMedia = () => {
    setShowLoadMediaModal(false);
    setSelectedLoadForMedia(null);
  };



  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await UserStorage.clearUser();
            // Call the parent logout handler
            if (onLogout) {
              onLogout();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* User Header Section */}
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Image 
                  source={require('../../assets/icon.png')} 
                  style={styles.logoIcon} 
                />
                <View style={styles.userTextContainer}>
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Text style={styles.userPhone}>
                    {user?.phoneNumber || user?.phone ? `Phone: ${user.phoneNumber || user.phone}` : `ID: ${user?.userId || 'N/A'}`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Loads Section */}
            <View style={styles.loadsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Loads</Text>
                <Text style={styles.sectionSubtitle}>
                  {loads.length} load{loads.length !== 1 ? 's' : ''} available
                </Text>
              </View>

              {loads.length > 0 ? (
                <View style={styles.loadsContainer}>
                  {loads.map((load) => (
                    <LoadCard
                      key={load.id}
                      load={load}
                      userId={user?.userId}
                      onPress={handleLoadPress}
                      onViewMedia={handleViewLoadMedia}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyLoadsContainer}>
                  <Ionicons name="folder-open" size={50} color="#ffffff50" />
                  <Text style={styles.emptyLoadsText}>No loads available</Text>
                  <Text style={styles.emptyLoadsSubtext}>
                    Loads will appear here when assigned
                  </Text>
                </View>
              )}
            </View>


          </View>
        </ScrollView>
      </LinearGradient>

      {/* Load-specific Media Modal */}
      <SavedMediaModal
        isVisible={showLoadMediaModal}
        onClose={handleCloseLoadMedia}
        loadId={selectedLoadForMedia?.dbId || selectedLoadForMedia?.id}
        loadTitle={selectedLoadForMedia?.loadNumber || selectedLoadForMedia?.title}
        loadNumber={selectedLoadForMedia?.loadNumber}
      />
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#ffffff80',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#ffffff60',
    marginTop: 2,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ffffff20',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ffffff30',
  },
  logoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  loadsSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#ffffff70',
    fontWeight: '500',
  },
  loadsContainer: {
    marginTop: 10,
  },
  emptyLoadsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff10',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffffff20',
  },
  emptyLoadsText: {
    fontSize: 18,
    color: '#ffffff70',
    fontWeight: '600',
    marginTop: 15,
  },
  emptyLoadsSubtext: {
    fontSize: 14,
    color: '#ffffff50',
    marginTop: 5,
    textAlign: 'center',
  },

});

export default Dashboard; 