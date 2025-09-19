import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../src/navigation/RootNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';

export default function VoltarParaHome() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();

    return (
    <TouchableOpacity
        style={[styles.container, { bottom: insets.bottom + 16, backgroundColor: colors.inputBg }]}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.85}
    >
        <FontAwesome name="chevron-left" size={18} color={colors.buttonBg} />
        <Text style={[styles.text, { color: colors.buttonBg }]}>Voltar para a tela inicial</Text>
    </TouchableOpacity>
);
}

const styles = StyleSheet.create({
container: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 10
},
text: {
    fontSize: 14,
    fontWeight: 'bold'
    }
});
