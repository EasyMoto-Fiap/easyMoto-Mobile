import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, InitialState } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState<InitialState | undefined>();
  const { isLoading } = useAuth();

  useEffect(() => {
    const prepare = async () => {
      try {
        const saved = await AsyncStorage.getItem(PERSISTENCE_KEY);
        if (saved) setInitialState(JSON.parse(saved));
      } finally {
        setIsReady(true);
      }
    };
    prepare();
  }, []);

  if (!isReady || isLoading) return null;

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={async (state) => {
        try {
          await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
        } catch {}
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
