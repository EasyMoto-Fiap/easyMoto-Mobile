import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, InitialState } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { FontAwesome, Feather, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { registerForPushNotificationsAsync } from './src/services/push';

SplashScreen.preventAutoHideAsync().catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

function AppContent() {
  const [ready, setReady] = useState(false);
  const [navState, setNavState] = useState<InitialState | undefined>();
  const [fontsLoaded] = useFonts({
    ...FontAwesome.font,
    ...Feather.font,
    ...AntDesign.font,
    ...MaterialCommunityIcons.font
  });

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(PERSISTENCE_KEY);
        if (saved) setNavState(JSON.parse(saved));
      } catch {}
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250]
        });
      } catch {}
      try {
        await registerForPushNotificationsAsync();
      } catch {}
      setReady(true);
      try {
        await SplashScreen.hideAsync();
      } catch {}
    })();
  }, [fontsLoaded]);

  if (!fontsLoaded || !ready) return null;

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        initialState={navState}
        onStateChange={async (state) => {
          try {
            await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
          } catch {}
        }}
      >
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
