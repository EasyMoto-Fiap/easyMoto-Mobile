import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller } from 'react-hook-form';

import ThemeToggleButton from '../components/ThemeToggleButton';
import VoltarParaHome from '../components/VoltarParaHome';
import { ThemeContext } from '../contexts/ThemeContext';
import useRequest from '../hooks/useRequest';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { login } from '../services/auth';
import { colors } from '../styles/colors';
import GradientButton from '../components/GradientButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { useLoginForm } from '../components/FormValidation';

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const role = route.params?.role;

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { run, loadingVisible, errorVisible, errorMessage, hideError } = useRequest();
  const { control, handleSubmit, formState: { isValid, errors } } = useLoginForm();

  async function submit(values: { email: string; senha: string }) {
    try {
      const resp = await login({ email: values.email, senha: values.senha });
      if (role === 'operador' && resp.usuario.perfil !== 0) throw new Error('Você tentou logar como Operador usando uma conta de Administrador.');
      if (role === 'admin' && resp.usuario.perfil !== 1) throw new Error('Você tentou logar como Administrador usando uma conta de Operador.');
      await AsyncStorage.setItem('token', resp.token ?? '');
      await AsyncStorage.setItem('usuarioAtual', JSON.stringify(resp.usuario));
      navigation.replace(resp.usuario.perfil === 0 ? 'HomeOperador' : 'HomeAdmin');
    } catch (err: any) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuarioAtual');
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) throw new Error('Email ou senha inválidos');
        if (!err.response) throw new Error('Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente.');
      }
      throw err;
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.toggle}><ThemeToggleButton /></View>

      <View style={styles.content}>
        <Text style={styles.logoRow}>
          <LogoEasyMoto size={38} />
        </Text>

        <Text style={[styles.title, { color: themeColors.text }]}>
          {role === 'admin' ? 'Login Administrador' : 'Login Operador'}
        </Text>

        <View style={styles.field}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: '#111' }, errors.email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor="#666"
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={onBlur}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message as string}</Text>}
        </View>

        <View style={[styles.field, styles.senhaContainer]}>
          <Controller
            control={control}
            name="senha"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: '#111', paddingRight: 48 }, errors.senha && styles.inputError]}
                placeholder="Senha"
                placeholderTextColor="#666"
                secureTextEntry={!mostrarSenha}
                onBlur={onBlur}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <Text onPress={() => setMostrarSenha(v => !v)} style={styles.iconeOlho}>
            <FontAwesome name={mostrarSenha ? 'eye-slash' : 'eye'} size={20} color="#666" />
          </Text>
          {errors.senha && <Text style={styles.errorText}>{errors.senha.message as string}</Text>}
        </View>

        <View style={styles.buttonWrapper}>
          <GradientButton
            title="Entrar"
            loading={loadingVisible}
            disabled={!isValid || loadingVisible}
            onPress={() => run(handleSubmit(submit), { loadingText: 'Entrando...' })}
          />
        </View>

        <View style={styles.signupRow}>
          <Text style={[styles.signupText, { color: isDark ? '#A6A6A6' : '#686868' }]}>Não possui conta? </Text>
          <Text onPress={() => navigation.navigate('Register', { role })} style={[styles.signupLink, { color: colors.primary }]}>Cadastre-se</Text>
        </View>

        {errorVisible && (
          <View style={[styles.bannerInline, { backgroundColor: themeColors.background, borderColor: colors.primary }]}>
            <Text style={[styles.bannerText, { color: themeColors.text }]} numberOfLines={2}>{errorMessage}</Text>
            <Text onPress={hideError} style={[styles.bannerActionText, { color: colors.primary }]}>Fechar</Text>
          </View>
        )}
      </View>

      <VoltarParaHome />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  toggle: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  content: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  logoRow: { alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, marginBottom: 16, textAlign: 'center' },
  field: { marginBottom: 12 },
  input: { padding: 16, borderRadius: 30 },
  inputError: { borderWidth: 1, borderColor: '#D93025' },
  errorText: { marginTop: 6, marginLeft: 12, fontSize: 12, color: '#D93025' },
  senhaContainer: { position: 'relative' },
  iconeOlho: { position: 'absolute', right: 18, top: 18 },
  buttonWrapper: { marginTop: 8, marginBottom: 12 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  signupText: { fontSize: 14 },
  signupLink: { fontSize: 14, fontWeight: '700' },
  bannerInline: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerText: { flex: 1, marginRight: 12, fontSize: 14 },
  bannerActionText: { fontSize: 14, fontWeight: '700' },
});
