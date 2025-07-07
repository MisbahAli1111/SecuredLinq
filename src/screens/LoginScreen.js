import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { UserService } from '../services/userService';
import { UserStorage } from '../utils/userStorage';

const LoginScreen = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    const userData = {
      name: name.trim(),
      phoneNumber: phoneNumber.replace(/\s/g, ''),
    };

    const validation = UserService.validateUserData(userData);
    
    if (!validation.isValid) {
      Alert.alert('Error', validation.errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        name: name.trim(),
        phoneNumber: phoneNumber.replace(/\s/g, ''), // Remove spaces
      };

      const result = await UserService.signupUser(userData);
      
      if (result.success) {
        // Save user data to local storage
        const savedUser = await UserStorage.saveUser(result.user);
        
        const welcomeMessage = result.isNewUser 
          ? `Hello ${result.user.name}! Welcome to SecureLinQ. Your account has been created successfully.`
          : `Hello ${result.user.name}! Welcome back to SecureLinQ.`;
        
        Alert.alert(
          'Welcome!',
          welcomeMessage,
          [
            {
              text: 'Continue',
              onPress: () => onLoginSuccess(savedUser),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to authenticate. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Failed to authenticate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (text) => {
    // Pakistani phone number formatting (11 digits: 03XX-XXX-XXXX)
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    } else if (cleaned.length <= 11) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    } else {
      // Limit to 11 digits for Pakistani numbers
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
    }
  };

  const handlePhoneNumberChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Image 
                  source={require('../../assets/icon.png')} 
                  style={styles.logoIcon} 
                />
                <Text style={styles.title}>SecureLinQ</Text>
                <Text style={styles.subtitle}>
                  Welcome! Let's get you started
                </Text>
              </View>

              {/* Login Form */}
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Create Your Account</Text>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#ffffff80"
                    value={name}
                    onChangeText={setName}
                    maxLength={50}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={20} color="#fff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#ffffff80"
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    keyboardType="phone-pad"
                    maxLength={13}
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ff7b7b', '#ff4757']}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="log-in" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Get Started</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Info Section */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>What you'll get:</Text>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={styles.featureText}>Secure media capture</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={styles.featureText}>Personal load management</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={styles.featureText}>Cloud storage integration</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
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
  formContainer: {
    backgroundColor: '#ffffff15',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ffffff20',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff20',
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ffffff30',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 10,
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
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#ffffff10',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff20',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  logoIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
});

export default LoginScreen; 