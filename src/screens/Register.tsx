import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

const BG = '#121212';
const GREEN = '#16a34a';

function formatarCPF(valor: string) {
  const numeros = valor.replace(/\D/g, '');
  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}

function formatarCEP(valor: string) {
  const numeros = valor.replace(/\D/g, '');
  return numeros.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
}

export default function Register() {
  const route = useRoute<RouteProp<RootStackParamList, 'Register'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const role = route.params.role;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  async function validarCampos() {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const cepLimpo = cep.replace(/\D/g, '');

    if (!/^[A-Za-zÀ-ú\s]+$/.test(nome)) {
      Alert.alert('Nome inválido', 'O nome não pode conter números ou símbolos.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Email inválido', 'O email deve conter @');
      return;
    }
    if (senha.length !== 8) {
      Alert.alert('Senha inválida', 'A senha deve conter exatamente 8 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'As senhas não coincidem.');
      return;
    }
    if (!/^\d{11}$/.test(cpfLimpo)) {
      Alert.alert('CPF inválido', 'O CPF deve conter exatamente 11 dígitos numéricos.');
      return;
    }
    if (!/^\d{8}$/.test(cepLimpo)) {
      Alert.alert('CEP inválido', 'O CEP deve conter exatamente 8 dígitos numéricos.');
      return;
    }

    const novo = {
      id: Date.now().toString(),
      nome,
      email,
      senha,
      cpf,
      filial: cep,
      telefone: '',
      role
    };

    const listaKey = role === 'operador' ? 'operadores' : 'admins';
    const dados = await AsyncStorage.getItem(listaKey);
    const lista = dados ? JSON.parse(dados) : [];
    const novaLista = [...lista, novo];

    await AsyncStorage.setItem(listaKey, JSON.stringify(novaLista));
    await AsyncStorage.setItem('usuario', JSON.stringify(novo));

    Alert.alert('Cadastro realizado com sucesso!');
    navigation.replace('Login', { role });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        <Text style={styles.logoEasy}>easy</Text>
        <Text style={styles.logoMoto}>Moto</Text>
      </Text>

      <Text style={styles.title}>
        Cadastro do {role === 'operador' ? 'operador' : 'administrador'}:
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome:"
        placeholderTextColor="#666"
        value={nome}
        onChangeText={setNome}
      />
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
          placeholder="Senha (8 caracteres):"
          placeholderTextColor="#666"
          secureTextEntry={!mostrarSenha}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.iconeOlho}>
          <FontAwesome name={mostrarSenha ? 'eye' : 'eye-slash'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.senhaContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Confirmar senha:"
          placeholderTextColor="#666"
          secureTextEntry={!mostrarConfirmar}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
        <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)} style={styles.iconeOlho}>
          <FontAwesome name={mostrarConfirmar ? 'eye' : 'eye-slash'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="CPF:"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={cpf}
        onChangeText={(v) => setCpf(formatarCPF(v))}
        maxLength={14}
      />
      <TextInput
        style={styles.input}
        placeholder="CEP da Filial:"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={cep}
        onChangeText={(v) => setCep(formatarCEP(v))}
        maxLength={9}
      />

      <TouchableOpacity style={styles.button} onPress={validarCampos}>
        <Text style={styles.buttonText}>Acessar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
        <Text style={styles.linkText}>Já tem conta? Faça Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, padding: 30, justifyContent: 'center' },
  logo: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 50, color: '#fff' },
  logoEasy: { color: GREEN },
  logoMoto: { color: '#fff' },
  title: { fontSize: 18, marginBottom: 20, textAlign: 'center', color: '#fff' },
  input: { backgroundColor: '#e4e4e4', padding: 15, borderRadius: 30, marginBottom: 15, color: '#000' },
  senhaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconeOlho: { position: 'absolute', right: 15 },
  button: { backgroundColor: '#004d25', padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkText: { textAlign: 'center', fontSize: 14, color: '#d9d9d9' }
});
