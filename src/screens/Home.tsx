import { View, Text, StyleSheet, StatusBar } from 'react-native';
import BotaoGradiente from '../../components/BotaoGradiente';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../../styles/colors';

export default function Home() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useContext(ThemeContext);
  const themeColors = theme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ThemeToggleButton />
      <Text style={[styles.logo, { color: themeColors.text }]}>
        <Text style={styles.logoEasy}>easy</Text>
        <Text style={{ color: themeColors.text }}>Moto</Text>
      </Text>
      <Text style={[styles.subtext, { color: theme === 'dark' ? colors.mutedText : '#4a4a4a' }]}>
        Para acessar o aplicativo escolha sua função:
      </Text>
      <View style={styles.buttonContainer}>
        <BotaoGradiente
          icone="user"
          titulo="Operador"
          onPress={() => navigation.navigate('Login', { role: 'operador' })}
          style={{ marginBottom: 20 }}
        />
        <BotaoGradiente
          icone="cog"
          titulo="Administrador"
          onPress={() => navigation.navigate('Login', { role: 'admin' })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingBottom: 24 },
  logo: { fontSize: 36, fontWeight: 'bold', marginBottom: 50 },
  logoEasy: { color: colors.primary },
  subtext: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  buttonContainer: { width: '100%' }
});
