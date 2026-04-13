import React, { useReducer, useEffect, useRef } from 'react';
import { V } from './utils/theme';
import { LS } from './utils/storage';
import { CloudSync } from './utils/sync';
import { SessionManager } from './utils/auth';
import { SentryUtil } from './utils/sentry';
import { today } from './utils/helpers';
import { reducer, init } from './state/reducer';
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalConfirm, SuccessToast } from './components/ui';
import { Onboarding } from './tabs/Onboarding';
import { HomeTab } from './tabs/HomeTab';
import { SettingsTab } from './tabs/SettingsTab';

export default function App() {
  const [s, d] = useReducer(reducer, init);

  // ─── Load persisted state ───
  useEffect(() => {
    const p = {
      transactions: LS.get("fl-tx") || [],
      accounts: LS.get("fl-accounts") || [],
      budgets: LS.get("fl-budgets") || {},
      goals: LS.get("fl-goals-v2") || [],
      recurring: LS.get("fl-recurring") || [],
      profile: LS.get("fl-profile") || init.profile,
      currency: LS.get("fl-currency") || "USD",
      onboarded: !!LS.get("fl-onboarded"),
    };
    d({ type: "INIT", p });

    // Identify in Sentry
    if (p.profile?.email) SentryUtil.identify(p.profile.email, `${p.profile.firstName} ${p.profile.lastName}`);

    // Check admin
    SessionManager.checkAdmin();
  }, []);

  // ─── Persist state changes ───
  useEffect(() => {
    if (!s.loaded) return;
    LS.set("fl-tx", s.transactions);
    LS.set("fl-accounts", s.accounts);
    LS.set("fl-budgets", s.budgets);
    LS.set("fl-goals-v2", s.goals);
    LS.set("fl-recurring", s.recurring);
    LS.set("fl-profile", s.profile);
    LS.set("fl-currency", s.currency);
    if (s.onboarded) LS.set("fl-onboarded", true);

    // Auto-sync to cloud
    if (s.onboarded && s.profile?.email) CloudSync.debouncedPush(s);
  }, [s.transactions, s.accounts, s.budgets, s.goals, s.recurring, s.profile, s.currency, s.onboarded, s.loaded]);

  // ─── Sync on app open ───
  useEffect(() => {
    if (s.loaded && s.onboarded && s.profile?.email) CloudSync.push(s);
  }, [s.loaded, s.onboarded]);

  // ─── Loading ───
  if (!s.loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: V.bg }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${V.accent}20`, borderTopColor: V.accent, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
    </div>
  );

  // ─── Onboarding ───
  if (!s.onboarded) return <ErrorBoundary><Onboarding d={d} /><GlobalConfirm /><SuccessToast /></ErrorBoundary>;

  // ─── Main App ───
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "transactions", label: "Activity", icon: "💸" },
    { id: "budget", label: "Budget", icon: "📊" },
    { id: "wealth", label: "Wealth", icon: "📈" },
    { id: "settings", label: "More", icon: "⚙️" },
  ];

  return (
    <ErrorBoundary>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: V.bg }}>
        {/* Main content area */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
          <div style={{ padding: "16px 16px 16px", maxWidth: 700, margin: "0 auto" }}>
            {s.tab === "home" && <HomeTab s={s} d={d} />}
            {s.tab === "transactions" && <div style={{ color: V.text3, textAlign: "center", padding: 40 }}>Transactions tab — coming from extraction</div>}
            {s.tab === "budget" && <div style={{ color: V.text3, textAlign: "center", padding: 40 }}>Budget tab — coming from extraction</div>}
            {s.tab === "wealth" && <div style={{ color: V.text3, textAlign: "center", padding: 40 }}>Wealth tab — coming from extraction</div>}
            {s.tab === "settings" && <SettingsTab s={s} d={d} />}
          </div>
        </div>

        {/* Bottom Nav */}
        <nav style={{ display: "flex", background: V.navBg, borderTop: `1px solid ${V.cardBorder}`,
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 8px))", flexShrink: 0, backdropFilter: "blur(20px)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => d({ type: "TAB", tab: t.id })}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 4px",
                background: "none", border: "none", cursor: "pointer", fontFamily: V.font,
                color: s.tab === t.id ? V.accent : V.text3, WebkitTapHighlightColor: "transparent" }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 9, fontWeight: s.tab === t.id ? 700 : 500 }}>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <GlobalConfirm />
      <SuccessToast />
    </ErrorBoundary>
  );
}
