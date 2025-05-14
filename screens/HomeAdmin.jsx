import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';

const opcoes = [
  { id: '1', titulo: 'Painel de Filiais', rota: 'DashboardFilial', icone: 'building' },
  { id: '2', titulo: 'Gerenciar Operadores', rota: 'GerenciarOperadores', icone: 'users' },
  { id: '3', titulo: 'Relatórios e Estatísticas', rota: 'Relatorios', icone: 'bar-chart' },
  { id: '4', titulo: 'Alertas da Plataforma', rota: 'AlertasAdmin', icone: 'exclamation-triangle' },
];

export default function HomeAdmin({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}
      onPress={() => navigation.navigate(item.rota)}
    >
      <FontAwesome name={item.icone} size={26} color={isDark ? '#00c853' : '#004d25'} />
      <View style={styles.textos}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>{item.titulo}</Text>
      </View>
      <FontAwesome name="angle-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.logo, { color: themeColors.text }]}>easy<Text style={{ color: colors.primary }}>Moto</Text></Text>

      <FlatList
        data={opcoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  logo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 15, marginBottom: 15, gap: 15 },
  textos: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
});
