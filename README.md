# Nutritica

Nutritica is a full-stack health and nutrition companion that brings together food logging, exercise tracking, biomarker monitoring, and AI-powered dietary advice in one unified app. It supports both patients and healthcare providers — patients track their daily health data while doctors can access authorized patient records and exchange messages through a secure portal. The AI chatbot runs locally via Ollama or through Google Gemini, and the app ships as both a web app and a native desktop installer via Electron.

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
- Powered by Ollama (local LLM inference) with Google Gemini (gemini-2.0-flash) as an alternative and fallback
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
- In-app messaging between doctors and patients

### Multi-Language Support
- 2 languages: English, Russian
- Language switcher in settings

### Themes
- Light and dark mode with Material Design 3 color system
- Persistent theme preference

### User Roles
- **Patient**: Full access to nutrition, exercise, chatbot, devices, and progress
- **Doctor**: Access to provider portal for viewing authorized patient data

## Tech Stack

| Layer       | Technology                             |
|-------------|----------------------------------------|
| Frontend    | React 19, Next.js 16, TypeScript 5     |
| Styling     | Tailwind CSS 4, Material Design 3      |
| Backend     | Next.js App Router API Routes          |
| Database    | PostgreSQL via Prisma 6 ORM            |
| AI          | Ollama (local LLM) + Google Gemini     |
| Charts      | Recharts 3                             |
| Desktop     | Electron 41                            |
| Icons       | Lucide React                           |

## System Architecture

```
┌────────────────────────────────────────────────────┐
│              CLIENT (Browser / Electron)           │
│                                                    │
│   Dashboard  Diary  Chatbot  Devices  Provider     │
│                                                    │
│   ThemeProvider · LanguageProvider · BottomNav     │
└──────────────────────┬─────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼─────────────────────────────┐
│              NEXT.JS SERVER (App Router)           │
│                                                    │
│   /api/auth    /api/chat       /api/food-log       │
│   /api/user    /api/settings   /api/exercise-log   │
│                /api/provider   /api/chat-messages  │
└───────┬────────────┬──────────────┬────────────────┘
        │            │              │
   ┌────▼────┐  ┌────▼─────┐  ┌────▼────┐
   │Postgres │  │  Ollama  │  │Postgres │
   │(Prisma) │  │  /Gemini │  │(Prisma) │
   │         │  │          │  │         │
   └─────────┘  └──────────┘  └─────────┘
```

## Data Model

- **User** — profile with health metrics, role (patient/doctor)
- **FoodLog** — daily food entries with calories and macros
- **ExerciseLog** — exercise entries with duration and calories burned
- **ChatMessage** — conversation history with AI assistant
- **UserSettings** — theme and notification preferences
- **ProviderAccess** — time-limited access codes for healthcare providers
- **DoctorPatient** — doctor-patient relationship records
- **DoctorMessage** — messages exchanged between doctors and patients

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A PostgreSQL database (e.g. [Railway](https://railway.app), [Render](https://render.com), or local)
- [Ollama](https://ollama.ai/) (optional — for local AI inference)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables** — create a `.env` file in the project root:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/nutritica
   GEMINI_API_KEY=your_gemini_api_key   # optional
   ```

3. **Set up the database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Start Ollama** (in a separate terminal, optional):
   ```bash
   ollama serve
   ollama pull gemma3:4b
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Build for Desktop (Electron)

```bash
npm run build
npx electron-builder --win
```

The installer will be generated in the `dist-electron/` folder.

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
│   ├── messages/       # Doctor-patient messaging
│   ├── privacy/        # Data management
│   └── terms/          # Terms of service
├── components/         # Shared UI components
├── lib/
│   ├── biomarkers.ts   # Biomarker simulation engine
│   ├── calculations.ts # BMR, TDEE, BMI calculations
│   ├── db.ts           # Database abstraction layer
│   ├── exercises.ts    # Exercise database
│   ├── food-translations.ts  # Food name translations
│   ├── foods.ts        # Food database
│   ├── i18n.ts         # Translations (8 languages)
│   ├── prisma.ts       # Prisma client
│   ├── session.ts      # Session management
│   ├── types.ts        # Shared TypeScript types
│   └── utils.ts        # Utility helpers
└── generated/prisma/   # Generated Prisma client
```

## Known Limitations

- Biomarker data is simulated (no real Bluetooth device integration)
- Ollama must be installed locally for AI features
- No push notifications (in-app alerts only)
