import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TopRightToggles from '../components/TopRightToggles';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../styles/colors';
import { t } from '../i18n';

type Opcao = {
  id: 'operadores' | 'patio' | 'notificacoes' | 'relatorios' | 'perfil' | 'sobreapp';
  titulo: string;
  subtitulo: string;
  icone: keyof typeof FontAwesome.glyphMap;
};

export default function HomeAdmin() {
  const { theme } = useContext(ThemeContext);
  useContext(LanguageContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const opcoes: Opcao[] = [
    {
      id: 'operadores',
      titulo: t('adminHome.options.operadores.title'),
      subtitulo: t('adminHome.options.operadores.subtitle'),
      icone: 'users',
    },
    {
      id: 'patio',
      titulo: t('adminHome.options.patio.title'),
      subtitulo: t('adminHome.options.patio.subtitle'),
      icone: 'dashboard',
    },
    {
      id: 'notificacoes',
      titulo: t('adminHome.options.notificacoes.title'),
      subtitulo: t('adminHome.options.notificacoes.subtitle'),
      icone: 'exclamation-circle',
    },
    {
      id: 'relatorios',
      titulo: t('adminHome.options.relatorios.title'),
      subtitulo: t('adminHome.options.relatorios.subtitle'),
      icone: 'bar-chart',
    },
    {
      id: 'perfil',
      titulo: t('adminHome.options.perfil.title'),
      subtitulo: t('adminHome.options.perfil.subtitle'),
      icone: 'user',
    },
    {
      id: 'sobreapp',
      titulo: t('adminHome.options.sobreapp.title'),
      subtitulo: t('adminHome.options.sobreapp.subtitle'),
      icone: 'info-circle',
    },
  ];

  function handlePress(item: Opcao) {
    if (item.id === 'operadores') { navigation.navigate('GerenciarOperadores'); return; }
    if (item.id === 'patio') { navigation.navigate('PatioModelos'); return; }
    if (item.id === 'notificacoes') { navigation.navigate('Notificacoes'); return; }
    if (item.id === 'relatorios') { navigation.navigate('Relatorio'); return; }
    if (item.id === 'perfil') { navigation.navigate('Perfil'); return; }
    if (item.id === 'sobreapp') { navigation.navigate('SobreApp'); return; }
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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TopRightToggles />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 120, paddingHorizontal: 22 },
  logoRow: { alignSelf: 'center', marginBottom: 28 },
  listContent: { paddingBottom: 36, rowGap: 16 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 18, gap: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13, marginTop: 4 },
});
