import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { saveUserProfile } from '../utils/storage';
import { calcBudgets, calcEmergencyTarget } from '../utils/calculations';
import { useOnboardingComplete } from '../navigation';
import { OnboardingStackParamList } from '../navigation';

type Route = RouteProp<OnboardingStackParamList, 'Plan'>;

function fmt(value: number, currency: string): string {
  return `${currency} ${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function AnimatedBar({ pct, color, trackColor }: { pct: number; color: string; trackColor: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(pct, 100),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
      <Animated.View style={[styles.barFill, { width, backgroundColor: color }]} />
    </View>
  );
}

export default function PlanScreen() {
  const onComplete = useOnboardingComplete();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const { name, salary, currency, bills } = route.params;
  const [saving, setSaving] = useState(false);

  const { spend, invest, emergency, totalBills } = calcBudgets(salary, bills);
  const emergencyTarget = calcEmergencyTarget(bills);

  const billsPct = salary > 0 ? Math.min((totalBills / salary) * 100, 100) : 0;
  const spendPct = salary > 0 ? Math.min((spend / salary) * 100, 100) : 0;
  const investPct = salary > 0 ? Math.min((invest / salary) * 100, 100) : 0;
  const emergencyPct = salary > 0 ? Math.min((emergency / salary) * 100, 100) : 0;

  async function handleStart() {
    setSaving(true);
    await saveUserProfile({
      name,
      salary,
      bills,
      spendBudget: spend,
      investBudget: invest,
      emergencyTarget,
      currency,
      onboardingComplete: true,
    });
    onComplete();
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.step}>4 of 4</Text>
      <Text style={styles.title}>{name}, here's your plan</Text>
      <Text style={styles.subtitle}>Based on your salary and fixed bills.</Text>

      {/* Fixed bills card */}
      <View style={[styles.card, { backgroundColor: COLORS.grayLight, borderColor: COLORS.gray }]}>
        <Text style={[styles.cardLabel, { color: COLORS.gray }]}>FIXED BILLS</Text>
        <Text style={[styles.cardAmount, { color: COLORS.textPrimary }]}>{fmt(totalBills, currency)}</Text>
        <Text style={styles.cardSub}>{Math.round(billsPct)}% of salary</Text>
        <AnimatedBar pct={billsPct} color={COLORS.gray} trackColor={COLORS.border} />
      </View>

      {/* Spending budget card */}
      <View style={[styles.card, { backgroundColor: COLORS.redLight, borderColor: COLORS.red }]}>
        <Text style={[styles.cardLabel, { color: COLORS.redDark }]}>SPENDING BUDGET</Text>
        <Text style={[styles.cardAmount, { color: COLORS.red }]}>{fmt(spend, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.redDark }]}>guilt-free spending</Text>
        <AnimatedBar pct={spendPct} color={COLORS.red} trackColor='#F9C8C8' />
      </View>

      {/* Investment card */}
      <View style={[styles.card, { backgroundColor: COLORS.purpleLight, borderColor: COLORS.purple }]}>
        <Text style={[styles.cardLabel, { color: COLORS.purpleDark }]}>INVESTMENT · 20%</Text>
        <Text style={[styles.cardAmount, { color: COLORS.purple }]}>{fmt(invest, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.purpleDark }]}>pay yourself first</Text>
        <AnimatedBar pct={investPct} color={COLORS.purple} trackColor='#D6D3F8' />
      </View>

      {/* Emergency fund card */}
      <View style={[styles.card, { backgroundColor: COLORS.blueLight, borderColor: COLORS.blue }]}>
        <Text style={[styles.cardLabel, { color: COLORS.blueDark }]}>EMERGENCY FUND · 10%</Text>
        <Text style={[styles.cardAmount, { color: COLORS.blue }]}>{fmt(emergency, currency)}/month</Text>
        <Text style={[styles.cardSub, { color: COLORS.blueDark }]}>
          target: {fmt(emergencyTarget, currency)} (6 months of bills)
        </Text>
        <AnimatedBar pct={emergencyPct} color={COLORS.blue} trackColor='#C2DCF5' />
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
          <Text style={styles.buttonText}>Start tracking →</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },
  container: {
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  step: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
    color: COLORS.green,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: FONT.sizes.xs,
    fontWeight: FONT.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  cardAmount: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.bold,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  barTrack: {
    height: 6,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: RADIUS.full,
  },
  button: {
    marginTop: 8,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.button,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.white,
  },
});
