import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ThemeToggleButton from '../components/ThemeToggleButton';
import LanguageToggleButton from '../components/LanguageToggleButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { deletarNotificacao, listarNotificacoes, type Notificacao } from '../services/notificacoes';
import { colors } from '../styles/colors';
import { t } from '../i18n';

export default function Notificacoes() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  useContext(LanguageContext);

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
        try {
          await deletarNotificacao(n.id);
        } catch {}
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
      <View style={styles.toggle}><ThemeToggleButton /></View>
      <View style={styles.langBadge}><LanguageToggleButton /></View>
      <View style={styles.logoRow}><LogoEasyMoto size={42} /></View>

      <Text style={[styles.title, { color: themeColors.text }]}>{t('notifications.historyTitle')}</Text>

      <View style={{ flex: 1, alignSelf: 'stretch' }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <ScrollView style={{ marginTop: 10, flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
            {!lista || lista.length === 0 ? (
              <Text style={[styles.text, { color: themeColors.text, textAlign: 'center', marginTop: 20 }]}>
                {t('notifications.empty')}
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
  container: { flex: 1, paddingTop: 120, paddingHorizontal: 22, alignItems: 'center' },
  toggle: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  langBadge: { position: 'absolute', top: 16, right: 60, zIndex: 10, padding: 35, paddingRight: 10 },
  logoRow: { alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, alignSelf: 'flex-start' },
  text: { fontSize: 16 },
  alertaItem: { padding: 12, borderRadius: 12, marginBottom: 10 },
  iconButton: { padding: 12, marginHorizontal: 8 },
  bottomActions: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12, borderTopWidth: 1, alignSelf: 'stretch' }
});
