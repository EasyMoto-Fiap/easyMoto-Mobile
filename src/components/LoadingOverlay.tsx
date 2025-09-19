import { Modal, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

type Props = {
  visible: boolean;
  text?: string | null;
};

function getPalette() {
  const c: any = colors || {};
  const bg = c?.dark?.background || '#121212';
  const text = c?.dark?.text || '#ffffff';
  const spinner = c?.primary || '#4caf50';
  return { bg, text, spinner };
}

export default function LoadingOverlay({ visible, text }: Props) {
  const palette = getPalette();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.box, { backgroundColor: palette.bg }]}>
          <ActivityIndicator size="large" color={palette.spinner} />
          {text ? <Text style={[styles.text, { color: palette.text }]}>{text}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  box: { padding: 20, borderRadius: 16, minWidth: 160, alignItems: 'center' },
  text: { marginTop: 12, fontSize: 14, textAlign: 'center' }
});
