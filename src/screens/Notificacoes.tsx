import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { listarNotificacoes, deletarNotificacao, type Notificacao } from '../services/notificacoes';

export default function Notificacoes() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [lista, setLista] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const userRaw = await AsyncStorage.getItem('usuarioAtual');
      const user = userRaw ? JSON.parse(userRaw) : undefined;
      const itens = await listarNotificacoes({ page: 1, pageSize: 100, escopo: 0, filialId: user?.filialId });
      setLista(itens);
    } catch {
      setLista([]);
    } finally {
      setLoading(false);
    }
  }

  async function apagarTodos() {
    if (!lista?.length) return;
    setLoading(true);
    try {
      for (const n of lista) {
        try { await deletarNotificacao(n.id); } catch {}
      }
      await carregar();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[styles.logo, { color: themeColors.text }]}>
          easy<Text style={{ color: colors.primary }}>Moto</Text>
        </Text>
        <ThemeToggleButton />
      </View>

      <Text style={[styles.title, { color: themeColors.text }]}>Histórico de alterações nas motos</Text>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <ScrollView style={{ marginTop: 10, flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            {(!lista || lista.length === 0) ? (
              <Text style={[styles.text, { color: themeColors.text, textAlign: 'center', marginTop: 20 }]}>
                Nenhum alerta ou histórico disponível.
              </Text>
            ) : (
              lista.map((n) => (
                <View key={n.id} style={[styles.alertaItem, { backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0' }]}>
                  <Text style={{ color: themeColors.text }}>{n.mensagem}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <View style={[styles.bottomActions, { borderTopColor: isDark ? '#333' : '#ddd' }]}>
        <TouchableOpacity style={styles.iconButton} onPress={carregar}>
          <FontAwesome name="refresh" size={20} color={themeColors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={apagarTodos}>
          <FontAwesome name="trash" size={20} color={themeColors.text} />
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
