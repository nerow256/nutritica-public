export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  goal: 'lose' | 'maintain' | 'gain';
  healthConditions: string[];
  dietaryRestrictions: string[];
  createdAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface FoodLogEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodId: string;
  foodName: string;
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  caloriesPerMinute: number;
  category: string;
}

export interface ExerciseEntry {
  id: string;
  date: string;
  exerciseName: string;
  duration: number;
  caloriesBurned: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
}
