import { uid } from '../utils/helpers';

// ─── Expense & Income Categories ───
export const EXP_CATS = [
  { id: "housing", icon: "🏠", label: "Housing", color: "#6366f1" },
  { id: "food", icon: "🍕", label: "Food & Dining", color: "#f59e0b" },
  { id: "transport", icon: "🚗", label: "Transport", color: "#3b82f6" },
  { id: "health", icon: "💊", label: "Health", color: "#ef4444" },
  { id: "entertainment", icon: "🎬", label: "Entertainment", color: "#a855f7" },
  { id: "shopping", icon: "🛍️", label: "Shopping", color: "#ec4899" },
  { id: "utilities", icon: "💡", label: "Utilities", color: "#14b8a6" },
  { id: "subscriptions", icon: "📱", label: "Subscriptions", color: "#8b5cf6" },
  { id: "fitness", icon: "💪", label: "Fitness", color: "#22d3ee" },
  { id: "travel", icon: "✈️", label: "Travel", color: "#f97316" },
  { id: "education", icon: "📚", label: "Education", color: "#06b6d4" },
  { id: "personal", icon: "👤", label: "Personal", color: "#64748b" },
  { id: "gifts", icon: "🎁", label: "Gifts", color: "#f43f5e" },
  { id: "savings", icon: "🏦", label: "Savings", color: "#10b981" },
  { id: "other", icon: "📦", label: "Other", color: "#6b7280" },
];

export const INC_CATS = [
  { id: "salary", icon: "💰", label: "Salary", color: "#10b981" },
  { id: "freelance", icon: "💻", label: "Freelance", color: "#3b82f6" },
  { id: "investment", icon: "📈", label: "Investment", color: "#f59e0b" },
  { id: "rental", icon: "🏠", label: "Rental", color: "#8b5cf6" },
  { id: "bonus", icon: "🎉", label: "Bonus", color: "#ec4899" },
  { id: "other_inc", icon: "📦", label: "Other", color: "#6b7280" },
];

export const ACCOUNT_TYPES = [
  { id: "checking", icon: "🏦", label: "Checking" },
  { id: "savings", icon: "💰", label: "Savings" },
  { id: "investment", icon: "📈", label: "Investment" },
  { id: "crypto", icon: "₿", label: "Crypto" },
  { id: "property", icon: "🏠", label: "Property" },
  { id: "debt", icon: "💳", label: "Debt" },
];

export const init = {
  tab: "home",
  transactions: [],
  accounts: [],
  budgets: {},
  goals: [],
  recurring: [],
  loaded: false,
  onboarded: false,
  profile: { firstName: "", lastName: "", email: "" },
  currency: "USD",
};

export function reducer(s, a) {
  switch (a.type) {
    case "INIT": return { ...s, ...a.p, loaded: true };
    case "TAB": return { ...s, tab: a.tab };
    case "ADD_TX": {
      if (s.transactions.some(t => t.id === a.tx.id)) return s;
      return { ...s, transactions: [a.tx, ...s.transactions].sort((a, b) => b.date.localeCompare(a.date)) };
    }
    case "DEL_TX": return { ...s, transactions: s.transactions.filter(t => t.id !== a.id) };
    case "UPD_TX": return { ...s, transactions: s.transactions.map(t => t.id === a.tx.id ? { ...a.tx } : t) };
    case "ADD_ACC": {
      if (s.accounts.some(ac => ac.id === a.acc.id)) return s;
      return { ...s, accounts: [...s.accounts, a.acc] };
    }
    case "DEL_ACC": return { ...s, accounts: s.accounts.filter(ac => ac.id !== a.id) };
    case "UPD_ACC": return { ...s, accounts: s.accounts.map(ac => ac.id === a.acc.id ? { ...a.acc } : ac) };
    case "SET_BUD": {
      const budgets = { ...s.budgets };
      Object.entries(a.budgets).forEach(([k, v]) => {
        const val = parseFloat(v);
        if (val > 0) budgets[k] = val; else delete budgets[k];
      });
      return { ...s, budgets };
    }
    case "ADD_GOAL": {
      if (s.goals.some(g => g.id === a.goal.id)) return s;
      return { ...s, goals: [...s.goals, a.goal] };
    }
    case "UPD_GOAL": return { ...s, goals: s.goals.map(g => g.id === a.goal.id ? { ...a.goal } : g) };
    case "DEL_GOAL": return { ...s, goals: s.goals.filter(g => g.id !== a.id) };
    case "ADD_RECUR": {
      if (s.recurring.some(r => r.id === a.rec.id)) return s;
      return { ...s, recurring: [...s.recurring, a.rec] };
    }
    case "DEL_RECUR": return { ...s, recurring: s.recurring.filter(r => r.id !== a.id) };
    case "UPD_RECUR": return { ...s, recurring: s.recurring.map(r => r.id === a.rec.id ? { ...a.rec } : r) };
    case "SET_PROFILE": return { ...s, profile: { ...(s.profile || {}), ...a.profile } };
    case "SET_CURRENCY": return { ...s, currency: a.currency };
    case "ONBOARDED": return { ...s, onboarded: true };
    case "IMPORT": return { ...s, ...a.data, loaded: true };
    case "CLEAR_ALL": return { ...init, loaded: true, onboarded: true, profile: s.profile };
    default: return s;
  }
}
