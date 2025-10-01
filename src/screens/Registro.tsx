import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Modal, Animated, Easing, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { useContext, useState, useEffect, useRef } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';
import api from '../services/api';
import axios from 'axios';
import { listarMotos, criarMoto, atualizarMoto, deletarMoto, type Moto as MotoAPI, type CategoriaNum, type StatusOperacionalNum } from '../services/motos';
import { registrarEntradaPatio } from '../services/patio';
import { criarNotificacao } from '../services/notificacoes';

type TipoMoto = 'Pop' | 'Sport' | 'E';
type CorHex = '#e6c300' | '#0074cc' | '#ff4500' | '#ff0000' | '#808080' | '#006400' | '#da70d6';

type MotoUI = {
  id: number;
  placa: string;
  modelo: string;
  ano: number;
  tipo: TipoMoto;
  cor: CorHex;
  statusOperacional: StatusOperacionalNum;
};

type NovaMotoState = {
  placa: string;
  modelo: string;
  ano: string;
  tipo: TipoMoto;
  cor: CorHex;
  statusOperacional: StatusOperacionalNum;
};

const legendaLabelPorCor: Record<CorHex, string> = {
  '#e6c300': 'Pendência',
  '#0074cc': 'Reparos Simples',
  '#ff4500': 'Danos Estruturais Graves',
  '#ff0000': 'Sinistro',
  '#808080': 'Sem Placa',
  '#006400': 'Pronta para Aluguel',
  '#da70d6': 'Sem Placa'
};

const legendaIdPorCor: Record<CorHex, number> = {
  '#e6c300': 1,
  '#0074cc': 2,
  '#ff4500': 3,
  '#ff0000': 4,
  '#808080': 5,
  '#006400': 6,
  '#da70d6': 7
};

const categoriaMap: Record<TipoMoto, CategoriaNum> = { Pop: 0, Sport: 1, E: 2 };
const categoriaReverse: Record<CategoriaNum, TipoMoto> = { 0: 'Pop', 1: 'Sport', 2: 'E' };

const statusOps = [
  { label: 'Disponível', value: 0 as StatusOperacionalNum, color: '#006400' },
  { label: 'Alugada', value: 1 as StatusOperacionalNum, color: '#e6c300' },
  { label: 'Manutenção', value: 2 as StatusOperacionalNum, color: '#0074cc' }
];

export default function Registro() {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = {
    background: isDark ? '#1e1e1e' : '#f3f3f3',
    card: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#f2f2f2' : '#111',
    subtext: isDark ? '#bdbdbd' : '#555',
    border: isDark ? '#2a2a2a' : '#e5e5e5',
    shadow: '#000'
  };

  const [motos, setMotos] = useState<MotoUI[]>([]);
  const [novaMoto, setNovaMoto] = useState<NovaMotoState>({ placa: '', modelo: '', ano: '', tipo: 'Pop', cor: '#006400', statusOperacional: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoMoto | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  function openModal(editId?: number) {
    setEditandoId(editId ?? null);
    if (editId) {
      const m = motos.find(x => x.id === editId);
      if (m) {
        setNovaMoto({
          placa: m.placa,
          modelo: m.modelo,
          ano: String(m.ano),
          tipo: m.tipo,
          cor: m.cor as CorHex,
          statusOperacional: m.statusOperacional
        });
      }
    } else {
      setNovaMoto({ placa: '', modelo: '', ano: '', tipo: 'Pop', cor: '#006400', statusOperacional: 0 });
    }
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true })
    ]).start();
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 150, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true })
    ]).start(({ finished }) => {
      if (finished) setModalVisible(false);
    });
  }

  function formatarPlaca(v: string) {
    return v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
  }

  function motosPorTipo(tipo: TipoMoto) {
    return motos.filter(m => m.tipo === tipo);
  }

  function validar() {
    const placa = novaMoto.placa.trim().toUpperCase();
    const modelo = novaMoto.modelo.trim();
    const anoNum = Number(novaMoto.ano);
    const anoAtual = new Date().getFullYear() + 1;
    if (!/^[A-Z0-9]{7}$/.test(placa)) { Alert.alert('Placa inválida', 'A placa deve ter exatamente 7 caracteres (letras e números).'); return false; }
    if (!modelo) { Alert.alert('Modelo inválido', 'Informe o modelo.'); return false; }
    if (!Number.isInteger(anoNum) || anoNum < 1980 || anoNum > anoAtual) { Alert.alert('Ano inválido', `Informe um ano entre 1980 e ${anoAtual}.`); return false; }
    return true;
  }

  function parseDotNetError(err: any): string | undefined {
    if (!axios.isAxiosError(err)) return;
    const data = err.response?.data;
    if (!data) return;
    if (typeof data === 'string') return data;
    const msgs: string[] = [];
    if (data.message) msgs.push(String(data.message));
    if (data.title && (!msgs.length || data.title !== msgs[0])) msgs.push(String(data.title));
    if (data.errors && typeof data.errors === 'object') {
      Object.values<any>(data.errors).forEach((arr) => {
        if (Array.isArray(arr)) arr.forEach((m) => msgs.push(String(m)));
      });
    }
    return msgs.filter(Boolean).join('\n');
  }

  async function ensureAuthHeader() {
    const token = await AsyncStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.defaults.timeout = 60000;
  }

  async function carregar() {
    try {
      await ensureAuthHeader();
      const res: any = await listarMotos(1, 500);
      const src: MotoAPI[] = (Array.isArray(res) ? res : (res?.items ?? [])) as MotoAPI[];
      const items: MotoUI[] = src.map((m: MotoAPI): MotoUI => ({
        id: m.id,
        placa: m.placa,
        modelo: m.modelo,
        ano: m.ano,
        tipo: categoriaReverse[m.categoria],
        cor: ((Object.keys(legendaIdPorCor).find((c) => legendaIdPorCor[c as CorHex] === m.legendaStatusId) as CorHex) ?? (m.cor as CorHex) ?? '#006400') as CorHex,
        statusOperacional: m.statusOperacional as StatusOperacionalNum
      }));
      setMotos(items);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as motos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function isTransientAxiosError(e: any) {
    if (!axios.isAxiosError(e)) return false;
    if (e.response) return false;
    if (e.code === 'ECONNABORTED') return true;
    if (typeof e.message === 'string' && e.message.toLowerCase().includes('network')) return true;
    return true;
  }

  async function salvar() {
    if (saving) return;
    if (!validar()) return;
    await ensureAuthHeader();
    const userRaw = await AsyncStorage.getItem('usuarioAtual');
    const user = userRaw ? JSON.parse(userRaw) : undefined;
    const filialId = user?.filialId;
    const usuarioOrigemId = user?.id;
    if (!filialId) { Alert.alert('Filial não encontrada', 'Não foi possível identificar a filial do usuário.'); return; }
    const placaSan = novaMoto.placa.trim().toUpperCase();
    const payload = {
      placa: placaSan,
      modelo: novaMoto.modelo.trim(),
      ano: Number(novaMoto.ano),
      ativo: true,
      filialId,
      categoria: categoriaMap[novaMoto.tipo],
      statusOperacional: novaMoto.statusOperacional,
      legendaStatusId: legendaIdPorCor[novaMoto.cor],
      qrCode: `MOTO-${placaSan}`,
      cor: novaMoto.cor
    };
    setSaving(true);
    try {
      if (editandoId) {
        await atualizarMoto(editandoId, payload as any);
        try {
          if (usuarioOrigemId) await criarNotificacao({ tipo: 1, mensagem: 'Moto atualizada', motoId: editandoId, usuarioOrigemId, escopo: 0 });
        } catch {}
      } else {
        let created: any = null;
        try {
          created = await criarMoto(payload as any);
        } catch (e: any) {
          if (isTransientAxiosError(e)) {
            try {
              const res = await listarMotos(1, 50);
              const src: MotoAPI[] = (Array.isArray(res) ? res : (res as any)?.items ?? []) as MotoAPI[];
              const existente = src.find((m: MotoAPI) => m.placa?.toUpperCase() === placaSan);
              if (existente) created = existente;
            } catch {}
          }
          if (!created) throw e;
        }
        if (created?.id) {
          try {
            await registrarEntradaPatio({ motoId: created.id, filialId, statusOperacional: payload.statusOperacional });
          } catch {}
          try {
            if (usuarioOrigemId) await criarNotificacao({ tipo: 0, mensagem: 'Moto cadastrada', motoId: created.id, usuarioOrigemId, escopo: 0 });
          } catch {}
        }
        const novoUI: MotoUI = {
          id: created?.id ?? Math.floor(Math.random() * 1e9),
          placa: payload.placa,
          modelo: payload.modelo,
          ano: payload.ano,
          tipo: novaMoto.tipo,
          cor: novaMoto.cor,
          statusOperacional: payload.statusOperacional
        };
        setMotos(prev => [novoUI, ...prev]);
      }
    } catch (err: any) {
      setSaving(false);
      const msg = parseDotNetError(err);
      if (msg) { Alert.alert('Erro', msg); return; }
      if (axios.isAxiosError(err) && err.response?.status === 409) { Alert.alert('Placa já cadastrada', 'A placa informada já existe.'); return; }
      if (axios.isAxiosError(err) && err.response?.status === 400) { Alert.alert('Dados inválidos', 'Verifique os campos e tente novamente.'); return; }
      Alert.alert('Erro', 'Não foi possível salvar.');
      return;
    }
    setSaving(false);
    closeModal();
    carregar().catch(() => {});
  }

  function excluir(id: number) {
    Alert.alert('Excluir', 'Deseja remover esta moto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await ensureAuthHeader();
            await deletarMoto(id);
            setMotos(prev => prev.filter(m => m.id !== id));
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        }
      }
    ]);
  }

  function Segmented<T extends string | number>({ items, value, onChange }: { items: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
    const isDarkLocal = isDark;
    return (
      <View style={[styles.segmented, { borderColor: isDarkLocal ? '#2a2a2a' : '#e5e5e5', backgroundColor: isDarkLocal ? '#0f0f0f' : '#fff' }]}>
        {items.map((it, i) => {
          const selected = it.value === value;
          return (
            <TouchableOpacity
              key={String(it.value)}
              style={[styles.segmentedItem, selected && { backgroundColor: colors.primary }, i > 0 && { borderLeftWidth: 1, borderLeftColor: isDarkLocal ? '#2a2a2a' : '#e5e5e5' }]}
              activeOpacity={0.9}
              onPress={() => onChange(it.value)}
            >
              <Text style={[styles.segmentedText, { color: selected ? '#fff' : (isDarkLocal ? '#bdbdbd' : '#666') }]}>{it.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const motosFiltradas = filtroTipo ? motosPorTipo(filtroTipo) : motos;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.logo, { color: themeColors.text }]}><Text style={{ color: colors.primary }}>easy</Text>Moto</Text>
        <View style={styles.themeBtn}><ThemeToggleButton /></View>
      </View>

      <View style={styles.content}>
        <View style={[styles.tabs, { borderColor: themeColors.border }]}>
          {(['Pop', 'Sport', 'E'] as TipoMoto[]).map((tipo) => {
            const selected = filtroTipo === tipo;
            return (
              <TouchableOpacity key={tipo} style={[styles.tab, { borderColor: selected ? colors.primary : themeColors.border, backgroundColor: themeColors.card }]} onPress={() => setFiltroTipo(prev => prev === tipo ? null : tipo)} activeOpacity={0.9}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FontAwesome name={tipo === 'Pop' ? 'motorcycle' : tipo === 'Sport' ? 'bolt' : 'battery'} size={14} color={colors.primary} />
                  <Text style={[styles.tabTitle, { color: themeColors.text }]}>{tipo}</Text>
                </View>
                <View style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{motosPorTipo(tipo).length}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {motosFiltradas.map((m) => (
            <View key={m.id} style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, shadowColor: themeColors.shadow }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <FontAwesome name="motorcycle" size={14} color={m.cor} style={{ marginRight: 8 }} />
                <Text style={{ color: themeColors.text, fontWeight: '800' }}>{m.modelo} • {m.placa}</Text>
              </View>
              <Text style={{ color: themeColors.subtext, marginBottom: 6 }}>Ano {m.ano} • {m.tipo}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => openModal(m.id)} style={styles.linkBtn}>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => excluir(m.id)} style={styles.linkBtn}>
                  <Text style={{ color: '#e53935', fontWeight: '700' }}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {loading && (
            <View style={{ paddingVertical: 40 }}>
              <ActivityIndicator />
            </View>
          )}

          {!loading && motosFiltradas.length === 0 && (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: themeColors.subtext }}>Nenhuma moto encontrada.</Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity onPress={() => openModal()} style={[styles.fab, { backgroundColor: colors.primary, shadowColor: themeColors.shadow }]} activeOpacity={0.9}>
          <FontAwesome name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.5)', paddingHorizontal: 12, justifyContent: 'center' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
              <ScrollView keyboardShouldPersistTaps="handled" style={[styles.modalCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Text style={[styles.modalTitulo, { color: themeColors.text }]}>{editandoId ? 'Editar Moto' : 'Nova Moto'}</Text>

                <Text style={[styles.sectionLabel, { color: themeColors.subtext }]}>Status da Legenda</Text>
                {(['#e6c300', '#0074cc', '#ff4500', '#ff0000', '#808080', '#006400', '#da70d6'] as CorHex[]).map((c) => (
                  <TouchableWithoutFeedback key={c} onPress={() => setNovaMoto(prev => ({ ...prev, cor: c }))}>
                    <View style={[styles.colorRow, { borderColor: novaMoto.cor === c ? colors.primary : themeColors.border, backgroundColor: isDark ? '#0f0f0f' : '#fff' }]}>
                      <View style={[styles.colorSwatch, { backgroundColor: c }]} />
                      <Text style={[styles.colorRowText, { color: themeColors.text }]}>{legendaLabelPorCor[c]}</Text>
                      {novaMoto.cor === c && <FontAwesome name="check" size={18} color={colors.primary} />}
                    </View>
                  </TouchableWithoutFeedback>
                ))}

                <Text style={[styles.sectionLabel, { color: themeColors.subtext }]}>Status Operacional</Text>
                <Segmented
                  items={statusOps.map(s => ({ label: s.label, value: s.value }))}
                  value={novaMoto.statusOperacional}
                  onChange={(v) => setNovaMoto(prev => ({ ...prev, statusOperacional: v }))}
                />

                <Text style={[styles.sectionLabel, { color: themeColors.subtext }]}>Dados</Text>
                <TextInput
                  value={novaMoto.placa}
                  onChangeText={(t) => setNovaMoto(prev => ({ ...prev, placa: formatarPlaca(t) }))}
                  placeholder="Placa"
                  placeholderTextColor="#888"
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { color: themeColors.text }]}
                  autoCapitalize="characters"
                />

                <TextInput
                  value={novaMoto.modelo}
                  onChangeText={(t) => setNovaMoto(prev => ({ ...prev, modelo: t }))}
                  placeholder="Modelo"
                  placeholderTextColor="#888"
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { color: themeColors.text }]}
                />

                <TextInput
                  value={novaMoto.ano}
                  onChangeText={(t) => setNovaMoto(prev => ({ ...prev, ano: t.replace(/[^0-9]/g, '').slice(0, 4) }))}
                  placeholder="Ano"
                  placeholderTextColor="#888"
                  keyboardType="number-pad"
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, { color: themeColors.text }]}
                />

                <Text style={[styles.sectionLabel, { color: themeColors.subtext }]}>Tipo</Text>
                <Segmented
                  items={[
                    { label: 'Pop', value: 'Pop' as TipoMoto },
                    { label: 'Sport', value: 'Sport' as TipoMoto },
                    { label: 'E', value: 'E' as TipoMoto }
                  ]}
                  value={novaMoto.tipo}
                  onChange={(v) => setNovaMoto(prev => ({ ...prev, tipo: v }))}
                />

                <TouchableOpacity style={[styles.primaryBtn, saving && { opacity: 0.9 }]} onPress={salvar} activeOpacity={0.95} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{editandoId ? 'Salvar edição' : 'Cadastrar'}</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={closeModal} activeOpacity={0.9} style={{ alignSelf: 'center', marginTop: 6, marginBottom: 4 }}>
                  <Text style={{ color: themeColors.text, textAlign: 'center' }}>Cancelar</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 64, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  themeBtn: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
  logo: { fontSize: 28, fontWeight: '800' },
  content: { paddingHorizontal: 16, paddingTop: 10, flex: 1 },
  tabs: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  tab: { flex: 1, padding: 12, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tabTitle: { fontWeight: '800', marginLeft: 8 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  linkBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  fab: { position: 'absolute', right: 16, bottom: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  modalCard: { borderRadius: 20, padding: 18, borderWidth: 1 },
  modalTitulo: { fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 8 },
  input: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, borderWidth: 1.5, borderColor: 'transparent', marginBottom: 12 },
  inputLight: { backgroundColor: colors.inputBg },
  inputDark: { backgroundColor: '#1c1c1c' },
  inputFocused: { borderColor: colors.primary },
  segmented: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  segmentedItem: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  segmentedText: { fontWeight: '700', color: '#666' },
  colorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderRadius: 12 },
  colorRowText: { flex: 1, fontWeight: '700' },
  colorSwatch: { width: 22, height: 14, borderRadius: 4, marginRight: 10 },
  primaryBtn: { marginTop: 10, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
