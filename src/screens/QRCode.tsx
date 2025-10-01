import { CameraView, useCameraPermissions } from 'expo-camera';
import { useContext, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import ThemeToggleButton from '../components/ThemeToggleButton';
import { ThemeContext } from '../contexts/ThemeContext';
import { colors } from '../styles/colors';

export default function QRCode() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.text, { color: themeColors.text }]}>Permissão da câmera negada.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemeToggleButton />
      <Text style={[styles.title, { color: themeColors.text }]}>Escaneie o QR Code da moto</Text>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={({ type, data }) => {
          if (!scanned) {
            setScanned(true);
            Alert.alert('QR Code lido', `Tipo: ${type}\nConteúdo: ${data}`);
            setTimeout(() => setScanned(false), 2500);
          }
        }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  camera: { width: '90%', height: 320, borderRadius: 12, overflow: 'hidden' },
  text: { marginTop: 60, fontSize: 16, textAlign: 'center' },
});
