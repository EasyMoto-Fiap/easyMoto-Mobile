import { Snackbar } from 'react-native-paper';

import * as appColors from '../styles/colors';

type Props = {
  visible: boolean;
  message: string | null;
  onDismiss: () => void;
  duration?: number;
};

function getPalette() {
  const c: any = (appColors as any).default ?? (appColors as any);
  return {
    bg: c.error || c.danger || '#c62828',
    text: c.onError || c.white || '#ffffff',
  };
}

export default function ErrorSnackbar({ visible, message, onDismiss, duration = 4000 }: Props) {
  const palette = getPalette();
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      style={{ backgroundColor: palette.bg }}
      action={{ label: 'Fechar', onPress: onDismiss, textColor: palette.text }}
    >
      {message || ''}
    </Snackbar>
  );
}
