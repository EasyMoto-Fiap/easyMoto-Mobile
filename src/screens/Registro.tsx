import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import ThemeToggleButton from '../components/ThemeToggleButton';
import { ThemeContext } from '../contexts/ThemeContext';
import { listarMotos } from '../services/motos';
import { colors } from '../styles/colors';

type TipoMoto = 'Pop' | 'Sport' | 'E';
type CorHex = string;

type _MotoLocal = {
  id: string;
  nome: string;
  tipo: TipoMoto;
  status: CorHex;
};

const legendaCores: Record<string, string> = {
  Pendência: '#e6c300',
  'Reparos Simples': '#0074cc',
  'Danos Estruturais Graves': '#ff4500',
  'Motor Defeituoso': '#ff0000',
  'Agendada para Manutenção': '#808080',
  'Pronta para Aluguel': '#006400',
  'Sem Placa': '#da70d6',
};

const corToLegenda: Record<string, string> = {
  '#e6c300': 'Pendência',
  '#0074cc': 'Reparos Simples',
  '#ff4500': 'Danos Estruturais Graves',
  '#ff0000': 'Motor Defeituoso',
  '#808080': 'Agendada para Manutenção',
  '#006400': 'Pronta para Aluguel',
  '#da70d6': 'Sem Placa',
};

export default function Relatorio() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [contagem, setContagem] = useState<Record<string, number>>({});

  async function carregar() {
    const data = await listarMotos(1, 1000);
    const lista: any[] = Array.isArray(data) ? data : (data?.items ?? []);
    const cont: Record<string, number> = {};
    for (const m of lista) {
      const cor = m?.cor as string | undefined;
      const placa = m?.placa as string | undefined;
      let statusNome: string | undefined = undefined;
      if (cor && corToLegenda[cor]) statusNome = corToLegenda[cor];
      else if (!placa) statusNome = 'Sem Placa';
      if (statusNome) cont[statusNome] = (cont[statusNome] || 0) + 1;
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

  const labels = useMemo(() => Object.keys(contagem), [contagem]);
  const values = useMemo(() => labels.map((k) => contagem[k]), [labels, contagem]);
  const barColors = useMemo(
    () => labels.map((label) => legendaCores[label] || colors.primary),
    [labels],
  );

  const chartData: any = {
    labels,
    datasets: [
      {
        data: values,
        colors: barColors.map(
          (c) =>
            (_opacity: number = 1) =>
              c,
        ),
      },
    ],
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.topHeader}>
        <ThemeToggleButton />
      </View>

      <View style={styles.logoContainer}>
        <Text style={[styles.logo, { color: themeColors.text }]}>
          easy<Text style={{ color: colors.primary }}>Moto</Text>
        </Text>
      </View>

      <Text style={[styles.title, { color: themeColors.text }]}>Relatório de Motos por Status</Text>

      {labels.length > 0 ? (
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
          style={{ marginTop: 40, marginBottom: 30, borderRadius: 16 }}
          fromZero
          showValuesOnTopOfBars
          verticalLabelRotation={20}
        />
      ) : (
        <Text style={[styles.text, { color: themeColors.text }]}>Nenhum dado disponível.</Text>
      )}

      <Text style={[styles.subtitle, { color: themeColors.text }]}>Legenda:</Text>
      {Object.entries(legendaCores).map(([label, cor]) => (
        <View key={label} style={styles.legendaItem}>
          <View style={[styles.corBox, { backgroundColor: cor }]} />
          <Text style={{ color: themeColors.text }}>{label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topHeader: { alignItems: 'flex-end', marginBottom: 10 },
  logoContainer: { alignItems: 'center', marginBottom: 20, marginTop: 60 },
  logo: { fontSize: 30, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 1 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 5, marginBottom: 10 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  corBox: { width: 16, height: 16, borderRadius: 4, marginRight: 8 },
  text: { fontSize: 16, textAlign: 'center', marginTop: 20 },
});
