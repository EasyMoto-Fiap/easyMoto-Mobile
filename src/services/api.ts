import axios from 'axios';
import { Platform } from 'react-native';

const PORT = 5230;

const baseURL =
  Platform.OS === 'android'
    ? `http://10.0.2.2:${PORT}/api`   // Android Emulator (Expo)
    : `http://localhost:${PORT}/api`; // iOS Simulator / Web em dev

export default axios.create({ baseURL, timeout: 15000 });
