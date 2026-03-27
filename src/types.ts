import { Home, Target, PlusCircle, Calendar } from 'lucide-react';

export type Page = 'homepage' | 'daily' | 'add-food' | 'goal' | 'onboarding' | 'settings';

export type GoalType = 'cut' | 'bulk' | 'maintain' | 'custom';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

export interface UserProfile {
  name: string;
  photoUrl?: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  weightUnit: 'kg' | 'lb';
  height: number;
  heightUnit: 'cm' | 'ft';
  activityLevel: ActivityLevel;
  goal: GoalType;
  language: 'en' | 'fr';
  onboarded: boolean;
  joinedAt?: string;
}

export interface Food {
  id: string;
  name: string;
  englishName: string;
  emoji: string;
  imageUrl?: string;
  calories: number; // kcal per 100g/ml or per unit
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  type: 'solid' | 'liquid' | 'unit';
  weightPerUnit?: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface LoggedFood extends Food {
  logId: string;
  timestamp: number;
  servings: number;
  mealType: MealType;
}

export interface DietPlan {
  name: string;
  description: string;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export const DIET_PLANS: Record<string, DietPlan> = {
  balanced: {
    name: 'Balanced (Maintaining)',
    description: 'Homeostasis: Hormonal and energy balance.',
    proteinPct: 30,
    carbsPct: 40,
    fatPct: 30,
  },
  cutting: {
    name: 'High Protein (Cutting)',
    description: 'Fat Loss: Muscle preservation and satiety.',
    proteinPct: 40,
    carbsPct: 35,
    fatPct: 25,
  },
  bulking: {
    name: 'High Carb (Bulking)',
    description: 'Hypertrophy: Glycogen saturation and insulin response.',
    proteinPct: 25,
    carbsPct: 50,
    fatPct: 25,
  },
};
