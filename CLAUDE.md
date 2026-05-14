# Moneye — Developer Onboarding

A personal finance tracking app built with **Expo + React Native (TypeScript)**. No backend — all data lives on-device via AsyncStorage.

---

## What the App Does

Users enter their monthly salary and fixed bills. The app auto-calculates a budget split:
- **Fixed Bills** — subtracted from salary first
- **Spending** — remaining free money (guilt-free spending)
- **Investment** — 20% of free money
- **Emergency Fund** — 10% of free money, target = 6× monthly bills

Then they track spending, investments, and emergency contributions month by month.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Expo SDK / React Native 0.81 |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation v7 (native stack + bottom tabs) |
| Storage | AsyncStorage (`@react-native-async-storage/async-storage`) |
| Icons | `@expo/vector-icons` (Feather) |
| Fonts | Inter via `@expo-google-fonts/inter` |
| Date picker | `@react-native-community/datetimepicker` |

---

## Project Structure

```
moneye/
├── App.tsx                    # Root — loads fonts, checks onboarding, picks navigator
├── app.json                   # Expo config (name: moneye-init, portrait only)
├── src/
│   ├── constants/
│   │   └── theme.ts           # Colors, font sizes, border radii — use these everywhere
│   ├── navigation/
│   │   └── index.tsx          # All navigation stacks defined here
│   ├── types/
│   │   └── index.ts           # All shared TypeScript types
│   ├── utils/
│   │   ├── storage.ts         # AsyncStorage read/write helpers
│   │   └── calculations.ts    # Budget math helpers
│   └── screens/               # One file per screen
```

---

## Running Locally

```bash
npm install
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser
```

---

## Data Models

Defined in `src/types/index.ts`.

```ts
type Bill = {
  icon: string;      // Emoji
  name: string;
  amount: number;
};

type UserProfile = {
  name: string;
  salary: number;
  bills: Bill[];
  spendBudget: number;      // Remaining after bills
  investBudget: number;     // 20% of free money
  emergencyTarget: number;  // 6× total monthly bills
  currency: string;         // ISO code e.g. "USD"
  onboardingComplete: boolean;
};

type Entry = {
  id: string;
  note: string;
  amount: number;
  category: string;  // See categories below
  date: string;      // ISO string
  month: number;     // 1–12
  year: number;
};

type MonthData = {
  spending: number;
  spendEntries: Entry[];
  investment: number;        // This month's total
  investTotal: number;       // All-time running total
  investEntries: Entry[];
  emergency: number;         // This month's contributions
  emergencyEntries: Entry[];
};
```

**Spending categories**: Food, Transport, Health, Shopping, Entertainment, Other

**Investment categories**: Gold, Stocks, Mutual Fund, Real Estate, Crypto, Other

---

## Storage

Defined in `src/utils/storage.ts`. Simple AsyncStorage wrappers:

| Function | Key | Purpose |
|---|---|---|
| `saveUserProfile(profile)` | `moneye_profile_v2` | Save user profile |
| `getUserProfile()` | `moneye_profile_v2` | Load user profile |
| `saveMonthData(key, data)` | `moneye_month_v2_{YYYY-MM}` | Save a month's data |
| `getMonthData(key)` | `moneye_month_v2_{YYYY-MM}` | Load a month's data |
| `getAllMonthKeys()` | — | List all saved month keys |

Month key format: `YYYY-MM` (e.g. `2026-04`)

---

## Calculations

Defined in `src/utils/calculations.ts`:

```ts
getFreeMoney(salary, bills)    // salary − total bills
calcBudgets(salary, bills)     // { spend, invest (20%), emergency (10%), totalBills }
calcSavings(spendBudget, spent) // budget − spent
calcEmergencyTarget(bills)     // 6 × total monthly bills
```

---

## Navigation

Defined in `src/navigation/index.tsx`.

**If not onboarded** → `OnboardingStack`:
```
Welcome → Name → Salary → Bills → Plan
```

**If onboarded** → `AppNavigator` (bottom tabs):
```
Tab: Home
  HomeStack:
    Home → SpendingDetail → SavingsDetail → InvestmentDetail → EmergencyDetail
                          → SpendingLog
                          → InvestmentLog

Tab: Settings
```

Onboarding is marked complete in `App.tsx` via the `useOnboardingComplete` callback. Reset is triggered from Settings via `useReset`.

---

## App Startup Logic (`App.tsx`)

1. Load Inter fonts (400, 500 weights)
2. Check AsyncStorage for `UserProfile`
3. If onboarded → check if current month exists; if not, create it (copying `investTotal` and `emergencyTotal` from previous month)
4. Show spinner until ready
5. Render either `OnboardingStack` or `AppNavigator`

---

## Screen Reference

### Onboarding (4 steps)

| Screen | Step | What it collects |
|---|---|---|
| WelcomeScreen | — | Intro / get started |
| NameScreen | 1 of 4 | First name |
| SalaryScreen | 2 of 4 | Currency + monthly salary |
| BillsScreen | 3 of 4 | Fixed bills (pre-filled + custom) |
| PlanScreen | 4 of 4 | Shows calculated plan, saves profile |

### Main App

| Screen | Purpose |
|---|---|
| HomeScreen | 4 summary cards (Spending, Savings, Investment, Emergency) |
| SpendingDetailScreen | Log spending entries, view recent logs |
| SavingsDetailScreen | Shows unspent amount, warns if over budget |
| InvestmentDetailScreen | Log investments, view all-time total |
| EmergencyDetailScreen | Log emergency contributions |
| SpendingLogScreen | Filtered full log (by month/year/category) |
| InvestmentLogScreen | Same as above for investments |
| SettingsScreen | Edit salary, currency, bills; reset app |

### Placeholder (not yet built)

- `BreakdownScreen.tsx`
- `LogScreen.tsx`
- `MonthlyScreen.tsx`
- `UnavoidablesScreen.tsx`

---

## Theme System

Always use values from `src/constants/theme.ts` — never hardcode colors or font sizes.

**Color roles**:
| Role | Color |
|---|---|
| Spending | Red `#E24B4A` |
| Savings | Green `#1D9E75` |
| Investment | Purple `#534AB7` |
| Emergency | Blue `#378ADD` |
| Bills / neutral | Gray |

Each has a `Light` and `Dark` variant (e.g. `greenLight`, `greenDark`).

**Border radii**: input: 8 · button: 12 · card: 16 · tag: 24 · full: 9999

**Font sizes**: xs(11) sm(12) sm2(13) md(14) md2(15) lg(18) xl(20) xxl(26) xxxl(30)

---

## UI Patterns (follow these for consistency)

- **Cards**: white bg, 16px radius, 1px border
- **Buttons**: 48–56px height, 12px radius
- **Progress bars**: 6px height, rounded, colored fill
- **Category pills**: 24px radius tags
- **Inputs**: 1.5px border, 8px radius, light bg
- **Modals**: overlay + bottom-sheet style
- **Pickers**: custom modal (no native picker) for month, year, category, currency

---

## State Management

- **No Redux / Zustand** — plain React hooks only
- `useFocusEffect` to reload data when a screen is focused
- Context API only for two navigation callbacks: `useOnboardingComplete` and `useReset`
- All persistence via AsyncStorage helpers in `storage.ts`

---

## Currency Support

25+ currencies selectable at onboarding and editable in Settings:
USD, EUR, GBP, INR, NPR, AUD, CAD, SGD, AED, PKR, BDT, LKR, MYR, PHP, IDR, THB, KES, NGN, ZAR, BRL, MXN, JPY, CNY, KRW, CHF

All amounts are displayed with the ISO currency code (e.g. `USD 1,200`).

---

## Key Conventions

- All screen components are in `src/screens/` — one file per screen, no shared screen components
- Theme values always from `src/constants/theme.ts`
- Data types always from `src/types/index.ts`
- Storage always through `src/utils/storage.ts` — never call AsyncStorage directly in screens
- Month keys always as `YYYY-MM` string
- `useFocusEffect` (not `useEffect`) for data fetching in screens that can be navigated back to
