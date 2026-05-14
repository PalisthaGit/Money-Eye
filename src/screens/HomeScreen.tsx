import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { getUserProfile, getMonthData } from '../utils/storage';
import { UserProfile, MonthData } from '../types';
import { HomeStackParamList } from '../navigation';
import { calcBudgets, calcUnused } from '../utils/calculations';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function fmt(value: number, currency: string): string {
  return `${currency} ${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getMonthLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getDaysLeft(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

interface ProgressBarProps {
  pct: number;
  color: string;
  trackColor: string;
}

function PlusCircle({ color }: { color: string }) {
  return (
    <View style={{
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: color,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ color, fontSize: 18, lineHeight: 20, fontWeight: '400' }}>+</Text>
    </View>
  );
}

function ProgressBar({ pct, color, trackColor }: ProgressBarProps) {
  return (
    <View style={[barStyles.track, { backgroundColor: trackColor }]}>
      <View
        style={[
          barStyles.fill,
          { width: `${Math.min(Math.max(pct, 0), 100)}%` as any, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: RADIUS.full,
  },
});

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        const p = await getUserProfile();
        const m = await getMonthData(currentMonthKey());
        if (!active) return;
        setProfile(p);
        setMonthData(m);
        setLoading(false);
      }
      load();
      return () => { active = false; };
    }, [])
  );

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  const spending = monthData?.spending ?? 0;
  const investment = monthData?.investment ?? 0;
  const emergency = monthData?.emergency ?? 0;
  const savingsLogged = monthData?.savings ?? 0;
  const { salary, currency, name } = profile;
  const { spendBudget, investBudget, savingsBudget, emergencyBudget } = calcBudgets(
    salary,
    profile.investPct ?? 20,
    profile.savingsPct ?? 10,
    profile.emergencyPct ?? 10,
  );

  const totalLogged = spending + investment + savingsLogged + emergency;
  const unused = calcUnused(salary, totalLogged);

  const spendPct = spendBudget > 0 ? (spending / spendBudget) * 100 : 0;
  const investProgress = investBudget > 0 ? (investment / investBudget) * 100 : 0;
  const savingsProgress = savingsBudget > 0 ? (savingsLogged / savingsBudget) * 100 : 0;
  const emergencyProgress = emergencyBudget > 0 ? (emergency / emergencyBudget) * 100 : 0;

  const daysLeft = getDaysLeft();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.greeting}>{getGreeting()}, {name} 👋</Text>
      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{getMonthLabel()}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{daysLeft} days left</Text>
        </View>
      </View>

      {/* Spending Card */}
      <TouchableOpacity
        style={[styles.card, styles.spendingCard]}
        onPress={() => navigation.navigate('SpendingDetail')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>SPENDING</Text>
          <PlusCircle color={COLORS.red} />
        </View>
        <Text style={styles.cardBigAmount}>{fmt(spending, currency)}</Text>
        <Text style={styles.cardSub}>of {fmt(spendBudget, currency)} this month</Text>
        <ProgressBar pct={spendPct} color={COLORS.red} trackColor={COLORS.redLight} />
        <View style={styles.pillRow}>
          <View style={[styles.pill, spendPct > 100 ? styles.pillDanger : styles.pillRed]}>
            <Text style={[styles.pillText, spendPct > 100 ? styles.pillTextDanger : { color: COLORS.red }]}>
              {spendPct > 100 ? 'Over budget!' : `${Math.round(spendPct)}% used`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Investing Card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: COLORS.purpleLight, borderColor: COLORS.purple }]}
        onPress={() => navigation.navigate('InvestmentDetail')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: COLORS.purpleDark }]}>INVESTING</Text>
          <PlusCircle color={COLORS.purple} />
        </View>
        <Text style={[styles.cardBigAmount, { color: COLORS.purple }]}>{fmt(investment, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.purpleDark }]}>of {fmt(investBudget, currency)}</Text>
        <ProgressBar pct={investProgress} color={COLORS.purple} trackColor='#D6D3F8' />
        <View style={styles.pillRow}>
          <View style={[styles.pill, { backgroundColor: COLORS.purpleLight, borderWidth: 1, borderColor: COLORS.purple }]}>
            <Text style={[styles.pillText, { color: COLORS.purple }]}>{Math.round(investProgress)}% done</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Savings Card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: COLORS.greenLight, borderColor: COLORS.green }]}
        onPress={() => navigation.navigate('SavingsDetail')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: COLORS.greenDark }]}>SAVINGS</Text>
          <PlusCircle color={COLORS.green} />
        </View>
        <Text style={[styles.cardBigAmount, { color: COLORS.green }]}>{fmt(savingsLogged, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.greenDark }]}>of {fmt(savingsBudget, currency)}</Text>
        <ProgressBar pct={savingsProgress} color={COLORS.green} trackColor='#A8E6D1' />
      </TouchableOpacity>

      {/* Emergency Card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: COLORS.blueLight, borderColor: COLORS.blue }]}
        onPress={() => navigation.navigate('EmergencyDetail')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: COLORS.blueDark }]}>EMERGENCY</Text>
          <PlusCircle color={COLORS.blue} />
        </View>
        <Text style={[styles.cardBigAmount, { color: COLORS.blue }]}>{fmt(emergency, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.blueDark }]}>of {fmt(emergencyBudget, currency)}</Text>
        <ProgressBar pct={emergencyProgress} color={COLORS.blue} trackColor='#C2DCF5' />
      </TouchableOpacity>

      {/* Unused Card — display only */}
      <View style={[styles.card, { backgroundColor: COLORS.grayLight, borderColor: COLORS.gray }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: COLORS.gray }]}>UNUSED</Text>
        </View>
        <Text style={[styles.cardBigAmount, { color: COLORS.textPrimary }]}>{fmt(unused, currency)}</Text>
        <Text style={[styles.cardSub, { color: COLORS.textSecondary }]}>available</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.tag,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT.weights.medium,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  spendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.red,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: FONT.sizes.xs,
    fontWeight: FONT.weights.medium,
    letterSpacing: 0.8,
    color: COLORS.textSecondary,
  },
  cardBigAmount: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  pillRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  pill: {
    borderRadius: RADIUS.tag,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillRed: {
    backgroundColor: COLORS.redLight,
  },
  pillDanger: {
    backgroundColor: COLORS.red,
  },
  pillText: {
    fontSize: FONT.sizes.xs,
    fontWeight: FONT.weights.medium,
  },
  pillTextDanger: {
    color: COLORS.white,
  },
});
