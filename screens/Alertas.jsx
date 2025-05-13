// Alertas.jsx com botões inferiores e ícones verdes
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

export default function Alertas() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarAlertas = async () => {
    setLoading(true);
    const dados = await AsyncStorage.getItem('historicoMotos');
    setAlertas(dados ? JSON.parse(dados) : []);
    setLoading(false);
  };

  const limparAlertas = async () => {
    await AsyncStorage.removeItem('historicoMotos');
    setAlertas([]);
  };

  useEffect(() => {
    carregarAlertas();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />

      <Text style={[styles.logo, { color: themeColors.text }]}>easy<Text style={{ color: colors.primary }}>Moto</Text></Text>

      <Text style={[styles.title, { color: themeColors.text }]}>Histórico de alterações nas motos</Text>

      <ScrollView style={{ marginTop: 10, flex: 1 }}>
        {alertas.length === 0 ? (
          <Text style={[styles.text, { color: themeColors.text, textAlign: 'center', marginTop: 20 }]}>Nenhum alerta ou histórico disponível.</Text>
        ) : (
          alertas.map((item, index) => (
            <View key={index} style={[styles.alertaItem, { backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0' }]}>
              <Text style={{ color: themeColors.text }}>{item}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity onPress={carregarAlertas} style={styles.iconButton}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <FontAwesome name="refresh" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={limparAlertas} style={styles.iconButton}>
          <FontAwesome name="trash" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  logo: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  alertaItem: { padding: 12, borderRadius: 8, marginBottom: 10 },
  text: { fontSize: 16 },
  iconButton: { padding: 12, marginHorizontal: 8 },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#444'
  }
});