import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { Bill } from '../types';
import { OnboardingStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Bills'>;
type Route = RouteProp<OnboardingStackParamList, 'Bills'>;

type PrefilledRow = {
  icon: string;
  name: string;
  amount: string;
};

type CustomRow = {
  id: number;
  icon: string;
  name: string;
  amount: string;
};

const PREFILLED: PrefilledRow[] = [
  { icon: '🏠', name: 'Rent',        amount: '' },
  { icon: '🚌', name: 'Transport',   amount: '' },
  { icon: '🍽️', name: 'Groceries',   amount: '' },
  { icon: '💡', name: 'Electricity', amount: '' },
];

const CUSTOM_ICONS = ['📱', '🎓', '🏥', '📦', '🌐', '🎬'];

let nextId = 0;

function parseAmt(s: string): number {
  const n = parseFloat(s.replace(/,/g, ''));
  return isNaN(n) || n <= 0 ? 0 : n;
}

function fmt(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BillsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { name, salary, currency } = route.params;

  const [prefilled, setPrefilled] = useState<PrefilledRow[]>(PREFILLED.map(r => ({ ...r })));
  const [customs, setCustoms] = useState<CustomRow[]>([]);

  const totalBills =
    prefilled.reduce((s, r) => s + parseAmt(r.amount), 0) +
    customs.reduce((s, r) => s + parseAmt(r.amount), 0);

  function updatePrefilled(index: number, amount: string) {
    setPrefilled(prev => prev.map((r, i) => (i === index ? { ...r, amount } : r)));
  }

  function addCustomRow() {
    const icon = CUSTOM_ICONS[customs.length % CUSTOM_ICONS.length];
    setCustoms(prev => [...prev, { id: nextId++, icon, name: '', amount: '' }]);
  }

  function updateCustom(id: number, field: 'name' | 'amount', value: string) {
    setCustoms(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function deleteCustom(id: number) {
    setCustoms(prev => prev.filter(r => r.id !== id));
  }

  function handleContinue() {
    const bills: Bill[] = [
      ...prefilled
        .filter(r => parseAmt(r.amount) > 0)
        .map(r => ({ icon: r.icon, name: r.name, amount: parseAmt(r.amount) })),
      ...customs
        .filter(r => parseAmt(r.amount) > 0 && r.name.trim())
        .map(r => ({ icon: r.icon, name: r.name.trim(), amount: parseAmt(r.amount) })),
    ];
    navigation.navigate('Plan', { name, salary, currency, bills });
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: COLORS.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={[styles.backBtn, { marginTop: insets.top + 8 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.step}>3 of 4</Text>
        <Text style={styles.title}>What are your fixed monthly bills?</Text>
        <Text style={styles.subtitle}>Enter 0 or leave blank if it doesn't apply to you.</Text>

        {/* Pre-filled rows */}
        <View style={styles.rowsContainer}>
          {prefilled.map((row, index) => (
            <View key={row.name} style={styles.billRow}>
              <View style={styles.amountField}>
                <Text style={styles.currencyPrefix}>{currency}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                  value={row.amount}
                  onChangeText={val => updatePrefilled(index, val)}
                  returnKeyType="done"
                />
              </View>
              <View style={styles.nameField}>
                <Text style={styles.rowIcon}>{row.icon}</Text>
                <Text style={styles.rowLabel}>{row.name}</Text>
              </View>
            </View>
          ))}

          {/* Custom rows */}
          {customs.map(row => (
            <View key={row.id} style={styles.billRow}>
              <View style={styles.amountField}>
                <Text style={styles.currencyPrefix}>{currency}</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                  value={row.amount}
                  onChangeText={val => updateCustom(row.id, 'amount', val)}
                  returnKeyType="done"
                />
              </View>
              <View style={styles.customNameField}>
                <Text style={styles.rowIcon}>{row.icon}</Text>
                <TextInput
                  style={styles.customNameInput}
                  placeholder="Bill name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={row.name}
                  onChangeText={val => updateCustom(row.id, 'name', val)}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={() => deleteCustom(row.id)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.deleteBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add another bill */}
        <TouchableOpacity
          style={styles.addRow}
          onPress={addCustomRow}
          activeOpacity={0.7}
        >
          <Text style={styles.addRowText}>+ Add another bill</Text>
        </TouchableOpacity>

        {/* Running total */}
        {totalBills > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total fixed bills</Text>
            <Text style={styles.totalAmount}>{currency} {fmt(totalBills)}</Text>
          </View>
        )}

        {/* Continue button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>See my plan →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backBtnText: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: FONT.weights.medium,
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
    marginBottom: 28,
    lineHeight: 22,
  },
  rowsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    height: 52,
  },
  currencyPrefix: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    padding: 0,
  },
  nameField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  customNameField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    height: 52,
  },
  rowIcon: {
    fontSize: 18,
  },
  rowLabel: {
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONT.weights.medium,
  },
  customNameInput: {
    flex: 1,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    padding: 0,
  },
  deleteBtn: {
    paddingHorizontal: 4,
  },
  deleteBtnText: {
    fontSize: 22,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
  addRow: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addRowText: {
    fontSize: FONT.sizes.md,
    color: COLORS.green,
    fontWeight: FONT.weights.medium,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
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
