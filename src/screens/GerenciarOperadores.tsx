import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ThemeToggleButton from '../components/ThemeToggleButton';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../services/api';
import {
  atualizarUsuario,
  criarUsuario,
  deletarUsuario,
  listarFiliais,
  listarUsuarios,
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
function desmascararCPF(v: string) {
  return v.replace(/\D/g, '');
}
function formatarTelefone(valor: string) {
  const n = valor.replace(/\D/g, '');
  let v = n;
  if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length > 10) v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  else if (v.length > 9) v = v.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  return v;
}
function desmascararTelefone(v: string) {
  return v.replace(/\D/g, '');
}
function formatarCEP(valor: string) {
  const n = valor.replace(/\D/g, '');
  return n.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
}
function desmascararCEP(v: string) {
  return v.replace(/\D/g, '');
}
function isNomeValido(v: string) {
  return /^[A-Za-zÀ-ú\s]+$/.test(v.trim());
}
function isEmailValido(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

type Form = {
  id?: number;
  nomeCompleto: string;
  email: string;
  senha?: string;
  cpf: string;
  cepFilial: string;
  telefone?: string;
};

export default function GerenciarOperadores() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [lista, setLista] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>({
    nomeCompleto: '',
    email: '',
    senha: '',
    cpf: '',
    cepFilial: '',
    telefone: '',
  });
  const [saving, setSaving] = useState(false);

  async function ensureAuthHeader() {
    const token = await AsyncStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async function carregar() {
    setLoading(true);
    try {
      await ensureAuthHeader();
      const res = await listarUsuarios(1, 200, 0);
      setLista(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setEditandoId(null);
    setForm({ nomeCompleto: '', email: '', senha: '', cpf: '', cepFilial: '', telefone: '' });
    setModalVisible(true);
  }

  function abrirEdicao(u: Usuario) {
    setEditandoId(u.id);
    setForm({
      id: u.id,
      nomeCompleto: u.nomeCompleto,
      email: u.email,
      senha: '',
      cpf: formatarCPF(u.cpf),
      cepFilial: formatarCEP(u.cepFilial),
      telefone: formatarTelefone(u.telefone || ''),
    });
    setModalVisible(true);
  }

  function validarFormulario(): { ok: boolean; msg?: string } {
    const nome = form.nomeCompleto;
    const email = form.email;
    const cpf = desmascararCPF(form.cpf);
    const cep = desmascararCEP(form.cepFilial);
    const tel = form.telefone ? desmascararTelefone(form.telefone) : '';
    if (!isNomeValido(nome))
      return { ok: false, msg: 'Nome inválido. Use apenas letras e espaços.' };
    if (!isEmailValido(email)) return { ok: false, msg: 'Email inválido.' };
    if (!/^\d{11}$/.test(cpf)) return { ok: false, msg: 'CPF inválido. Informe 11 dígitos.' };
    if (!/^\d{8}$/.test(cep)) return { ok: false, msg: 'CEP inválido. Informe 8 dígitos.' };
    if (tel && !/^\d{10,11}$/.test(tel))
      return { ok: false, msg: 'Telefone inválido. Use DDD + número (10 ou 11 dígitos).' };
    if (!editandoId && (!form.senha || form.senha.length < 8))
      return { ok: false, msg: 'Senha deve ter pelo menos 8 caracteres.' };
    if (editandoId && form.senha && form.senha.length < 8)
      return { ok: false, msg: 'Nova senha deve ter pelo menos 8 caracteres.' };
    return { ok: true };
  }

  async function salvar() {
    const check = validarFormulario();
    if (!check.ok) {
      Alert.alert('Atenção', check.msg || 'Verifique os campos.');
      return;
    }

    setSaving(true);
    await ensureAuthHeader();

    const cpf = desmascararCPF(form.cpf);
    const cep = desmascararCEP(form.cepFilial);
    const tel = form.telefone ? desmascararTelefone(form.telefone) : '';

    let filialId: number | undefined = undefined;
    try {
      const filiais = await listarFiliais(1, 200);
      const filial = filiais.items.find((f) => f.cep.replace(/\D/g, '') === cep);
      if (filial) filialId = filial.id;
    } catch {}

    try {
      if (editandoId) {
        const payload = {
          nomeCompleto: form.nomeCompleto.trim(),
          email: form.email.trim(),
          telefone: tel,
          cpf,
          cepFilial: cep,
          senha: form.senha || undefined,
          confirmarSenha: form.senha || undefined,
          perfil: 0,
          ativo: true,
          filialId,
        };
        await atualizarUsuario(editandoId, payload);
      } else {
        const payload = {
          nomeCompleto: form.nomeCompleto.trim(),
          email: form.email.trim(),
          telefone: tel,
          cpf,
          cepFilial: cep,
          senha: form.senha as string,
          confirmarSenha: form.senha as string,
          perfil: 0,
          ativo: true,
          filialId,
        };
        await criarUsuario(payload);
      }
      setModalVisible(false);
      await carregar();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        Alert.alert(
          'Erro',
          'Não foi possível salvar. Verifique o CEP da filial e os dados informados.',
        );
      } else {
        Alert.alert('Erro', 'Não foi possível salvar.');
      }
    } finally {
      setSaving(false);
    }
  }

  function excluir(id: number) {
    Alert.alert('Excluir', 'Deseja remover este operador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await ensureAuthHeader();
            await deletarUsuario(id);
            await carregar();
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.logo, { color: themeColors.text }]}>
        <Text style={{ color: colors.primary }}>easy</Text>Moto
      </Text>

      <TouchableOpacity
        style={styles.botaoPrincipal}
        onPress={abrirNovo}
        activeOpacity={0.9}
        disabled={saving}
      >
        <Text style={styles.botaoPrincipalTexto}>
          {saving ? 'Salvando...' : 'Cadastrar operador'}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: themeColors.text }}>Carregando operadores...</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {lista.map((u) => (
            <View
              key={u.id}
              style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}
            >
              <FontAwesome name="user" size={22} color={isDark ? '#00c853' : colors.buttonBg} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.cardTitulo, { color: themeColors.text }]}>
                  {u.nomeCompleto}
                </Text>
                <Text style={{ color: isDark ? '#ccc' : '#666' }}>{u.email}</Text>
                <Text style={{ color: isDark ? '#ccc' : '#666' }}>Filial CEP: {u.cepFilial}</Text>
              </View>
              <TouchableOpacity onPress={() => abrirEdicao(u)} style={{ paddingHorizontal: 8 }}>
                <Text style={styles.linkEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => excluir(u.id)} style={{ paddingHorizontal: 8 }}>
                <Text style={styles.linkExcluir}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ))}
          {lista.length === 0 && (
            <Text style={{ color: themeColors.text, textAlign: 'center', marginTop: 20 }}>
              Nenhum operador encontrado.
            </Text>
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.modalTitulo, { color: themeColors.text }]}>
              {editandoId ? 'Editar Operador' : 'Novo Operador'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#aaa"
              value={form.nomeCompleto}
              onChangeText={(t) => {
                const limpo = t.replace(/[^A-Za-zÀ-ú\s]/g, '');
                setForm((p) => ({ ...p, nomeCompleto: limpo }));
              }}
              maxLength={60}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={form.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
              maxLength={80}
            />
            {!editandoId && (
              <TextInput
                style={styles.input}
                placeholder="Senha (mín. 8)"
                placeholderTextColor="#aaa"
                value={form.senha}
                secureTextEntry
                onChangeText={(t) => setForm((p) => ({ ...p, senha: t }))}
                maxLength={32}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="CPF"
              placeholderTextColor="#aaa"
              value={form.cpf}
              onChangeText={(t) => setForm((p) => ({ ...p, cpf: formatarCPF(t) }))}
              keyboardType="number-pad"
              maxLength={14}
            />
            <TextInput
              style={styles.input}
              placeholder="CEP da Filial"
              placeholderTextColor="#aaa"
              value={form.cepFilial}
              onChangeText={(t) => setForm((p) => ({ ...p, cepFilial: formatarCEP(t) }))}
              keyboardType="number-pad"
              maxLength={9}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor="#aaa"
              value={form.telefone || ''}
              onChangeText={(t) => setForm((p) => ({ ...p, telefone: formatarTelefone(t) }))}
              keyboardType="phone-pad"
              maxLength={15}
            />

            <TouchableOpacity
              style={styles.botaoPrincipal}
              onPress={salvar}
              activeOpacity={0.9}
              disabled={saving}
            >
              <Text style={styles.botaoPrincipalTexto}>
                {saving ? 'Salvando...' : editandoId ? 'Salvar' : 'Cadastrar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
              disabled={saving}
            >
              <Text style={{ marginTop: 10, color: themeColors.text, textAlign: 'center' }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  logo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  botaoPrincipal: {
    backgroundColor: '#00c853',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 12,
  },
  botaoPrincipalTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardTitulo: { fontSize: 16, fontWeight: '600' },
  linkEditar: { color: '#2196f3', fontWeight: 'bold' },
  linkExcluir: { color: '#ff5252', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { width: '92%', padding: 20, borderRadius: 12 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    backgroundColor: '#e4e4e4',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
});
