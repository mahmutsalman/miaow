# 🐱 Miaow

A community-driven mobile app for tracking and feeding stray cats in Istanbul. Built with Expo (React Native) and Supabase.

## What it does

Miaow connects two kinds of helpers:

- **Reporters** (`📍 Kedi Bildiren`) — spot a stray cat, drop a pin on the map with GPS coordinates, cat count, notes, and an optional photo.
- **Feeders** (`🍽️ Mama Bırakan`) — browse the live map, navigate to a sighting, leave food, and log the feeding.

The map updates in real time via Supabase Realtime, so every new sighting or feeding is immediately visible to all users.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 + Expo Router 6 |
| UI | React Native 0.81 (iOS/Android) + React Native Web |
| Map (native) | MapLibre React Native |
| Map (web) | react-map-gl + MapLibre GL JS |
| Backend | Supabase (Auth, Postgres, Storage, Realtime) |
| State | Zustand |
| Language | TypeScript |

## Project Structure

```
app/
  _layout.tsx          # Root layout — auth listener, gesture handler
  index.tsx            # Entry redirect (auth → map or login)
  (auth)/
    login.tsx          # Email/password sign-in
    register.tsx       # New account creation
    role-select.tsx    # Choose reporter or feeder role
  (app)/
    map.tsx            # Main map screen with live sightings
    report.tsx         # Submit a new cat sighting (reporter only)
    profile.tsx        # User profile and sign-out

components/
  MapView.tsx          # Native map (MapLibre React Native)
  MapView.web.tsx      # Web map (react-map-gl)
  MapView.types.ts     # Shared handle type (flyToSightings)
  CatMarker.tsx        # Custom cat pin component
  SightingSheet.tsx    # Bottom sheet detail card for a sighting

lib/
  supabase.ts          # Supabase client + shared types
  mockData.ts          # Demo sightings for running without Supabase
  useLocation.ts       # GPS hook (expo-location)

store/
  useAuthStore.ts      # Zustand store — session, profile, sign-out

constants/
  colors.ts            # Design tokens

supabase-schema.sql    # Full DB schema — run once in Supabase SQL Editor
```

## Demo Mode

The app runs **without any Supabase credentials**. If `EXPO_PUBLIC_SUPABASE_URL` is not set, it loads mock sightings around Karaköy, Istanbul and shows a `DEMO` badge in the top bar. All map, marker, and bottom-sheet interactions work normally in demo mode.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- For iOS: Xcode + iOS Simulator (macOS only)
- For Android: Android Studio + AVD

### 1. Install dependencies

```bash
npm install
```

### 2. Environment (optional — skip for demo mode)

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase project values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### 3. Run

```bash
# Start Expo dev server (scan QR with Expo Go)
npm start

# iOS simulator
npm run ios

# Android emulator
npm run android

# Web browser
npm run web
```

### Supabase Setup (for full backend)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and paste the contents of `supabase-schema.sql` — this creates the `profiles`, `sightings`, and `feedings` tables with RLS policies and realtime enabled.
3. Go to **Storage** and create a public bucket named `cat-photos` (or the SQL file does it automatically).
4. Copy your **Project URL** and **anon key** from Project Settings → API into `.env`.

## Database Schema

```
profiles    — user id (FK auth.users), role (reporter|feeder), nickname, avatar_url
sightings   — reporter_id, lat, lng, neighborhood, cat_count, notes, photo_url, active
feedings    — sighting_id, feeder_id, note, fed_at
```

Row Level Security is enabled on all tables. Users can only insert/update their own rows; all active sightings and feedings are publicly readable.

## Features

- Interactive map with clustered cat markers
- Real-time sighting updates via Supabase Realtime (Postgres changes)
- Role-based UI — FAB to report a sighting visible only to reporters
- GPS location capture via `expo-location`
- Photo upload to Supabase Storage (`cat-photos` bucket)
- Feeding log per sighting with counter
- Bottom sheet detail card (cat count, neighborhood, notes, feeding count, reporter nickname)
- Fly-to-sightings button to re-center map
- Fully offline-capable demo mode with mock data
