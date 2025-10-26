import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import ThemeToggleButton from '../components/ThemeToggleButton';
import VoltarParaHome from '../components/VoltarParaHome';
import { ThemeContext } from '../contexts/ThemeContext';
import useRequest from '../hooks/useRequest';
import type { RootStackParamList } from '../navigation/RootNavigator';
import api from '../services/api';
import { login } from '../services/auth';
import { colors } from '../styles/colors';
import GradientButton from '../components/GradientButton';

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const role = route.params?.role;

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const { run, loadingVisible, errorVisible, errorMessage, hideError } = useRequest();

  async function onSubmit() {
    const e = email.trim();
    const s = senha.trim();
    if (!e || !e.includes('@')) throw new Error('Email inválido');
    if (!s || s.length < 6) throw new Error('Senha inválida');
    try {
      const resp = await login({ email: e, senha: s });
      if (role === 'operador' && resp.usuario.perfil !== 0) {
        throw new Error('Você tentou logar como Operador usando uma conta de Administrador.');
      }
      if (role === 'admin' && resp.usuario.perfil !== 1) {
        throw new Error('Você tentou logar como Administrador usando uma conta de Operador.');
      }
      await AsyncStorage.setItem('token', resp.token);
      await AsyncStorage.setItem('usuarioAtual', JSON.stringify(resp.usuario));
      api.defaults.headers.common['Authorization'] = `Bearer ${resp.token}`;
      if (resp.usuario.perfil === 0) {
        navigation.replace('HomeOperador');
      } else {
        navigation.replace('HomeAdmin');
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          throw new Error('Email ou senha inválidos');
        }
        if (!err.response) {
          throw new Error('Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.');
        }
      }
      throw err;
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <VoltarParaHome />
      <ThemeToggleButton />

      <Text style={styles.logoRow}>
        <Text style={[styles.logo, styles.logoEasy]}>easy</Text>
        <Text style={[styles.logo, { color: themeColors.text }]}>Moto</Text>
      </Text>

      <Text style={[styles.title, { color: themeColors.text }]}>
        {role === 'admin' ? 'Login Administrador' : 'Login Operador'}
      </Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: '#111' }]}
        placeholder="Email"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.senhaContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: colors.inputBg, color: '#111' }]}
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry={!mostrarSenha}
          value={senha}
          onChangeText={setSenha}
        />
        <Text onPress={() => setMostrarSenha(v => !v)} style={styles.iconeOlho}>
          <FontAwesome name={mostrarSenha ? 'eye-slash' : 'eye'} size={20} color="#666" />
        </Text>
      </View>

      <GradientButton
        title="Entrar"
        loading={loadingVisible}
        disabled={loadingVisible}
        onPress={() => run(onSubmit, { loadingText: 'Entrando...' })}
      />

      <View style={styles.signupRow}>
        <Text style={[styles.signupText, { color: isDark ? '#A6A6A6' : '#686868' }]}>Não tem conta? </Text>
        <Text onPress={() => navigation.navigate('Register', { role })} style={[styles.signupLink, { color: colors.primary }]}>Cadastre-se</Text>
      </View>

      {errorVisible && (
        <View style={[styles.bannerInline, { backgroundColor: themeColors.background, borderColor: colors.primary }]}>
          <Text style={[styles.bannerText, { color: themeColors.text }]} numberOfLines={2}>{errorMessage}</Text>
          <Text onPress={hideError} style={[styles.bannerActionText, { color: colors.primary }]}>Fechar</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center' },
  logoRow: { textAlign: 'center', marginBottom: 50 },
  logo: { fontSize: 36, fontWeight: 'bold' },
  logoEasy: { color: colors.primary },
  title: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  input: { padding: 15, borderRadius: 30, marginBottom: 15 },
  senhaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconeOlho: { position: 'absolute', right: 15 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  signupText: { fontSize: 14 },
  signupLink: { fontSize: 14, fontWeight: '700' },
  bannerInline: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerText: { flex: 1, marginRight: 12, fontSize: 14 },
  bannerActionText: { fontSize: 14, fontWeight: '700' },
});
