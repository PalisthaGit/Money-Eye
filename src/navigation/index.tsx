import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import LogScreen from '../screens/LogScreen';
import MonthlyScreen from '../screens/MonthlyScreen';
import SettingsScreen from '../screens/SettingsScreen';

import SalaryScreen from '../screens/SalaryScreen';
import UnavoidablesScreen from '../screens/UnavoidablesScreen';
import BreakdownScreen from '../screens/BreakdownScreen';
import PlanScreen from '../screens/PlanScreen';
import { Unavoidable } from '../types';
import { COLORS, FONT } from '../constants/theme';

export type OnboardingStackParamList = {
  Salary: undefined;
  Unavoidables: { salary: number; currency: string };
  Breakdown: { salary: number; currency: string; unavoidables: Unavoidable[] };
  Plan: { salary: number; currency: string; unavoidables: Unavoidable[] };
};

export type AppTabParamList = {
  Home: undefined;
  Log: undefined;
  Monthly: undefined;
  Settings: undefined;
};

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();

const OnboardingCompleteContext = React.createContext<() => void>(() => {});
export const useOnboardingComplete = () => React.useContext(OnboardingCompleteContext);

function OnboardingNavigator({ onComplete }: { onComplete: () => void }) {
  return (
    <OnboardingCompleteContext.Provider value={onComplete}>
      <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
        <OnboardingStack.Screen name="Salary" component={SalaryScreen} />
        <OnboardingStack.Screen name="Unavoidables" component={UnavoidablesScreen} />
        <OnboardingStack.Screen name="Breakdown" component={BreakdownScreen} />
        <OnboardingStack.Screen name="Plan" component={PlanScreen} />
      </OnboardingStack.Navigator>
    </OnboardingCompleteContext.Provider>
  );
}

function AppNavigator() {
  return (
    <AppTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: FONT.sizes.xs,
          marginBottom: 6,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Feather.glyphMap> = {
            Home: 'home',
            Log: 'plus-circle',
            Monthly: 'bar-chart-2',
            Settings: 'settings',
          };
          return <Feather name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <AppTab.Screen name="Home" component={HomeScreen} />
      <AppTab.Screen name="Log" component={LogScreen} />
      <AppTab.Screen name="Monthly" component={MonthlyScreen} />
      <AppTab.Screen name="Settings" component={SettingsScreen} />
    </AppTab.Navigator>
  );
}

interface RootNavigatorProps {
  onboardingComplete: boolean;
  onComplete: () => void;
}

export function RootNavigator({ onboardingComplete, onComplete }: RootNavigatorProps) {
  return (
    <NavigationContainer>
      {onboardingComplete ? <AppNavigator /> : <OnboardingNavigator onComplete={onComplete} />}
    </NavigationContainer>
  );
}
