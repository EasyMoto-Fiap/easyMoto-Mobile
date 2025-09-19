import { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';
type ThemeContextValue = { theme: Theme; toggleTheme: () => Promise<void> };

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: async () => {}
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') setTheme(saved);
    })();
  }, []);

  async function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await AsyncStorage.setItem('theme', next);
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
