import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Setup Buffer polyfill for React Native
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Import our screens and components
import { Dashboard, CaptureProcess } from './src/screens';
import { SavedMediaModal } from './src/components';

const Stack = createStackNavigator();

// Main App Component
const MainApp = () => {
  const [showSavedMediaModal, setShowSavedMediaModal] = useState(false);

  const handleViewSavedMedia = () => {
    setShowSavedMediaModal(true);
  };

  const handleCloseSavedMedia = () => {
    setShowSavedMediaModal(false);
  };

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          <Stack.Screen name="Dashboard">
            {(props) => (
              <Dashboard
                {...props}
                onViewSavedMedia={handleViewSavedMedia}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="CaptureProcess"
            component={CaptureProcess}
            options={{
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateY: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.height, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Saved Media Modal */}
      <SavedMediaModal
        isVisible={showSavedMediaModal}
        onClose={handleCloseSavedMedia}
      />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MainApp />
        <StatusBar style="light" />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
