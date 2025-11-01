import { useContext } from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';

type Props = {
    size?: number;
    style?: StyleProp<TextStyle>;
};

export default function LogoEasyMoto({ size = 36, style }: Props) {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const themeColors = isDark ? colors.dark : colors.light;

    return (
        <Text style={[styles.wordmark, { fontSize: size, color: themeColors.text }, style]}>
        <Text style={{ color: colors.primary }}>easy</Text>Moto
        </Text>
    );
}

const styles = StyleSheet.create({
    wordmark: {
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});