import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import api from '../services/api';

type AuthUser = any;

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (data: { token: string; user: AuthUser }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (nextUser: AuthUser) => Promise<void>;
  setToken: (nextToken: string | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateUser: async () => {},
  setToken: async () => {},
});

const TOKEN_KEY = 'token';
const USER_KEY = 'usuarioAtual';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (storedToken) {
          setTokenState(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const setToken = async (nextToken: string | null) => {
    setTokenState(nextToken);
    if (nextToken) {
      await AsyncStorage.setItem(TOKEN_KEY, nextToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${nextToken}`;
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const signIn = async ({ token: t, user: u }: { token: string; user: AuthUser }) => {
    await AsyncStorage.setItem(TOKEN_KEY, t);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setTokenState(t);
    setUser(u);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    delete api.defaults.headers.common['Authorization'];
    setTokenState(null);
    setUser(null);
  };

  const updateUser = async (nextUser: AuthUser) => {
    setUser(nextUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const value = useMemo(
    () => ({ user, token, isLoading, signIn, signOut, updateUser, setToken }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
