# PlanAble

A cross-platform mobile productivity app built with React Native and Expo. PlanAble helps users manage tasks through a dashboard, calendar view, and a focused **One Thing Mode** designed to reduce distraction and improve follow-through.

## Features

### Task Management
- **Four task types** — Basic (one-off), Routine (recurring on selected weekdays), Related (linked to a parent task), and Long Interval (repeating on a custom day cycle)
- **Multiple task views** — filter by Today, Upcoming, Repeating, or Open
- **Full task editing** — title, due date, time, notes, recurrence settings, and linked tasks
- **Completion tracking** — recurring tasks track completed and excluded dates independently

### One Thing Mode
- Distraction-free focus mode for working through a single task at a time
- Built-in countdown timer with configurable default duration
- Play, pause, and reset controls
- Mid-session reminder notifications at set intervals
- Vibration feedback and confetti on completion

### Calendar View
- Visual calendar for reviewing and navigating scheduled tasks

### Notifications
- Local scheduled notifications for individual tasks
- Weekly recurring reminders on selected days and times
- Per-task notification toggle
- Separate sound and silent notification channels on Android

### Settings
- Light / dark / system theme
- Color blind mode
- Confetti toggle
- Default One Thing Mode timer duration
- Master notifications toggle

### Authentication
- Email and password sign-in via Supabase Auth
- Google Sign-In (iOS and Android)
- Persistent sessions with automatic token refresh

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native (Expo) | Cross-platform mobile framework |
| Supabase | Authentication, database & real-time services |
| TypeScript | Type-safe development |
| Jest | Unit and integration testing |

---

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
git clone <repository-url>
cd PlanAble
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

You can find these values in your Supabase project under **Project Settings → API**.

### Running the App

```bash
npx expo start
```

---

## Project Structure

```
PlanAble/
├── src/
│   ├── app/              # Expo Router screens (index, login, signup, etc.)
│   ├── components/       # Reusable UI components
│   ├── contexts/         # Global state (AppContext)
│   ├── hooks/            # Custom React hooks
│   ├── constants/        # Theme and shared tokens
│   └── types/            # Shared TypeScript types
├── lib/
│   ├── supabaseClient.ts # Supabase singleton and auth helpers
│   └── Notifications.ts  # Local notification scheduling
├── supabase/
│   ├── migrations/       # SQL migration files
│   └── types/            # Generated TypeScript types
├── testing/
│   ├── unit/             # Unit test suites
│   ├── integration/      # Integration test suites
│   └── evidence/         # Auto-saved test run output
└── scripts/              # Developer tooling
```

---

## Running Tests

```bash
# All tests with coverage
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# CI mode
npm run test:ci
```

Test output is automatically saved to `testing/evidence/` after each run.

### Coverage Thresholds

| Metric | Minimum |
|---|---|
| Statements | 65% |
| Branches | 50% |
| Functions | 65% |
| Lines | 65% |

---

## Authentication

PlanAble supports two sign-in methods:

- **Email & password** — handled by Supabase Auth, no extra setup required
- **Google Sign-In** — requires configuration in Google Cloud Console and a valid `iosUrlScheme` set in `app.json`

> ⚠️ The `iosUrlScheme` in `app.json` is currently a placeholder. Replace it with your real Google OAuth iOS client ID before building.

---

## Building for Production

PlanAble uses [Expo Application Services (EAS)](https://expo.dev/eas) for builds and store submission.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in
eas login

# Build
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android

# Publish an OTA update
eas update
```

> ⚠️ Before your first production build, update `android.package` in `app.json` from `com.anonymous.plannerprototype` to your own identifier. This cannot be changed after release.

---
