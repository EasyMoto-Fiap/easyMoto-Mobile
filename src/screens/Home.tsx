import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import BotaoGradiente from '../../components/BotaoGradiente';

export default function Home() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.logo}>
        <Text style={styles.logoEasy}>easy</Text>
        <Text style={styles.logoMoto}>Moto</Text>
      </Text>
      <Text style={styles.subtext}>Para acessar o aplicativo escolha sua função:</Text>
      <View style={styles.buttonContainer}>
        <BotaoGradiente
          icone="user"
          titulo="Operador"
          onPress={() => Alert.alert('Operador')}
          style={{ marginBottom: 20 }}
        />
        <BotaoGradiente
          icone="cog"
          titulo="Administrador"
          onPress={() => Alert.alert('Administrador')}
        />
      </View>
    </View>
  );
}

const BG = '#121212';
const GREEN = '#16a34a';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 24
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#ffffff'
  },
  logoEasy: { color: GREEN },
  logoMoto: { color: '#ffffff' },
  subtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#D9D9D9'
  },
  buttonContainer: { width: '100%' }
});
