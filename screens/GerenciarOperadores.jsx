import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GerenciarOperadores() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const [operadores, setOperadores] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      const dados = await AsyncStorage.getItem('operadores');
      setOperadores(dados ? JSON.parse(dados) : []);
    };
    carregar();
  }, []);

  const removerOperador = async (id) => {
    const restante = operadores.filter((op) => op.id !== id);
    setOperadores(restante);
    await AsyncStorage.setItem('operadores', JSON.stringify(restante));
  };

  const confirmarRemocao = (operador) => {
    Alert.alert(
      'Remover operador',
      `Tem certeza que deseja remover ${operador.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removerOperador(operador.id) },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}>
      <FontAwesome name="user" size={24} color={colors.primary} />
      <View style={styles.textos}>
        <Text style={[styles.nome, { color: themeColors.text }]}>{item.nome}</Text>
        <Text style={{ color: themeColors.text }}>{item.email}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmarRemocao(item)}>
        <FontAwesome name="trash" size={20} color="#ff5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.logo, { color: themeColors.text }]}>
        easy<Text style={{ color: colors.primary }}>Moto</Text>
      </Text>
      <Text style={[styles.titulo, { color: themeColors.text }]}>Operadores cadastrados</Text>

      {operadores.length === 0 ? (
        <Text style={[styles.textoVazio, { color: themeColors.text }]}>Nenhum operador encontrado.</Text>
      ) : (
        <FlatList
          data={operadores}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  logo: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 15, marginBottom: 15, gap: 15 },
  textos: { flex: 1 },
  nome: { fontSize: 16, fontWeight: 'bold' },
  textoVazio: { marginTop: 20, textAlign: 'center' },
});
