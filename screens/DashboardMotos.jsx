import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';

const modelos = [
  { nome: 'Mottu Pop', desc: 'Primeira Mottu', tipo: 'Pop' },
  { nome: 'Mottu Sport', desc: 'Mais econômica', tipo: 'Sport' },
  { nome: 'Mottu-E', desc: 'Moto elétrica', tipo: 'E' },
];

export default function DashboardMotos() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.logo, { color: themeColors.text }]}>
        <Text style={{ color: colors.primary }}>easy</Text>Moto
      </Text>
      <Text style={[styles.title, { color: themeColors.text }]}>Modelos disponíveis:</Text>
      <Text style={[styles.subtitle, { color: themeColors.text }]}>
        Visualize no mapa real por tipo
      </Text>

      {modelos.map((item) => (
        <View
          key={item.nome}
          style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}
        >
          <FontAwesome name="motorcycle" size={26} color="#00c853" />
          <View style={styles.textos}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>{item.nome}</Text>
            <Text style={[styles.cardSub, { color: '#999' }]}>{item.desc}</Text>
            <TouchableOpacity
              style={styles.botao}
              onPress={() => navigation.navigate('PatioMapaReal', { tipo: item.tipo })}
            >
              <Text style={styles.botaoTexto}>Ver no mapa</Text>
            </TouchableOpacity>
          </View>
          <FontAwesome name="angle-right" size={20} color="#888" />
        </View>
      ))}
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
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    gap: 15,
  },
  textos: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSub: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  botao: {
    backgroundColor: '#00c853',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
