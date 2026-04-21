import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Bill } from '../types';
import { COLORS, FONT } from '../constants/theme';

// Screen imports
import WelcomeScreen from '../screens/WelcomeScreen';
import NameScreen from '../screens/NameScreen';
import SalaryScreen from '../screens/SalaryScreen';
import BillsScreen from '../screens/BillsScreen';
import PlanScreen from '../screens/PlanScreen';
import HomeScreen from '../screens/HomeScreen';
import SpendingDetailScreen from '../screens/SpendingDetailScreen';
import SavingsDetailScreen from '../screens/SavingsDetailScreen';
import InvestmentDetailScreen from '../screens/InvestmentDetailScreen';
import EmergencyDetailScreen from '../screens/EmergencyDetailScreen';
import SpendingLogScreen from '../screens/SpendingLogScreen';
import InvestmentLogScreen from '../screens/InvestmentLogScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Name: undefined;
  Salary: { name: string };
  Bills: { name: string; salary: number; currency: string };
  Plan: { name: string; salary: number; currency: string; bills: Bill[] };
};

export type HomeStackParamList = {
  Home: undefined;
  SpendingDetail: undefined;
  SavingsDetail: undefined;
  InvestmentDetail: undefined;
  EmergencyDetail: undefined;
  SpendingLog: undefined;
  InvestmentLog: undefined;
};

export type AppTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  Settings: undefined;
};

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();

const OnboardingCompleteContext = React.createContext<() => void>(() => {});
export const useOnboardingComplete = () => React.useContext(OnboardingCompleteContext);

const ResetContext = React.createContext<() => void>(() => {});
export const useReset = () => React.useContext(ResetContext);

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="SpendingDetail" component={SpendingDetailScreen} />
      <HomeStack.Screen name="SavingsDetail" component={SavingsDetailScreen} />
      <HomeStack.Screen name="InvestmentDetail" component={InvestmentDetailScreen} />
      <HomeStack.Screen name="EmergencyDetail" component={EmergencyDetailScreen} />
      <HomeStack.Screen name="SpendingLog" component={SpendingLogScreen} />
      <HomeStack.Screen name="InvestmentLog" component={InvestmentLogScreen} />
    </HomeStack.Navigator>
  );
}

function AppNavigator({ onReset }: { onReset: () => void }) {
  return (
    <ResetContext.Provider value={onReset}>
      <AppTab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: 64,
          },
          tabBarActiveTintColor: COLORS.green,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarLabelStyle: { fontSize: FONT.sizes.xs, marginBottom: 8 },
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, keyof typeof Feather.glyphMap> = {
              HomeStack: 'home',
              Settings: 'settings',
            };
            return <Feather name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <AppTab.Screen name="HomeStack" component={HomeNavigator} options={{ tabBarLabel: 'Home' }} />
        <AppTab.Screen name="Settings" component={SettingsScreen} />
      </AppTab.Navigator>
    </ResetContext.Provider>
  );
}

function OnboardingNavigator({ onComplete }: { onComplete: () => void }) {
  return (
    <OnboardingCompleteContext.Provider value={onComplete}>
      <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
        <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
        <OnboardingStack.Screen name="Name" component={NameScreen} />
        <OnboardingStack.Screen name="Salary" component={SalaryScreen} />
        <OnboardingStack.Screen name="Bills" component={BillsScreen} />
        <OnboardingStack.Screen name="Plan" component={PlanScreen} />
      </OnboardingStack.Navigator>
    </OnboardingCompleteContext.Provider>
  );
}

interface RootNavigatorProps {
  onboardingComplete: boolean;
  onComplete: () => void;
  onReset: () => void;
}

export function RootNavigator({ onboardingComplete, onComplete, onReset }: RootNavigatorProps) {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {onboardingComplete
          ? <AppNavigator onReset={onReset} />
          : <OnboardingNavigator onComplete={onComplete} />
        }
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
