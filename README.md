# Diet Health Companion

A smart nutrition and health tracking platform that combines food logging, exercise tracking, biomarker monitoring, and AI-powered dietary advice into one unified application.

## Features

### Nutrition Tracking
- Food diary with meal categorization (breakfast, lunch, dinner, snacks)
- Built-in food database with nutritional data
- Calorie and macro tracking (protein, carbs, fat)
- Daily/weekly/monthly progress charts
- BMR, TDEE, and BMI calculations based on user profile

### Exercise Logging
- Exercise database categorized by type (Cardio, Strength, Flexibility, Sports)
- Duration tracking with calorie burn estimation
- Daily exercise summary

### AI Chatbot
- Powered by Ollama (local LLM inference)
- Streaming responses with markdown formatting
- Food photo recognition via vision models
- Quick prompt templates for nutrition and fitness advice

### Connected Devices & Biomarkers
- Live heart rate monitoring
- Step tracking with daily goal progress
- Blood pressure, blood glucose, SpO2, body temperature, sleep tracking
- Alert system with warning and critical thresholds
- Daily health score and summary checklist
- Gamification with badges and streaks

### Healthcare Provider Access
- Patients generate time-limited access codes (24h expiry)
- Doctors enter codes on a dedicated portal to view patient data
- Read-only access to nutrition, exercise, and biomarker history
- CSV export of biomarker data
- No login required for providers — code-based access only

### Multi-Language Support
- 8 languages: English, Spanish, French, German, Arabic, Chinese, Japanese, Russian
- Full RTL support for Arabic
- Language switcher in settings

### Themes
- Light and dark mode with Material Design 3 color system
- Persistent theme preference

### User Roles
- **Patient**: Full access to nutrition, exercise, chatbot, devices, and progress
- **Doctor**: Access to provider portal for viewing authorized patient data

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | React 19, Next.js 16, TypeScript 5     |
| Styling     | Tailwind CSS 4, Material Design 3      |
| Backend     | Next.js App Router API Routes          |
| Database    | SQLite via Prisma 6 ORM               |
| AI          | Ollama (local LLM, e.g. qwen3.5:4b)   |
| Charts      | Recharts 3                             |
| Desktop     | Electron 41                            |
| Icons       | Lucide React                           |

## System Architecture

```
┌───────────────────────────────────────────────────┐
│              CLIENT (Browser / Electron)           │
│                                                    │
│   Dashboard  Diary  Chatbot  Devices  Provider     │
│                                                    │
│   ThemeProvider · LanguageProvider · BottomNav      │
└──────────────────────┬─────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼─────────────────────────────┐
│              NEXT.JS SERVER (App Router)            │
│                                                    │
│   /api/auth    /api/chat       /api/food-log       │
│   /api/user    /api/settings   /api/exercise-log   │
│                /api/provider   /api/chat-messages   │
└───────┬────────────┬──────────────┬────────────────┘
        │            │              │
   ┌────▼────┐  ┌────▼─────┐  ┌────▼────┐
   │ SQLite  │  │  Ollama  │  │ SQLite  │
   │(Prisma) │  │ (Local   │  │(Prisma) │
   │         │  │   LLM)   │  │         │
   └─────────┘  └──────────┘  └─────────┘
```

## Data Model

- **User** — profile with health metrics, role (patient/doctor)
- **FoodLog** — daily food entries with calories and macros
- **ExerciseLog** — exercise entries with duration and calories burned
- **ChatMessage** — conversation history with AI assistant
- **UserSettings** — theme and notification preferences
- **ProviderAccess** — time-limited access codes for healthcare providers

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.ai/) (for AI chatbot features)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Start Ollama** (in a separate terminal):
   ```bash
   ollama serve
   ollama pull qwen3.5:4b
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Build for Desktop (Electron)

```bash
npm run build
npx electron-builder --win
```

The installer will be generated in the `dist/` folder.

## Project Structure

```
src/
├── app/
│   ├── api/            # API routes (auth, chat, food-log, etc.)
│   ├── chatbot/        # AI chatbot page
│   ├── dashboard/      # Main dashboard
│   ├── devices/        # Health devices & biomarkers
│   ├── diary/          # Food diary
│   ├── exercise/       # Exercise logging
│   ├── login/          # Login page
│   ├── onboarding/     # Profile setup wizard
│   ├── profile/        # User profile
│   ├── progress/       # Analytics & charts
│   ├── provider/       # Healthcare provider portal
│   ├── register/       # Registration with role selection
│   ├── settings/       # App settings
│   ├── help/           # FAQ
│   └── privacy/        # Data management
├── components/         # Shared UI components
├── lib/
│   ├── biomarkers.ts   # Biomarker simulation engine
│   ├── calculations.ts # BMR, TDEE, BMI calculations
│   ├── db.ts           # Database abstraction layer
│   ├── exercises.ts    # Exercise database
│   ├── foods.ts        # Food database
│   ├── i18n.ts         # Translations (8 languages)
│   └── prisma.ts       # Prisma client
└── generated/prisma/   # Generated Prisma client
```

## Known Limitations

- Biomarker data is simulated (no real Bluetooth device integration)
- Passwords are stored in plain text (would use bcrypt in production)
- Ollama must be installed locally for AI features
- No push notifications (in-app alerts only)
