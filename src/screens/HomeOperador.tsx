import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useContext } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Opcao = { id: 'patio' | 'motos' | 'qrcode' | 'notificacoes' | 'relatorios' | 'perfil'; titulo: string; subtitulo: string; icone: keyof typeof FontAwesome.glyphMap };

const opcoes: Opcao[] = [
  { id: 'patio', titulo: 'Pátio', subtitulo: 'Mapa do pátio e localização das motos', icone: 'dashboard' },
  { id: 'motos', titulo: 'Motos Cadastradas', subtitulo: 'Registro das motos já cadastradas', icone: 'motorcycle' },
  { id: 'qrcode', titulo: 'QR Code', subtitulo: 'Escanear motos', icone: 'qrcode' },
  { id: 'notificacoes', titulo: 'Notificações', subtitulo: 'Alertas operacionais', icone: 'exclamation-circle' },
  { id: 'relatorios', titulo: 'Relatórios das Motos', subtitulo: 'Atualização semanal da filial', icone: 'bar-chart' },
  { id: 'perfil', titulo: 'Meu Perfil', subtitulo: 'Gerenciar meu perfil', icone: 'user' }
];

export default function HomeOperador() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  function handlePress(item: Opcao) {
    if (item.id === 'patio') { navigation.navigate('PatioModelos'); return; }
    if (item.id === 'motos') { navigation.navigate('Registro', { canEdit: true }); return; }
    if (item.id === 'qrcode') { navigation.navigate('QRCode'); return; }
    if (item.id === 'notificacoes') { navigation.navigate('Notificacoes'); return; }
    if (item.id === 'relatorios') { navigation.navigate('Relatorio'); return; }
    if (item.id === 'perfil') { navigation.navigate('Perfil'); return; }
  }

  function renderItem({ item }: { item: Opcao }) {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}
        onPress={() => handlePress(item)}
        activeOpacity={0.9}
      >
        <FontAwesome name={item.icone} size={26} color={isDark ? '#00c853' : colors.buttonBg} />
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>{item.titulo}</Text>
          <Text style={[styles.cardSub, { color: isDark ? '#ccc' : '#666' }]}>{item.subtitulo}</Text>
        </View>
        <FontAwesome name="angle-right" size={20} color="#999" />
      </TouchableOpacity>
    );
  }

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
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  logo: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 15, marginBottom: 15, gap: 15 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13, marginTop: 2 }
});
