import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

export const scheduleTimerCompletionNotification = async (
  secondsFromNow: number,
  body: string
) => {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Focus session complete ✅',
      body,
  sound: Platform.select({ ios: 'default', android: 'default' }),
    },
    trigger: { seconds: secondsFromNow, channelId: 'focus-timer' },
  });
  return identifier;
};

export const cancelNotification = async (identifier?: string) => {
  if (identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
};

export const configureNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('focus-timer', {
      name: 'Focus Timer',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366f1',
    });
  }
};
