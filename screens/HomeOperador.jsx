import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useContext } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';

const opcoes = [
  {
    id: '1',
    titulo: 'Dashboard Motos',
    subtitulo: 'Filiais das motos',
    rota: 'Dashboard',
    icone: 'dashboard',
  },
  {
    id: '2',
    titulo: 'Painel Das Motos',
    subtitulo: 'Filiais das motos',
    rota: 'Dashboard',
    destinoInterno: 'DashboardFilial',
    origem: 'painel',
    icone: 'motorcycle',
  },
  {
    id: '3',
    titulo: 'QR Code',
    subtitulo: 'escanear motos',
    rota: 'QR Code', 
    icone: 'qrcode',
  },
  {
    id: '4',
    titulo: 'Meu Perfil',
    subtitulo: 'gerenciar meu perfil',
    rota: 'Perfil',
    icone: 'user',
  },
  {
    id: '5',
    titulo: 'Aviso De Anomalias',
    subtitulo: 'alertas operacionais',
    rota: 'Alertas',
    icone: 'exclamation-circle',
  },
  {
    id: '6',
    titulo: 'Graficos De Relatorios',
    subtitulo: 'Atualização semanal da filial',
    rota: 'Relatorios',
    icone: 'bar-chart',
  },
];

export default function HomeOperador({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}
      onPress={() => {
        if (item.destinoInterno) {
          navigation.navigate(item.rota, {
            screen: item.destinoInterno,
            params: { origem: item.origem },
          });
        } else {
          navigation.navigate(item.rota, item.origem ? { origem: item.origem } : undefined);
        }
      }}
    >
      <FontAwesome name={item.icone} size={26} color={isDark ? '#00c853' : '#004d25'} />
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: themeColors.text }]}>{item.titulo}</Text>
        <Text style={[styles.cardSub, { color: isDark ? '#ccc' : '#666' }]}>{item.subtitulo}</Text>
      </View>
      <FontAwesome name="angle-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />

      <Text style={[styles.logo, { color: themeColors.text }]}>
        <Text style={{ color: colors.primary }}>easy</Text>Moto
      </Text>

      <FlatList
        data={opcoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    gap: 15,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSub: {
    fontSize: 13,
    marginTop: 2,
  },
});
