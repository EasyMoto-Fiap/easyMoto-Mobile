import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ThemeToggleButton from '../components/ThemeToggleButton';
import LanguageToggleButton from '../components/LanguageToggleButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { deletarNotificacao, listarNotificacoes, type Notificacao } from '../services/notificacoes';
import { registerForPushNotificationsAsync } from '../services/push';
import { colors } from '../styles/colors';
import { t } from '../i18n';

const PUSH_STORE_KEY = 'pushHistory';
const PUSH_TOKEN_KEY = 'pushToken';

export default function Notificacoes() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;
  useContext(LanguageContext);

  const [lista, setLista] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);

  async function getPushHistory(): Promise<Notificacao[]> {
    const raw = await AsyncStorage.getItem(PUSH_STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  async function addPushHistory(item: Notificacao) {
    const prev = await getPushHistory();
    const next = [item, ...prev].slice(0, 200);
    await AsyncStorage.setItem(PUSH_STORE_KEY, JSON.stringify(next));
  }

  async function carregar() {
    setLoading(true);
    try {
      const userRaw = await AsyncStorage.getItem('usuarioAtual');
      const user = userRaw ? JSON.parse(userRaw) : undefined;
      const itensApi = await listarNotificacoes({ page: 1, pageSize: 100, escopo: 0, filialId: user?.filialId });
      const itensPush = await getPushHistory();
      setLista([...itensPush, ...itensApi]);
    } catch {
      const itensPush = await getPushHistory();
      setLista(itensPush);
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
      await AsyncStorage.removeItem(PUSH_STORE_KEY);
      await carregar();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let subReceive: Notifications.Subscription | undefined;

    carregar();

    registerForPushNotificationsAsync().then(async (token) => {
      if (token) await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    });

    subReceive = Notifications.addNotificationReceivedListener(async (notif) => {
      const title = notif.request.content.title ?? '';
      const body = notif.request.content.body ?? '';
      const msg = [title, body].filter(Boolean).join(' — ') || JSON.stringify(notif.request.content.data);
      const item = { id: -Date.now(), mensagem: msg } as Notificacao;
      setLista((prev) => [item, ...prev]);
      await addPushHistory(item);
    });

    return () => {
      subReceive?.remove();
    };
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
                <View key={String(n.id)} style={[styles.alertaItem, { backgroundColor: isDark ? '#1e1e1e' : '#f0f0f0' }]}>
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
