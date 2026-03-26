export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return bmr * (activityMultipliers[activityLevel] || 1.2);
}

export function calculateTargetCalories(tdee: number, goal: 'lose' | 'maintain' | 'gain'): number {
  if (goal === 'lose') return Math.round(tdee - 500);
  if (goal === 'gain') return Math.round(tdee + 500);
  return Math.round(tdee);
}

export function calculateBMI(weight: number, heightCm: number): number {
  if (!heightCm || !weight) return 0;
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

export function getBMICategory(bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

export function calculateMacroTargets(targetCalories: number) {
  return {
    protein: Math.round((targetCalories * 0.30) / 4),
    carbs: Math.round((targetCalories * 0.45) / 4),
    fat: Math.round((targetCalories * 0.25) / 9),
  };
}

export function getCalorieInfo(weight: number, height: number, age: number, gender: 'male' | 'female', activityLevel: string, goal: 'lose' | 'maintain' | 'gain') {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const target = calculateTargetCalories(tdee, goal);
  const macros = calculateMacroTargets(target);
  return { bmr, tdee, target, macros };
}
