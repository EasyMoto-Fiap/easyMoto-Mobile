// Componente para o botão das telas de login, cadastro, Home
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';

type Props = {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle | ViewStyle[];
};

export default function GradientButton({ title, onPress, loading, disabled, style }: Props) {
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} disabled={disabled || !!loading} style={[styles.touchable, style]}>
        <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, (disabled || loading) ? { opacity: 0.9 } : null]}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.text}>{title}</Text>}
        </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    touchable: { borderRadius: 30, overflow: 'hidden' },
    button: { paddingVertical: 15, borderRadius: 30, alignItems: 'center' },
    text: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
