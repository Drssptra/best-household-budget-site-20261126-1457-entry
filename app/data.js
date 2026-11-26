// data.js — the household's money: seed data, storage and the small
// helpers every view uses. All state lives in localStorage under one key,
// so the site works offline and remembers edits between visits.

export const STORE_KEY = 'hearth-ledger-v1';

export const CATEGORIES = [
  { id: 'groceries', label: 'Groceries', color: '#2e7d4f', icon: '🛒' },
  { id: 'housing', label: 'Housing & Rent', color: '#7a5c2e', icon: '🏠' },
  { id: 'utilities', label: 'Utilities', color: '#4a6fa5', icon: '💡' },
  { id: 'transport', label: 'Transport', color: '#8a5a9e', icon: '🚗' },
  { id: 'dining', label: 'Dining Out', color: '#c25e3a', icon: '🍽️' },
  { id: 'entertainment', label: 'Entertainment', color: '#b3883a', icon: '🎬' },
  { id: 'health', label: 'Health & Pharmacy', color: '#3a8a7d', icon: '💊' },
  { id: 'kids', label: 'Kids & School', color: '#5b7fa6', icon: '🎒' },
  { id: 'clothing', label: 'Clothing', color: '#a65a7d', icon: '👕' },
  { id: 'subscriptions', label: 'Subscriptions', color: '#6b7c93', icon: '📺' },
  { id: 'home', label: 'Home & Garden', color: '#6d8a3a', icon: '🪴' },
  { id: 'personal', label: 'Personal', color: '#9e7b4f', icon: '✂️' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary' },
  { id: 'freelance', label: 'Freelance & Side Work' },
  { id: 'refund', label: 'Refunds & Rebates' },
  { id: 'other-income', label: 'Other Income' },
];

export function categoryOf(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, label: id, color: '#6b7c93', icon: '•' };
}

export function incomeCategoryOf(id) {
  return INCOME_CATEGORIES.find((c) => c.id === id) || { id, label: id };
}

// --- Seed data: the Hartley household, November 2026 -----------------------
// Maya (teacher) and Jordan (electrician), two kids, one joint account.
// Figures are realistic for a family of four; every row is editable.

function seedTransactions() {
  const t = (id, date, kind, category, note, amount, account, member) => ({
    id, date, kind, category, note, amount, account, member,
  });
  return [
    // Income — November
    t('t01', '2026-11-01', 'income', 'salary', 'Maya — monthly salary', 3850.00, 'Joint checking', 'Maya'),
    t('t02', '2026-11-01', 'income', 'salary', 'Jordan — monthly salary', 2950.00, 'Joint checking', 'Jordan'),
    t('t03', '2026-11-07', 'income', 'freelance', 'Jordan — weekend wiring job', 240.00, 'Joint checking', 'Jordan'),
    t('t04', '2026-11-14', 'income', 'freelance', 'Maya — tutoring, two sessions', 120.00, 'Joint checking', 'Maya'),
    t('t05', '2026-11-19', 'income', 'refund', 'Energy rebate from city utility', 86.40, 'Joint checking', 'Shared'),
    // Housing & utilities
    t('t06', '2026-11-01', 'expense', 'housing', 'Monthly rent', 1450.00, 'Joint checking', 'Shared'),
    t('t07', '2026-11-05', 'expense', 'utilities', 'Electricity bill', 118.20, 'Joint checking', 'Shared'),
    t('t08', '2026-11-06', 'expense', 'utilities', 'Water & sewer', 54.75, 'Joint checking', 'Shared'),
    t('t09', '2026-11-12', 'expense', 'utilities', 'Internet & phone bundle', 89.00, 'Joint checking', 'Shared'),
    // Groceries
    t('t10', '2026-11-02', 'expense', 'groceries', 'Weekly shop — Green Mart', 132.48, 'Joint checking', 'Maya'),
    t('t11', '2026-11-08', 'expense', 'groceries', 'Weekly shop — Green Mart', 118.90, 'Joint checking', 'Maya'),
    t('t12', '2026-11-11', 'expense', 'groceries', 'Butcher & bakery run', 46.30, 'Cash wallet', 'Jordan'),
    t('t13', '2026-11-15', 'expense', 'groceries', 'Weekly shop — Green Mart', 141.15, 'Joint checking', 'Maya'),
    t('t14', '2026-11-21', 'expense', 'groceries', 'Weekly shop + Thanksgiving prep', 168.60, 'Joint checking', 'Maya'),
    t('t15', '2026-11-24', 'expense', 'groceries', 'Thanksgiving turkey & sides', 74.25, 'Joint checking', 'Maya'),
    // Transport
    t('t16', '2026-11-03', 'expense', 'transport', 'Fuel — Jordan’s van', 52.00, 'Credit card', 'Jordan'),
    t('t17', '2026-11-10', 'expense', 'transport', 'Fuel — family car', 44.50, 'Credit card', 'Maya'),
    t('t18', '2026-11-16', 'expense', 'transport', 'Bus passes — kids, November', 60.00, 'Joint checking', 'Shared'),
    t('t19', '2026-11-20', 'expense', 'transport', 'Fuel — family car', 48.75, 'Credit card', 'Jordan'),
    // Dining, fun and the rest of life
    t('t20', '2026-11-06', 'expense', 'dining', 'Pizza night with the kids', 38.40, 'Cash wallet', 'Shared'),
    t('t21', '2026-11-13', 'expense', 'dining', 'Lunch out — Maya & Jordan', 27.80, 'Credit card', 'Shared'),
    t('t22', '2026-11-21', 'expense', 'dining', 'Takeaway Thai', 32.60, 'Credit card', 'Shared'),
    t('t23', '2026-11-07', 'expense', 'entertainment', 'Cinema — family film', 42.00, 'Credit card', 'Shared'),
    t('t24', '2026-11-14', 'expense', 'entertainment', 'Board game for game night', 28.95, 'Joint checking', 'Shared'),
    t('t25', '2026-11-09', 'expense', 'health', 'Pharmacy — flu medicine', 24.60, 'Joint checking', 'Maya'),
    t('t26', '2026-11-17', 'expense', 'health', 'Dentist check-up — Leo', 65.00, 'Joint checking', 'Shared'),
    t('t27', '2026-11-04', 'expense', 'kids', 'School trip — science museum', 36.00, 'Joint checking', 'Shared'),
    t('t28', '2026-11-18', 'expense', 'kids', 'New school shoes — Nora', 58.00, 'Credit card', 'Shared'),
    t('t29', '2026-11-22', 'expense', 'kids', 'Art supplies for school project', 21.40, 'Cash wallet', 'Maya'),
    t('t30', '2026-11-10', 'expense', 'clothing', 'Winter jacket — Jordan', 89.00, 'Credit card', 'Jordan'),
    t('t31', '2026-11-02', 'expense', 'subscriptions', 'Streaming bundle', 24.99, 'Joint checking', 'Shared'),
    t('t32', '2026-11-15', 'expense', 'subscriptions', 'Music streaming', 11.99, 'Joint checking', 'Shared'),
    t('t33', '2026-11-08', 'expense', 'subscriptions', 'Cloud storage — family photos', 2.99, 'Joint checking', 'Shared'),
    t('t34', '2026-11-15', 'expense', 'home', 'Light bulbs & a new doormat', 33.75, 'Joint checking', 'Jordan'),
    t('t35', '2026-11-23', 'expense', 'home', 'Garden soil & winter bulbs', 41.20, 'Cash wallet', 'Jordan'),
    t('t36', '2026-11-12', 'expense', 'personal', 'Haircut — Maya', 42.00, 'Cash wallet', 'Maya'),
    t('t37', '2026-11-25', 'expense', 'personal', 'Haircut — Jordan', 25.00, 'Cash wallet', 'Jordan'),
    // October, so the month view has something to compare with
    t('t38', '2026-10-01', 'income', 'salary', 'Maya — monthly salary', 3850.00, 'Joint checking', 'Maya'),
    t('t39', '2026-10-01', 'income', 'salary', 'Jordan — monthly salary', 2950.00, 'Joint checking', 'Jordan'),
    t('t40', '2026-10-01', 'expense', 'housing', 'Monthly rent', 1450.00, 'Joint checking', 'Shared'),
    t('t41', '2026-10-03', 'expense', 'groceries', 'Weekly shop — Green Mart', 128.40, 'Joint checking', 'Maya'),
    t('t42', '2026-10-10', 'expense', 'groceries', 'Weekly shop — Green Mart', 134.90, 'Joint checking', 'Maya'),
    t('t43', '2026-10-17', 'expense', 'groceries', 'Weekly shop — Green Mart', 122.75, 'Joint checking', 'Maya'),
    t('t44', '2026-10-24', 'expense', 'groceries', 'Weekly shop — Green Mart', 139.20, 'Joint checking', 'Maya'),
    t('t45', '2026-10-05', 'expense', 'utilities', 'Electricity bill', 104.60, 'Joint checking', 'Shared'),
    t('t46', '2026-10-06', 'expense', 'utilities', 'Water & sewer', 51.30, 'Joint checking', 'Shared'),
    t('t47', '2026-10-12', 'expense', 'utilities', 'Internet & phone bundle', 89.00, 'Joint checking', 'Shared'),
    t('t48', '2026-10-07', 'expense', 'transport', 'Fuel — family car', 46.00, 'Credit card', 'Jordan'),
    t('t49', '2026-10-21', 'expense', 'transport', 'Fuel — Jordan’s van', 55.50, 'Credit card', 'Jordan'),
    t('t50', '2026-10-16', 'expense', 'transport', 'Bus passes — kids, October', 60.00, 'Joint checking', 'Shared'),
    t('t51', '2026-10-09', 'expense', 'dining', 'Pizza night with the kids', 36.90, 'Cash wallet', 'Shared'),
    t('t52', '2026-10-23', 'expense', 'dining', 'Takeaway Thai', 31.40, 'Credit card', 'Shared'),
    t('t53', '2026-10-11', 'expense', 'entertainment', 'Cinema — family film', 38.00, 'Credit card', 'Shared'),
    t('t54', '2026-10-18', 'expense', 'health', 'Pharmacy — vitamins', 19.80, 'Joint checking', 'Maya'),
    t('t55', '2026-10-20', 'expense', 'kids', 'School lunch money — Leo & Nora', 80.00, 'Joint checking', 'Shared'),
    t('t56', '2026-10-02', 'expense', 'subscriptions', 'Streaming bundle', 24.99, 'Joint checking', 'Shared'),
    t('t57', '2026-10-15', 'expense', 'subscriptions', 'Music streaming', 11.99, 'Joint checking', 'Shared'),
    t('t58', '2026-10-08', 'expense', 'home', 'Fix leaking tap — plumber parts', 46.50, 'Joint checking', 'Jordan'),
    t('t59', '2026-10-14', 'expense', 'personal', 'Haircut — Leo', 18.00, 'Cash wallet', 'Shared'),
  ];
}

function seedState() {
  return {
    version: 1,
    household: { name: 'The Hartley Household', members: ['Maya', 'Jordan', 'Leo', 'Nora'], month: '2026-11' },
    budgets: {
      groceries: 720, housing: 1450, utilities: 260, transport: 380, dining: 220,
      entertainment: 150, health: 180, kids: 300, clothing: 120, subscriptions: 64,
      home: 140, personal: 160,
    },
    savingsTarget: 600,
    goals: [
      { id: 'g1', name: 'Emergency fund — 3 months of rent', target: 4350, saved: 2875, date: '2027-06-30' },
      { id: 'g2', name: 'Summer holiday — coast trip', target: 1800, saved: 640, date: '2027-07-01' },
      { id: 'g3', name: 'New washing machine', target: 550, saved: 410, date: '2027-01-31' },
    ],
    // Closed months, for the six-month trend on Insights.
    history: [
      { month: '2026-06', income: 6930.00, spending: 3562.10 },
      { month: '2026-07', income: 7010.00, spending: 3721.45 },
      { month: '2026-08', income: 6885.00, spending: 3890.20 },
      { month: '2026-09', income: 7160.00, spending: 3614.80 },
      { month: '2026-10', income: 6800.00, spending: 3355.03 },
    ],
    transactions: seedTransactions(),
  };
}

// --- Store ---------------------------------------------------------------

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch {
    // Corrupt or unavailable storage: fall back to the seed.
  }
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

export function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the in-memory copy still works for the visit.
  }
}

export function resetState() {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

export function nextId(state, prefix) {
  let n = state.transactions.length + state.goals.length + 1;
  let id = `${prefix}${n}`;
  const taken = new Set([...state.transactions.map((t) => t.id), ...state.goals.map((g) => g.id)]);
  while (taken.has(id)) { n += 1; id = `${prefix}${n}`; }
  return id;
}

// --- Month math ----------------------------------------------------------

export function monthOf(dateStr) {
  return dateStr.slice(0, 7);
}

export function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function monthTotals(state, month) {
  const rows = state.transactions.filter((t) => monthOf(t.date) === month);
  let income = 0;
  let spending = 0;
  const byCategory = new Map();
  for (const t of rows) {
    if (t.kind === 'income') income += t.amount;
    else {
      spending += t.amount;
      byCategory.set(t.category, (byCategory.get(t.category) || 0) + t.amount);
    }
  }
  return { income, spending, byCategory, rows };
}

// Days still to go in a month, or null when the month is not the current
// one (its days are all spent). Uses the visitor's local calendar.
export function daysLeftInMonth(month) {
  const now = new Date();
  const [y, m] = month.split('-').map(Number);
  if (now.getFullYear() !== y || now.getMonth() + 1 !== m) return null;
  return new Date(y, m, 0).getDate() - now.getDate();
}

export function monthNameShort(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
}

export function formatMoney(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
