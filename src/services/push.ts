import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    finalStatus = req.status;
  }
  if (finalStatus !== 'granted') return null;
  if (!Device.isDevice) return null;

  const token = await Notifications.getDevicePushTokenAsync();
  return token.data as string;
}

export async function sendLocalTest(
  title = 'Teste',
  body = 'Notificação local funcionando.'
) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null
  });
}

export function addNotificationListeners(
  onReceive: (n: Notifications.Notification) => void,
  onResponse?: (r: Notifications.NotificationResponse) => void
) {
  const sub1 = Notifications.addNotificationReceivedListener(onReceive);
  const sub2 = Notifications.addNotificationResponseReceivedListener(
    onResponse ?? (() => {})
  );
  return () => {
    sub1.remove();
    sub2.remove();
  };
}
