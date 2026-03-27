export type Locale = 'en' | 'ru';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ru: '🇷🇺',
};

export const rtlLocales: Locale[] = [];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export interface Translations {
  // Navigation
  home: string;
  diary: string;
  aiChat: string;
  progress: string;
  messagesNav: string;
  settings: string;

  // Common
  save: string;
  cancel: string;
  back: string;
  next: string;
  delete: string;
  add: string;
  edit: string;
  loading: string;
  noEntries: string;
  fillAllFields: string;
  somethingWentWrong: string;
  today: string;
  yesterday: string;
  kcal: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  target: string;

  // Landing
  landingTitle: string;
  landingSubtitle: string;
  landingTagline: string;
  getStarted: string;
  smartTracking: string;
  aiInsights: string;
  healthGoals: string;

  // Auth
  welcomeBack: string;
  signInSubtitle: string;
  email: string;
  password: string;
  enterEmail: string;
  enterPassword: string;
  signIn: string;
  signingIn: string;
  forgotPassword: string;
  passwordResetSent: string;
  noAccount: string;
  signUp: string;
  createAccount: string;
  createAccountSubtitle: string;
  enterName: string;
  fullName: string;
  confirmPassword: string;
  confirmYourPassword: string;
  createPassword: string;
  passwordMinLength: string;
  passwordsNoMatch: string;
  agreeTerms: string;
  agreeTermsError: string;
  creating: string;
  hasAccount: string;
  registrationFailed: string;
  invalidCredentials: string;
  incorrectPassword: string;
  passwordWeak: string;
  passwordMedium: string;
  passwordStrong: string;
  iAmA: string;
  patient: string;
  doctor: string;

  // Onboarding
  basicInfo: string;
  basicInfoSubtitle: string;
  yourGoals: string;
  yourGoalsSubtitle: string;
  healthInfo: string;
  healthInfoSubtitle: string;
  personalInfo: string;
  age: string;
  height: string;
  heightCm: string;
  weight: string;
  weightKg: string;
  gender: string;
  male: string;
  female: string;
  activityLevel: string;
  sedentary: string;
  sedentaryDesc: string;
  lightlyActive: string;
  lightlyActiveDesc: string;
  moderatelyActive: string;
  moderatelyActiveDesc: string;
  veryActive: string;
  veryActiveDesc: string;
  extraActive: string;
  extraActiveDesc: string;
  goal: string;
  loseWeight: string;
  maintainWeight: string;
  gainWeight: string;
  healthConditions: string;
  healthConditionsPlaceholder: string;
  dietaryRestrictions: string;
  dietaryRestrictionsPlaceholder: string;
  completeSetup: string;
  diabetes: string;
  heartDisease: string;
  highBloodPressure: string;
  allergies: string;
  none: string;
  vegetarian: string;
  vegan: string;
  glutenFree: string;
  lactoseIntolerant: string;
  halal: string;
  kosher: string;

  // Dashboard
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  eaten: string;
  burned: string;
  remaining: string;
  todaysMeals: string;
  viewAll: string;
  kcalBurned: string;
  exercise: string;
  exerciseToday: string;
  details: string;
  minutes: string;
  noExercises: string;
  noExercisesHint: string;
  logFood: string;
  logExercise: string;
  viewProgress: string;
  viewProgressSubtitle: string;
  bmiCalculator: string;

  // Diary (food logging)
  foodDiary: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  foodName: string;
  amountGrams: string;
  searchFoods: string;
  customEntry: string;
  per100g: string;
  addToDiary: string;
  addTo: string;
  tapToAdd: string;
  dailySummary: string;

  // Exercise
  exerciseLog: string;
  trackActivities: string;
  todaysActivities: string;
  duration: string;
  durationMinutes: string;
  min: string;
  estimatedBurn: string;
  kcalPerMin: string;
  addExercise: string;

  // Progress
  trackJourney: string;
  bmi: string;
  underweight: string;
  normal: string;
  normalWeight: string;
  overweight: string;
  obese: string;
  dailyTarget: string;
  avgDaily: string;
  daysOnTrack: string;
  week: string;
  month: string;
  calorieIntake: string;
  underTarget: string;
  overTarget: string;
  bodyInformation: string;
  dailyMacroTargets: string;

  // Settings
  preferences: string;
  darkMode: string;
  notifications: string;
  language: string;
  selectLanguage: string;
  account: string;
  editProfile: string;
  connectedDevices: string;
  privacySecurity: string;
  helpFaq: string;
  logOut: string;
  deleteAccount: string;
  deleteAccountWarning: string;

  // Profile
  profile: string;
  memberSince: string;
  recently: string;

  // Privacy
  privacyTitle: string;
  privacySubtitle: string;
  dataPrivacy: string;
  dataStoredLocally: string;
  dataStoredLocallyDesc: string;
  noThirdParty: string;
  noThirdPartyDesc: string;
  aiChatPrivacy: string;
  aiChatPrivacyDesc: string;
  accountSecurity: string;
  changePassword: string;
  changePasswordDesc: string;
  dataManagement: string;
  exportData: string;
  exportDataDesc: string;
  dataExported: string;
  clearAllData: string;
  clearAllDataDesc: string;
  clearDataWarning: string;

  // Terms
  termsTitle: string;
  termsSubtitle: string;
  termsAcceptance: string;
  termsAcceptanceDesc: string;
  termsUse: string;
  termsUseDesc: string;
  termsHealth: string;
  termsHealthDesc: string;
  termsAccount: string;
  termsAccountDesc: string;
  termsChanges: string;
  termsChangesDesc: string;
  termsLastUpdated: string;

  // Help
  helpTitle: string;
  helpSubtitle: string;
  faqSection: string;
  faqTrackMeals: string;
  faqTrackMealsAnswer: string;
  faqChangeGoals: string;
  faqChangeGoalsAnswer: string;
  faqAiChat: string;
  faqAiChatAnswer: string;
  faqExercise: string;
  faqExerciseAnswer: string;
  faqLanguage: string;
  faqLanguageAnswer: string;
  faqDataSafe: string;
  faqDataSafeAnswer: string;
  contactSupport: string;
  contactSupportDesc: string;
  appVersion: string;

  // Chat / AI
  aiHealthCompanion: string;
  selectModel: string;
  ollamaOffline: string;
  aiOffline: string;
  howCanIHelp: string;
  askAnything: string;
  typeQuestion: string;
  attachImage: string;
  analyzeImage: string;
  welcomeMessage: string;
  chatCleared: string;
  chatErrorConnect: string;
  chatErrorEmpty: string;
  chatErrorGeneral: string;
  generationStopped: string;
  promptBreakfast: string;
  promptCalories: string;
  promptLowCarb: string;
  promptHeart: string;

  // Devices / Biomarkers
  devicesTitle: string;
  devicesConnected: string;
  devicesTab: string;
  biomarkers: string;
  alertsTab: string;
  dailySummaryReport: string;
  fitnessWatch: string;
  fitnessWatchDesc: string;
  bpMonitor: string;
  bpMonitorDesc: string;
  glucoseMonitor: string;
  glucoseMonitorDesc: string;
  smartScale: string;
  smartScaleDesc: string;
  googleFit: string;
  googleFitDesc: string;
  connected: string;
  disconnected: string;
  lastSynced: string;
  devicesNote: string;
  simulatedConnection: string;
  heartRate: string;
  live: string;
  minLabel: string;
  avgLabel: string;
  maxLabel: string;
  stepsLabel: string;
  goalReached: string;
  bloodPressureLabel: string;
  bpNormalLabel: string;
  bpElevated: string;
  bpHigh: string;
  systolic: string;
  diastolic: string;
  bloodGlucoseLabel: string;
  glucoseNormalLabel: string;
  glucoseOutOfRange: string;
  temperature: string;
  tempNormal: string;
  tempElevated: string;
  sleepLabel: string;
  hours: string;
  achievements: string;
  badge10kSteps: string;
  badgeHealthyHR: string;
  badgeGoodSleep: string;
  badgeActiveWeek: string;
  badgeNormalBP: string;
  dayStreak: string;
  healthScore: string;
  scoreExcellent: string;
  scoreGood: string;
  scoreNeedsAttention: string;
  todaySummary: string;
  stepsGoal: string;
  sleepGoal: string;
  bpGoal: string;
  glucoseGoal: string;
  recommendations: string;
  recSteps: string;
  recSleep: string;
  recBP: string;
  recGreat: string;
  shareResults: string;
  faultSimulationLabel: string;
  faultSimulationDesc: string;
  faultDetected: string;
  noAlerts: string;
  noAlertsDesc: string;
  criticalAlerts: string;
  warningAlerts: string;
  automationRules: string;
  ruleHR: string;
  ruleBP: string;
  ruleGlucose: string;
  ruleO2: string;
  ruleFault: string;
  value: string;
  threshold: string;
  glucoseShort: string;
  biomarkerHistory: string;
  dateLabel: string;
  exportBiomarkerData: string;

  // Alert messages (from biomarkers.ts)
  criticalHeartRateHigh: string;
  criticalHeartRateLow: string;
  warningHeartRateHigh: string;
  criticalBPHigh: string;
  warningBPHigh: string;
  criticalGlucoseHigh: string;
  criticalGlucoseLow: string;
  warningGlucoseHigh: string;
  warningGlucoseLow: string;
  criticalO2Low: string;
  warningO2Low: string;
  criticalTempHigh: string;
  warningTempHigh: string;
  faultStepsImpossible: string;

  // Provider / Healthcare access
  shareWithProvider: string;
  shareWithProviderDesc: string;
  codeExpires24h: string;
  codeCopied: string;
  copyCode: string;
  generateNew: string;
  generateAccessCode: string;
  providerPortal: string;
  providerPortalDesc: string;
  providerPortalInstructions: string;
  accessCode: string;
  accessPatientData: string;
  providerSecurityNote: string;
  providerDashboard: string;
  patientData: string;
  backToApp: string;
  overview: string;
  nutritionTab: string;
  exerciseTab: string;
  recentAlerts: string;
  nutritionHistory: string;
  exerciseHistory: string;
  patientInfo: string;

  // Doctor-patient messaging
  messagesTitle: string;
  messagesSubtitle: string;
  myPatients: string;
  noMessagesYet: string;
  startConversation: string;
  typeMessage: string;
  noConversations: string;
  noConversationsDesc: string;
  noPatientsYet: string;
  noPatientsDesc: string;
  savePatient: string;
  saved: string;
  loginToSavePatients: string;

  // Search
  searchPatients: string;
  searchByNameOrEmail: string;
  noResults: string;

  // Specialty
  specialty: string;
  selectSpecialty: string;
  generalPractitioner: string;
  cardiology: string;
  endocrinology: string;
  nutritionist: string;
  internalMedicine: string;
  sportsMedicine: string;
  psychiatry: string;
  pediatrics: string;
  otherSpecialty: string;
}

const en: Translations = {
  // Navigation
  home: 'Home',
  diary: 'Diary',
  aiChat: 'AI Chat',
  progress: 'Progress',
  messagesNav: 'Messages',
  settings: 'Settings',

  // Common
  save: 'Save',
  cancel: 'Cancel',
  back: 'Back',
  next: 'Next',
  delete: 'Delete',
  add: 'Add',
  edit: 'Edit',
  loading: 'Loading...',
  noEntries: 'No entries yet',
  fillAllFields: 'Please fill in all fields',
  somethingWentWrong: 'Something went wrong',
  today: 'Today',
  yesterday: 'Yesterday',
  kcal: 'kcal',
  calories: 'Calories',
  protein: 'Protein',
  carbs: 'Carbs',
  fat: 'Fat',
  target: 'Target',

  // Landing
  landingTitle: 'Nutritica',
  landingSubtitle: 'Your AI-powered personal health assistant. Track nutrition, monitor activity, and get tailored advice for a healthier life.',
  landingTagline: 'Your health, intelligently managed',
  getStarted: 'Get Started',
  smartTracking: 'Smart Tracking',
  aiInsights: 'AI Insights',
  healthGoals: 'Health Goals',

  // Auth
  welcomeBack: 'Welcome Back',
  signInSubtitle: 'Sign in to continue your health journey',
  email: 'Email',
  password: 'Password',
  enterEmail: 'Enter your email',
  enterPassword: 'Enter your password',
  signIn: 'Sign In',
  signingIn: 'Signing in...',
  forgotPassword: 'Forgot password?',
  passwordResetSent: 'Password reset instructions have been sent to your email',
  noAccount: "Don't have an account?",
  signUp: 'Sign Up',
  createAccount: 'Create Account',
  createAccountSubtitle: 'Start your health journey today',
  enterName: 'Enter your full name',
  fullName: 'Full Name',
  confirmPassword: 'Confirm Password',
  confirmYourPassword: 'Confirm your password',
  createPassword: 'Create a password',
  passwordMinLength: 'Password must be at least 6 characters',
  passwordsNoMatch: 'Passwords do not match',
  agreeTerms: 'I agree to the Terms of Service and Privacy Policy',
  agreeTermsError: 'You must agree to the terms to continue',
  creating: 'Creating...',
  hasAccount: 'Already have an account?',
  registrationFailed: 'Registration failed. Please try again.',
  invalidCredentials: 'Invalid email or password',
  incorrectPassword: 'Incorrect password',
  passwordWeak: 'Weak',
  passwordMedium: 'Medium',
  passwordStrong: 'Strong',
  iAmA: 'I am a',
  patient: 'Patient',
  doctor: 'Doctor',

  // Onboarding
  basicInfo: 'Basic Information',
  basicInfoSubtitle: 'Tell us about yourself so we can personalize your experience',
  yourGoals: 'Your Goals',
  yourGoalsSubtitle: 'What would you like to achieve?',
  healthInfo: 'Health Information',
  healthInfoSubtitle: 'Help us understand your health needs',
  personalInfo: 'Personal Information',
  age: 'Age',
  height: 'Height',
  heightCm: 'Height (cm)',
  weight: 'Weight',
  weightKg: 'Weight (kg)',
  gender: 'Gender',
  male: 'Male',
  female: 'Female',
  activityLevel: 'Activity Level',
  sedentary: 'Sedentary',
  sedentaryDesc: 'Little or no exercise, desk job',
  lightlyActive: 'Lightly Active',
  lightlyActiveDesc: 'Light exercise 1-3 days/week',
  moderatelyActive: 'Moderately Active',
  moderatelyActiveDesc: 'Moderate exercise 3-5 days/week',
  veryActive: 'Very Active',
  veryActiveDesc: 'Hard exercise 6-7 days/week',
  extraActive: 'Extra Active',
  extraActiveDesc: 'Very hard exercise, physical job',
  goal: 'Goal',
  loseWeight: 'Lose Weight',
  maintainWeight: 'Maintain Weight',
  gainWeight: 'Gain Weight',
  healthConditions: 'Health Conditions',
  healthConditionsPlaceholder: 'e.g. Diabetes, High Blood Pressure',
  dietaryRestrictions: 'Dietary Restrictions',
  dietaryRestrictionsPlaceholder: 'e.g. Vegetarian, Gluten-Free',
  completeSetup: 'Complete Setup',
  diabetes: 'Diabetes',
  heartDisease: 'Heart Disease',
  highBloodPressure: 'High Blood Pressure',
  allergies: 'Allergies',
  none: 'None',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  glutenFree: 'Gluten-Free',
  lactoseIntolerant: 'Lactose Intolerant',
  halal: 'Halal',
  kosher: 'Kosher',

  // Dashboard
  goodMorning: 'Good Morning',
  goodAfternoon: 'Good Afternoon',
  goodEvening: 'Good Evening',
  eaten: 'Eaten',
  burned: 'Burned',
  remaining: 'Remaining',
  todaysMeals: "Today's Meals",
  viewAll: 'View All',
  kcalBurned: 'kcal burned',
  exercise: 'Exercise',
  exerciseToday: "Today's Exercise",
  details: 'Details',
  minutes: 'minutes',
  noExercises: 'No exercises logged',
  noExercisesHint: 'Tap the button above to log your first exercise',
  logFood: 'Log Food',
  logExercise: 'Log Exercise',
  viewProgress: 'View Progress',
  viewProgressSubtitle: 'Track your weekly trends and insights',
  bmiCalculator: 'BMI Calculator',

  // Diary (food logging)
  foodDiary: 'Food Diary',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  foodName: 'Food name',
  amountGrams: 'Amount (grams)',
  searchFoods: 'Search foods...',
  customEntry: 'Custom Entry',
  per100g: 'per 100g',
  addToDiary: 'Add to Diary',
  addTo: 'Add to',
  tapToAdd: 'Tap + to add food',
  dailySummary: 'Daily Summary',

  // Exercise
  exerciseLog: 'Exercise Log',
  trackActivities: 'Track your daily activities',
  todaysActivities: "Today's Activities",
  duration: 'Duration',
  durationMinutes: 'Duration (minutes)',
  min: 'min',
  estimatedBurn: 'Estimated Burn',
  kcalPerMin: 'kcal/min',
  addExercise: 'Add Exercise',

  // Progress
  trackJourney: 'Track your health journey',
  bmi: 'BMI',
  underweight: 'Underweight',
  normal: 'Normal',
  normalWeight: 'Normal',
  overweight: 'Overweight',
  obese: 'Obese',
  dailyTarget: 'Daily Target',
  avgDaily: 'Avg Daily',
  daysOnTrack: 'Days on Track',
  week: 'Week',
  month: 'Month',
  calorieIntake: 'Calorie Intake',
  underTarget: 'Under target',
  overTarget: 'Over target',
  bodyInformation: 'Body Information',
  dailyMacroTargets: 'Daily Macro Targets',

  // Settings
  preferences: 'Preferences',
  darkMode: 'Dark Mode',
  notifications: 'Notifications',
  language: 'Language',
  selectLanguage: 'Select Language',
  account: 'Account',
  editProfile: 'Edit Profile',
  connectedDevices: 'Connected Devices',
  privacySecurity: 'Privacy & Security',
  helpFaq: 'Help & FAQ',
  logOut: 'Log Out',
  deleteAccount: 'Delete Account',
  deleteAccountWarning: 'This action is permanent and cannot be undone. Enter your password to confirm.',

  // Profile
  profile: 'Profile',
  memberSince: 'Member since',
  recently: 'recently',

  // Privacy
  privacyTitle: 'Privacy & Security',
  privacySubtitle: 'Your data, your control',
  dataPrivacy: 'Data Privacy',
  dataStoredLocally: 'Data Stored Locally',
  dataStoredLocallyDesc: 'Your health data is stored securely on the server database and is only accessible by you.',
  noThirdParty: 'No Third-Party Sharing',
  noThirdPartyDesc: 'We do not sell or share your personal health data with any third-party companies.',
  aiChatPrivacy: 'AI Chat Privacy',
  aiChatPrivacyDesc: 'AI conversations are processed locally via Ollama. No data is sent to external AI services.',
  accountSecurity: 'Account Security',
  changePassword: 'Change Password',
  changePasswordDesc: 'Update your account password',
  dataManagement: 'Data Management',
  exportData: 'Export Data',
  exportDataDesc: 'Download your health data as a JSON file',
  dataExported: 'Data exported successfully!',
  clearAllData: 'Clear All Data',
  clearAllDataDesc: 'Remove all locally stored data',
  clearDataWarning: 'Are you sure you want to clear all local data? This cannot be undone.',

  // Terms
  termsTitle: 'Terms of Service',
  termsSubtitle: 'Please read before using Nutritica',
  termsAcceptance: 'Acceptance of Terms',
  termsAcceptanceDesc: 'By creating an account or using Nutritica, you agree to these Terms of Service. If you do not agree, please do not use the application.',
  termsUse: 'Permitted Use',
  termsUseDesc: 'Nutritica is a personal health and nutrition tracking tool. You may use it to log meals, track exercise, and monitor health goals for personal, non-commercial purposes. You must not misuse the service or attempt to access it through unauthorized means.',
  termsHealth: 'Health Disclaimer',
  termsHealthDesc: 'Nutritica is not a medical device and does not provide medical advice. AI-generated insights are for informational purposes only and should not replace professional medical consultation. Always consult a qualified healthcare provider before making changes to your diet or exercise routine.',
  termsAccount: 'Your Account',
  termsAccountDesc: 'You are responsible for maintaining the confidentiality of your account credentials. All data entered into your account is your responsibility. You may delete your account and all associated data at any time from the settings page.',
  termsChanges: 'Changes to Terms',
  termsChangesDesc: 'We may update these terms from time to time. Continued use of Nutritica after changes constitutes acceptance of the updated terms. We will notify you of significant changes through the application.',
  termsLastUpdated: 'Last updated',

  // Help
  helpTitle: 'Help & FAQ',
  helpSubtitle: 'Find answers to common questions',
  faqSection: 'Frequently Asked Questions',
  faqTrackMeals: 'How do I track my meals?',
  faqTrackMealsAnswer: 'Go to the Diary tab and tap the + button on any meal section. You can search from our food database or create a custom entry with your own nutritional values.',
  faqChangeGoals: 'How do I change my health goals?',
  faqChangeGoalsAnswer: 'Go to Settings > Edit Profile to update your weight goal, activity level, and other health parameters. Your calorie targets will automatically adjust.',
  faqAiChat: 'How does the AI chat work?',
  faqAiChatAnswer: 'The AI chat uses a local Ollama instance to provide personalized health and nutrition advice. Make sure Ollama is running on your system for the chat to work.',
  faqExercise: 'How do I log exercises?',
  faqExerciseAnswer: 'Navigate to the Exercise page from the dashboard. Choose from our exercise database and enter the duration. Calories burned will be calculated automatically.',
  faqLanguage: 'How do I change the language?',
  faqLanguageAnswer: 'Go to Settings and tap on Language. Select your preferred language from the list. The app will update immediately.',
  faqDataSafe: 'Is my data safe?',
  faqDataSafeAnswer: 'Yes! Your data is stored in a secure database. AI conversations are processed locally through Ollama. We do not share your data with third parties.',
  contactSupport: 'Contact Support',
  contactSupportDesc: 'Get help from our support team',
  appVersion: 'App Version',

  // Chat / AI
  aiHealthCompanion: 'AI Health Companion',
  selectModel: 'Select model...',
  ollamaOffline: 'Ollama offline',
  aiOffline: 'AI offline',
  howCanIHelp: 'How can I help you today?',
  askAnything: 'Ask me anything about nutrition, health, or your diet goals',
  typeQuestion: 'Ask a health question...',
  attachImage: 'Attach image',
  analyzeImage: 'Please analyze this image',
  welcomeMessage: "Hello! I'm your AI health companion. I can help you with nutrition advice, meal planning, exercise tips, and understanding your health data. What would you like to know?",
  chatCleared: "Chat cleared! How can I help you today?",
  chatErrorConnect: 'Failed to connect to AI service.',
  chatErrorEmpty: 'I received an empty response. Please try again.',
  chatErrorGeneral: 'Sorry, something went wrong. Please try again.',
  generationStopped: 'Generation stopped',
  promptBreakfast: 'What should I eat for a healthy breakfast?',
  promptCalories: 'How many calories should I eat daily?',
  promptLowCarb: 'Suggest a low-carb dinner recipe',
  promptHeart: 'Tips for heart-healthy eating',

  // Devices / Biomarkers
  devicesTitle: 'Health Devices',
  devicesConnected: 'devices connected',
  devicesTab: 'Devices',
  biomarkers: 'Biomarkers',
  alertsTab: 'Alerts',
  dailySummaryReport: 'Summary',
  fitnessWatch: 'Fitness Watch',
  fitnessWatchDesc: 'Heart rate, steps, SpO2, sleep',
  bpMonitor: 'Blood Pressure Monitor',
  bpMonitorDesc: 'Systolic & diastolic pressure',
  glucoseMonitor: 'Glucose Monitor',
  glucoseMonitorDesc: 'Blood glucose levels',
  smartScale: 'Smart Scale',
  smartScaleDesc: 'Weight & body temperature',
  googleFit: 'Google Fit',
  googleFitDesc: 'Steps & heart rate sync',
  connected: 'Connected',
  disconnected: 'Disconnected',
  lastSynced: 'Synced',
  devicesNote: 'These are simulated device connections for demonstration purposes. In a production app, these would connect to real health devices via Bluetooth or cloud APIs.',
  simulatedConnection: 'Simulated connections for demo purposes',
  heartRate: 'Heart Rate',
  live: 'Live',
  minLabel: 'Min',
  avgLabel: 'Avg',
  maxLabel: 'Max',
  stepsLabel: 'Steps',
  goalReached: 'Goal reached!',
  bloodPressureLabel: 'Blood Pressure',
  bpNormalLabel: 'Normal',
  bpElevated: 'Elevated',
  bpHigh: 'High',
  systolic: 'Systolic',
  diastolic: 'Diastolic',
  bloodGlucoseLabel: 'Blood Glucose',
  glucoseNormalLabel: 'Normal range',
  glucoseOutOfRange: 'Outside normal range',
  temperature: 'Temperature',
  tempNormal: 'Normal',
  tempElevated: 'Elevated',
  sleepLabel: 'Sleep',
  hours: 'hours',
  achievements: 'Achievements',
  badge10kSteps: '10K Steps',
  badgeHealthyHR: 'Healthy Heart',
  badgeGoodSleep: 'Good Sleep',
  badgeActiveWeek: 'Active Week',
  badgeNormalBP: 'Normal BP',
  dayStreak: 'day step streak!',
  healthScore: 'Health Score',
  scoreExcellent: 'Excellent',
  scoreGood: 'Good',
  scoreNeedsAttention: 'Needs Attention',
  todaySummary: "Today's Summary",
  stepsGoal: 'Steps Goal (10,000)',
  sleepGoal: 'Sleep (6-9 hrs)',
  bpGoal: 'Blood Pressure',
  glucoseGoal: 'Blood Glucose',
  recommendations: 'Recommendations',
  recSteps: 'Try a 30-minute walk to reach your step goal.',
  recSleep: 'Aim for 7-9 hours of sleep. Consider adjusting your bedtime routine.',
  recBP: 'Your blood pressure is elevated. Consider reducing sodium intake and consulting your healthcare provider.',
  recGreat: 'Great job! Keep up the healthy habits.',
  shareResults: 'Share Results',
  faultSimulationLabel: 'Fault Simulation',
  faultSimulationDesc: 'Simulate device malfunctions (e.g. impossible step counts)',
  faultDetected: 'Fault detected: impossible step count. Device may be malfunctioning.',
  noAlerts: 'All Clear!',
  noAlertsDesc: 'All biomarkers are within normal ranges.',
  criticalAlerts: 'Critical',
  warningAlerts: 'Warnings',
  automationRules: 'Automation Rules',
  ruleHR: 'Alert when heart rate exceeds 120 bpm or drops below 40 bpm',
  ruleBP: 'Alert when blood pressure exceeds 140/90 mmHg',
  ruleGlucose: 'Alert when blood glucose is outside 70-180 mg/dL',
  ruleO2: 'Alert when oxygen saturation drops below 94%',
  ruleFault: 'Detect device faults (e.g. impossible readings)',
  value: 'Value',
  threshold: 'Threshold',
  glucoseShort: 'Glucose',
  biomarkerHistory: '30-Day Biomarker History',
  dateLabel: 'Date',
  exportBiomarkerData: 'Export Biomarker Report (CSV)',

  // Alert messages
  criticalHeartRateHigh: 'Critical: Heart rate is dangerously high',
  criticalHeartRateLow: 'Critical: Heart rate is dangerously low',
  warningHeartRateHigh: 'Warning: Heart rate is elevated',
  criticalBPHigh: 'Critical: Blood pressure is dangerously high',
  warningBPHigh: 'Warning: Blood pressure is elevated',
  criticalGlucoseHigh: 'Critical: Blood glucose is dangerously high',
  criticalGlucoseLow: 'Critical: Blood glucose is dangerously low',
  warningGlucoseHigh: 'Warning: Blood glucose is elevated',
  warningGlucoseLow: 'Warning: Blood glucose is low',
  criticalO2Low: 'Critical: Oxygen saturation is dangerously low',
  warningO2Low: 'Warning: Oxygen saturation is below normal',
  criticalTempHigh: 'Critical: Body temperature is dangerously high',
  warningTempHigh: 'Warning: Body temperature is elevated',
  faultStepsImpossible: 'Device fault: Impossible step count detected',

  // Provider / Healthcare access
  shareWithProvider: 'Share with Doctor',
  shareWithProviderDesc: 'Generate a code so your doctor can access your data and message you',
  codeExpires24h: 'Expires in 24 hours',
  codeCopied: 'Copied!',
  copyCode: 'Copy',
  generateNew: 'New Code',
  generateAccessCode: 'Generate Access Code',
  providerPortal: 'Healthcare Provider Portal',
  providerPortalDesc: 'Manage your patients and view health data',
  providerPortalInstructions: "Enter the patient's access code to view their health data",
  accessCode: 'Enter Access Code',
  accessPatientData: 'Access Patient Data',
  providerSecurityNote: 'Access codes are generated by patients and expire after 24 hours.',
  providerDashboard: 'Provider Dashboard',
  patientData: 'Patient Data View',
  backToApp: 'Back to App',
  overview: 'Overview',
  nutritionTab: 'Nutrition',
  exerciseTab: 'Exercise',
  recentAlerts: 'Recent Alerts',
  nutritionHistory: 'Nutrition History',
  exerciseHistory: 'Exercise History',
  patientInfo: 'Patient Information',

  // Doctor-patient messaging
  messagesTitle: 'Messages',
  messagesSubtitle: 'Chat with your healthcare providers',
  myPatients: 'My Patients',
  noMessagesYet: 'No messages yet',
  startConversation: 'Send a message to start the conversation',
  typeMessage: 'Type a message...',
  noConversations: 'No messages yet',
  noConversationsDesc: 'When your healthcare provider sends you a message, it will appear here',
  noPatientsYet: 'No patients saved yet',
  noPatientsDesc: 'Use an access code to view a patient, then save them to your list',
  savePatient: 'Save',
  saved: 'Saved',
  loginToSavePatients: 'Log in as a doctor to save patients and chat with them',

  // Search
  searchPatients: 'Find Patient',
  searchByNameOrEmail: 'Search by name or email...',
  noResults: 'No patients found',

  // Specialty
  specialty: 'Specialty',
  selectSpecialty: 'Select your specialty...',
  generalPractitioner: 'General Practitioner',
  cardiology: 'Cardiology',
  endocrinology: 'Endocrinology',
  nutritionist: 'Nutrition / Dietetics',
  internalMedicine: 'Internal Medicine',
  sportsMedicine: 'Sports Medicine',
  psychiatry: 'Psychiatry',
  pediatrics: 'Pediatrics',
  otherSpecialty: 'Other',
};

const ru: Translations = {
  // Navigation
  home: 'Главная',
  diary: 'Дневник',
  aiChat: 'ИИ Чат',
  progress: 'Прогресс',
  messagesNav: 'Сообщения',
  settings: 'Настройки',

  // Common
  save: 'Сохранить',
  cancel: 'Отмена',
  back: 'Назад',
  next: 'Далее',
  delete: 'Удалить',
  add: 'Добавить',
  edit: 'Редактировать',
  loading: 'Загрузка...',
  noEntries: 'Записей пока нет',
  fillAllFields: 'Пожалуйста, заполните все поля',
  somethingWentWrong: 'Что-то пошло не так',
  today: 'Сегодня',
  yesterday: 'Вчера',
  kcal: 'ккал',
  calories: 'Калории',
  protein: 'Белки',
  carbs: 'Углеводы',
  fat: 'Жиры',
  target: 'Цель',

  // Landing
  landingTitle: 'Nutritica',
  landingSubtitle: 'Ваш персональный помощник по здоровью на базе ИИ. Отслеживайте питание, контролируйте активность и получайте индивидуальные рекомендации.',
  landingTagline: 'Ваше здоровье под умным контролем',
  getStarted: 'Начать',
  smartTracking: 'Умный трекинг',
  aiInsights: 'ИИ-аналитика',
  healthGoals: 'Цели здоровья',

  // Auth
  welcomeBack: 'С возвращением',
  signInSubtitle: 'Войдите, чтобы продолжить путь к здоровью',
  email: 'Эл. почта',
  password: 'Пароль',
  enterEmail: 'Введите вашу эл. почту',
  enterPassword: 'Введите ваш пароль',
  signIn: 'Войти',
  signingIn: 'Вход...',
  forgotPassword: 'Забыли пароль?',
  passwordResetSent: 'Инструкции по сбросу пароля отправлены на вашу почту',
  noAccount: 'Нет аккаунта?',
  signUp: 'Зарегистрироваться',
  createAccount: 'Создать аккаунт',
  createAccountSubtitle: 'Начните свой путь к здоровью сегодня',
  enterName: 'Введите ваше полное имя',
  fullName: 'Полное имя',
  confirmPassword: 'Подтвердите пароль',
  confirmYourPassword: 'Подтвердите ваш пароль',
  createPassword: 'Создайте пароль',
  passwordMinLength: 'Пароль должен содержать минимум 6 символов',
  passwordsNoMatch: 'Пароли не совпадают',
  agreeTerms: 'Я принимаю Условия использования и Политику конфиденциальности',
  agreeTermsError: 'Необходимо принять условия для продолжения',
  creating: 'Создание...',
  hasAccount: 'Уже есть аккаунт?',
  registrationFailed: 'Ошибка регистрации. Попробуйте снова.',
  invalidCredentials: 'Неверная почта или пароль',
  incorrectPassword: 'Неверный пароль',
  passwordWeak: 'Слабый',
  passwordMedium: 'Средний',
  passwordStrong: 'Сильный',
  iAmA: 'Я являюсь',
  patient: 'Пациент',
  doctor: 'Врач',

  // Onboarding
  basicInfo: 'Основная информация',
  basicInfoSubtitle: 'Расскажите о себе, чтобы мы могли персонализировать ваш опыт',
  yourGoals: 'Ваши цели',
  yourGoalsSubtitle: 'Чего вы хотите достичь?',
  healthInfo: 'Информация о здоровье',
  healthInfoSubtitle: 'Помогите нам понять ваши потребности в здоровье',
  personalInfo: 'Личная информация',
  age: 'Возраст',
  height: 'Рост',
  heightCm: 'Рост (см)',
  weight: 'Вес',
  weightKg: 'Вес (кг)',
  gender: 'Пол',
  male: 'Мужской',
  female: 'Женский',
  activityLevel: 'Уровень активности',
  sedentary: 'Малоподвижный',
  sedentaryDesc: 'Мало или нет физической нагрузки, сидячая работа',
  lightlyActive: 'Слегка активный',
  lightlyActiveDesc: 'Лёгкие упражнения 1-3 дня в неделю',
  moderatelyActive: 'Умеренно активный',
  moderatelyActiveDesc: 'Умеренные упражнения 3-5 дней в неделю',
  veryActive: 'Очень активный',
  veryActiveDesc: 'Интенсивные упражнения 6-7 дней в неделю',
  extraActive: 'Сверхактивный',
  extraActiveDesc: 'Очень интенсивные нагрузки, физическая работа',
  goal: 'Цель',
  loseWeight: 'Похудеть',
  maintainWeight: 'Поддержать вес',
  gainWeight: 'Набрать вес',
  healthConditions: 'Состояние здоровья',
  healthConditionsPlaceholder: 'напр. Диабет, Высокое давление',
  dietaryRestrictions: 'Диетические ограничения',
  dietaryRestrictionsPlaceholder: 'напр. Вегетарианство, Безглютеновая диета',
  completeSetup: 'Завершить настройку',
  diabetes: 'Диабет',
  heartDisease: 'Болезни сердца',
  highBloodPressure: 'Высокое давление',
  allergies: 'Аллергии',
  none: 'Нет',
  vegetarian: 'Вегетарианство',
  vegan: 'Веганство',
  glutenFree: 'Без глютена',
  lactoseIntolerant: 'Непереносимость лактозы',
  halal: 'Халяль',
  kosher: 'Кошер',

  // Dashboard
  goodMorning: 'Доброе утро',
  goodAfternoon: 'Добрый день',
  goodEvening: 'Добрый вечер',
  eaten: 'Съедено',
  burned: 'Сожжено',
  remaining: 'Осталось',
  todaysMeals: 'Приёмы пищи сегодня',
  viewAll: 'Смотреть все',
  kcalBurned: 'ккал сожжено',
  exercise: 'Упражнения',
  exerciseToday: 'Упражнения сегодня',
  details: 'Подробнее',
  minutes: 'минут',
  noExercises: 'Упражнений пока нет',
  noExercisesHint: 'Нажмите кнопку выше, чтобы добавить первое упражнение',
  logFood: 'Записать еду',
  logExercise: 'Записать упражнение',
  viewProgress: 'Посмотреть прогресс',
  viewProgressSubtitle: 'Отслеживайте недельные тенденции и аналитику',
  bmiCalculator: 'Калькулятор ИМТ',

  // Diary (food logging)
  foodDiary: 'Дневник питания',
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
  foodName: 'Название блюда',
  amountGrams: 'Количество (граммы)',
  searchFoods: 'Поиск продуктов...',
  customEntry: 'Своя запись',
  per100g: 'на 100г',
  addToDiary: 'Добавить в дневник',
  addTo: 'Добавить в',
  tapToAdd: 'Нажмите +, чтобы добавить еду',
  dailySummary: 'Итог за день',

  // Exercise
  exerciseLog: 'Журнал упражнений',
  trackActivities: 'Отслеживайте свою активность',
  todaysActivities: 'Активность сегодня',
  duration: 'Длительность',
  durationMinutes: 'Длительность (минуты)',
  min: 'мин',
  estimatedBurn: 'Расчётный расход',
  kcalPerMin: 'ккал/мин',
  addExercise: 'Добавить упражнение',

  // Progress
  trackJourney: 'Отслеживайте свой путь к здоровью',
  bmi: 'ИМТ',
  underweight: 'Недостаточный вес',
  normal: 'Нормальный',
  normalWeight: 'Нормальный',
  overweight: 'Избыточный вес',
  obese: 'Ожирение',
  dailyTarget: 'Дневная норма',
  avgDaily: 'Средн. в день',
  daysOnTrack: 'Дней в норме',
  week: 'Неделя',
  month: 'Месяц',
  calorieIntake: 'Потребление калорий',
  underTarget: 'Ниже нормы',
  overTarget: 'Выше нормы',
  bodyInformation: 'Информация о теле',
  dailyMacroTargets: 'Дневные нормы макронутриентов',

  // Settings
  preferences: 'Предпочтения',
  darkMode: 'Тёмная тема',
  notifications: 'Уведомления',
  language: 'Язык',
  selectLanguage: 'Выберите язык',
  account: 'Аккаунт',
  editProfile: 'Редактировать профиль',
  connectedDevices: 'Подключённые устройства',
  privacySecurity: 'Конфиденциальность и безопасность',
  helpFaq: 'Помощь и FAQ',
  logOut: 'Выйти',
  deleteAccount: 'Удалить аккаунт',
  deleteAccountWarning: 'Это действие необратимо. Введите пароль для подтверждения.',

  // Profile
  profile: 'Профиль',
  memberSince: 'Участник с',
  recently: 'недавно',

  // Privacy
  privacyTitle: 'Конфиденциальность и безопасность',
  privacySubtitle: 'Ваши данные под вашим контролем',
  dataPrivacy: 'Конфиденциальность данных',
  dataStoredLocally: 'Данные хранятся локально',
  dataStoredLocallyDesc: 'Ваши данные о здоровье надёжно хранятся на сервере и доступны только вам.',
  noThirdParty: 'Без передачи третьим лицам',
  noThirdPartyDesc: 'Мы не продаём и не передаём ваши персональные данные о здоровье сторонним компаниям.',
  aiChatPrivacy: 'Конфиденциальность ИИ-чата',
  aiChatPrivacyDesc: 'ИИ-разговоры обрабатываются локально через Ollama. Данные не отправляются во внешние ИИ-сервисы.',
  accountSecurity: 'Безопасность аккаунта',
  changePassword: 'Изменить пароль',
  changePasswordDesc: 'Обновите пароль вашего аккаунта',
  dataManagement: 'Управление данными',
  exportData: 'Экспорт данных',
  exportDataDesc: 'Скачайте ваши данные о здоровье в формате JSON',
  dataExported: 'Данные успешно экспортированы!',
  clearAllData: 'Очистить все данные',
  clearAllDataDesc: 'Удалить все локально сохранённые данные',
  clearDataWarning: 'Вы уверены, что хотите очистить все локальные данные? Это действие нельзя отменить.',

  // Terms
  termsTitle: 'Условия использования',
  termsSubtitle: 'Пожалуйста, ознакомьтесь перед использованием Nutritica',
  termsAcceptance: 'Принятие условий',
  termsAcceptanceDesc: 'Создавая учётную запись или используя Nutritica, вы соглашаетесь с настоящими Условиями использования. Если вы не согласны, пожалуйста, не используйте приложение.',
  termsUse: 'Допустимое использование',
  termsUseDesc: 'Nutritica — это инструмент для отслеживания здоровья и питания. Вы можете использовать его для записи приёмов пищи, отслеживания упражнений и мониторинга целей здоровья в личных, некоммерческих целях. Запрещается злоупотреблять сервисом или пытаться получить к нему доступ несанкционированными способами.',
  termsHealth: 'Отказ от медицинской ответственности',
  termsHealthDesc: 'Nutritica не является медицинским устройством и не предоставляет медицинских рекомендаций. ИИ-рекомендации носят исключительно информационный характер и не заменяют консультацию врача. Всегда консультируйтесь с квалифицированным медицинским специалистом перед изменением диеты или режима тренировок.',
  termsAccount: 'Ваша учётная запись',
  termsAccountDesc: 'Вы несёте ответственность за сохранность данных вашей учётной записи. Все данные, введённые в вашу учётную запись, являются вашей ответственностью. Вы можете удалить свою учётную запись и все связанные данные в любое время на странице настроек.',
  termsChanges: 'Изменение условий',
  termsChangesDesc: 'Мы можем время от времени обновлять эти условия. Продолжение использования Nutritica после изменений означает принятие обновлённых условий. Мы уведомим вас о существенных изменениях через приложение.',
  termsLastUpdated: 'Последнее обновление',

  // Help
  helpTitle: 'Помощь и FAQ',
  helpSubtitle: 'Ответы на частые вопросы',
  faqSection: 'Часто задаваемые вопросы',
  faqTrackMeals: 'Как отслеживать приёмы пищи?',
  faqTrackMealsAnswer: 'Перейдите на вкладку «Дневник» и нажмите кнопку + в разделе нужного приёма пищи. Вы можете искать в базе продуктов или создать свою запись с указанием пищевой ценности.',
  faqChangeGoals: 'Как изменить цели по здоровью?',
  faqChangeGoalsAnswer: 'Перейдите в Настройки > Редактировать профиль, чтобы обновить цель по весу, уровень активности и другие параметры здоровья. Нормы калорий будут пересчитаны автоматически.',
  faqAiChat: 'Как работает ИИ-чат?',
  faqAiChatAnswer: 'ИИ-чат использует локальный экземпляр Ollama для предоставления персонализированных советов по здоровью и питанию. Убедитесь, что Ollama запущена на вашем компьютере.',
  faqExercise: 'Как записывать упражнения?',
  faqExerciseAnswer: 'Перейдите на страницу «Упражнения» с главной. Выберите из базы упражнений и укажите продолжительность. Расход калорий будет рассчитан автоматически.',
  faqLanguage: 'Как изменить язык?',
  faqLanguageAnswer: 'Перейдите в Настройки и нажмите «Язык». Выберите нужный язык из списка. Приложение обновится мгновенно.',
  faqDataSafe: 'Безопасны ли мои данные?',
  faqDataSafeAnswer: 'Да! Ваши данные хранятся в защищённой базе данных. ИИ-разговоры обрабатываются локально через Ollama. Мы не передаём ваши данные третьим лицам.',
  contactSupport: 'Связаться с поддержкой',
  contactSupportDesc: 'Получите помощь от нашей команды поддержки',
  appVersion: 'Версия приложения',

  // Chat / AI
  aiHealthCompanion: 'ИИ-помощник по здоровью',
  selectModel: 'Выберите модель...',
  ollamaOffline: 'Ollama не подключена',
  aiOffline: 'ИИ не доступен',
  howCanIHelp: 'Чем я могу вам помочь?',
  askAnything: 'Спрашивайте о питании, здоровье или ваших целях',
  typeQuestion: 'Задайте вопрос о здоровье...',
  attachImage: 'Прикрепить изображение',
  analyzeImage: 'Пожалуйста, проанализируйте это изображение',
  welcomeMessage: 'Здравствуйте! Я ваш ИИ-помощник по здоровью. Я могу помочь с советами по питанию, планированием рациона, рекомендациями по упражнениям и анализом ваших данных о здоровье. Что бы вы хотели узнать?',
  chatCleared: 'Чат очищен! Чем я могу вам помочь?',
  chatErrorConnect: 'Не удалось подключиться к ИИ-сервису.',
  chatErrorEmpty: 'Получен пустой ответ. Попробуйте ещё раз.',
  chatErrorGeneral: 'Извините, произошла ошибка. Попробуйте ещё раз.',
  generationStopped: 'Генерация остановлена',
  promptBreakfast: 'Что съесть на полезный завтрак?',
  promptCalories: 'Сколько калорий мне нужно в день?',
  promptLowCarb: 'Предложите рецепт низкоуглеводного ужина',
  promptHeart: 'Советы по питанию для здоровья сердца',

  // Devices / Biomarkers
  devicesTitle: 'Устройства здоровья',
  devicesConnected: 'устройств подключено',
  devicesTab: 'Устройства',
  biomarkers: 'Биомаркеры',
  alertsTab: 'Оповещения',
  dailySummaryReport: 'Итоги',
  fitnessWatch: 'Фитнес-часы',
  fitnessWatchDesc: 'Пульс, шаги, SpO2, сон',
  bpMonitor: 'Тонометр',
  bpMonitorDesc: 'Систолическое и диастолическое давление',
  glucoseMonitor: 'Глюкометр',
  glucoseMonitorDesc: 'Уровень глюкозы в крови',
  smartScale: 'Умные весы',
  smartScaleDesc: 'Вес и температура тела',
  googleFit: 'Google Fit',
  googleFitDesc: 'Синхронизация шагов и пульса',
  connected: 'Подключено',
  disconnected: 'Отключено',
  lastSynced: 'Синхр.',
  devicesNote: 'Это имитация подключения устройств в демонстрационных целях. В рабочем приложении подключение происходит через Bluetooth или облачные API.',
  simulatedConnection: 'Имитация подключения в демонстрационных целях',
  heartRate: 'Пульс',
  live: 'В реальном времени',
  minLabel: 'Мин',
  avgLabel: 'Средн',
  maxLabel: 'Макс',
  stepsLabel: 'Шаги',
  goalReached: 'Цель достигнута!',
  bloodPressureLabel: 'Артериальное давление',
  bpNormalLabel: 'Нормальное',
  bpElevated: 'Повышенное',
  bpHigh: 'Высокое',
  systolic: 'Систолическое',
  diastolic: 'Диастолическое',
  bloodGlucoseLabel: 'Глюкоза крови',
  glucoseNormalLabel: 'В пределах нормы',
  glucoseOutOfRange: 'Вне нормального диапазона',
  temperature: 'Температура',
  tempNormal: 'Нормальная',
  tempElevated: 'Повышенная',
  sleepLabel: 'Сон',
  hours: 'часов',
  achievements: 'Достижения',
  badge10kSteps: '10 000 шагов',
  badgeHealthyHR: 'Здоровое сердце',
  badgeGoodSleep: 'Хороший сон',
  badgeActiveWeek: 'Активная неделя',
  badgeNormalBP: 'Нормальное АД',
  dayStreak: 'дней подряд по шагам!',
  healthScore: 'Показатель здоровья',
  scoreExcellent: 'Отлично',
  scoreGood: 'Хорошо',
  scoreNeedsAttention: 'Требует внимания',
  todaySummary: 'Итоги дня',
  stepsGoal: 'Цель по шагам (10 000)',
  sleepGoal: 'Сон (6-9 часов)',
  bpGoal: 'Артериальное давление',
  glucoseGoal: 'Глюкоза крови',
  recommendations: 'Рекомендации',
  recSteps: 'Попробуйте 30-минутную прогулку для достижения цели по шагам.',
  recSleep: 'Старайтесь спать 7-9 часов. Попробуйте скорректировать режим сна.',
  recBP: 'Ваше давление повышено. Уменьшите потребление натрия и проконсультируйтесь с врачом.',
  recGreat: 'Отличная работа! Продолжайте в том же духе.',
  shareResults: 'Поделиться результатами',
  faultSimulationLabel: 'Имитация неисправностей',
  faultSimulationDesc: 'Имитация неисправностей устройств (напр. невозможное количество шагов)',
  faultDetected: 'Обнаружена неисправность: невозможное количество шагов. Устройство может работать некорректно.',
  noAlerts: 'Всё в порядке!',
  noAlertsDesc: 'Все биомаркеры в пределах нормы.',
  criticalAlerts: 'Критические',
  warningAlerts: 'Предупреждения',
  automationRules: 'Правила автоматизации',
  ruleHR: 'Оповещение при пульсе выше 120 уд/мин или ниже 40 уд/мин',
  ruleBP: 'Оповещение при давлении выше 140/90 мм рт. ст.',
  ruleGlucose: 'Оповещение при глюкозе вне диапазона 70-180 мг/дл',
  ruleO2: 'Оповещение при насыщении кислородом ниже 94%',
  ruleFault: 'Обнаружение неисправностей устройств (напр. невозможные показания)',
  value: 'Значение',
  threshold: 'Порог',
  glucoseShort: 'Глюкоза',
  biomarkerHistory: 'История биомаркеров за 30 дней',
  dateLabel: 'Дата',
  exportBiomarkerData: 'Экспорт отчёта по биомаркерам (CSV)',

  // Alert messages
  criticalHeartRateHigh: 'Критическое: Пульс опасно высокий',
  criticalHeartRateLow: 'Критическое: Пульс опасно низкий',
  warningHeartRateHigh: 'Предупреждение: Пульс повышен',
  criticalBPHigh: 'Критическое: Давление опасно высокое',
  warningBPHigh: 'Предупреждение: Давление повышено',
  criticalGlucoseHigh: 'Критическое: Глюкоза крови опасно высокая',
  criticalGlucoseLow: 'Критическое: Глюкоза крови опасно низкая',
  warningGlucoseHigh: 'Предупреждение: Глюкоза крови повышена',
  warningGlucoseLow: 'Предупреждение: Глюкоза крови понижена',
  criticalO2Low: 'Критическое: Насыщение кислородом опасно низкое',
  warningO2Low: 'Предупреждение: Насыщение кислородом ниже нормы',
  criticalTempHigh: 'Критическое: Температура тела опасно высокая',
  warningTempHigh: 'Предупреждение: Температура тела повышена',
  faultStepsImpossible: 'Неисправность устройства: обнаружено невозможное количество шагов',

  // Provider / Healthcare access
  shareWithProvider: 'Поделиться с врачом',
  shareWithProviderDesc: 'Сгенерируйте код, чтобы врач мог получить доступ к вашим данным и писать вам',
  codeExpires24h: 'Действителен 24 часа',
  codeCopied: 'Скопировано!',
  copyCode: 'Копировать',
  generateNew: 'Новый код',
  generateAccessCode: 'Сгенерировать код доступа',
  providerPortal: 'Портал медицинского работника',
  providerPortalDesc: 'Управляйте пациентами и просматривайте данные о здоровье',
  providerPortalInstructions: 'Введите код доступа пациента для просмотра его данных о здоровье',
  accessCode: 'Введите код доступа',
  accessPatientData: 'Доступ к данным пациента',
  providerSecurityNote: 'Коды доступа генерируются пациентами и действуют 24 часа.',
  providerDashboard: 'Панель врача',
  patientData: 'Данные пациента',
  backToApp: 'Вернуться в приложение',
  overview: 'Обзор',
  nutritionTab: 'Питание',
  exerciseTab: 'Упражнения',
  recentAlerts: 'Последние оповещения',
  nutritionHistory: 'История питания',
  exerciseHistory: 'История упражнений',
  patientInfo: 'Информация о пациенте',

  // Doctor-patient messaging
  messagesTitle: 'Сообщения',
  messagesSubtitle: 'Общайтесь с вашими медицинскими работниками',
  myPatients: 'Мои пациенты',
  noMessagesYet: 'Сообщений пока нет',
  startConversation: 'Отправьте сообщение, чтобы начать разговор',
  typeMessage: 'Введите сообщение...',
  noConversations: 'Сообщений пока нет',
  noConversationsDesc: 'Когда ваш врач отправит вам сообщение, оно появится здесь',
  noPatientsYet: 'Пациентов пока нет',
  noPatientsDesc: 'Используйте код доступа для просмотра данных пациента, затем сохраните его в список',
  savePatient: 'Сохранить',
  saved: 'Сохранено',
  loginToSavePatients: 'Войдите как врач, чтобы сохранять пациентов и общаться с ними',

  // Search
  searchPatients: 'Найти пациента',
  searchByNameOrEmail: 'Поиск по имени или email...',
  noResults: 'Пациенты не найдены',

  // Specialty
  specialty: 'Специализация',
  selectSpecialty: 'Выберите специализацию...',
  generalPractitioner: 'Терапевт',
  cardiology: 'Кардиология',
  endocrinology: 'Эндокринология',
  nutritionist: 'Диетология',
  internalMedicine: 'Внутренние болезни',
  sportsMedicine: 'Спортивная медицина',
  psychiatry: 'Психиатрия',
  pediatrics: 'Педиатрия',
  otherSpecialty: 'Другое',
};

export const translations: Record<Locale, Translations> = { en, ru };

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || en;
}
