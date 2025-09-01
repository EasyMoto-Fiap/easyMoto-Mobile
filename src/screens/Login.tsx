import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../../styles/colors';

export default function Login() {
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const role = route.params.role;
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        <Text style={styles.logoEasy}>easy</Text>
        <Text style={styles.logoMoto}>Moto</Text>
      </Text>
      <Text style={styles.title}>Login do {role === 'operador' ? 'operador' : 'administrador'}:</Text>
      <TextInput
        style={styles.input}
        placeholder="Email:"
        placeholderTextColor="#666"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <View style={styles.senhaContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Senha:"
          placeholderTextColor="#666"
          secureTextEntry={!mostrarSenha}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.iconeOlho}>
          <FontAwesome name={mostrarSenha ? 'eye' : 'eye-slash'} size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Acessar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register', { role })}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 30, justifyContent: 'center' },
  logo: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 50, color: colors.text },
  logoEasy: { color: colors.primary },
  logoMoto: { color: colors.text },
  title: { fontSize: 18, marginBottom: 20, textAlign: 'center', color: colors.text },
  input: { backgroundColor: colors.inputBg, padding: 15, borderRadius: 30, marginBottom: 15, color: '#000' },
  senhaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconeOlho: { position: 'absolute', right: 15 },
  button: { backgroundColor: colors.buttonBg, padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { textAlign: 'center', fontSize: 14, color: colors.mutedText }
});
