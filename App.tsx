import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { loadUserProfile, clearAllData } from './src/utils/storage';
import { RootNavigator } from './src/navigation';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
  });

  useEffect(() => {
    async function checkOnboarding() {
      await clearAllData(); // temporary - remove after testing
      const profile = await loadUserProfile();
      setOnboardingComplete(profile?.onboardingComplete ?? false);
      setLoading(false);
    }
    checkOnboarding();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return <RootNavigator onboardingComplete={onboardingComplete} onComplete={() => setOnboardingComplete(true)} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
