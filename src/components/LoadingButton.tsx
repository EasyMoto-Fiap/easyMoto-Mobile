import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../styles/colors';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function LoadingButton({ title, onPress, loading, disabled, style }: Props) {
  const bg = (colors as any)?.buttonBg || '#004d25';
  const textColor = '#ffffff';
  const isDisabled = !!loading || !!disabled;
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bg, opacity: isDisabled ? 0.7 : 1 }, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator size="small" color={textColor} /> : <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 16 }
});
