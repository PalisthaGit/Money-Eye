import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { saveUserProfile } from '../utils/storage';
import {
  calcFreeMoney,
  calcEmergencyTarget,
  calcInvestmentSlice,
  calcSpendingMoney,
} from '../utils/calculations';
import { useOnboardingComplete } from '../navigation';
import { OnboardingStackParamList } from '../navigation';

type Route = RouteProp<OnboardingStackParamList, 'Plan'>;

export default function PlanScreen() {
  const onComplete = useOnboardingComplete();
  const { params } = useRoute<Route>();
  const { salary, currency, unavoidables } = params;
  const [saving, setSaving] = useState(false);

  const freeMoney = calcFreeMoney(salary, unavoidables);
  const emergencyTarget = calcEmergencyTarget(unavoidables);
  const investmentSlice = calcInvestmentSlice(freeMoney);
  const spendingMoney = calcSpendingMoney(freeMoney, investmentSlice);

  const fmt = (n: number) => `${currency} ${n.toFixed(2)}`;

  async function handleStart() {
    setSaving(true);
    await saveUserProfile({
      salary,
      currency,
      unavoidables,
      emergencyFundTarget: emergencyTarget,
      investmentSlice,
      onboardingComplete: true,
    });
    onComplete();
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.step}>Step 4 of 4</Text>
      <Text style={styles.title}>Your Plan is Ready</Text>
      <Text style={styles.subtitle}>
        Here's how to put your free money to work every month.
      </Text>

      <View style={[styles.card, styles.tealCard]}>
        <Text style={[styles.cardLabel, { color: COLORS.tealDeep }]}>Emergency Fund Target</Text>
        <Text style={[styles.cardAmount, { color: COLORS.teal }]}>{fmt(emergencyTarget)}</Text>
        <Text style={[styles.cardNote, { color: COLORS.teal }]}>
          6 months of fixed costs — build this before investing aggressively
        </Text>
      </View>

      <View style={[styles.card, styles.tealCard]}>
        <Text style={[styles.cardLabel, { color: COLORS.tealDeep }]}>Monthly Investment (20%)</Text>
        <Text style={[styles.cardAmount, { color: COLORS.teal }]}>{fmt(investmentSlice)}</Text>
        <Text style={[styles.cardNote, { color: COLORS.teal }]}>
          Pay yourself first — index funds, ETFs, or savings
        </Text>
      </View>

      <View style={[styles.card, styles.primaryCard]}>
        <Text style={[styles.cardLabel, { color: COLORS.primary }]}>Spending Money</Text>
        <Text style={[styles.cardAmount, { color: COLORS.primary }]}>{fmt(spendingMoney)}</Text>
        <Text style={[styles.cardNote, { color: COLORS.primaryMid }]}>
          Free money after investing — guilt-free spending budget
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleStart}
        activeOpacity={0.85}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Start tracking</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },
  step: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
    color: COLORS.primaryAccent,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FONT.sizes.xxxl,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  tealCard: {
    backgroundColor: COLORS.tealLight,
    borderColor: '#99F6E4',
  },
  primaryCard: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primaryLight,
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.medium,
    marginBottom: 4,
  },
  cardNote: {
    fontSize: FONT.sizes.sm,
    lineHeight: 20,
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.medium,
    color: COLORS.white,
  },
});
