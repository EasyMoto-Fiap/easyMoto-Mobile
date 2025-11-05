import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import ThemeToggleButton from '../components/ThemeToggleButton';
import LanguageToggleButton from '../components/LanguageToggleButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { listarMotos } from '../services/motos';
import { colors } from '../styles/colors';
import { t } from '../i18n';

type TipoMoto = 'Pop' | 'Sport' | 'E';

const statusColorByKey: Record<
  'pendencia' | 'reparosSimples' | 'danosGraves' | 'motorDefeituoso' | 'agendada' | 'pronta' | 'semPlaca',
  string
> = {
  pendencia: '#e6c300',
  reparosSimples: '#0074cc',
  danosGraves: '#ff4500',
  motorDefeituoso: '#ff0000',
  agendada: '#808080',
  pronta: '#006400',
  semPlaca: '#da70d6',
};

const colorToKey: Record<string, keyof typeof statusColorByKey> = {
  '#e6c300': 'pendencia',
  '#0074cc': 'reparosSimples',
  '#ff4500': 'danosGraves',
  '#ff0000': 'motorDefeituoso',
  '#808080': 'agendada',
  '#006400': 'pronta',
  '#da70d6': 'semPlaca',
};

const legendOrder: (keyof typeof statusColorByKey)[] = [
  'pendencia',
  'reparosSimples',
  'danosGraves',
  'motorDefeituoso',
  'agendada',
  'pronta',
  'semPlaca',
];

export default function Relatorio() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  useContext(LanguageContext);

  const [contagem, setContagem] = useState<Record<keyof typeof statusColorByKey, number>>({} as any);

  async function carregar() {
    const data = await listarMotos(1, 1000);
    const lista: any[] = Array.isArray(data) ? data : (data?.items ?? []);
    const cont: Record<keyof typeof statusColorByKey, number> = {} as any;
    for (const m of lista) {
      const cor = m?.cor as string | undefined;
      const placa = m?.placa as string | undefined;
      let key: keyof typeof statusColorByKey | undefined = undefined;
      if (cor && colorToKey[cor]) key = colorToKey[cor];
      else if (!placa) key = 'semPlaca';
      if (key) cont[key] = (cont[key] || 0) + 1;
    }
    setContagem(cont);
  }

  useEffect(() => {
    carregar();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, []),
  );

  const keys = useMemo(() => Object.keys(contagem) as (keyof typeof statusColorByKey)[], [contagem]);
  const values = useMemo(() => keys.map(k => contagem[k]), [keys, contagem]);
  const barColors = useMemo(() => keys.map(k => statusColorByKey[k]), [keys]);
  const xLabels = useMemo(() => keys.map(() => ''), [keys]);

  const chartData: any = {
    labels: xLabels,
    datasets: [
      {
        data: values,
        colors: barColors.map((c) => () => c),
      },
    ],
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <View style={styles.togglesRow}>
        <View style={styles.langBadge}>
          <LanguageToggleButton />
        </View>
        <View style={{ width: 8 }} />
        <ThemeToggleButton />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.logoRow}>
          <LogoEasyMoto size={42} />
        </View>

        <Text style={[styles.title, { color: themeColors.text }]}>{t('report.title')}</Text>

        {values.length > 0 ? (
          <BarChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={320}
            withInnerLines
            withCustomBarColorFromData
            flatColor
            segments={5}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: themeColors.background,
              backgroundGradientFrom: themeColors.background,
              backgroundGradientTo: themeColors.background,
              fillShadowGradientOpacity: 1,
              barPercentage: 0.6,
              decimalPlaces: 0,
              color: () => 'rgba(0,0,0,1)',
              labelColor: () => themeColors.text,
              propsForBackgroundLines: { stroke: isDark ? '#444' : '#ccc' },
            }}
            style={{ marginTop: 24, marginBottom: 30, borderRadius: 16 }}
            fromZero
            showValuesOnTopOfBars
          />
        ) : (
          <Text style={[styles.text, { color: themeColors.text }]}>{t('report.noData')}</Text>
        )}

        <Text style={[styles.subtitle, { color: themeColors.text }]}>{t('report.legend')}</Text>
        {legendOrder.map((k) => (
          <View key={k} style={styles.legendaItem}>
            <View style={[styles.corBox, { backgroundColor: statusColorByKey[k] }]} />
            <Text style={{ color: themeColors.text }}>{t(`report.status.${k}`)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 120 },
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
  logoRow: { alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 10 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  corBox: { width: 16, height: 16, borderRadius: 4, marginRight: 8 },
  text: { fontSize: 16, textAlign: 'center', marginTop: 24 },
});
