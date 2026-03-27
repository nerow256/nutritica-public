# Diet Health Companion - Expo Demo Plan

## 1. Introduction (1-2 min)

**Script:**
> "We are [names]. We built Diet Health Companion — a smart nutrition and health tracking platform that combines food logging, exercise tracking, biomarker monitoring, and AI-powered dietary advice into one unified app."

**Key points to mention:**
- Full-stack web application built over one semester
- Supports 8 languages, dark/light theme, desktop + mobile
- AI integration for food recognition and health advice

---

## 2. Company & Product Overview (1-2 min)

**Problem:** People struggle to track nutrition, exercise, and health data across multiple apps. Healthcare providers have no easy way to access patient lifestyle data.

**Solution:** Diet Health Companion — a single platform that:
- Tracks food intake with calorie/macro breakdown
- Logs exercises with calorie burn calculation
- Monitors health biomarkers from connected devices
- Provides AI-powered dietary advice via local LLM
- Lets patients share health data with doctors via secure access codes

**Target audience:** Health-conscious individuals, patients managing conditions (diabetes, heart disease), and their healthcare providers.

---

## 3. System Architecture (2 min)

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser / Electron)           │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ │
│  │ Dashboard │ │  Diary   │ │ Chatbot   │ │ Devices   │ │
│  │  (React)  │ │  (React) │ │  (React)  │ │  (React)  │ │
│  └──────────┘ └──────────┘ └───────────┘ └───────────┘ │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Shared: ThemeProvider, LanguageProvider, BottomNav│   │
│  └──────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / SSE
┌───────────────────────▼─────────────────────────────────┐
│                 NEXT.JS SERVER (App Router)               │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │ /api/auth  │ │ /api/chat  │ │ /api/food-log        │ │
│  │ /api/user  │ │            │ │ /api/exercise-log     │ │
│  │ /api/settings│            │ │ /api/provider         │ │
│  └─────┬──────┘ └─────┬──────┘ └──────────┬───────────┘ │
└────────┼──────────────┼───────────────────┼─────────────┘
         │              │                   │
    ┌────▼────┐   ┌─────▼─────┐       ┌────▼────┐
    │ SQLite  │   │  Ollama   │       │ SQLite  │
    │ (Prisma)│   │  (Local   │       │ (Prisma)│
    │         │   │   LLM)    │       │         │
    └─────────┘   └───────────┘       └─────────┘
```

**Tech stack to mention:**
| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Next.js 16, TypeScript    |
| Styling    | Tailwind CSS 4, Material Design 3   |
| Backend    | Next.js API Routes                  |
| Database   | SQLite via Prisma ORM               |
| AI         | Ollama (local LLM, e.g. qwen3.5)   |
| Charts     | Recharts                            |
| Desktop    | Electron                            |
| i18n       | Custom system, 8 languages + RTL    |

---

## 4. Demo Flow (10-12 min)

### Pre-demo Setup
- Have a test account already created with ~2 weeks of food/exercise data
- Have Ollama running with a model loaded
- Have a second browser/incognito for the provider portal demo
- Prepare a food photo for AI recognition demo

---

### Demo Step 1: Registration with Role Selection (1 min)
**Who presents:** Person A

1. Open landing page — show the clean Material Design 3 UI
2. Click "Get Started"
3. **Show the Patient / Doctor role selector** — highlight this is new
4. Register as a patient → show onboarding flow (gender, age, goals)
5. *Don't spend long here — move on quickly*

---

### Demo Step 2: Dashboard Overview (1.5 min)
**Who presents:** Person A

1. Show the dashboard with calorie ring, macro bars, BMI
2. Point out the calculated targets (BMR/TDEE based on profile)
3. Show quick action buttons
4. **Toggle dark mode** in settings → show theme change
5. **Switch language** to Arabic → show RTL layout flipping

---

### Demo Step 3: Food Diary (2 min)
**Who presents:** Person B

1. Open diary → show existing logged meals
2. Add a new food entry:
   - Search from food database → show results
   - Select food, set portion, choose meal type
   - Show it appear in the diary with calorie/macro breakdown
3. Show daily summary at bottom
4. Navigate between dates

---

### Demo Step 4: AI Chatbot (2 min)
**Who presents:** Person B

1. Open chatbot
2. Send a text message: *"What should I eat for dinner if I'm trying to lose weight?"*
3. Show streaming response with markdown formatting
4. **Photo recognition:** Upload a food photo → AI identifies it
5. Use a quick prompt button
6. Show model selector dropdown

---

### Demo Step 5: Exercise Logging (1 min)
**Who presents:** Person C

1. Open exercise page
2. Show exercise categories (Cardio, Strength, Flexibility, Sports)
3. Log a quick exercise → show calorie burn calculation
4. Show it reflected in dashboard totals

---

### Demo Step 6: Health Devices & Biomarkers (2 min)
**Who presents:** Person C

1. Open devices page → Biomarkers tab
2. Show **live heart rate** updating in real-time
3. Show step counter with progress bar toward 10K goal
4. Show blood pressure, glucose, SpO2, temperature readings
5. Switch to **Alerts tab** → show warning/critical alerts
6. Switch to **Summary tab** → show health score and checklist
7. Show **gamification badges** (step streaks, etc.)

---

### Demo Step 7: Healthcare Provider Access (2 min)
**Who presents:** Person D (or Person A)

1. On patient's devices page → Provider tab
2. Click "Generate Access Code" → show the XXXX-XXXX code
3. *"The patient shares this code with their doctor"*
4. Open new browser/incognito → go to `/provider`
5. Enter the code → show patient data loads
6. Show Overview tab (health score, BMI, alerts)
7. Show Nutrition tab (food log history)
8. Show Exercise tab
9. Show Biomarkers tab with 30-day data + CSV export
10. *"Codes expire after 24 hours for security"*

---

### Demo Step 8: Progress & Analytics (1 min)
**Who presents:** Person D

1. Open progress page
2. Show weekly/monthly calorie charts
3. Show BMI trend
4. Show macro target tracking

---

## 5. What Works vs. What Doesn't (1 min)

### Works Well
- Full nutrition tracking with macro breakdown
- AI chatbot with streaming + food photo recognition
- 8-language support with RTL
- Dark/light theme
- Healthcare provider secure access
- Biomarker monitoring with alerts
- Desktop app via Electron
- BMR/TDEE/BMI calculations
- Data export/import

### Limitations / Future Work
- Biomarker data is simulated (no real Bluetooth device pairing)
- No real-time push notifications (only in-app alerts)
- Password storage is not hashed (would need bcrypt for production)
- No mobile APK build yet (Capacitor planned)
- Ollama requires local installation (could be replaced with cloud API)

---

## 6. Marketing Strategy (1 min)

**Target Market:** Health-conscious millennials, patients with chronic conditions, fitness enthusiasts

**Value Proposition:** "Your complete health companion — track food, exercise, and vitals in one place, with AI guidance and doctor access built in."

**Distribution Channels:**
- Web app (accessible via any browser)
- Desktop app (Electron .exe for Windows)
- Future: Mobile app stores

**Differentiators:**
- Privacy-first: AI runs locally via Ollama, no cloud data sharing
- Multi-language: 8 languages including Arabic RTL
- Doctor integration: Secure code-based provider access
- All-in-one: Food + Exercise + Devices + AI in one app

---

## 7. Q&A Preparation

**Likely questions and answers:**

**Q: Why SQLite instead of PostgreSQL?**
A: For a local-first app, SQLite is ideal — zero setup, works offline, perfect for Electron desktop packaging. In production we'd migrate to PostgreSQL.

**Q: How does the AI work?**
A: We use Ollama, which runs open-source LLMs locally. The chat API streams responses via Server-Sent Events. Vision models can analyze food photos. All AI processing stays on the user's machine — no data leaves the device.

**Q: How secure is the provider access?**
A: Access codes are 8-character alphanumeric, expire after 24 hours, and are single-use per generation. Patients can regenerate codes to revoke access. Provider view is read-only.

**Q: Why 8 languages?**
A: Health apps need to be accessible. We support English, Spanish, French, German, Arabic (with full RTL), Chinese, Japanese, and Russian — covering major world language groups.

**Q: How do the biomarkers work without real devices?**
A: We built a simulation engine that generates realistic health data using seeded pseudo-random numbers with Gaussian distribution, adjusted for the user's age and weight. This demonstrates the full UI and alert system. Real device integration would use Bluetooth Web API or platform-specific SDKs.

**Q: Can you show the source code for [feature]?**
A: Key files to have ready:
- `src/app/api/chat/route.ts` — AI streaming
- `src/lib/biomarkers.ts` — biomarker simulation
- `src/lib/calculations.ts` — BMR/TDEE/BMI
- `src/app/api/provider/route.ts` — provider access
- `src/lib/i18n.ts` — translation system
- `prisma/schema.prisma` — data model

---

## Timing Summary

| Section                    | Time   | Presenter |
|---------------------------|--------|-----------|
| Introduction              | 1 min  | All       |
| Product Overview          | 1 min  | Person A  |
| Architecture              | 2 min  | Person A  |
| Registration & Dashboard  | 2.5 min| Person A  |
| Food Diary & AI Chatbot   | 4 min  | Person B  |
| Exercise & Devices        | 3 min  | Person C  |
| Provider Access & Progress| 3 min  | Person D  |
| What Works / Limitations  | 1 min  | All       |
| Marketing                 | 1 min  | Person D  |
| Q&A                       | 2+ min | All       |
| **Total**                 | **~20 min** |       |

---

## Pre-Demo Checklist

- [ ] Test account with 2+ weeks of food/exercise data loaded
- [ ] Ollama running with model loaded (`ollama serve` + `ollama pull qwen3.5:4b`)
- [ ] Dev server running (`npm run dev`)
- [ ] Food photo ready for AI demo
- [ ] Second browser window ready for provider portal
- [ ] Dark mode OFF initially (to demo the toggle)
- [ ] Language set to English initially (to demo switching)
- [ ] Practiced the full demo at least twice
- [ ] Each person knows their section
- [ ] Architecture diagram printed or on a slide
