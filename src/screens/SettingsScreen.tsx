import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { UserProfile, Bill } from '../types';
import { getUserProfile, saveUserProfile } from '../utils/storage';
import { calcBudgets, calcEmergencyTarget } from '../utils/calculations';
import { useReset } from '../navigation';

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

const BILL_ICONS = ['🏠', '🍽️', '🚌', '💡', '📱', '🎓', '🏥', '📦'];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const onReset = useReset();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Salary section
  const [salary, setSalary] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [salaryDirty, setSalaryDirty] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  // Bills section
  const [bills, setBills] = useState<Bill[]>([]);
  const [editingBills, setEditingBills] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(BILL_ICONS[0]);
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [billsDirty, setBillsDirty] = useState(false);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];
  const filteredCurrencies = CURRENCIES.filter(c => {
    const q = currencySearch.toLowerCase();
    return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const p = await getUserProfile();
    if (!p) return;
    setProfile(p);
    setSalary(String(p.salary));
    setCurrency(p.currency);
    setBills(p.bills);
    setSalaryDirty(false);
    setBillsDirty(false);
    setEditingBills(false);
  }

  async function handleSaveSalary() {
    if (!profile) return;
    const num = parseFloat(salary.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) return;
    const { spend, invest, emergencyTarget: et } = calcBudgets(num, bills);
    const emergTarget = calcEmergencyTarget(bills);
    const updated: UserProfile = {
      ...profile,
      salary: num,
      currency,
      spendBudget: spend,
      investBudget: invest,
      emergencyTarget: emergTarget,
    };
    await saveUserProfile(updated);
    setProfile(updated);
    setSalaryDirty(false);
  }

  function handleAddBill() {
    const amount = parseFloat(newBillAmount.replace(/,/g, ''));
    if (!newBillName.trim() || isNaN(amount) || amount <= 0) return;
    setBills(prev => [...prev, { icon: selectedIcon, name: newBillName.trim(), amount }]);
    setNewBillName('');
    setNewBillAmount('');
    setBillsDirty(true);
  }

  function handleDeleteBill(index: number) {
    setBills(prev => prev.filter((_, i) => i !== index));
    setBillsDirty(true);
  }

  async function handleSaveBills() {
    if (!profile) return;
    const salNum = parseFloat(salary.replace(/,/g, '')) || profile.salary;
    const { spend, invest } = calcBudgets(salNum, bills);
    const emergTarget = calcEmergencyTarget(bills);
    const updated: UserProfile = {
      ...profile,
      bills,
      spendBudget: spend,
      investBudget: invest,
      emergencyTarget: emergTarget,
    };
    await saveUserProfile(updated);
    setProfile(updated);
    setBillsDirty(false);
    setEditingBills(false);
  }

  function handleReset() {
    Alert.alert(
      'Reset app',
      'This will delete all your data and restart onboarding. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            onReset();
          },
        },
      ]
    );
  }

  const totalBills = bills.reduce((s, b) => s + b.amount, 0);

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Profile section */}
        {profile && (
          <>
            <Text style={styles.sectionHeading}>PROFILE</Text>
            <View style={styles.card}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Name</Text>
                <Text style={styles.profileValue}>{profile.name}</Text>
              </View>
              <View style={[styles.profileRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.profileLabel}>Salary</Text>
                <Text style={styles.profileValue}>{profile.currency} {profile.salary.toLocaleString()}</Text>
              </View>
            </View>
          </>
        )}

        {/* Salary section */}
        <Text style={styles.sectionHeading}>SALARY</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Currency</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setCurrencyModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectorText}>{selectedCurrency.code} — {selectedCurrency.name}</Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Monthly Salary</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencyPrefix}>{currency}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={salary}
              onChangeText={v => { setSalary(v); setSalaryDirty(true); }}
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {salaryDirty && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSalary} activeOpacity={0.85}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bills section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>BILLS</Text>
          <TouchableOpacity onPress={() => setEditingBills(v => !v)}>
            <Text style={styles.editLink}>{editingBills ? 'Done' : 'Edit bills'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {bills.map((bill, index) => (
            <View key={index} style={styles.billRow}>
              <Text style={styles.billIcon}>{bill.icon}</Text>
              <Text style={styles.billName}>{bill.name}</Text>
              <Text style={styles.billAmount}>{currency} {bill.amount.toLocaleString()}</Text>
              {editingBills && (
                <TouchableOpacity onPress={() => handleDeleteBill(index)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {bills.length > 0 && (
            <View style={styles.totalRow}>
              <View style={styles.divider} />
              <Text style={styles.totalText}>Total: {currency} {totalBills.toLocaleString()}</Text>
            </View>
          )}

          {editingBills && (
            <>
              <View style={styles.divider} />
              <Text style={[styles.label, { marginTop: 8 }]}>Add new bill</Text>
              <View style={styles.iconRow}>
                {BILL_ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.iconBtn, selectedIcon === icon && styles.iconBtnSelected]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Text style={styles.iconEmoji}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.addRow}>
                <TextInput
                  style={[styles.addInput, styles.addNameInput]}
                  placeholder="Name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newBillName}
                  onChangeText={setNewBillName}
                />
                <TextInput
                  style={[styles.addInput, styles.addAmountInput]}
                  placeholder="Amount"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                  value={newBillAmount}
                  onChangeText={setNewBillAmount}
                />
                <TouchableOpacity style={styles.addBtn} onPress={handleAddBill} activeOpacity={0.8}>
                  <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {billsDirty && (
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveBills} activeOpacity={0.85}>
                  <Text style={styles.saveButtonText}>Save bills</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Danger zone */}
        <Text style={styles.sectionHeading}>DANGER ZONE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleReset} activeOpacity={0.85}>
            <Text style={styles.dangerButtonText}>Reset app</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Currency modal */}
      <Modal
        visible={currencyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => { setCurrencyModalVisible(false); setCurrencySearch(''); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search currency..."
              placeholderTextColor={COLORS.textSecondary}
              value={currencySearch}
              onChangeText={setCurrencySearch}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            <FlatList
              data={filteredCurrencies}
              keyExtractor={item => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.currencyRow, item.code === currency && styles.currencyRowActive]}
                  onPress={() => {
                    setCurrency(item.code);
                    setCurrencyModalVisible(false);
                    setCurrencySearch('');
                    setSalaryDirty(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.currencyRowText, item.code === currency && styles.currencyRowTextActive]}>
                    {item.code} — {item.name}
                  </Text>
                  {item.code === currency && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  container: {
    paddingHorizontal: 24,
  },
  screenTitle: {
    fontSize: FONT.sizes.xxl,
    fontWeight: FONT.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: 28,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: FONT.sizes.sm2,
    fontWeight: FONT.weights.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  editLink: {
    fontSize: FONT.sizes.sm2,
    color: COLORS.green,
    fontWeight: FONT.weights.medium,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileLabel: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
  },
  profileValue: {
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: FONT.weights.medium,
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  selectorText: {
    flex: 1,
    fontSize: FONT.sizes.md,
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  currencyPrefix: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: FONT.sizes.lg,
    color: COLORS.textPrimary,
    paddingVertical: 14,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.white,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  billIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  billName: {
    flex: 1,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  billAmount: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: FONT.sizes.lg,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  totalRow: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalText: {
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.medium,
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.input,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  iconBtnSelected: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  iconEmoji: {
    fontSize: 18,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  addInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: FONT.sizes.md,
    color: COLORS.textPrimary,
  },
  addNameInput: { flex: 2 },
  addAmountInput: { flex: 1 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: FONT.sizes.xl,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    lineHeight: 26,
  },
  dangerButton: {
    backgroundColor: COLORS.redLight,
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: RADIUS.button,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontSize: FONT.sizes.md2,
    fontWeight: FONT.weights.bold,
    color: COLORS.red,
  },
  // Currency Modal
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
  modalSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },
});
