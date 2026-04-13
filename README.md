# 💰 FinanceLog

> **Part of the [IRONLOG](https://ironlog.space) ecosystem**

A personal finance and budget tracking PWA. Part of the IRONLOG ecosystem.

## Live App

**[https://financelog.ironlog.space](https://financelog.ironlog.space)**

## Tech Stack

- **Frontend**: React 18, Recharts 2.12, Vite 6
- **Storage**: localStorage — all data stays on device by default
- **Cloud Sync**: Optional push/pull to IRONLOG backend (Supabase)
- **Auth**: Email + PIN, shared `ironlog_session` cookie for SSO across apps
- **Deployment**: GitHub Pages via GitHub Actions

## Development

```bash
npm install
npm run dev      # Dev server on port 3001
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── main.jsx              # Entry point, SW registration
├── App.jsx               # Root component, routing, state persistence
├── index.css             # Global styles
├── components/
│   ├── ui.jsx            # Shared UI (Btn, Card, Field, Sheet, etc.)
│   ├── Icons.jsx         # SVG icons
│   └── ErrorBoundary.jsx # Crash handler with emergency backup
├── tabs/
│   ├── Onboarding.jsx    # Multi-step signup wizard
│   ├── HomeTab.jsx       # Dashboard
│   └── SettingsTab.jsx   # Settings, export/import, sign out
├── utils/
│   ├── auth.js           # Session management
│   ├── storage.js        # localStorage + encrypted storage + cookies
│   ├── sync.js           # Cloud sync (push/pull)
│   ├── theme.js          # Dark/light themes
│   ├── helpers.js        # Date, currency, math utilities
│   └── sentry.js         # Error tracking
└── state/
    └── reducer.js        # App state reducer + data constants
```

## IRON Rank System

FinanceLog participates in the shared IRONLOG XP/rank system:
- Earn XP by logging consistently in this app
- Progress through 30 ranks: Bronze I → Immortal III
- Daily Missions with app-specific objectives
- Light/dark theme toggle in Settings

## IRONLOG Ecosystem

| App | URL |
|-----|-----|
| IRONLOG | [ironlog.space](https://ironlog.space) |
| NutritionLog | [nutrition.ironlog.space](https://nutrition.ironlog.space) |
| TherapyLog | [therapylog.ironlog.space](https://therapylog.ironlog.space) |
| FinanceLog | [financelog.ironlog.space](https://financelog.ironlog.space) |
| ReminderLog | [reminderlog.ironlog.space](https://reminderlog.ironlog.space) |

## License

MIT
