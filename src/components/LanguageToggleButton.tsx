import { useContext } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { colors } from '../styles/colors';

export default function LanguageToggleButton() {
  const { lang, toggleLang } = useContext(LanguageContext);
  return (
    <Pressable onPress={toggleLang} style={({ pressed }) => [styles.root, pressed && styles.pressed]} hitSlop={10}>
      <FontAwesome name="globe" size={16} color={colors.primary} />
      <Text style={styles.code}>{lang.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center'
  },
  code: { marginLeft: 6, fontWeight: '700', color: colors.primary },
  pressed: { opacity: 0.7 }
});




