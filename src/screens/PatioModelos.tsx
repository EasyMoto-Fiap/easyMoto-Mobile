import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import ThemeToggleButton from '../components/ThemeToggleButton';
import LanguageToggleButton from '../components/LanguageToggleButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../styles/colors';
import { t } from '../i18n';

type Modelo = { nome: string; desc: string; tipo: string };

export default function PatioModelos() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  useContext(LanguageContext);

  const modelos: Modelo[] = [
    { nome: 'Mottu Pop', desc: t('patioModelos.models.pop.desc'), tipo: 'Pop' },
    { nome: 'Mottu Sport', desc: t('patioModelos.models.sport.desc'), tipo: 'Sport' },
    { nome: 'Mottu-E', desc: t('patioModelos.models.e.desc'), tipo: 'E' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.togglesRow}>
        <View style={styles.langBadge}>
          <LanguageToggleButton />
        </View>
        <View style={{ width: 8 }} />
        <ThemeToggleButton />
      </View>

      <View style={styles.logoRow}>
        <LogoEasyMoto size={42} />
      </View>

      <Text style={[styles.title, { color: themeColors.text }]}>{t('patioModelos.title')}</Text>
      <Text style={[styles.subtitle, { color: themeColors.text }]}>{t('patioModelos.subtitle')}</Text>

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
              onPress={() => navigation.navigate('Patio', { tipo: item.tipo })}
              activeOpacity={0.9}
            >
              <Text style={styles.botaoTexto}>{t('patioModelos.button')}</Text>
            </TouchableOpacity>
          </View>
          <FontAwesome name="angle-right" size={20} color="#888" />
        </View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 120, paddingHorizontal: 22 },
  togglesRow: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBadge: {
    padding: 20,
    paddingRight: 1,
  },
  logoRow: { alignSelf: 'center', marginBottom: 28 },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 15, marginBottom: 15, gap: 15 },
  textos: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSub: { fontSize: 13, marginTop: 2, marginBottom: 10 },
  botao: { backgroundColor: '#00c853', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', alignSelf: 'flex-start' },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
