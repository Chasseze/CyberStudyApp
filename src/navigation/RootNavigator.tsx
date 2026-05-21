import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import {
  AuthStackParamList,
  HistoryStackParamList,
  InsightsStackParamList,
  RootTabParamList,
  SettingsStackParamList,
  TrackerStackParamList,
} from './types';
import { selectAuth, useAppStore } from '../store';
import LoginScreen from '../screens/auth/LoginScreen';
import TrackerHomeScreen from '../screens/tracker/TrackerHomeScreen';
import HistoryListScreen from '../screens/history/HistoryListScreen';
import QuickInsightsScreen from '../screens/insights/QuickInsightsScreen';
import SettingsHomeScreen from '../screens/settings/SettingsHomeScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const TrackerStack = createNativeStackNavigator<TrackerStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
const InsightsStack = createNativeStackNavigator<InsightsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const AuthStackNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
  </AuthStack.Navigator>
);

const TrackerStackNavigator = () => (
  <TrackerStack.Navigator>
    <TrackerStack.Screen
      name="TrackerHome"
      component={TrackerHomeScreen}
      options={{ headerShown: false }}
    />
  </TrackerStack.Navigator>
);

const HistoryStackNavigator = () => (
  <HistoryStack.Navigator>
    <HistoryStack.Screen
      name="HistoryList"
      component={HistoryListScreen}
      options={{ title: 'History' }}
    />
  </HistoryStack.Navigator>
);

const InsightsStackNavigator = () => (
  <InsightsStack.Navigator>
    <InsightsStack.Screen
      name="QuickInsights"
      component={QuickInsightsScreen}
      options={{ headerShown: false }}
    />
  </InsightsStack.Navigator>
);

const SettingsStackNavigator = () => (
  <SettingsStack.Navigator>
    <SettingsStack.Screen
      name="SettingsHome"
      component={SettingsHomeScreen}
      options={{ title: 'Settings' }}
    />
  </SettingsStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#4f46e5',
      tabBarInactiveTintColor: '#6b7280',
      tabBarLabelStyle: { fontSize: 12 },
      tabBarStyle: { paddingBottom: 4, paddingTop: 4, height: 60 },
      tabBarIcon: ({ color, size }) => {
        let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'timer-outline';
        if (route.name === 'TrackerStack') {
          iconName = 'timer-outline';
        } else if (route.name === 'HistoryStack') {
          iconName = 'list-outline';
        } else if (route.name === 'InsightsStack') {
          iconName = 'bar-chart-outline';
        } else if (route.name === 'SettingsStack') {
          iconName = 'settings-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="TrackerStack"
      component={TrackerStackNavigator}
      options={{ title: 'Tracker' }}
    />
    <Tab.Screen
      name="HistoryStack"
      component={HistoryStackNavigator}
      options={{ title: 'History' }}
    />
    <Tab.Screen
      name="InsightsStack"
      component={InsightsStackNavigator}
      options={{ title: 'Insights' }}
    />
    <Tab.Screen
      name="SettingsStack"
      component={SettingsStackNavigator}
      options={{ title: 'Settings' }}
    />
  </Tab.Navigator>
);

const LoadingGate = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617' }}>
    <ActivityIndicator size="large" color="#6366f1" />
  </View>
);

export const RootNavigator = () => {
  const [mounted, setMounted] = React.useState(false);
  const { user, authStatus } = useAppStore(selectAuth);
  
  React.useEffect(() => {
    console.log('[RootNavigator] Component mounted');
    setMounted(true);
  }, []);

  console.log('[RootNavigator] Rendering with user:', user?.email, 'authStatus:', authStatus, 'mounted:', mounted);

  const theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#020617',
      card: '#0f172a',
      border: 'rgba(148, 163, 184, 0.2)',
      primary: '#6366f1',
      text: '#f8fafc',
    },
  };

  // Show loading only during the actual login process
  if (authStatus === 'loading') {
    console.log('[RootNavigator] Showing loading gate');
    return <LoadingGate />;
  }

  // Always show the UI once mounted - let Zustand hydrate in the background
  if (!mounted) {
    console.log('[RootNavigator] Not mounted yet');
    return <LoadingGate />;
  }

  console.log('[RootNavigator] Rendering:', user ? 'TabNavigator' : 'AuthStackNavigator');
  
  return (
    <NavigationContainer theme={theme}>
      {user ? <TabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
};
