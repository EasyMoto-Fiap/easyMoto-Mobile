import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ThemeToggleButton from './ThemeToggleButton';
import LanguageToggleButton from './LanguageToggleButton';

export default function TopRightToggles() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: insets.top + 8 }]}>
      <LanguageToggleButton />
      <View style={styles.spacer} />
      <ThemeToggleButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',  
    alignItems: 'center',
    zIndex: 20,
  },
  spacer: {
    width: 8,
  },
});