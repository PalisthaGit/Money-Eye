import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { getUserProfile, getMonthData, saveMonthData, getAllMonthKeys } from './src/utils/storage';
import { RootNavigator } from './src/navigation';
import { COLORS } from './src/constants/theme';

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

async function ensureCurrentMonth(): Promise<void> {
  const profile = await getUserProfile();
  if (!profile) return;
  const key = getCurrentMonthKey();
  const existing = await getMonthData(key);
  if (existing) return;

  const allKeys = await getAllMonthKeys();
  const prevKeys = allKeys.filter(k => k < key).sort();
  const prevKey = prevKeys[prevKeys.length - 1];
  const prevData = prevKey ? await getMonthData(prevKey) : null;

  await saveMonthData(key, {
    spending: 0,
    spendEntries: [],
    investment: 0,
    investTotal: prevData?.investTotal ?? 0,
    investEntries: [],
    emergency: prevData?.emergency ?? 0,
    emergencyEntries: [],
    savings: 0,
    savingsEntries: [],
  });
}

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium });

  useEffect(() => {
    async function init() {
      const profile = await getUserProfile();
      if (profile?.onboardingComplete) {
        await ensureCurrentMonth();
        setOnboardingComplete(true);
      }
      setLoading(false);
    }
    init();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  return (
    <RootNavigator
      onboardingComplete={onboardingComplete}
      onComplete={() => {
        ensureCurrentMonth();
        setOnboardingComplete(true);
      }}
      onReset={() => setOnboardingComplete(false)}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
