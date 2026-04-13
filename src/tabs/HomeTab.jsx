import React, { useMemo } from 'react';
import { V } from '../utils/theme';
import { Card, Btn, Progress, Stat } from '../components/ui';
import { Icons } from '../components/Icons';
import { today, fmtMoney, fmtShortMoney, thisMonth, safeSum } from '../utils/helpers';
import { EXP_CATS, INC_CATS } from '../state/reducer';

export function HomeTab({ s, d }) {
  const monthTx = useMemo(() => s.transactions.filter(t => t.date?.startsWith(thisMonth())), [s.transactions]);
  const monthIncome = safeSum(monthTx.filter(t => t.type === "income").map(t => t.amount));
  const monthExpense = safeSum(monthTx.filter(t => t.type === "expense").map(t => t.amount));
  const monthNet = monthIncome - monthExpense;
  const netWorth = safeSum(s.accounts.map(a => a.type === "debt" ? -(a.balance || 0) : (a.balance || 0)));
  const todayTx = s.transactions.filter(t => t.date === today());

  // Top spending categories this month
  const catSpend = {};
  monthTx.filter(t => t.type === "expense").forEach(t => { catSpend[t.category] = (catSpend[t.category] || 0) + t.amount; });
  const topCats = Object.entries(catSpend).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: V.text }}>{greeting}, {s.profile?.firstName || "there"}</div>
        <div style={{ fontSize: 11, color: V.text3 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
      </div>

      {/* Net Worth Card */}
      <Card style={{ padding: 16, background: `linear-gradient(135deg,${V.accent}08,${V.accent2}05)`, border: `1px solid ${V.accent}20` }}>
        <div style={{ fontSize: 10, color: V.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Net Worth</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: V.accent, fontFamily: V.mono }}>{fmtMoney(netWorth)}</div>
        <div style={{ fontSize: 10, color: V.text3, marginTop: 2 }}>{s.accounts.length} account{s.accounts.length !== 1 ? "s" : ""} linked</div>
      </Card>

      {/* Month Summary */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: V.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>This Month</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <Stat label="Income" value={fmtShortMoney(monthIncome)} color={V.accent} />
          <Stat label="Spent" value={fmtShortMoney(monthExpense)} color={V.danger} />
          <Stat label="Net" value={(monthNet >= 0 ? "+" : "") + fmtShortMoney(monthNet)} color={monthNet >= 0 ? V.accent : V.danger} />
        </div>
      </Card>

      {/* Budget Overview */}
      {Object.keys(s.budgets).length > 0 && (
        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Budget Health</div>
          {Object.entries(s.budgets).slice(0, 4).map(([catId, limit]) => {
            const cat = EXP_CATS.find(c => c.id === catId);
            const spent = catSpend[catId] || 0;
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
            return (
              <div key={catId} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: V.text }}>{cat?.icon} {cat?.label || catId}</span>
                  <span style={{ fontSize: 10, color: pct > 100 ? V.danger : V.text3, fontFamily: V.mono }}>{fmtMoney(spent, 0)} / {fmtMoney(limit, 0)}</span>
                </div>
                <Progress val={spent} max={limit} color={pct > 100 ? V.danger : pct > 80 ? V.warn : V.accent} h={4} />
              </div>
            );
          })}
        </Card>
      )}

      {/* Top Spending */}
      {topCats.length > 0 && (
        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Top Spending</div>
          {topCats.map(([catId, amount]) => {
            const cat = EXP_CATS.find(c => c.id === catId);
            return (
              <div key={catId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0",
                borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                <span style={{ fontSize: 12, color: V.text }}>{cat?.icon} {cat?.label || catId}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: V.danger, fontFamily: V.mono }}>{fmtMoney(amount, 0)}</span>
              </div>
            );
          })}
        </Card>
      )}

      {/* Quick Add */}
      <Btn full onClick={() => d({ type: "TAB", tab: "transactions" })} s={{ marginTop: 4 }}>
        {Icons.plus({ size: 16, color: V.bg })} Log Transaction
      </Btn>

      {/* Goals */}
      {s.goals.length > 0 && (
        <Card style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Savings Goals</div>
          {s.goals.map(g => (
            <div key={g.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: V.text }}>{g.icon} {g.name}</span>
                <span style={{ fontSize: 10, color: V.text3, fontFamily: V.mono }}>{fmtMoney(g.current || 0, 0)} / {fmtMoney(g.target, 0)}</span>
              </div>
              <Progress val={g.current || 0} max={g.target} color={V.accent2} h={4} />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
