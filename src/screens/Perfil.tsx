import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ThemeToggleButton from '../components/ThemeToggleButton';
import { ThemeContext } from '../contexts/ThemeContext';
import {
  atualizarUsuario,
  deletarUsuario,
  listarFiliais,
  obterUsuarioPorId,
  UpdateUsuarioPayload,
  Usuario,
} from '../services/usuarios';
import { colors } from '../styles/colors';

function formatarCPF(valor: string) {
  const n = valor.replace(/\D/g, '');
  return n
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}

function formatarTelefone(valor: string) {
  const n = valor.replace(/\D/g, '');
  let v = n;
  if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length > 10) v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  else if (v.length > 9) v = v.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  return v;
}

export default function Perfil() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const navigation = useNavigation();

  const [imagem, setImagem] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);

  const [id, setId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [filial, setFilial] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [perfil, setPerfil] = useState<number>(0);
  const [filialId, setFilialId] = useState<number | null>(null);

  useEffect(() => {
    const carregar = async () => {
      const raw = await AsyncStorage.getItem('usuarioAtual');
      const foto = await AsyncStorage.getItem('fotoPerfil');
      if (foto) setImagem(foto);
      if (raw) {
        const u: Usuario = JSON.parse(raw);
        setId(u.id);
        setNome(u.nomeCompleto || '');
        setEmail(u.email || '');
        setTelefone(formatarTelefone(u.telefone || ''));
        setCpf(formatarCPF(u.cpf || ''));
        setFilial(u.cepFilial || '');
        setPerfil(u.perfil ?? 0);
        setFilialId(u.filialId ?? null);
        try {
          const fresh = await obterUsuarioPorId(u.id);
          setNome(fresh.nomeCompleto || '');
          setEmail(fresh.email || '');
          setTelefone(formatarTelefone(fresh.telefone || ''));
          setCpf(formatarCPF(fresh.cpf || ''));
          setFilial(fresh.cepFilial || '');
          setPerfil(fresh.perfil ?? 0);
          setFilialId(fresh.filialId ?? null);
          await AsyncStorage.setItem('usuarioAtual', JSON.stringify(fresh));
        } catch {}
      }
    };
    carregar();
  }, []);

  const handleEscolherFonteImagem = () => {
    Alert.alert('Selecionar imagem', 'Escolha uma opção', [
      {
        text: 'Galeria',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permissão necessária', 'Permita acesso à galeria.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImagem(uri);
            await AsyncStorage.setItem('fotoPerfil', uri);
          }
        },
      },
      {
        text: 'Câmera',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permissão necessária', 'Permita acesso à câmera.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImagem(uri);
            await AsyncStorage.setItem('fotoPerfil', uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const salvarAlteracoes = async () => {
    if (id == null) return;
    const cpfLimpo = cpf.replace(/\D/g, '');
    const telLimpo = telefone.replace(/\D/g, '');
    const cepLimpo = filial.replace(/\D/g, '');
    if (!nome.trim()) {
      Alert.alert('Nome inválido', 'Informe seu nome completo.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Email inválido', 'Informe um email válido.');
      return;
    }
    if (!/^\d{11}$/.test(cpfLimpo)) {
      Alert.alert('CPF inválido', 'Informe 11 dígitos.');
      return;
    }
    if (!/^\d{10,11}$/.test(telLimpo)) {
      Alert.alert('Telefone inválido', 'Informe DDD + número.');
      return;
    }

    let novoFilialId = filialId ?? 0;
    if (/^\d{8}$/.test(cepLimpo)) {
      try {
        const f = await listarFiliais(1, 200);
        const achada = f.items.find((x) => x.cep.replace(/\D/g, '') === cepLimpo);
        if (achada) novoFilialId = achada.id;
      } catch {}
    }

    const payload: UpdateUsuarioPayload = {
      nomeCompleto: nome,
      email,
      telefone: telLimpo,
      cpf: cpfLimpo,
      cepFilial: cepLimpo || '',
      senha: novaSenha || undefined,
      confirmarSenha: novaSenha || undefined,
      perfil,
      ativo: true,
      filialId: novoFilialId,
    };

    try {
      const atualizado = await atualizarUsuario(id, payload);
      await AsyncStorage.setItem('usuarioAtual', JSON.stringify(atualizado));
      setNovaSenha('');
      setEditando(false);
      Alert.alert('Sucesso', 'Informações atualizadas.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const apagarConta = async () => {
    if (id == null) return;
    Alert.alert('Apagar conta', 'Tem certeza? Esta ação é irreversível.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletarUsuario(id);
            await AsyncStorage.removeItem('usuarioAtual');
            await AsyncStorage.removeItem('token');
            Alert.alert('Conta apagada', 'Sua conta foi excluída.');
            // @ts-ignore
            navigation.navigate('Login', { role: perfil === 1 ? 'admin' : 'operador' });
          } catch {
            Alert.alert('Erro', 'Não foi possível apagar a conta.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />

      <Text style={[styles.logo, { color: themeColors.text }]}>
        <Text style={{ color: colors.primary }}>easy</Text>Moto
      </Text>

      <TouchableOpacity onPress={handleEscolherFonteImagem} activeOpacity={0.9}>
        <View style={styles.avatar}>
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.avatarImage} />
          ) : (
            <FontAwesome name="motorcycle" size={40} color="#888" />
          )}
        </View>
      </TouchableOpacity>

      <Text style={[styles.name, { color: themeColors.text }]}>{nome || 'Usuário'}</Text>
      <Text style={[styles.role, { color: themeColors.text }]}>
        {perfil === 1 ? 'Administrador' : 'Operador'}
      </Text>

      <Text style={[styles.section, { color: themeColors.text }]}>Dados:</Text>

      <TextInput
        style={styles.input}
        editable={editando}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome completo"
      />
      <TextInput
        style={styles.input}
        editable={editando}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        editable={editando}
        value={telefone}
        onChangeText={(v) => setTelefone(formatarTelefone(v))}
        placeholder="Telefone"
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        editable={editando}
        value={cpf}
        onChangeText={(v) => setCpf(formatarCPF(v))}
        placeholder="CPF"
      />
      <TextInput
        style={styles.input}
        editable={editando}
        value={filial}
        onChangeText={setFilial}
        placeholder="Filial"
      />

      {editando && (
        <TextInput
          style={styles.input}
          value={novaSenha}
          onChangeText={setNovaSenha}
          placeholder="Nova senha (opcional)"
          secureTextEntry
        />
      )}

      {!editando ? (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setEditando(true)}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Editar informações</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={salvarAlteracoes} activeOpacity={0.9}>
          <Text style={styles.buttonText}>Salvar alterações</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.deleteOutline} onPress={apagarConta} activeOpacity={0.9}>
        <Text style={styles.deleteOutlineText}>Apagar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 30, alignItems: 'center' },
  logo: { fontSize: 30, fontWeight: 'bold', marginBottom: 20 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e4e4e4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50 },
  name: { fontSize: 18, fontWeight: 'bold' },
  role: { fontSize: 14, marginBottom: 20 },
  section: { fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  input: {
    backgroundColor: '#e4e4e4',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#004d25',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  deleteOutline: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B00020',
  },
  deleteOutlineText: { color: '#B00020', fontWeight: 'bold' },
});
