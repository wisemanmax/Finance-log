import React, { useState } from 'react';
import { V, setTheme } from '../utils/theme';
import { LS } from '../utils/storage';
import { Card, Btn, Field, ConfirmCtrl, SuccessToastCtrl } from '../components/ui';
import { Icons } from '../components/Icons';
import { SessionManager } from '../utils/auth';

export function TOSContent() {
  return (
    <div style={{ fontSize: 12, color: V.text2, lineHeight: 1.8 }}>
      <h3 style={{ color: V.text, marginBottom: 8 }}>Terms of Service</h3>
      <p>By using FinanceLog, you agree to use the app responsibly. Your data is stored locally on your device. Cloud sync is optional and encrypted in transit. We do not sell your data. You must be 13 or older to use this service. We reserve the right to terminate accounts that violate these terms.</p>
      <p style={{ marginTop: 12 }}>Last updated: April 2026</p>
    </div>
  );
}

export function PrivacyContent() {
  return (
    <div style={{ fontSize: 12, color: V.text2, lineHeight: 1.8 }}>
      <h3 style={{ color: V.text, marginBottom: 8 }}>Privacy Policy</h3>
      <p>FinanceLog stores your data locally on your device by default. When you enable cloud sync, your data is encrypted in transit and stored securely. We collect minimal analytics (crash reports via Sentry). We never sell, share, or monetize your personal or financial data. You can export or delete all your data at any time from Settings.</p>
      <p style={{ marginTop: 12 }}>Last updated: April 2026</p>
    </div>
  );
}

export function SettingsTab({ s, d }) {
  const [isDark, setIsDark] = useState(V.mode === "dark");
  const email = s.profile?.email || LS.get("ft-session-email");

  const toggleTheme = () => {
    const mode = isDark ? "light" : "dark";
    setTheme(mode);
    setIsDark(!isDark);
    // V is a mutated object, not React state — reload so every component
    // re-reads the new theme values consistently on next render.
    window.location.reload();
  };

  const exportData = () => {
    const data = { transactions: s.transactions, accounts: s.accounts, budgets: s.budgets, goals: s.goals, recurring: s.recurring, profile: s.profile };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `financelog-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    SuccessToastCtrl.show("Data exported");
  };

  const importData = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          d({ type: "IMPORT", data });
          SuccessToastCtrl.show("Data imported successfully");
        } catch (err) { alert("Invalid backup file"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const signOut = async () => {
    await SessionManager.revoke();
    LS.set("fl-onboarded", null);
    window.location.reload();
  };

  const clearAll = () => {
    ConfirmCtrl.show("Delete All Data?", "This will permanently remove all your transactions, accounts, budgets, and goals. This cannot be undone.", () => {
      d({ type: "CLEAR_ALL" });
      SuccessToastCtrl.show("All data cleared");
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: V.text }}>Settings</div>

      {/* Account */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: V.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Account</div>
        <div style={{ fontSize: 13, color: V.text }}>{s.profile?.firstName} {s.profile?.lastName}</div>
        <div style={{ fontSize: 11, color: V.text3 }}>{email || "Not signed in"}</div>
      </Card>

      {/* Theme */}
      <Card style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: V.text }}>Dark Mode</span>
          <button onClick={toggleTheme} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
            background: isDark ? V.accent : "rgba(255,255,255,0.15)", position: "relative", transition: "background .2s" }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", position: "absolute", top: 3,
              left: isDark ? 23 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
          </button>
        </div>
      </Card>

      {/* Data */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: V.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Data</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn v="secondary" full onClick={exportData}>{Icons.download({ size: 14, color: V.text2 })} Export</Btn>
          <Btn v="secondary" full onClick={importData}>{Icons.upload({ size: 14, color: V.text2 })} Import</Btn>
        </div>
      </Card>

      {/* Danger zone */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: V.danger, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Danger Zone</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn v="danger" full onClick={clearAll}>{Icons.trash({ size: 14, color: V.danger })} Clear All Data</Btn>
          <Btn v="secondary" full onClick={signOut}>Sign Out</Btn>
        </div>
      </Card>

      {/* Version */}
      <div style={{ textAlign: "center", fontSize: 10, color: V.text3, padding: 12 }}>
        FinanceLog v1.0 · Part of the IRONLOG ecosystem
      </div>
    </div>
  );
}
