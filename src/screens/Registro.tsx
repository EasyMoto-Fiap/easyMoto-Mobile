import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, ActivityIndicator, Animated, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { useContext, useState, useEffect, useRef } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import api from '../services/api';
import axios from 'axios';
import { listarMotos, criarMoto, atualizarMoto, deletarMoto, type Moto as MotoAPI, type CategoriaNum, type StatusOperacionalNum } from '../services/motos';
import { registrarEntradaPatio } from '../services/patio';
import { criarNotificacao } from '../services/notificacoes';

type TipoMoto = 'Pop' | 'Sport' | 'E';
type CorHex = string;

const coresLabel: Record<CorHex, string> = {
  '#e6c300': 'Pendência',
  '#0074cc': 'Reparos Simples',
  '#ff4500': 'Danos Estruturais Graves',
  '#ff0000': 'Motor Defeituoso',
  '#808080': 'Agendada para Manutenção',
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
  { label: 'Manutenção', value: 2 as StatusOperacionalNum, color: '#ff4500' }
];

type MotoUI = {
  id: number;
  placa: string;
  modelo: string;
  ano: number;
  tipo: TipoMoto;
  cor: CorHex;
  statusOperacional: StatusOperacionalNum;
};

type NovaMotoForm = {
  placa: string;
  modelo: string;
  ano: string;
  tipo: TipoMoto;
  cor: CorHex;
  statusOperacional: StatusOperacionalNum;
};

export default function Registro() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const route = useRoute<RouteProp<RootStackParamList, 'Registro'>>();
  const canEdit = route.params?.canEdit === true;

  const [motos, setMotos] = useState<MotoUI[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [focus, setFocus] = useState<'placa' | 'modelo' | 'ano' | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const [novaMoto, setNovaMoto] = useState<NovaMotoForm>({
    placa: '',
    modelo: '',
    ano: '',
    tipo: 'Pop',
    cor: '#006400',
    statusOperacional: 0
  });

  async function ensureAuthHeader() {
    const token = await AsyncStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.defaults.timeout = 15000;
  }

  async function carregar() {
    try {
      await ensureAuthHeader();
      const res = await listarMotos(1, 500);
      const items = res.items.map<MotoUI>((m: MotoAPI) => ({
        id: m.id,
        placa: m.placa,
        modelo: m.modelo,
        ano: m.ano,
        tipo: categoriaReverse[m.categoria],
        cor: (m as any).cor || '#006400',
        statusOperacional: m.statusOperacional
      }));
      setMotos(items);
    } catch {
      setMotos([]);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function motosPorTipo(tipo: TipoMoto) {
    return motos.filter(m => m.tipo === tipo);
  }

  function validar() {
    const placa = novaMoto.placa.trim().toUpperCase();
    const modelo = novaMoto.modelo.trim();
    const anoNum = Number(novaMoto.ano);
    if (!/^[A-Z0-9]{7}$/.test(placa)) { Alert.alert('Placa inválida', 'Informe exatamente 7 caracteres (letras e números).'); return false; }
    if (!modelo) { Alert.alert('Modelo inválido', 'Informe o modelo.'); return false; }
    const anoAtual = new Date().getFullYear() + 1;
    if (!Number.isInteger(anoNum) || anoNum < 1980 || anoNum > anoAtual) { Alert.alert('Ano inválido', `Informe um ano entre 1980 e ${anoAtual}.`); return false; }
    return true;
  }

  function parseDotNetError(err: any) {
    if (!axios.isAxiosError(err)) return null;
    const data = err.response?.data as any;
    if (!data) return null;
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
        if (usuarioOrigemId) {
          await criarNotificacao({ tipo: 1, mensagem: 'Moto atualizada', motoId: editandoId, usuarioOrigemId, escopo: 0 });
        }
      } else {
        const created = await criarMoto(payload as any);
        if (created?.id) {
          await registrarEntradaPatio({ motoId: created.id, filialId, statusOperacional: payload.statusOperacional });
          if (usuarioOrigemId) {
            await criarNotificacao({ tipo: 0, mensagem: 'Moto cadastrada', motoId: created.id, usuarioOrigemId, escopo: 0 });
          }
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
      const msg = parseDotNetError(err);
      setSaving(false);
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
            await carregar();
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
              style={[styles.segmentedItem, selected && { backgroundColor: colors.primary }, i > 0 && { borderLeftWidth: 1, borderLeftColor: isDarkLocal ? '#1c1c1c' : '#ededed' }]}
              activeOpacity={0.9}
              onPress={() => onChange(it.value)}
            >
              <Text style={[styles.segmentedText, selected && { color: '#fff' }]}>{it.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  function ColorRow({ color, label, selected, onPress }: { color: CorHex; label: string; selected: boolean; onPress: () => void }) {
    const isDarkLocal = isDark;
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[
          styles.colorRow,
          { borderColor: selected ? colors.primary : (isDarkLocal ? '#262626' : '#e7e7e7'), backgroundColor: isDarkLocal ? '#141414' : '#fafafa' }
        ]}
      >
        <View style={[styles.colorSwatch, { backgroundColor: color }]} />
        <Text style={[styles.colorRowText, { color: isDarkLocal ? '#ddd' : '#222' }]}>{label}</Text>
        {selected && <FontAwesome name="check" size={16} color={colors.primary} />}
      </TouchableOpacity>
    );
  }

  function openModalForCreate() {
    setEditandoId(null);
    setNovaMoto({ placa: '', modelo: '', ano: '', tipo: 'Pop', cor: '#006400', statusOperacional: 0 });
    setModalVisible(true);
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
  }

  function openModalForEdit(m: MotoUI) {
    setNovaMoto({ placa: m.placa, modelo: m.modelo, ano: String(m.ano), tipo: m.tipo, cor: m.cor, statusOperacional: m.statusOperacional });
    setEditandoId(m.id);
    setModalVisible(true);
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
  }

  function closeModal() {
    Animated.timing(anim, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => setModalVisible(false));
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.logo, { color: themeColors.text }]}>
        easy<Text style={{ color: colors.primary }}>Moto</Text>
      </Text>

      {canEdit && (
        <TouchableOpacity style={styles.primaryBtn} onPress={openModalForCreate} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>Cadastrar nova moto</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={{ flex: 1 }}>
        {(['Pop', 'Sport', 'E'] as TipoMoto[]).map(tipo => (
          <View key={tipo} style={{ marginBottom: 16 }}>
            <Text style={[styles.tipoTitulo, { color: themeColors.text }]}>{tipo}</Text>
            {motosPorTipo(tipo).map(m => (
              <View key={m.id} style={[styles.card, { backgroundColor: isDark ? '#161616' : '#f6f6f6', borderColor: isDark ? '#1f1f1f' : '#ececec' }]}>
                <FontAwesome name="motorcycle" size={22} color={m.cor} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.cardTitulo, { color: themeColors.text }]}>{m.modelo} • {m.placa}</Text>
                  <Text style={{ color: isDark ? '#bdbdbd' : '#666' }}>Ano {m.ano} • {statusOps.find(s => s.value === m.statusOperacional)?.label}</Text>
                </View>
                {canEdit && (
                  <View style={{ gap: 6 }}>
                    <TouchableOpacity onPress={() => openModalForEdit(m)}>
                      <Text style={styles.linkEditar}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => excluir(m.id)}>
                      <Text style={styles.linkExcluir}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={modalVisible} animationType="none" transparent statusBarTranslucent onRequestClose={closeModal}>
        <View style={styles.modalRoot}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View style={[styles.backdrop, { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }]} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.modalWrapper, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12, paddingHorizontal: 16 }]}>
            <Animated.View
              style={[
                styles.modalCard,
                {
                  backgroundColor: themeColors.background,
                  borderColor: isDark ? '#2a2a2a' : '#eee',
                  transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
                  opacity: anim,
                  maxHeight: '82%',
                  width: '100%',
                  alignSelf: 'center'
                }
              ]}
            >
              <Text style={[styles.modalTitulo, { color: themeColors.text }]}>{editandoId ? 'Editar Moto' : 'Nova Moto'}</Text>

              <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
                <TextInput
                  placeholder="Placa"
                  placeholderTextColor="#888"
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, focus === 'placa' && styles.inputFocused, { color: themeColors.text }]}
                  value={novaMoto.placa}
                  onFocus={() => setFocus('placa')}
                  onBlur={() => setFocus(null)}
                  autoCapitalize="characters"
                  onChangeText={t => {
                    const only = t.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
                    setNovaMoto({ ...novaMoto, placa: only });
                  }}
                  maxLength={7}
                />
                <TextInput
                  placeholder="Modelo"
                  placeholderTextColor="#888"
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, focus === 'modelo' && styles.inputFocused, { color: themeColors.text }]}
                  value={novaMoto.modelo}
                  onFocus={() => setFocus('modelo')}
                  onBlur={() => setFocus(null)}
                  onChangeText={t => setNovaMoto({ ...novaMoto, modelo: t })}
                  maxLength={50}
                />
                <TextInput
                  placeholder="Ano"
                  placeholderTextColor="#888"
                  keyboardType="number-pad"
                  style={[styles.input, isDark ? styles.inputDark : styles.inputLight, focus === 'ano' && styles.inputFocused, { color: themeColors.text }]}
                  value={novaMoto.ano}
                  onFocus={() => setFocus('ano')}
                  onBlur={() => setFocus(null)}
                  onChangeText={t => setNovaMoto({ ...novaMoto, ano: t.replace(/\D/g, '') })}
                  maxLength={4}
                />

                <Text style={[styles.sectionLabel, { color: themeColors.text }]}>Tipo</Text>
                <Segmented
                  items={[{ label: 'Pop', value: 'Pop' }, { label: 'Sport', value: 'Sport' }, { label: 'E', value: 'E' }]}
                  value={novaMoto.tipo}
                  onChange={(v) => setNovaMoto({ ...novaMoto, tipo: v as TipoMoto })}
                />

                <Text style={[styles.sectionLabel, { color: themeColors.text }]}>Status da Legenda</Text>
                <View style={{ gap: 8 }}>
                  {Object.entries(coresLabel).map(([cor, nome]) => (
                    <ColorRow
                      key={cor}
                      color={cor as CorHex}
                      label={nome}
                      selected={novaMoto.cor === cor}
                      onPress={() => setNovaMoto({ ...novaMoto, cor: cor as CorHex })}
                    />
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { color: themeColors.text }]}>Status Operacional</Text>
                <Segmented
                  items={statusOps.map(s => ({ label: s.label, value: s.value }))}
                  value={novaMoto.statusOperacional}
                  onChange={(v) => setNovaMoto({ ...novaMoto, statusOperacional: v as StatusOperacionalNum })}
                />

                <TouchableOpacity style={[styles.primaryBtn, saving && { opacity: 0.9 }]} onPress={salvar} activeOpacity={0.95} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{editandoId ? 'Salvar edição' : 'Cadastrar'}</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={closeModal} activeOpacity={0.8} disabled={saving} style={{ alignSelf: 'center', marginTop: 6, marginBottom: 4 }}>
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
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  logo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  primaryBtn: { backgroundColor: colors.buttonBg, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginVertical: 14 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tipoTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  cardTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  linkEditar: { color: '#2196f3', fontWeight: 'bold', textAlign: 'right' },
  linkExcluir: { color: '#ff5252', fontWeight: 'bold', textAlign: 'right' },
  modalRoot: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)' },
  modalWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalCard: { borderRadius: 20, padding: 18, borderWidth: 1 },
  modalTitulo: { fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 8 },
  input: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1.5, borderColor: 'transparent', marginBottom: 12 },
  inputLight: { backgroundColor: colors.inputBg },
  inputDark: { backgroundColor: '#1c1c1c' },
  inputFocused: { borderColor: colors.primary },
  segmented: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  segmentedItem: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  segmentedText: { fontWeight: '700', color: '#666' },
  colorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderRadius: 12 },
  colorRowText: { flex: 1, fontWeight: '700' },
  colorSwatch: { width: 22, height: 14, borderRadius: 4, marginRight: 10 }
});
