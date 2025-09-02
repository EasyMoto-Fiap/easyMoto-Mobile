import { View, Text, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../../styles/colors';
import type { RootStackParamList } from '../navigation/RootNavigator';

export default function Patio() {
  const route = useRoute<RouteProp<RootStackParamList, 'Patio'>>();
  const { theme } = useContext(ThemeContext);
  const themeColors = theme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Mapa do Pátio</Text>
      <Text style={[styles.subtitle, { color: themeColors.text }]}>Modelo: {route.params.tipo}</Text>
      <Text style={[styles.helper, { color: theme === 'dark' ? colors.mutedText : '#666' }]}>Em breve</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 6, textAlign: 'center' },
  helper: { fontSize: 14, textAlign: 'center' }
});
