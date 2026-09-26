# ખેડૂત ખર્ચ (Khedut Kharch)

**Khedut Kharch** is a production-ready, offline-first Progressive Web App (PWA) built specifically for farmers in Gujarat (Kachchh). It serves as a modern digital replacement for the traditional paper notebook, allowing farmers to track crop-wise expenses, manage labor and partner accounts, and securely store farm documents.

The app is built with a **Freemium Business Model**, offering robust local-first features for free, while gating cloud synchronization, PDF exports, and unlimited data behind an affordable yearly subscription (₹300/year).

---

## 🌟 Core Features

- **Crop-Wise Accounting:** Track expenses, seeds, fertilizers, and income for multiple crops and seasons simultaneously.
- **Labor & Partner Management:** Record daily labor attendance and track advance payments (ઉપાડ) given to farming partners.
- **Farmer's Wallet (ખેડૂત વૉલેટ):** Securely upload and store important agricultural documents (like 7/12 extracts, bills, and ID proofs).
- **Offline-First Architecture:** The app works 100% offline. Farmers can log expenses in the middle of a field without internet. When the network returns, Premium users' data automatically syncs to the cloud.
- **Analytics & PDF Reports:** Generate profit/loss charts and beautiful, printable PDF reports to share with accountants or partners via WhatsApp.
- **100% Gujarati UI:** Custom-built for the local demographic, featuring locally hosted variable fonts (Noto Sans Gujarati) for perfect rendering.

## 💰 Monetization (Freemium Model)

The app employs a seamless freemium strategy:
1. **Free Tier:** Users can log in via Google, use the app entirely offline, manage up to 3 active crops, and store up to 5 documents locally.
2. **Premium Tier (₹300/year):** Unlocks unlimited crops, Cloud Sync (Firebase), PDF generation, WhatsApp sharing, and up to 30 documents in the wallet.
3. **Smart Migration:** When a free user upgrades, their localized data is automatically migrated and synced to the secure cloud.
4. **Admin Panel:** A built-in, PIN-protected dashboard (`/admin`) allows the app owner to view pending UPI payments, verify transaction screenshots, and manually approve or ban users.

## 🛠 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (Custom design system with CSS Variables)
- **Database & Auth:** Firebase (Google Auth, Firestore for real-time cloud sync & Base64 document storage)
- **Offline & PWA:** `vite-plugin-pwa` (Workbox) & `localStorage` as the primary offline datastore.
- **Routing:** React Router DOM
- **Forms & Validation:** React Hook Form + Zod
- **Charts:** Recharts

## 📁 Project Structure

```text
src/
  components/
    guards/       AuthGuard (handles trial/premium/admin routing)
    icons/        Custom hand-drawn SVG icons (no external libraries)
    ui/           Shared UI components (Buttons, Modals, AppShell)
  context/
    AuthContext.tsx     Handles Google Auth, Membership status, and Admin roles
    AppDataContext.tsx  Handles local data saving & Firebase Cloud Sync
  pages/
    admin/              PIN-protected panel to manage users and approve payments
    fields/             Crop & Farm management screens
    membership/         Payment & Upgrade screens
    wallet/             Document upload and management
    Dashboard, Report, Statistics, Login, PrivacyPolicy, etc.
```

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Run Development Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   ```

## 🎨 Design Philosophy
- **Outdoor Legibility:** High-contrast text, large 48px+ touch targets, and a warm "paper" background color palette designed to be readable in bright sunlight.
- **Skeuomorphic Touches:** The UI borrows elements from physical notebooks (stitched borders, bookmark ribbons) to make the digital transition feel familiar to rural users.
