import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, ThemeContext } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  
    shouldShowList: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function Root() {
  const { theme } = React.useContext(ThemeContext);
  return (
    <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });

        if (Device.isDevice) {
          const { status } = await Notifications.getPermissionsAsync();
          const finalStatus =
            status === 'granted'
              ? 'granted'
              : (await Notifications.requestPermissionsAsync()).status;

          if (finalStatus === 'granted') {
            await Notifications.getExpoPushTokenAsync().catch(() => {});
          }
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setReady(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return (
    <SafeAreaProvider>
      {!ready ? (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000',
          }}
        >
          <ActivityIndicator size="large" color="#00c853" />
        </SafeAreaView>
      ) : (
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <Root />
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      )}
    </SafeAreaProvider>
  );
}
