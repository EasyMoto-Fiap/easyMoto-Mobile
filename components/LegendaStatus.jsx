import { View, Text, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const legenda = [
  { cor: 'yellow', nome: 'Pendência' },
  { cor: 'blue', nome: 'Reparos Simples' },
  { cor: 'red', nome: 'Defeito grave' },
  { cor: 'gray', nome: 'Manutenção' },
  { cor: 'green', nome: 'Pronta p/ aluguel' },
  { cor: 'purple', nome: 'Sem placa' },
  { cor: 'pink', nome: 'Minha Mottu' },
];

export default function LegendaStatus() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDark && { color: '#fff' }]}>Legendas:</Text>
      {legenda.map((item, index) => (
        <View key={index} style={styles.row}>
          <View style={[styles.bola, { backgroundColor: item.cor }]} />
          <Text style={[styles.text, isDark && { color: '#eee' }]}>{item.nome}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  bola: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  text: {
    fontSize: 13,
  },
});
