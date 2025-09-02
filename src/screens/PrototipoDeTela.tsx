import { View, Text, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../../styles/colors';

export default function PrototipoDeTela() {
  const route = useRoute<RouteProp<RootStackParamList, 'PrototipoDeTela'>>();
  const { theme } = useContext(ThemeContext);
  const themeColors = theme === 'dark' ? colors.dark : colors.light;
  const titulo = route.params.titulo;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>{titulo}</Text>
      <Text style={[styles.subtitle, { color: theme === 'dark' ? colors.mutedText : '#666' }]}>Em breve</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center' }
});
