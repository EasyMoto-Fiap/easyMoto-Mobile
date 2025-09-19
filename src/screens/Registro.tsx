import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../../styles/colors';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';

type TipoMoto = 'Pop' | 'Sport' | 'E';
type CorHex = string;

type Moto = {
  id: string;
  nome: string;
  tipo: TipoMoto;
  status: CorHex;
  lat: number;
  lng: number;
};

const coresLabel: Record<CorHex, string> = {
  '#e6c300': 'Pendência',
  '#0074cc': 'Reparos Simples',
  '#ff4500': 'Danos Estruturais Graves',
  '#ff0000': 'Motor Defeituoso',
  '#808080': 'Agendada para Manutenção',
  '#006400': 'Pronta para Aluguel',
  '#da70d6': 'Sem Placa'
};

type NovaMotoForm = { nome: string; tipo: TipoMoto; status: CorHex };

export default function Registro() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const route = useRoute<RouteProp<RootStackParamList, 'Registro'>>();
  const canEdit = route.params?.canEdit === true;

  const [motos, setMotos] = useState<Moto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novaMoto, setNovaMoto] = useState<NovaMotoForm>({ nome: '', tipo: 'Pop', status: '#006400' });
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      const dados = await AsyncStorage.getItem('motos');
      if (dados) setMotos(JSON.parse(dados) as Moto[]);
    };
    carregar();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('motos', JSON.stringify(motos));
  }, [motos]);

  async function registrarAlerta(mensagem: string) {
    const historico = await AsyncStorage.getItem('historicoMotos');
    const logs: string[] = historico ? JSON.parse(historico) : [];
    logs.unshift(`${new Date().toLocaleString()} - ${mensagem}`);
    await AsyncStorage.setItem('historicoMotos', JSON.stringify(logs));
  }

  function adicionarOuEditarMoto() {
    if (editandoId) {
      setMotos(prev => prev.map(m => (m.id === editandoId ? { ...m, ...novaMoto } : m)));
      registrarAlerta(`Moto ${novaMoto.nome} foi editada.`);
    } else {
      const nova: Moto = {
        id: Date.now().toString(),
        nome: novaMoto.nome,
        tipo: novaMoto.tipo,
        status: novaMoto.status,
        lat: -23.55 + Math.random() * 0.01,
        lng: -46.63 + Math.random() * 0.01
      };
      setMotos(prev => [...prev, nova]);
      registrarAlerta(`Moto ${nova.nome} foi cadastrada.`);
    }
    setNovaMoto({ nome: '', tipo: 'Pop', status: '#006400' });
    setEditandoId(null);
    setModalVisible(false);
  }

  async function excluirMoto(id: string) {
    const moto = motos.find(m => m.id === id);
    setMotos(prev => prev.filter(m => m.id !== id));
    if (moto) registrarAlerta(`Moto ${moto.nome} foi excluída.`);
  }

  function motosPorTipo(tipo: TipoMoto) {
    return motos.filter(m => m.tipo === tipo);
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.logo, { color: themeColors.text }]}>
        easy<Text style={{ color: colors.primary }}>Moto</Text>
      </Text>

      {canEdit && (
        <TouchableOpacity
          style={styles.botaoCadastrar}
          onPress={() => {
            setEditandoId(null);
            setNovaMoto({ nome: '', tipo: 'Pop', status: '#006400' });
            setModalVisible(true);
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.botaoCadastrarTexto}>Cadastrar nova moto</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={{ flex: 1 }}>
        {(['Pop', 'Sport', 'E'] as TipoMoto[]).map(tipo => (
          <View key={tipo} style={{ marginBottom: 20 }}>
            <Text style={[styles.tipoTitulo, { color: themeColors.text }]}>{tipo}</Text>
            {motosPorTipo(tipo).map(moto => (
              <View key={moto.id} style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}>
                <FontAwesome name="motorcycle" size={24} color={moto.status} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[styles.cardTitulo, { color: themeColors.text }]}>{moto.nome}</Text>
                  <Text style={{ color: themeColors.text }}>Status: {coresLabel[moto.status]}</Text>
                </View>
                {canEdit && (
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        setNovaMoto({ nome: moto.nome, tipo: moto.tipo, status: moto.status });
                        setEditandoId(moto.id);
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.botaoEditar}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => excluirMoto(moto.id)}>
                      <Text style={styles.botaoExcluir}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={styles.legendaContainer}>
          <Text style={[styles.legendaTitulo, { color: themeColors.text }]}>Legenda:</Text>
          {Object.entries(coresLabel).map(([cor, nome]) => (
            <View key={cor} style={styles.legendaItem}>
              <View style={[styles.legendaCor, { backgroundColor: cor }]} />
              <Text style={{ color: themeColors.text }}>{nome}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.modalTitulo, { color: themeColors.text }]}>{editandoId ? 'Editar Moto' : 'Nova Moto'}</Text>
            <TextInput
              placeholder="Nome da moto"
              placeholderTextColor="#aaa"
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.text }]}
              value={novaMoto.nome}
              onChangeText={t => setNovaMoto({ ...novaMoto, nome: t })}
            />
            <Text style={{ color: themeColors.text, marginTop: 10 }}>Tipo:</Text>
            <View style={styles.tipoContainer}>
              {(['Pop', 'Sport', 'E'] as TipoMoto[]).map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.tipoBotao, novaMoto.tipo === tipo && styles.tipoSelecionado]}
                  onPress={() => setNovaMoto({ ...novaMoto, tipo })}
                >
                  <Text style={{ color: novaMoto.tipo === tipo ? '#fff' : themeColors.text }}>{tipo}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: themeColors.text, marginTop: 10 }}>Status:</Text>
            <View style={styles.statusContainer}>
              {Object.entries(coresLabel).map(([cor, nome]) => (
                <TouchableOpacity
                  key={cor}
                  style={[styles.statusBotao, { backgroundColor: cor }, novaMoto.status === cor && styles.statusSelecionado]}
                  onPress={() => setNovaMoto({ ...novaMoto, status: cor })}
                >
                  <Text style={styles.statusTexto}>{nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.botaoCadastrar} onPress={adicionarOuEditarMoto} activeOpacity={0.9}>
              <Text style={styles.botaoCadastrarTexto}>{editandoId ? 'Salvar edição' : 'Cadastrar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8}>
              <Text style={{ marginTop: 10, color: themeColors.text, textAlign: 'center' }}>Cancelar</Text>
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
  botaoCadastrar: { backgroundColor: '#00c853', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 16 },
  botaoCadastrarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tipoTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 15, marginBottom: 16 },
  cardTitulo: { fontSize: 16, fontWeight: '600' },
  botaoEditar: { color: '#2196f3', fontWeight: 'bold' },
  botaoExcluir: { color: '#ff5252', fontWeight: 'bold' },
  legendaContainer: { marginTop: 20 },
  legendaTitulo: { fontWeight: 'bold', marginBottom: 4 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendaCor: { width: 16, height: 16, marginRight: 6, borderRadius: 4 }
});
