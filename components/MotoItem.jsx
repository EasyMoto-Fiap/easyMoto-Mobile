import { TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function MotoItem({ moto, onPress, onLongPress }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(moto)}
      onLongPress={() => onLongPress(moto)}
      style={styles.item}
    >
      <FontAwesome name="motorcycle" size={36} color={moto.status} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    margin: 10,
  },
});
