import { CameraView, useCameraPermissions } from 'expo-camera';
import { useContext, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import ThemeToggleButton from '../components/ThemeToggleButton';
import LanguageToggleButton from '../components/LanguageToggleButton';
import LogoEasyMoto from '../components/LogoEasyMoto';
import { ThemeContext } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { colors } from '../styles/colors';
import { t } from '../i18n';

export default function QRCode() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  useContext(LanguageContext);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission, requestPermission]);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.togglesRow}>
          <View style={styles.langBadge}>
            <LanguageToggleButton />
          </View>
          <View style={{ width: 8 }} />
          <ThemeToggleButton />
        </View>

        <View style={styles.logoRow}>
          <LogoEasyMoto size={42} />
        </View>
        <Text style={[styles.text, { color: themeColors.text }]}>{t('qrcode.permissionDenied')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.togglesRow}>
        <View style={styles.langBadge}>
          <LanguageToggleButton />
        </View>
        <View style={{ width: 8 }} />
        <ThemeToggleButton />
      </View>

      <View style={styles.logoRow}>
        <LogoEasyMoto size={42} />
      </View>

      <Text style={[styles.title, { color: themeColors.text }]}>{t('qrcode.title')}</Text>

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={({ type, data }) => {
          if (!scanned) {
            setScanned(true);
            Alert.alert(t('qrcode.alertTitle'), t('qrcode.alertContent', { type, data }));
            setTimeout(() => setScanned(false), 2500);
          }
        }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 120, alignItems: 'center' },
  togglesRow: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBadge: {
    padding: 20,
    paddingRight: 1,
  },
  logoRow: { alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  camera: { width: '90%', height: 320, borderRadius: 12, overflow: 'hidden' },
  text: { marginTop: 12, fontSize: 16, textAlign: 'center' },
});
