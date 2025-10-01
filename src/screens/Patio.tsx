import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useContext, useEffect, useRef, useState } from 'react';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '../contexts/ThemeContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import api from '../services/api';
import { listarMotos } from '../services/motos';
import { colors } from '../styles/colors';

type MotoPin = {
  id: number;
  nome: string;
  tipo: 'Pop' | 'Sport' | 'E';
  lat?: number;
  lng?: number;
  statusColor?: string;
};

type Legenda = { id: number; nome?: string; cor?: string };

export default function Patio() {
  const route = useRoute<RouteProp<RootStackParamList, 'Patio'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const mapRef = useRef<MapView | null>(null);

  const tipoInicial = (route?.params as any)?.tipo || 'Pop';
  const [filtro, setFiltro] = useState<'Pop' | 'Sport' | 'E'>(tipoInicial);
  const [motoSelecionada, setMotoSelecionada] = useState<MotoPin | null>(null);
  const [motos, setMotos] = useState<MotoPin[]>([]);
  const [loading, setLoading] = useState(false);

  function catToTipo(c: any): 'Pop' | 'Sport' | 'E' {
    if (c === 1 || `${c}`.toLowerCase() === 'pop') return 'Pop';
    if (c === 2 || `${c}`.toLowerCase() === 'sport') return 'Sport';
    return 'E';
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
    if (m?.legendaStatusId != null && legendas[m.legendaStatusId])
      return legendas[m.legendaStatusId];
    const fallbackByName: Record<string, string> = {
      Pendência: '#e6c300',
      'Reparos Simples': '#0074cc',
      'Danos Estruturais Graves': '#ff4500',
      Sinistro: '#ff0000',
      'Pronta para Aluguel': '#006400',
      'Sem Placa': '#808080',
    };
    if (m?.legendaStatusNome && fallbackByName[m.legendaStatusNome])
      return fallbackByName[m.legendaStatusNome];
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
      const filtrada = filialId
        ? lista.filter((m) => Number(m.filialId) === Number(filialId))
        : lista;

      const mapped: MotoPin[] = filtrada.map((m) => ({
        id: Number(m.id),
        nome: `${m.modelo ?? ''} • ${m.placa ?? ''}`.trim(),
        tipo: catToTipo(m.categoria),
        lat: m.latitude ?? m.lat ?? undefined,
        lng: m.longitude ?? m.lng ?? undefined,
        statusColor: corPorStatus(m, legendas),
      }));

      setMotos(mapped);
      const primeira = mapped.find((x) => x.tipo === filtro);
      if (primeira && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: primeira.lat ?? -23.5505,
            longitude: primeira.lng ?? -46.6333,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          600,
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
    }, []),
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
          longitudeDelta: 0.02,
        },
        600,
      );
    }
    setFiltro(tipo);
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.botaoVoltar, { top: insets.top + 8 }]}
        activeOpacity={0.9}
      >
        <AntDesign name="arrowleft" size={22} color="#fff" />
      </TouchableOpacity>

      <Text style={[styles.titulo, { color: themeColors.text }]}>easyMoto — Pátio</Text>

      <View style={styles.filtros}>
        {(['Pop', 'Sport', 'E'] as const).map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.botao,
              filtro === tipo
                ? { backgroundColor: colors.primary }
                : {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: themeColors.text,
                  },
            ]}
            onPress={() => handleFiltroPress(tipo)}
            activeOpacity={0.9}
          >
            <Text style={{ color: filtro === tipo ? '#fff' : themeColors.text }}>{tipo}</Text>
          </TouchableOpacity>
        ))}
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
            longitudeDelta: 0.05,
          }}
        >
          {motosFiltradas.map((moto) => (
            <Marker
              key={moto.id}
              coordinate={{
                latitude: moto.lat ?? -23.5505,
                longitude: moto.lng ?? -46.6333,
              }}
              onPress={() => setMotoSelecionada(moto)}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <MaterialCommunityIcons
                name="motorbike"
                size={28}
                color={moto.statusColor || colors.primary}
              />
            </Marker>
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
            <Text style={[styles.modalTitulo, { color: themeColors.text }]}>
              {motoSelecionada?.nome}
            </Text>
            <Text style={{ color: themeColors.text }}>Tipo: {motoSelecionada?.tipo}</Text>
            <Text style={{ color: themeColors.text }}>
              Latitude: {motoSelecionada?.lat !== undefined ? motoSelecionada.lat.toFixed(6) : '--'}
            </Text>
            <Text style={{ color: themeColors.text }}>
              Longitude:{' '}
              {motoSelecionada?.lng !== undefined ? motoSelecionada.lng.toFixed(6) : '--'}
            </Text>

            <TouchableOpacity
              onPress={() => setMotoSelecionada(null)}
              style={styles.fechar}
              activeOpacity={0.9}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  titulo: { fontSize: 20, fontWeight: 'bold', padding: 16, textAlign: 'center' },
  filtros: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
  botao: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginHorizontal: 5 },
  map: { flex: 1 },
  botaoVoltar: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    padding: 10,
    borderRadius: 100,
    backgroundColor: '#00c853',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: { width: 280, padding: 20, borderRadius: 10 },
  modalTitulo: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  fechar: {
    marginTop: 15,
    backgroundColor: '#00c853',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
