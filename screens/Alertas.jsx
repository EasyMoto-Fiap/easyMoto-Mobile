import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';

export default function Alertas() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const carregarLogs = async () => {
      const dados = await AsyncStorage.getItem('historicoMotos');
      if (dados) setLogs(JSON.parse(dados));
    };
    carregarLogs();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />

      <Text style={[styles.logoText, { color: themeColors.text }]}>easy<Text style={{ color: colors.primary }}>Moto</Text></Text>

      <Text style={[styles.title, { color: themeColors.text }]}>Histórico de alterações nas motos</Text>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        {logs.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={[styles.noData, { color: themeColors.text }]}>Nenhum alerta ou histórico disponível.</Text>
          </View>
        ) : (
          logs.map((item, index) => (
            <View key={index} style={[styles.logCard, { backgroundColor: isDark ? '#1e1e1e' : '#f3f3f3' }]}>
              <Text style={[styles.logText, { color: themeColors.text }]}>{item}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollArea: {
    paddingBottom: 40,
  },
  logCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  logText: {
    fontSize: 14,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  noData: {
    fontSize: 16,
    textAlign: 'center',
  },
});
