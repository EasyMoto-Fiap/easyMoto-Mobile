import { Feather } from '@expo/vector-icons';
import React, { useContext } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isDark = theme === 'dark';
  const iconName: React.ComponentProps<typeof Feather>['name'] = isDark ? 'sun' : 'moon';
  const iconColor = isDark ? colors.dark.text : colors.light.text;
  const bg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: pressed ? 0.7 : 1 },
      ]}
      android_ripple={{
        color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        borderless: true,
      }}
      hitSlop={10}
    >
      <Feather name={iconName} size={20} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
