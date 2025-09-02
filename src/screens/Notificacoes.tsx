import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../../styles/colors';
import ThemeToggleButton from '../../components/ThemeToggleButton';

export default function Notificacoes() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [alertas, setAlertas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function carregarAlertas() {
    setLoading(true);
    const dados = await AsyncStorage.getItem('historicoMotos');
    setAlertas(dados ? JSON.parse(dados) : []);
    setLoading(false);
  }

  async function limparAlertas() {
    await AsyncStorage.removeItem('historicoMotos');
    setAlertas([]);
  }

  useEffect(() => {
    carregarAlertas();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.logo, { color: themeColors.text }]}>
        easy<Text style={{ color: colors.primary }}>Moto</Text>
      </Text>
      <Text style={[styles.title, { color: themeColors.text }]}>Histórico de alterações nas motos</Text>
      <ScrollView style={{ marginTop: 10, flex: 1 }}>
        {alertas.length === 0 ? (
          <Text style={[styles.text, { color: themeColors.text, textAlign: 'center', marginTop: 20 }]}>
            Nenhum alerta ou histórico disponível.
          </Text>
        ) : (
          alertas.map((item, index) => (
            <View key={index} style={[styles.alertaItem, { backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0' }]}>
              <Text style={{ color: themeColors.text }}>{item}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={[styles.bottomActions, { borderTopColor: isDark ? '#333' : '#ddd' }]}>
        <TouchableOpacity onPress={carregarAlertas} style={styles.iconButton} activeOpacity={0.8}>
          {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <FontAwesome name="refresh" size={22} color={colors.primary} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={limparAlertas} style={styles.iconButton} activeOpacity={0.8}>
          <FontAwesome name="trash" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  logo: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, textAlign: 'left' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 16 },
  alertaItem: { padding: 12, borderRadius: 8, marginBottom: 10 },
  iconButton: { padding: 12, marginHorizontal: 8 },
  bottomActions: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1 }
});
