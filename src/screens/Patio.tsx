import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import api from '../services/api';
import { listarMotos } from '../services/motos';
import { colors } from '../styles/colors';
import { t } from '../i18n';

type MotoPin = {
  id: number;
  nome: string;
  tipo: 'Pop' | 'Sport' | 'E';
  lat?: number;
  lng?: number;
  statusColor?: string;
};

type Legenda = { id: number; nome?: string; cor?: string };

const bikePin = require('../../assets/img/motorcycle.png');

export default function Patio() {
  const route = useRoute<RouteProp<RootStackParamList, 'Patio'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const mapRef = useRef<MapView | null>(null);
  useContext(LanguageContext);

  const tipoInicial = (route?.params as any)?.tipo || 'Pop';
  const [filtro, setFiltro] = useState<'Pop' | 'Sport' | 'E'>(tipoInicial);
  const [motoSelecionada, setMotoSelecionada] = useState<MotoPin | null>(null);
  const [motos, setMotos] = useState<MotoPin[]>([]);
  const [loading, setLoading] = useState(false);

  function catToTipo(c: any): 'Pop' | 'Sport' | 'E' {
    const n = Number(c);
    if (n === 0) return 'Pop';
    if (n === 1) return 'Sport';
    if (n === 2) return 'E';
    const s = `${c}`.toLowerCase();
    if (s === 'pop') return 'Pop';
    if (s === 'sport') return 'Sport';
    if (s === 'e') return 'E';
    return 'Pop';
  }

  async function ensureAuth() {
    const token = await AsyncStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.defaults.timeout = 15000;
  }

  async function carregarLegendas(): Promise<Record<number, string>> {
    const res = await api.get('/legendasstatus');
    const lista: Legenda[] = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
    const map: Record<number, string> = {};
    for (const l of lista) {
      if (l?.id != null && l?.cor) map[Number(l.id)] = String(l.cor);
    }
    return map;
  }

  function corPorStatus(m: any, legendas: Record<number, string>): string {
    if (m?.cor) return String(m.cor);
    if (m?.legendaStatusId != null && legendas[m.legendaStatusId]) return legendas[m.legendaStatusId];
    const fallbackByName: Record<string, string> = {
      Pendência: '#e6c300',
      'Reparos Simples': '#0074cc',
      'Danos Estruturais Graves': '#ff4500',
      Sinistro: '#ff0000',
      'Pronta para Aluguel': '#006400',
      'Sem Placa': '#808080'
    };
    if (m?.legendaStatusNome && fallbackByName[m.legendaStatusNome]) return fallbackByName[m.legendaStatusNome];
    if (m?.statusOperacional === 0) return '#006400';
    if (m?.statusOperacional === 1) return '#e6c300';
    if (m?.statusOperacional === 2) return '#ff4500';
    return colors.primary;
  }

  async function carregar() {
    setLoading(true);
    try {
      await ensureAuth();
      const userRaw = await AsyncStorage.getItem('usuarioAtual');
      const user = userRaw ? JSON.parse(userRaw) : undefined;
      const filialId = user?.filialId;

      const legendas = await carregarLegendas();

      const data = await listarMotos(1, 1000);
      const lista: any[] = Array.isArray(data) ? data : (data?.items ?? []);
      const filtrada = filialId ? lista.filter((m) => Number(m.filialId) === Number(filialId)) : lista;

      const basePins: MotoPin[] = filtrada.map((m) => ({
        id: Number(m.id),
        nome: `${m.modelo ?? ''} • ${m.placa ?? ''}`.trim(),
        tipo: catToTipo(m.categoria),
        lat: m.latitude ?? m.lat ?? undefined,
        lng: m.longitude ?? m.lng ?? undefined,
        statusColor: corPorStatus(m, legendas)
      }));

      const coordCount: Record<string, number> = {};
      const mapped: MotoPin[] = basePins.map((pin) => {
        const baseLat = pin.lat ?? -23.5505;
        const baseLng = pin.lng ?? -46.6333;
        const key = `${baseLat.toFixed(5)},${baseLng.toFixed(5)}`;
        const idx = coordCount[key] ?? 0;
        coordCount[key] = idx + 1;
        const jitter = 0.0003 * idx;
        return {
          ...pin,
          lat: baseLat + jitter,
          lng: baseLng + jitter
        };
      });

      setMotos(mapped);

      const primeira = mapped.find((x) => x.tipo === filtro);
      if (primeira && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: primeira.lat ?? -23.5505,
            longitude: primeira.lng ?? -46.6333,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          },
          600
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      carregar();
      return () => {};
    }, [])
  );

  const motosFiltradas = motos.filter((m) => m.tipo === filtro);

  function handleFiltroPress(tipo: 'Pop' | 'Sport' | 'E') {
    const primeira = motos.find((m) => m.tipo === tipo);
    if (primeira && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: primeira.lat ?? -23.5505,
          longitude: primeira.lng ?? -46.6333,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02
        },
        600
      );
    }
    setFiltro(tipo);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: themeColors.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.botaoVoltar}
          activeOpacity={0.9}
        >
          <AntDesign name="arrowleft" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.filtrosRow}>
          {(['Pop', 'Sport', 'E'] as const).map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={[
                styles.botao,
                filtro === tipo
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: themeColors.text }
              ]}
              onPress={() => handleFiltroPress(tipo)}
              activeOpacity={0.9}
            >
              <Text style={{ color: filtro === tipo ? '#fff' : themeColors.text }}>
                {t(`patio.filters.${tipo}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: -23.5505,
            longitude: -46.6333,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          }}
        >
          {motosFiltradas.map((moto) => (
            <Marker
              key={moto.id}
              coordinate={{
                latitude: moto.lat ?? -23.5505,
                longitude: moto.lng ?? -46.6333
              }}
              onPress={() => setMotoSelecionada(moto)}
              anchor={{ x: 0.5, y: 0.5 }}
              image={bikePin}
            />
          ))}
        </MapView>
      )}

      <Modal
        visible={!!motoSelecionada}
        transparent
        animationType="slide"
        onRequestClose={() => setMotoSelecionada(null)}
      >
        <View style={styles.modalFundo}>
          <View style={[styles.modal, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.modalTitulo, { color: themeColors.text }]}>{motoSelecionada?.nome}</Text>
            <Text style={{ color: themeColors.text }}>
              {t('patio.modal.type')}: {motoSelecionada?.tipo}
            </Text>
            <Text style={{ color: themeColors.text }}>
              {t('patio.modal.latitude')}:{' '}
              {motoSelecionada?.lat !== undefined ? motoSelecionada.lat.toFixed(6) : '--'}
            </Text>
            <Text style={{ color: themeColors.text }}>
              {t('patio.modal.longitude')}:{' '}
              {motoSelecionada?.lng !== undefined ? motoSelecionada.lng.toFixed(6) : '--'}
            </Text>

            <TouchableOpacity
              onPress={() => setMotoSelecionada(null)}
              style={styles.fechar}
              activeOpacity={0.9}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('patio.modal.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingRight: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtrosRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botao: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginHorizontal: 4 },
  map: { flex: 1 },
  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00c853',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: 280, padding: 20, borderRadius: 10 },
  modalTitulo: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  fechar: { marginTop: 15, backgroundColor: '#00c853', padding: 10, borderRadius: 8, alignItems: 'center' },
});
