import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ThemeToggleButton from '../components/ThemeToggleButton';
import LanguageToggleButton from '../components/LanguageToggleButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../styles/colors';
import { t } from '../i18n';

type Opcao = {
  id: 'patio' | 'motos' | 'qrcode' | 'notificacoes' | 'relatorios' | 'perfil';
  titulo: string;
  subtitulo: string;
  icone: keyof typeof FontAwesome.glyphMap;
};

export default function HomeOperador() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useContext(LanguageContext);

  const opcoes: Opcao[] = [
    { id: 'patio', titulo: t('operatorHome.options.patio.title'), subtitulo: t('operatorHome.options.patio.subtitle'), icone: 'dashboard' },
    { id: 'motos', titulo: t('operatorHome.options.motos.title'), subtitulo: t('operatorHome.options.motos.subtitle'), icone: 'motorcycle' },
    { id: 'qrcode', titulo: t('operatorHome.options.qrcode.title'), subtitulo: t('operatorHome.options.qrcode.subtitle'), icone: 'qrcode' },
    { id: 'notificacoes', titulo: t('operatorHome.options.notificacoes.title'), subtitulo: t('operatorHome.options.notificacoes.subtitle'), icone: 'exclamation-circle' },
    { id: 'relatorios', titulo: t('operatorHome.options.relatorios.title'), subtitulo: t('operatorHome.options.relatorios.subtitle'), icone: 'bar-chart' },
    { id: 'perfil', titulo: t('operatorHome.options.perfil.title'), subtitulo: t('operatorHome.options.perfil.subtitle'), icone: 'user' },
  ];

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
      <View style={styles.toggle}>
        <ThemeToggleButton />
      </View>
      <View style={styles.langBadge}>
        <LanguageToggleButton />
      </View>

      <View style={styles.logoRow}>
        <LogoEasyMoto size={42} />
      </View>

      <FlatList
        data={opcoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 120, paddingHorizontal: 22 },
  toggle: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  langBadge: { position: 'absolute', top: 16, right: 60, zIndex: 10, padding: 35, paddingRight: 10 },
  logoRow: { alignSelf: 'center', marginBottom: 28 },
  listContent: { paddingBottom: 36, rowGap: 16 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 18, gap: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13, marginTop: 4 },
});
