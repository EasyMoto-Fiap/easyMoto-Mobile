import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useContext, useRef, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { colors } from '../styles/colors';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PatioMapaRealComModal({ route }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const tipoInicial = route?.params?.tipo || 'Pop';
  const [filtro, setFiltro] = useState(tipoInicial);
  const [motoSelecionada, setMotoSelecionada] = useState(null);
  const [motos, setMotos] = useState([]);

  useEffect(() => {
    const carregarMotosSalvas = async () => {
      const dados = await AsyncStorage.getItem('motos');
      if (dados) {
        const lista = JSON.parse(dados);
        setMotos(lista);
      }
    };
    carregarMotosSalvas();
  }, []);

  const motosFiltradas = motos.filter((m) => m.tipo === filtro);

  const handleFiltroPress = (tipo) => {
    const primeira = motos.find((m) => m.tipo === tipo);
    if (primeira && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: primeira.lat || -23.5505,
          longitude: primeira.lng || -46.6333,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
    setFiltro(tipo);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
        <AntDesign name="arrowleft" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={[styles.titulo, { color: themeColors.text }]}>easyMoto — Mapa Real</Text>

      <View style={styles.filtros}>
        {['Pop', 'Sport', 'E'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.botao,
              filtro === tipo
                ? { backgroundColor: '#00c853' }
                : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: themeColors.text },
            ]}
            onPress={() => handleFiltroPress(tipo)}
          >
            <Text style={{ color: filtro === tipo ? '#fff' : themeColors.text }}>{tipo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
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
              latitude: moto.lat || -23.5505,
              longitude: moto.lng || -46.6333,
            }}
            onPress={() => setMotoSelecionada(moto)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <FontAwesome
              name="motorcycle"
              size={28}
              color={moto.status === 'yellow' ? '#ffd700' : moto.status || '#00c853'}
            />
          </Marker>
        ))}
      </MapView>

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
            <Text style={{ color: themeColors.text }}>Latitude: {motoSelecionada?.lat?.toFixed(6)}</Text>
            <Text style={{ color: themeColors.text }}>Longitude: {motoSelecionada?.lng?.toFixed(6)}</Text>

            <TouchableOpacity onPress={() => setMotoSelecionada(null)} style={styles.fechar}>
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
    top: 50,
    left: 20,
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
