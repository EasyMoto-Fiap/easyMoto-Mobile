import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ThemeToggleButton from '../components/ThemeToggleButton';
import LanguageToggleButton from '../components/LanguageToggleButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import api from '../services/api';
import { atualizarUsuario, criarUsuario, deletarUsuario, listarFiliais, listarUsuarios, Usuario } from '../services/usuarios';
import { colors } from '../styles/colors';
import { t } from '../i18n';

function formatarCPF(valor: string) {
  const n = valor.replace(/\D/g, '');
  return n.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}
function desmascararCPF(v: string) { return v.replace(/\D/g, ''); }
function formatarTelefone(valor: string) {
  const n = valor.replace(/\D/g, '');
  let v = n;
  if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length > 10) v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  else if (v.length > 9) v = v.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  return v;
}
function desmascararTelefone(v: string) { return v.replace(/\D/g, ''); }
function formatarCEP(valor: string) { return valor.replace(/\D/g, '').replace(/^(\d{5})(\d{1,3})/, '$1-$2'); }
function desmascararCEP(v: string) { return v.replace(/\D/g, ''); }
function isNomeValido(v: string) { return /^[A-Za-zÀ-ú\s]+$/.test(v.trim()); }
function isEmailValido(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

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
  useContext(LanguageContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [lista, setLista] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>({ nomeCompleto: '', email: '', senha: '', cpf: '', cepFilial: '', telefone: '' });
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

  useEffect(() => { carregar(); }, []);

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
    if (!isNomeValido(nome)) return { ok: false, msg: t('operators.validation.nomeInvalido') };
    if (!isEmailValido(email)) return { ok: false, msg: t('operators.validation.emailInvalido') };
    if (!/^\d{11}$/.test(cpf)) return { ok: false, msg: t('operators.validation.cpfInvalido') };
    if (!/^\d{8}$/.test(cep)) return { ok: false, msg: t('operators.validation.cepInvalido') };
    if (tel && !/^\d{10,11}$/.test(tel)) return { ok: false, msg: t('operators.validation.telefoneInvalido') };
    if (!editandoId && (!form.senha || form.senha.length < 8)) return { ok: false, msg: t('operators.validation.senhaCurta') };
    if (editandoId && form.senha && form.senha.length < 8) return { ok: false, msg: t('operators.validation.novaSenhaCurta') };
    return { ok: true };
  }

  async function salvar() {
    const check = validarFormulario();
    if (!check.ok) {
      Alert.alert(t('operators.alert'), check.msg || t('operators.checkFields'));
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
        Alert.alert(t('operators.error'), t('operators.errorSaveCepDados'));
      } else {
        Alert.alert(t('operators.error'), t('operators.errorSave'));
      }
    } finally {
      setSaving(false);
    }
  }

  function excluir(id: number) {
    Alert.alert(t('operators.delete.title'), t('operators.delete.message'), [
      { text: t('operators.delete.cancel'), style: 'cancel' },
      {
        text: t('operators.delete.remove'),
        style: 'destructive',
        onPress: async () => {
          try {
            await ensureAuthHeader();
            await deletarUsuario(id);
            await carregar();
          } catch {
            Alert.alert(t('operators.error'), t('operators.errorDelete'));
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.toggle}><ThemeToggleButton /></View>
      <View style={styles.langBadge}><LanguageToggleButton /></View>
      <View style={styles.logoRow}><LogoEasyMoto size={42} /></View>

      <TouchableOpacity style={styles.botaoPrincipal} onPress={abrirNovo} activeOpacity={0.9} disabled={saving}>
        <Text style={styles.botaoPrincipalTexto}>{saving ? t('operators.saving') : t('operators.create')}</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 10, color: themeColors.text }}>{t('operators.loading')}</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {lista.map((u) => (
            <View key={u.id} style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}>
              <FontAwesome name="user" size={22} color={isDark ? '#00c853' : colors.buttonBg} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.cardTitulo, { color: themeColors.text }]}>{u.nomeCompleto}</Text>
                <Text style={{ color: isDark ? '#ccc' : '#666' }}>{u.email}</Text>
                <Text style={{ color: isDark ? '#ccc' : '#666' }}>{t('operators.branchCep')}: {u.cepFilial}</Text>
              </View>
              <TouchableOpacity onPress={() => abrirEdicao(u)} style={{ paddingHorizontal: 8 }}>
                <Text style={styles.linkEditar}>{t('operators.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => excluir(u.id)} style={{ paddingHorizontal: 8 }}>
                <Text style={styles.linkExcluir}>{t('operators.delete.short')}</Text>
              </TouchableOpacity>
            </View>
          ))}
          {lista.length === 0 && (
            <Text style={{ color: themeColors.text, textAlign: 'center', marginTop: 20 }}>
              {t('operators.empty')}
            </Text>
          )}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.modalTitulo, { color: themeColors.text }]}>
              {editandoId ? t('operators.modal.editTitle') : t('operators.modal.newTitle')}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t('operators.fields.nome')}
              placeholderTextColor="#aaa"
              value={form.nomeCompleto}
              onChangeText={(tvalue) => {
                const limpo = tvalue.replace(/[^A-Za-zÀ-ú\s]/g, '');
                setForm((p) => ({ ...p, nomeCompleto: limpo }));
              }}
              maxLength={60}
            />
            <TextInput
              style={styles.input}
              placeholder={t('operators.fields.email')}
              placeholderTextColor="#aaa"
              value={form.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(tvalue) => setForm((p) => ({ ...p, email: tvalue }))}
              maxLength={80}
            />
            {!editandoId && (
              <TextInput
                style={styles.input}
                placeholder={t('operators.fields.senhaMin')}
                placeholderTextColor="#aaa"
                value={form.senha}
                secureTextEntry
                onChangeText={(tvalue) => setForm((p) => ({ ...p, senha: tvalue }))}
                maxLength={32}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder={t('operators.fields.cpf')}
              placeholderTextColor="#aaa"
              value={form.cpf}
              onChangeText={(tvalue) => setForm((p) => ({ ...p, cpf: formatarCPF(tvalue) }))}
              keyboardType="number-pad"
              maxLength={14}
            />
            <TextInput
              style={styles.input}
              placeholder={t('operators.fields.cepFilial')}
              placeholderTextColor="#aaa"
              value={form.cepFilial}
              onChangeText={(tvalue) => setForm((p) => ({ ...p, cepFilial: formatarCEP(tvalue) }))}
              keyboardType="number-pad"
              maxLength={9}
            />
            <TextInput
              style={styles.input}
              placeholder={t('operators.fields.telefone')}
              placeholderTextColor="#aaa"
              value={form.telefone || ''}
              onChangeText={(tvalue) => setForm((p) => ({ ...p, telefone: formatarTelefone(tvalue) }))}
              keyboardType="phone-pad"
              maxLength={15}
            />

            <TouchableOpacity style={styles.botaoPrincipal} onPress={salvar} activeOpacity={0.9} disabled={saving}>
              <Text style={styles.botaoPrincipalTexto}>{saving ? t('operators.saving') : (editandoId ? t('operators.save') : t('operators.register'))}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8} disabled={saving}>
              <Text style={{ marginTop: 10, color: themeColors.text, textAlign: 'center' }}>{t('operators.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 120, paddingHorizontal: 22 },
  toggle: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  langBadge: { position: 'absolute', top: 16, right: 56, zIndex: 10, padding: 38, paddingRight: 12 },
  logoRow: { alignSelf: 'center', marginBottom: 16 },
  botaoPrincipal: { backgroundColor: '#00c853', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 12 },
  botaoPrincipalTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTitulo: { fontSize: 16, fontWeight: '600' },
  linkEditar: { color: '#2196f3', fontWeight: 'bold' },
  linkExcluir: { color: '#ff5252', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', padding: 20, borderRadius: 12 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#e4e4e4', padding: 12, borderRadius: 10, width: '100%', marginBottom: 10 },
});
