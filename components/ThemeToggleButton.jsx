import { TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export default function ThemeToggleButton({ position = { top: 50, right: 30 } }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        position: 'absolute',
        top: position.top,
        right: position.right,
        zIndex: 10,
      }}
    >
      <FontAwesome name={isDark ? 'sun-o' : 'moon-o'} size={24} color={isDark ? '#fff' : '#000'} />
    </TouchableOpacity>
  );
}
