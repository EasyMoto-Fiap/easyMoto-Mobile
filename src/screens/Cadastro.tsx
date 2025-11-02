import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller } from 'react-hook-form';

import ErrorSnackbar from '../components/ErrorSnackbar';
import ThemeToggleButton from '../components/ThemeToggleButton';
import VoltarParaHome from '../components/VoltarParaHome';
import { ThemeContext } from '../contexts/ThemeContext';
import useRequest from '../hooks/useRequest';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { criarUsuario, listarFiliais, buscarUsuarioPorEmail } from '../services/usuarios';
import { colors } from '../styles/colors';
import GradientButton from '../components/GradientButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { useCadastroForm, formatarCEP, formatarCPF, formatarTelefone } from '../components/FormValidation';

export default function Cadastro() {
  const route = useRoute<RouteProp<RootStackParamList, 'Register'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const role = route.params?.role;

  const { theme } = useContext(ThemeContext);
  const themeColors = theme === 'dark' ? colors.dark : colors.light;

  const { run, loadingVisible, errorVisible: reqErrorVisible, errorMessage: reqErrorMessage, hideError } = useRequest();
  const { control, handleSubmit, formState: { isValid, errors } } = useCadastroForm();

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  async function submit(values: any) {
    const existente = await buscarUsuarioPorEmail(values.email);
    if (existente) {
      Alert.alert('Email já cadastrado', 'Use outro email ou faça login.');
      return;
    }
    const perfil = role === 'operador' ? 0 : 1;
    const filiais = await listarFiliais(1, 100);
    const cepLimpo = values.cep.replace(/\D/g, '');
    const filial = filiais.items.find((f: any) => f.cep.replace(/\D/g, '') === cepLimpo);
    if (!filial) {
      Alert.alert('Filial não encontrada', 'Nenhuma filial com este CEP.');
      return;
    }
    const usuario = await criarUsuario({
      nomeCompleto: values.nome,
      email: values.email,
      telefone: values.telefone.replace(/\D/g, ''),
      cpf: values.cpf.replace(/\D/g, ''),
      cepFilial: cepLimpo,
      senha: values.senha,
      confirmarSenha: values.confirmarSenha,
      perfil,
      ativo: true,
      filialId: filial.id,
    });
    await AsyncStorage.setItem('usuarioAtual', JSON.stringify(usuario));
    Alert.alert('Cadastro realizado com sucesso!');
    navigation.replace(perfil === 0 ? 'HomeOperador' : 'HomeAdmin');
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.toggle}><ThemeToggleButton /></View>

      <View style={styles.content}>
        <Text style={styles.logoRow}><LogoEasyMoto size={38} /></Text>

        <Text style={[styles.title, { color: themeColors.text }]}>
          Cadastro do {role === 'operador' ? 'operador' : 'administrador'}:
        </Text>

        <View style={styles.field}>
          <Controller
            control={control}
            name="nome"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: '#000' }, errors.nome && styles.inputError]}
                placeholder="Nome:"
                placeholderTextColor="#666"
                onBlur={onBlur}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.nome && <Text style={styles.errorText}>{errors.nome.message as string}</Text>}
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: '#000' }, errors.email && styles.inputError]}
                placeholder="Email:"
                placeholderTextColor="#666"
                autoCapitalize="none"
                onBlur={onBlur}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message as string}</Text>}
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="telefone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: '#000' }, errors.telefone && styles.inputError]}
                placeholder="Telefone:"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                onBlur={onBlur}
                value={value}
                onChangeText={(v) => onChange(formatarTelefone(v))}
              />
            )}
          />
          {errors.telefone && <Text style={styles.errorText}>{errors.telefone.message as string}</Text>}
        </View>

        <View style={[styles.field, styles.senhaContainer]}>
          <Controller
            control={control}
            name="senha"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: '#000', paddingRight: 48 }, errors.senha && styles.inputError]}
                placeholder="Senha:"
                placeholderTextColor="#666"
                secureTextEntry={!mostrarSenha}
                onBlur={onBlur}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <TouchableOpacity onPress={() => setMostrarSenha(v => !v)} style={styles.iconeOlho}>
            <FontAwesome name={mostrarSenha ? 'eye' : 'eye-slash'} size={20} color="#666" />
          </TouchableOpacity>
          {errors.senha && <Text style={styles.errorText}>{errors.senha.message as string}</Text>}
        </View>

        <View style={[styles.field, styles.senhaContainer]}>
          <Controller
            control={control}
            name="confirmarSenha"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: '#000', paddingRight: 48 }, errors.confirmarSenha && styles.inputError]}
                placeholder="Confirmar senha:"
                placeholderTextColor="#666"
                secureTextEntry={!mostrarConfirmar}
                onBlur={onBlur}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <TouchableOpacity onPress={() => setMostrarConfirmar(v => !v)} style={styles.iconeOlho}>
            <FontAwesome name={mostrarConfirmar ? 'eye' : 'eye-slash'} size={20} color="#666" />
          </TouchableOpacity>
          {errors.confirmarSenha && <Text style={styles.errorText}>{errors.confirmarSenha.message as string}</Text>}
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="cpf"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: '#000' }, errors.cpf && styles.inputError]}
                placeholder="CPF:"
                placeholderTextColor="#666"
                onBlur={onBlur}
                value={value}
                onChangeText={(v) => onChange(formatarCPF(v))}
              />
            )}
          />
          {errors.cpf && <Text style={styles.errorText}>{errors.cpf.message as string}</Text>}
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="cep"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: '#000' }, errors.cep && styles.inputError]}
                placeholder="CEP da Filial:"
                placeholderTextColor="#666"
                onBlur={onBlur}
                value={value}
                onChangeText={(v) => onChange(formatarCEP(v))}
              />
            )}
          />
          {errors.cep && <Text style={styles.errorText}>{errors.cep.message as string}</Text>}
        </View>

        <View style={styles.buttonWrapper}>
          <GradientButton title="Acessar" onPress={() => run(handleSubmit(submit), { loadingText: 'Cadastrando...' })} loading={loadingVisible} disabled={!isValid || loadingVisible} />
        </View>

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: theme === 'dark' ? '#A6A6A6' : '#686868' }]}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Faça login</Text>
          </TouchableOpacity>
        </View>
      </View>

      <VoltarParaHome />
      <ErrorSnackbar visible={reqErrorVisible} message={reqErrorMessage} onDismiss={hideError} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  toggle: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  content: { width: '100%', maxWidth: 420, alignSelf: 'center', paddingBottom: 90 },
  logoRow: { alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, marginBottom: 16, textAlign: 'center' },
  field: { marginBottom: 12 },
  input: { padding: 16, borderRadius: 30 },
  inputError: { borderWidth: 1, borderColor: '#D93025' },
  errorText: { marginTop: 6, marginLeft: 12, fontSize: 12, color: '#D93025' },
  senhaContainer: { position: 'relative' },
  iconeOlho: { position: 'absolute', right: 18, top: 18 },
  buttonWrapper: { marginTop: 8, marginBottom: 12 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: '700' },
});
