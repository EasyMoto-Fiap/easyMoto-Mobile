import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const legendaCores = {
  pendencia: '#e6c300',
  reparos: '#0074cc',
  danos: '#ff4500',
  defeituoso: '#ff0000',
  manutencao: '#808080',
  pronta: '#006400',
  sem_placa: '#da70d6',
};

const coresLabel = {
  '#e6c300': 'Pendência',
  '#0074cc': 'Reparos Simples',
  '#ff4500': 'Danos Estruturais Graves',
  '#ff0000': 'Motor Defeituoso',
  '#808080': 'Agendada para Manutenção',
  '#006400': 'Pronta para Aluguel',
  '#da70d6': 'Sem Placa',
};

export default function DashboardFilial({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const origem = route?.params?.origem || 'dashboard';
  const isAdmin = origem === 'painel';

  const [motos, setMotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novaMoto, setNovaMoto] = useState({ nome: '', tipo: 'Pop', status: legendaCores.pronta });

  useEffect(() => {
    const carregarMotos = async () => {
      const dados = await AsyncStorage.getItem('motos');
      if (dados) {
        setMotos(JSON.parse(dados));
      } else {
        const iniciais = [
          { id: 'A1', nome: 'Moto A1', tipo: 'Pop', status: legendaCores.pendencia, lat: -23.5505, lng: -46.6333 },
          { id: 'B1', nome: 'Moto B1', tipo: 'Sport', status: legendaCores.defeituoso, lat: -23.5507, lng: -46.6334 },
          { id: 'C1', nome: 'Moto C1', tipo: 'E', status: legendaCores.danos, lat: -23.5509, lng: -46.6335 },
        ];
        setMotos(iniciais);
        await AsyncStorage.setItem('motos', JSON.stringify(iniciais));
      }
    };
    carregarMotos();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('motos', JSON.stringify(motos));
  }, [motos]);

  const adicionarMoto = () => {
    const base = {
      Pop: { lat: -23.5505, lng: -46.6333 },
      Sport: { lat: -23.5507, lng: -46.6335 },
      E: { lat: -23.5509, lng: -46.6337 },
    };

    const count = motos.filter((m) => m.tipo === novaMoto.tipo).length;

    const nova = {
      id: Date.now().toString(),
      ...novaMoto,
      lat: base[novaMoto.tipo].lat + (count * 0.0001),
      lng: base[novaMoto.tipo].lng + (count * 0.0001),
    };

    setMotos([...motos, nova]);
    setNovaMoto({ nome: '', tipo: 'Pop', status: legendaCores.pronta });
    setModalVisible(false);
  };

  const excluirMoto = (id) => {
    setMotos((prev) => prev.filter((m) => m.id !== id));
  };

  const motosPorTipo = (tipo) => motos.filter((m) => m.tipo === tipo);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.titulo, { color: themeColors.text }]}>Modelos disponíveis:</Text>
      <Text style={[styles.subtitulo, { color: themeColors.text }]}>Visualize no mapa real por tipo</Text>

      {isAdmin && (
        <TouchableOpacity style={styles.botaoCadastrar} onPress={() => setModalVisible(true)}>
          <Text style={styles.botaoCadastrarTexto}>Cadastrar nova moto</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {['Pop', 'Sport', 'E'].map((tipo) => (
          <View key={tipo} style={{ marginBottom: 20 }}>
            <Text style={[styles.tipoTitulo, { color: themeColors.text }]}>{tipo}</Text>
            {motosPorTipo(tipo).map((moto) => (
              <View key={moto.id} style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}>
                <FontAwesome name="motorcycle" size={24} color={moto.status} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[styles.cardTitulo, { color: themeColors.text }]}>{moto.nome}</Text>
                  <Text style={{ color: themeColors.text }}>Status: {coresLabel[moto.status]}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 10 }}>
                  <TouchableOpacity
                    style={styles.verMapaBtn}
                    onPress={() => navigation.navigate('PatioMapaReal', { tipo })}
                  >
                    <Text style={styles.verMapaTexto}>Ver no mapa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.excluirBtn} onPress={() => excluirMoto(moto.id)}>
                    <Text style={styles.excluirTexto}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.legenda}>
          <Text style={[styles.legendaTitulo, { color: themeColors.text }]}>Legenda:</Text>
          {Object.entries(coresLabel).map(([cor, nome]) => (
            <View key={cor} style={styles.legendaItem}>
              <View style={[styles.corQuadrado, { backgroundColor: cor }]} />
              <Text style={{ color: themeColors.text }}>{nome}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.modalTitulo, { color: themeColors.text }]}>Nova Moto</Text>
            <TextInput
              placeholder="Nome da moto"
              placeholderTextColor="#aaa"
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.text }]}
              value={novaMoto.nome}
              onChangeText={(t) => setNovaMoto({ ...novaMoto, nome: t })}
            />

            <Text style={[{ color: themeColors.text, marginTop: 10 }]}>Tipo:</Text>
            <View style={styles.tipoContainer}>
              {['Pop', 'Sport', 'E'].map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.tipoBotao, novaMoto.tipo === tipo && styles.tipoSelecionado]}
                  onPress={() => setNovaMoto({ ...novaMoto, tipo })}
                >
                  <Text style={{ color: novaMoto.tipo === tipo ? '#fff' : themeColors.text }}>{tipo}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[{ color: themeColors.text, marginTop: 10 }]}>Status:</Text>
            <View style={styles.statusContainer}>
              {Object.entries(coresLabel).map(([cor, label]) => (
                <TouchableOpacity
                  key={cor}
                  style={[
                    styles.statusBotao,
                    { backgroundColor: cor },
                    novaMoto.status === cor && styles.statusSelecionado,
                  ]}
                  onPress={() => setNovaMoto({ ...novaMoto, status: cor })}
                >
                  <Text style={styles.statusTexto}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.salvarBotao} onPress={adicionarMoto}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 10, color: themeColors.text }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { fontSize: 14, marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 15, marginBottom: 16 },
  cardTitulo: { fontSize: 16, fontWeight: '600' },
  verMapaBtn: { backgroundColor: '#00c853', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  verMapaTexto: { color: '#fff', fontWeight: 'bold' },
  excluirBtn: { backgroundColor: '#ff5252', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  excluirTexto: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  botaoCadastrar: { backgroundColor: '#00c853', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  botaoCadastrarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  legenda: { marginTop: 10, marginBottom: 40 },
  legendaTitulo: { fontWeight: 'bold', marginBottom: 4 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  corQuadrado: { width: 16, height: 16, marginRight: 6, borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', padding: 20, borderRadius: 12 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, padding: 10, borderRadius: 8 },
  tipoContainer: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tipoBotao: { borderWidth: 1, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  tipoSelecionado: { backgroundColor: '#00c853', borderColor: '#00c853' },
  statusContainer: { marginTop: 8 },
  statusBotao: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, marginBottom: 6 },
  statusSelecionado: { borderWidth: 2, borderColor: '#000' },
  statusTexto: { color: '#fff', fontWeight: 'bold' },
  salvarBotao: { marginTop: 12, backgroundColor: '#00c853', padding: 12, borderRadius: 8, alignItems: 'center' },
  tipoTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
});
