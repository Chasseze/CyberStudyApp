import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ErrorBoundary } from './src/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { configureNotificationChannel } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    configureNotificationChannel().catch((error) => {
      console.warn('Failed to configure notification channel', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#020617' }}>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <RootNavigator />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
