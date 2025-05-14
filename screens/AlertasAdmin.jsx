import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { colors } from '../styles/colors';

export default function AlertasAdmin() {
  const { theme } = useContext(ThemeContext);
  const themeColors = theme === 'dark' ? colors.dark : colors.light;
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      const dados = await AsyncStorage.getItem('historicoMotos');
      setAlertas(dados ? JSON.parse(dados) : []);
    };
    carregar();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.titulo, { color: themeColors.text }]}>Alertas do Sistema</Text>

      <ScrollView style={{ marginTop: 20 }}>
        {alertas.length === 0 ? (
          <Text style={[styles.texto, { color: themeColors.text }]}>Nenhum alerta registrado.</Text>
        ) : (
          alertas.map((item, i) => (
            <Text key={i} style={{ color: themeColors.text, marginBottom: 10 }}>{item}</Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  texto: { fontSize: 16, marginTop: 20 },
});
