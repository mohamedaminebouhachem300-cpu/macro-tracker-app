import { Home, Target, PlusCircle, Calendar } from 'lucide-react';

export type Page = 'homepage' | 'daily' | 'add-food' | 'goal' | 'onboarding' | 'settings';

export type GoalType = 'cut' | 'bulk' | 'maintain' | 'custom';

export interface UserProfile {
  name: string;
  photoUrl?: string;
  weight: number;
  weightUnit: 'kg' | 'lb';
  height: number;
  heightUnit: 'cm' | 'ft';
  goal: GoalType;
  onboarded: boolean;
}

export interface Food {
  id: string;
  name: string;
  englishName: string;
  emoji: string;
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
    name: 'Balanced',
    description: 'A moderate approach for maintenance and overall health.',
    proteinPct: 30,
    carbsPct: 40,
    fatPct: 30,
  },
  cutting: {
    name: 'High Protein (Cutting)',
    description: 'Higher protein to preserve muscle while losing fat.',
    proteinPct: 45,
    carbsPct: 30,
    fatPct: 25,
  },
  bulking: {
    name: 'High Carb (Bulking)',
    description: 'Higher carbs to fuel intense workouts and muscle growth.',
    proteinPct: 25,
    carbsPct: 55,
    fatPct: 20,
  },
};
