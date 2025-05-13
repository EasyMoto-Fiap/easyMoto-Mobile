import { View, Text, StyleSheet, Alert } from 'react-native';
import { useEffect, useRef, useState, useContext } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemeContext } from '../contexts/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { colors } from '../styles/colors';

export default function QRCode() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permissão da câmera negada.</Text>
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
            setTimeout(() => setScanned(false), 3000);
          }
        }}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  camera: {
    width: '90%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  text: {
    marginTop: 60,
    fontSize: 16,
    textAlign: 'center',
  },
});
