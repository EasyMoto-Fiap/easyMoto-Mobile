import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

import { colors } from '../styles/colors';

type Props = {
  icone: keyof typeof FontAwesome.glyphMap;
  titulo: string;
  onPress: () => void;
  style?: ViewStyle;
};

export default function BotaoGradiente({ icone, titulo, onPress, style }: Props) {
  return (
    <TouchableOpacity style={[styles.wrapper, style]} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <FontAwesome name={icone} size={20} color="#fff" style={styles.icon} />
        <Text style={styles.label}>{titulo}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 30,
  },
  icon: { marginRight: 10 },
  label: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
