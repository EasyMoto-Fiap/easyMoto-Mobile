import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ThemeToggleButton from '../components/ThemeToggleButton';
import { ThemeContext } from '../contexts/ThemeContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../styles/colors';

export default function Home() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />

      <Text style={[styles.logoText, { color: themeColors.text }]}>
        <Text style={{ color: colors.primary }}>easy</Text>Moto
      </Text>

      <Text style={[styles.subtext, { color: themeColors.text }]}>
        Para acessar o aplicativo escolha sua função:
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login', { role: 'operador' })}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Operador</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login', { role: 'admin' })}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Administrador</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GREEN = '#004d25';

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  logoText: { fontSize: 36, fontWeight: 'bold', marginBottom: 50 },
  subtext: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  buttonContainer: { width: '100%', gap: 20 },
  button: { backgroundColor: GREEN, paddingVertical: 15, borderRadius: 30, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
