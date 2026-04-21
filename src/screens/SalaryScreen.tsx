import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { OnboardingStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Salary'>;
type Route = RouteProp<OnboardingStackParamList, 'Salary'>;

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'NPR', symbol: 'NPR', name: 'Nepalese Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'PKR', symbol: 'PKR', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'LKR', name: 'Sri Lankan Rupee' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'KES', symbol: 'KES', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

export default function SalaryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { name } = route.params;

  const [salary, setSalary] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCurrency = CURRENCIES.find(c => c.code === currency)!;
  const filtered = CURRENCIES.filter(c => {
    const q = search.toLowerCase();
    return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
  });

  const num = parseFloat(salary.replace(/,/g, ''));
  const canContinue = salary.length > 0 && !isNaN(num) && num > 0;

  function handleSelect(code: string) {
    setCurrency(code);
    setModalVisible(false);
    setSearch('');
  }

  function handleContinue() {
    if (!canContinue) return;
    navigation.navigate('Bills', { name, salary: num, currency });
  }

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={16}
      >
        <Text style={styles.step}>2 of 4</Text>
        <Text style={styles.title}>Hi {name}! What's your monthly salary?</Text>

        <Text style={styles.label}>Currency</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectorText}>
            {selectedCurrency.code} — {selectedCurrency.name}
          </Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Monthly Salary</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currencyPrefix}>{selectedCurrency.code}</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            value={salary}
            onChangeText={setSalary}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!canContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSearch(''); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search currency..."
              placeholderTextColor={COLORS.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            <FlatList
              data={filtered}
              keyExtractor={item => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.currencyRow, item.code === currency && styles.currencyRowActive]}
                  onPress={() => handleSelect(item.code)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.currencyRowText, item.code === currency && styles.currencyRowTextActive]}>
                    {item.code} — {item.name}
                  </Text>
                  {item.code === currency && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },
  container: {
    flexGrow: 1,
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
    marginBottom: 40,
    lineHeight: 34,
  },
  label: {
    fontSize: FONT.sizes.sm,
    fontWeight: FONT.weights.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    marginBottom: 28,
  },
  selectorText: {
    flex: 1,
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
  },
  dropdownArrow: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  currencyPrefix: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: FONT.sizes.xl,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
    paddingVertical: 16,
  },
  button: {
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.button,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.white,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: FONT.sizes.lg,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    paddingLeft: 16,
  },
  searchInput: {
    marginHorizontal: 20,
    marginBottom: 8,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  currencyRowActive: {
    backgroundColor: COLORS.greenLight,
  },
  currencyRowText: {
    flex: 1,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
  },
  currencyRowTextActive: {
    color: COLORS.green,
    fontWeight: FONT.weights.medium,
  },
  checkmark: {
    fontSize: FONT.sizes.md,
    color: COLORS.green,
    fontWeight: FONT.weights.medium,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },
});
