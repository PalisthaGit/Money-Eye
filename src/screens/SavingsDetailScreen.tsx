import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { getUserProfile, getMonthData } from '../utils/storage';
import { UserProfile, MonthData, Entry } from '../types';
import { HomeStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SavingsDetail'>;

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function fmt(value: number, currency: string): string {
  return `${currency} ${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function SavingsDetailScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [monthData, setMonthData] = useState<MonthData | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        const p = await getUserProfile();
        const m = await getMonthData(currentMonthKey());
        if (!active) return;
        setProfile(p);
        setMonthData(m);
      }
      load();
      return () => { active = false; };
    }, [])
  );

  if (!profile) {
    return <View style={styles.flex} />;
  }

  const spending = monthData?.spending ?? 0;
  const savings = profile.spendBudget - spending;
  const isOverBudget = savings < 0;

  const topOverspend = [...(monthData?.spendEntries ?? [])]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <TouchableOpacity
        style={[styles.backBtn, { marginTop: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroAmount}>
          {isOverBudget ? '-' : ''}{fmt(Math.abs(savings), profile.currency)}
        </Text>
        <Text style={styles.heroLabel}>
          {isOverBudget ? 'over budget' : 'saved this month'}
        </Text>
      </View>

      {/* Info box */}
      <View style={styles.section}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Savings = your spending budget minus what you spent. It calculates itself.
          </Text>
        </View>
      </View>

      {/* Overspend section */}
      {isOverBudget && (
        <View style={styles.section}>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              You went over budget by {fmt(Math.abs(savings), profile.currency)}. Spending that exceeded your budget came from your savings.
            </Text>
          </View>

          {topOverspend.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Top spending items</Text>
              <View style={styles.card}>
                {topOverspend.map((entry, i) => (
                  <View
                    key={entry.id}
                    style={[styles.entryRow, i < topOverspend.length - 1 && styles.entryBorder]}
                  >
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryNote}>{entry.note || entry.category}</Text>
                      <Text style={styles.entryCategory}>{entry.category}</Text>
                    </View>
                    <Text style={styles.entryAmount}>-{fmt(entry.amount, profile.currency)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 4,
  },
  backText: {
    fontSize: FONT.sizes.md,
    color: COLORS.green,
    fontWeight: FONT.weights.medium,
  },
  heroBanner: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: 20,
  },
  heroAmount: {
    fontSize: FONT.sizes.xxxl,
    fontWeight: FONT.weights.bold,
    color: COLORS.white,
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: FONT.sizes.md,
    color: 'rgba(255,255,255,0.85)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: COLORS.greenLight,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  infoText: {
    fontSize: FONT.sizes.md,
    color: COLORS.greenDark,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: COLORS.amberLight,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.amber,
    marginBottom: 16,
  },
  warningText: {
    fontSize: FONT.sizes.md,
    color: COLORS.amber,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  entryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  entryInfo: {
    flex: 1,
  },
  entryNote: {
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONT.weights.medium,
  },
  entryCategory: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  entryAmount: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.bold,
    color: COLORS.red,
  },
});
