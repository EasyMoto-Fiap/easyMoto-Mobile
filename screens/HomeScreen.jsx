import { View, Text, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import CustomButton from '../components/CustomButton';
import ThemeToggleButton from '../components/ThemeToggleButton';

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

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
        <CustomButton
          label="Operador"
          icon="user"
          onPress={() => navigation.navigate('LoginOperador')}
        />
        <CustomButton
          label="Administrador"
          icon="cog"
          onPress={() => navigation.navigate('LoginAdmin')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
});
