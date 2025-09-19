import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';

type Operador = {
    id: string;
    nome: string;
    email: string;
    senha: string;
    cpf: string;
    filial: string;
    telefone?: string;
};

export default function GerenciarOperadores() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [lista, setLista] = useState<Operador[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<Operador>({
    id: '',
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    filial: '',
    telefone: ''
  });

  useEffect(() => {
    const carregar = async () => {
      const dados = await AsyncStorage.getItem('operadores');
      setLista(dados ? JSON.parse(dados) : []);
    };
    carregar();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('operadores', JSON.stringify(lista));
  }, [lista]);

  function abrirNovo() {
    setEditandoId(null);
    setForm({ id: '', nome: '', email: '', senha: '', cpf: '', filial: '', telefone: '' });
    setModalVisible(true);
  }

  function abrirEdicao(op: Operador) {
    setEditandoId(op.id);
    setForm(op);
    setModalVisible(true);
  }

  function salvar() {
    if (!form.nome || !form.email || !form.cpf || !form.filial) {
      Alert.alert('Atenção', 'Preencha nome, email, CPF e filial.');
      return;
    }
    if (!editandoId && (!form.senha || form.senha.length < 8)) {
      Alert.alert('Atenção', 'Senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (editandoId) {
      setLista((prev) => prev.map((o) => (o.id === editandoId ? { ...form, id: editandoId } : o)));
    } else {
      const novo: Operador = { ...form, id: Date.now().toString() };
      setLista((prev) => [novo, ...prev]);
    }
    setModalVisible(false);
  }

  function excluir(id: string) {
    Alert.alert('Excluir', 'Deseja remover este operador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => setLista((prev) => prev.filter((o) => o.id !== id))
      }
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.logo, { color: themeColors.text }]}>
        <Text style={{ color: colors.primary }}>easy</Text>Moto
      </Text>

      <TouchableOpacity style={styles.botaoPrincipal} onPress={abrirNovo} activeOpacity={0.9}>
        <Text style={styles.botaoPrincipalTexto}>Cadastrar operador</Text>
      </TouchableOpacity>

      <ScrollView style={{ flex: 1 }}>
        {lista.map((op) => (
          <View key={op.id} style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}>
            <FontAwesome name="user" size={22} color={isDark ? '#00c853' : colors.buttonBg} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.cardTitulo, { color: themeColors.text }]}>{op.nome}</Text>
              <Text style={{ color: isDark ? '#ccc' : '#666' }}>{op.email}</Text>
              <Text style={{ color: isDark ? '#ccc' : '#666' }}>Filial: {op.filial}</Text>
            </View>
            <TouchableOpacity onPress={() => abrirEdicao(op)} style={{ paddingHorizontal: 8 }}>
              <Text style={styles.linkEditar}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => excluir(op.id)} style={{ paddingHorizontal: 8 }}>
              <Text style={styles.linkExcluir}>Excluir</Text>
            </TouchableOpacity>
          </View>
        ))}
        {lista.length === 0 && (
          <Text style={{ color: themeColors.text, textAlign: 'center', marginTop: 20 }}>Nenhum operador cadastrado.</Text>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.modalTitulo, { color: themeColors.text }]}>{editandoId ? 'Editar Operador' : 'Novo Operador'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#aaa"
              value={form.nome}
              onChangeText={(t) => setForm((p) => ({ ...p, nome: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={form.email}
              keyboardType="email-address"
              onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
            />
            {!editandoId && (
              <TextInput
                style={styles.input}
                placeholder="Senha (mín. 8)"
                placeholderTextColor="#aaa"
                value={form.senha}
                secureTextEntry
                onChangeText={(t) => setForm((p) => ({ ...p, senha: t }))}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="CPF"
              placeholderTextColor="#aaa"
              value={form.cpf}
              onChangeText={(t) => setForm((p) => ({ ...p, cpf: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Filial (CEP)"
              placeholderTextColor="#aaa"
              value={form.filial}
              onChangeText={(t) => setForm((p) => ({ ...p, filial: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor="#aaa"
              value={form.telefone || ''}
              onChangeText={(t) => setForm((p) => ({ ...p, telefone: t }))}
            />

            <TouchableOpacity style={styles.botaoPrincipal} onPress={salvar} activeOpacity={0.9}>
              <Text style={styles.botaoPrincipalTexto}>{editandoId ? 'Salvar' : 'Cadastrar'}</Text>
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
  botaoPrincipal: { backgroundColor: '#00c853', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 12 },
  botaoPrincipalTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTitulo: { fontSize: 16, fontWeight: '600' },
  linkEditar: { color: '#2196f3', fontWeight: 'bold' },
  linkExcluir: { color: '#ff5252', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', padding: 20, borderRadius: 12 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#e4e4e4', padding: 12, borderRadius: 10, width: '100%', marginBottom: 10 }
});
