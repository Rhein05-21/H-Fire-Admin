# GEMINI.md

## Project Overview
**H-Fire Admin** is a real-time fire and gas monitoring system designed for communities. It provides a centralized dashboard for administrators to monitor multiple households and for residents to track their own devices. The system uses IoT sensors (MQ2, flame sensors) to detect hazards and provides instant alerts via push notifications and in-app emergency modals.

### Core Technologies
- **Frontend:** React Native with [Expo](https://expo.dev) (SDK 54), TypeScript, Expo Router (File-based routing).
- **Backend:** [Supabase](https://supabase.com) (Database, Auth, Realtime) and [Clerk](https://clerk.com) for authentication.
- **Messaging:** [HiveMQ](https://www.hivemq.com) (MQTT) for low-latency device data transmission.
- **Monitoring:** [Sentry](https://sentry.io) for error tracking and logging.
- **Hardware Integration:** Arduino/ESP32 (C++) code is present in the root (`HFire_app_mq2_lcd.ino`).

## Architecture & Data Flow
1.  **Devices:** IoT devices publish gas/smoke (PPM) and flame status to HiveMQ topics (`hfire/{house_name}/{mac}`).
2.  **Bridge:** A Node.js bridge (`utils/hivemq-to-supabase-bridge.js`) subscribes to MQTT topics, validates payloads, and logs data to Supabase (`gas_logs`, `incidents`).
3.  **App (Real-time):**
    - Subscribes to MQTT for immediate UI updates.
    - Subscribes to Supabase Realtime (`global-alerts` channel) for community-wide incident notifications.
    - Uses `UserContext` and `AdminContext` to manage state across the application.
4.  **Notifications:** Triggered via Expo Push Notification service when "Danger" status is detected.

## Key Directories & Files
- `/app`: Expo Router routes.
  - `/(admin)`: Dashboard and features exclusive to administrators.
  - `/(tabs)`: Main application tabs (Incidents, Map, Settings).
- `/components`: Reusable UI components.
  - `EmergencyModal.tsx`: Full-screen alert for active incidents.
  - `GasMonitor.tsx`: Real-time status display for individual devices.
- `/context`: State management providers.
  - `UserContext.tsx`: Manages user profile, MQTT connection, and device registry.
  - `AdminContext.tsx`: Handles admin-specific logic and global alerts.
- `/utils`: Client initializations.
  - `supabase.js`: Supabase client config.
  - `hivemq-to-supabase-bridge.js`: The backend bridge logic.
- `/constants`: Single source of truth for app logic.
  - `thresholds.ts`: Defines `Normal` (≤450), `Warning` (≤1500), and `Danger` (>1500) PPM levels.

## Building and Running

### Development Commands
- **Install Dependencies:** `npm install`
- **Start Expo App:** `npx expo start`
- **Run Android/iOS:** `npm run android` or `npm run ios`
- **Run Bridge:** `node utils/hivemq-to-supabase-bridge.js` (Requires `.env` with Supabase/HiveMQ credentials)
- **Lint Code:** `npm run lint`

### Environment Variables
Ensure the following are set in your `.env` file (see `app.config.js` and `utils/` for usage):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_HIVEMQ_BROKER`
- `EXPO_PUBLIC_HIVEMQ_USERNAME`
- `EXPO_PUBLIC_HIVEMQ_PASSWORD`

## Development Conventions
- **Routing:** Use file-based routing in the `app/` directory.
- **Styling:** Follow the theme defined in `constants/theme.ts`.
- **Alerts:** Always use `GAS_THRESHOLDS` from `constants/thresholds.ts` for consistency.
- **Safety:** Do not bypass the `ErrorBoundary` for critical monitoring components.
