import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TopRightToggles from '../components/TopRightToggles';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../styles/colors';
import GradientButton from '../components/GradientButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { t } from '../i18n';

export default function Home() {
  const { theme } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TopRightToggles />
      <LogoEasyMoto style={styles.logoText} />

      <Text style={[styles.subtext, { color: themeColors.text }]}>
        {t('home.subtitle')}
      </Text>

      <View style={styles.buttonContainer}>
        <GradientButton
          title={t('home.operador')}
          onPress={() => navigation.navigate('Login', { role: 'operador' })}
        />
        <GradientButton
          title={t('home.admin')}
          onPress={() => navigation.navigate('Login', { role: 'admin' })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  logoText: { fontSize: 36, fontWeight: 'bold', marginBottom: 50 },
  subtext: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  buttonContainer: { width: '100%', gap: 20 },
});
