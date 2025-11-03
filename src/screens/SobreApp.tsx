import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Constants from 'expo-constants';
import ThemeToggleButton from '../components/ThemeToggleButton';
import LanguageToggleButton from '../components/LanguageToggleButton';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { colors } from '../styles/colors';
import { t } from '../i18n';

const buildInfo = require('../buildInfo.json') as { commitHash?: string; buildDate?: string };

export default function SobreApp() {
  const { theme } = useContext(ThemeContext);
  useContext(LanguageContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const muted = isDark ? '#9aa0a6' : '#6b7280';

  const appName =
    (Constants.expoConfig as any)?.name ||
    (Constants.manifest as any)?.name ||
    'App';

  const version =
    (Constants.expoConfig as any)?.version ||
    (Constants.manifest as any)?.version ||
    '0.0.0';

  const commitHash =
    ((Constants.expoConfig as any)?.extra?.commitHash as string) ||
    buildInfo?.commitHash ||
    'dev';

  const buildDate = buildInfo?.buildDate
    ? buildInfo.buildDate.replace('T', ' ').replace('Z', ' UTC')
    : '-';

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.toggle}><ThemeToggleButton /></View>
      <View style={styles.langBadge}><LanguageToggleButton /></View>

      <Text style={[styles.title, { color: themeColors.text }]}>{t('about.title')}</Text>

      <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}>
        <Text style={[styles.label, { color: muted }]}>{t('about.name')}</Text>
        <Text style={[styles.value, { color: themeColors.text }]}>{appName}</Text>

        <Text style={[styles.label, { color: muted }]}>{t('about.version')}</Text>
        <Text style={[styles.value, { color: themeColors.text }]}>{version}</Text>

        <Text style={[styles.label, { color: muted }]}>{t('about.commit')}</Text>
        <TouchableOpacity activeOpacity={0.9} onLongPress={() => Alert.alert('Commit', `Hash: ${commitHash}`)}>
          <Text style={[styles.value, styles.mono, { color: themeColors.text }]}>{commitHash}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: muted }]}>{t('about.build')}</Text>
        <Text style={[styles.value, { color: themeColors.text }]}>{buildDate}</Text>
      </View>

      <Text style={[styles.hint, { color: muted }]}>{t('about.hint')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 120, paddingHorizontal: 22 },
  toggle: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  langBadge: { position: 'absolute', top: 16, right: 56, zIndex: 10, padding: 35, paddingRight: 12 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 16 },
  card: { borderRadius: 18, padding: 18, gap: 6 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  mono: { fontFamily: 'monospace' },
  hint: { fontSize: 12, marginTop: 14 }
});
