import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { OnboardingStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Eye circle */}
        <View style={styles.eyeCircle}>
          <Text style={styles.eyeEmoji}>👁</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Money Eye</Text>
        <Text style={styles.tagline}>Watch your money. Know where it goes.</Text>

        {/* Feature bullets */}
        <View style={styles.featuresCard}>
          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>📊</Text>
            <Text style={styles.featureText}>See all your money in one place</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>🧮</Text>
            <Text style={styles.featureText}>Your plan calculates itself</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureEmoji}>📱</Text>
            <Text style={styles.featureText}>Everything stays on your phone</Text>
          </View>
        </View>
      </ScrollView>

      {/* Get started button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Name')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get started →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  eyeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  eyeEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: FONT.sizes.xxxl,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: FONT.sizes.md2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  featuresCard: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.card,
    padding: 20,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureEmoji: {
    fontSize: 24,
    width: 36,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: FONT.sizes.md2,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.button,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.white,
  },
});
