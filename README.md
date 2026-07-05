# ખેડૂત ખર્ચ નોંધ (Khedut Kharch Nondh)

A production-ready, offline-first, 100% Gujarati Progressive Web App for farmers to track crop-wise
expenses from sowing to harvest — a digital replacement for the paper expense notebook.

## Tech stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (token-based design system)
- React Router (hash routing, so it works from static hosting too)
- React Hook Form + Zod for validated forms
- Recharts for the statistics dashboard (lazy-loaded, off the critical path)
- `vite-plugin-pwa` for the installable, offline service worker
- **LocalStorage only** — no backend, no auth, no network calls. All data stays on the device.
- Self-hosted Noto Sans Gujarati + Inter (variable fonts) — fully offline, no Google Fonts CDN

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
```

Open the dev server URL on a phone (or resize your browser to ~390px) — the whole UI is designed
mobile-first for one-handed use in bright outdoor light.

## Project structure

```
src/
  components/
    icons/        custom SVG icon set (one consistent stroke design language)
    ui/            Button, Card, Field (Input/Select/Textarea), Dialog, EmptyState, AppShell
    SeasonCard.tsx notebook-styled dashboard card
  context/
    AppDataContext.tsx   seasons + expenses + settings, all persisted to LocalStorage
    ToastContext.tsx     lightweight toast notifications
  hooks/
    useInstallPrompt.ts  captures the PWA "Add to Home Screen" prompt
  lib/
    storage.ts     safe LocalStorage read/write + usage estimate
    calc.ts         totals, category breakdown, profit, monthly series
    format.ts       currency, DD/MM/YYYY dates, Gujarati long dates
    validation.ts   Zod schemas for season / expense / harvest forms
    image.ts        client-side bill-photo compression before storing
  pages/
    Dashboard, NewSeason, CropDetails, AddExpense, ExpenseHistory,
    Harvest, Report (printable PDF), Statistics, Settings
```

## Design system

- Palette: warm "paper" background, deep crop green, saffron and soil-brown accents.
- Typography: Noto Sans Gujarati throughout, Inter for tabular numerals (amounts, dates).
- Signature element: cards use a dashed "notebook stitch" top border and a colored crop tag ribbon,
  echoing the paper notebook this app replaces.
- 8px spacing rhythm, 16px card radius, 48px+ touch targets, high-contrast text for sunlight.
- No emojis, no stock illustrations — every icon is a custom-drawn SVG in one stroke language.

## PWA / offline

- `vite-plugin-pwa` precaches the app shell, fonts, and icons on first load.
- Works fully offline after the first visit; data lives in LocalStorage and survives refreshes and
  browser restarts.
- Installable on Android/desktop via the browser's install prompt or the in-app install button in
  Settings.

## Data & backup

- Settings → Backup lets you export all seasons/expenses/settings as a single JSON file, and restore
  from one.
- "PDF બનાવો" on any crop opens a print-formatted report and uses the browser's native print-to-PDF,
  so Gujarati text always renders correctly.
