import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { getUserProfile, getMonthData, getAllMonthKeys } from '../utils/storage';
import { UserProfile, Entry } from '../types';
import { HomeStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SpendingLog'>;

function fmt(value: number, currency: string): string {
  return `${currency} ${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const YEARS = [2024, 2025, 2026, 2027];
const SPEND_CATEGORIES = ['All', 'Food', 'Transport', 'Health', 'Shopping', 'Entertainment', 'Other'];
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F97316',
  Transport: '#8B5CF6',
  Health: '#EF4444',
  Shopping: '#EC4899',
  Entertainment: '#F59E0B',
  Other: COLORS.gray,
};

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}

function PickerModal({ visible, title, options, selected, onSelect, onClose }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={pickerStyles.sheet}>
          <Text style={pickerStyles.title}>{title}</Text>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[pickerStyles.option, opt === selected && pickerStyles.optionSelected]}
              onPress={() => { onSelect(opt); onClose(); }}
              activeOpacity={0.8}
            >
              <Text style={[pickerStyles.optionText, opt === selected && pickerStyles.optionTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  option: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: RADIUS.input,
  },
  optionSelected: {
    backgroundColor: COLORS.redLight,
  },
  optionText: {
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.red,
    fontWeight: FONT.weights.medium,
  },
});

export default function SpendingLogScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const now = new Date();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [yearModalVisible, setYearModalVisible] = useState(false);
  const [catModalVisible, setCatModalVisible] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [selectedMonth, selectedYear]);

  async function loadEntries() {
    setLoading(true);
    const p = await getUserProfile();
    setProfile(p);
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const data = await getMonthData(monthKey);
    setEntries(data?.spendEntries ?? []);
    setLoading(false);
  }

  const filteredEntries = selectedCategory === 'All'
    ? entries
    : entries.filter(e => e.category === selectedCategory);

  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalSpent = filteredEntries.reduce((s, e) => s + e.amount, 0);

  // Top category
  const categoryTotals: Record<string, number> = {};
  filteredEntries.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + e.amount;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const currency = profile?.currency ?? '';
  const monthLabel = MONTHS[parseInt(selectedMonth) - 1];

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spending Log</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setMonthModalVisible(true)} activeOpacity={0.8}>
          <Text style={styles.filterBtnText}>{monthLabel}</Text>
          <Text style={styles.filterArrow}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setYearModalVisible(true)} activeOpacity={0.8}>
          <Text style={styles.filterBtnText}>{selectedYear}</Text>
          <Text style={styles.filterArrow}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setCatModalVisible(true)} activeOpacity={0.8}>
          <Text style={styles.filterBtnText}>{selectedCategory}</Text>
          <Text style={styles.filterArrow}>▾</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryStrip}>
        <Text style={styles.summaryText}>Total spent: {fmt(totalSpent, currency)}</Text>
        {topCategory && (
          <Text style={styles.summaryText}>
            Top: {topCategory[0]} · {fmt(topCategory[1], currency)}
          </Text>
        )}
      </View>

      {/* List */}
      {sortedEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No spending entries for {monthLabel} {selectedYear}.{'\n'}Try a different filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedEntries}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          renderItem={({ item }) => (
            <View style={styles.entryRow}>
              <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[item.category] ?? COLORS.gray }]} />
              <View style={styles.entryInfo}>
                <Text style={styles.entryNote}>{item.note || item.category}</Text>
                <Text style={styles.entryDate}>{fmtDate(item.date)}</Text>
              </View>
              <Text style={[styles.entryAmount, { color: COLORS.red }]}>
                -{fmt(item.amount, currency)}
              </Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Pickers */}
      <PickerModal
        visible={monthModalVisible}
        title="Select Month"
        options={MONTHS.map((_, i) => String(i + 1))}
        selected={selectedMonth}
        onSelect={setSelectedMonth}
        onClose={() => setMonthModalVisible(false)}
      />
      <PickerModal
        visible={yearModalVisible}
        title="Select Year"
        options={YEARS.map(String)}
        selected={selectedYear}
        onSelect={setSelectedYear}
        onClose={() => setYearModalVisible(false)}
      />
      <PickerModal
        visible={catModalVisible}
        title="Select Category"
        options={SPEND_CATEGORIES}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        onClose={() => setCatModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    fontSize: FONT.sizes.md,
    color: COLORS.red,
    fontWeight: FONT.weights.medium,
  },
  headerTitle: {
    fontSize: FONT.sizes.xl,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  filterBtnText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT.weights.medium,
    flex: 1,
  },
  filterArrow: {
    fontSize: FONT.sizes.xs,
    color: COLORS.textSecondary,
  },
  summaryStrip: {
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.card,
    margin: 16,
    gap: 4,
  },
  summaryText: {
    fontSize: FONT.sizes.sm2,
    color: COLORS.textPrimary,
    fontWeight: FONT.weights.medium,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  entryInfo: {
    flex: 1,
  },
  entryNote: {
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONT.weights.medium,
  },
  entryDate: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  entryAmount: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.bold,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
});
