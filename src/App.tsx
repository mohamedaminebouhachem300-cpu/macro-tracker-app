import React, { useState, useEffect, useMemo } from 'react';
import { Home, Target, PlusCircle, Calendar, ChevronRight, Search, Trash2, Plus, Minus, Settings, User, ArrowRight, Check, Camera, Moon, Sun, Beef, Wheat, Flame, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, Food, LoggedFood, DIET_PLANS, DietPlan, MealType, UserProfile, GoalType } from './types';
import { FOOD_DATABASE } from './foodDatabase';
import { translations } from './translations';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('homepage');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    photoUrl: '',
    age: 0,
    gender: 'male',
    weight: 0,
    weightUnit: 'kg',
    height: 0,
    heightUnit: 'cm',
    activityLevel: '' as any,
    goal: '' as any,
    language: 'en',
    onboarded: false,
    joinedAt: new Date().toLocaleDateString()
  });
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinPct, setProteinPct] = useState(30);
  const [carbsPct, setCarbsPct] = useState(40);
  const [fatPct, setFatPct] = useState(30);
  const [dailyLogs, setDailyLogs] = useState<LoggedFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servingsInput, setServingsInput] = useState<number>(1);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [quickProtein, setQuickProtein] = useState<string>('');
  const [quickCarbs, setQuickCarbs] = useState<string>('');
  const [quickFat, setQuickFat] = useState<string>('');
  const [customMealName, setCustomMealName] = useState<string>('');
  const [customProtein, setCustomProtein] = useState<string>('');
  const [customCarbs, setCustomCarbs] = useState<string>('');
  const [customFat, setCustomFat] = useState<string>('');
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<{ food: Food; amount: number }[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem('macro_goal');
    const savedLogs = localStorage.getItem('macro_logs');
    const savedProfile = localStorage.getItem('macro_profile');
    const savedTheme = localStorage.getItem('macro_theme');
    const savedCustomFoods = localStorage.getItem('macro_custom_foods');
    const lastActiveDate = localStorage.getItem('macro_last_active_date');
    const today = new Date().toLocaleDateString();
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    if (savedCustomFoods) {
      setCustomFoods(JSON.parse(savedCustomFoods));
    }
    
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      // Ensure joinedAt exists for existing users
      if (!profile.joinedAt) {
        profile.joinedAt = new Date().toLocaleDateString();
        localStorage.setItem('macro_profile', JSON.stringify(profile));
      }
      setUserProfile(profile);
      if (!profile.onboarded) {
        setCurrentPage('onboarding');
      }
    } else {
      setCurrentPage('onboarding');
    }

    if (savedGoal) {
      const { calories, p, c, f } = JSON.parse(savedGoal);
      setCalorieGoal(calories);
      setProteinPct(p);
      setCarbsPct(c);
      setFatPct(f);
    }

    // Daily Reset Logic
    if (lastActiveDate !== today) {
      // It's a new day! Clear logs.
      setDailyLogs([]);
      localStorage.setItem('macro_logs', JSON.stringify([]));
      localStorage.setItem('macro_last_active_date', today);
    } else if (savedLogs) {
      setDailyLogs(JSON.parse(savedLogs));
    }

    // Check for day change every minute
    const interval = setInterval(() => {
      const currentDay = new Date().toLocaleDateString();
      const lastSavedDay = localStorage.getItem('macro_last_active_date');
      if (lastSavedDay && lastSavedDay !== currentDay) {
        setDailyLogs([]);
        localStorage.setItem('macro_logs', JSON.stringify([]));
        localStorage.setItem('macro_last_active_date', currentDay);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('macro_last_active_date', new Date().toLocaleDateString());
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('macro_goal', JSON.stringify({ calories: calorieGoal, p: proteinPct, c: carbsPct, f: fatPct }));
  }, [calorieGoal, proteinPct, carbsPct, fatPct]);

  useEffect(() => {
    localStorage.setItem('macro_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('macro_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('macro_custom_foods', JSON.stringify(customFoods));
  }, [customFoods]);

  useEffect(() => {
    localStorage.setItem('macro_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const totals = useMemo(() => {
    return dailyLogs.reduce((acc, log) => {
      let multiplier = 1;
      if (log.type === 'unit') {
        multiplier = log.servings;
      } else {
        multiplier = log.servings / 100;
      }
      
      return {
        calories: acc.calories + ((log.calories || 0) * multiplier),
        protein: acc.protein + ((log.protein || 0) * multiplier),
        carbs: acc.carbs + ((log.carbs || 0) * multiplier),
        fat: acc.fat + ((log.fat || 0) * multiplier),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [dailyLogs]);

  const targetMacros = useMemo(() => {
    return {
      protein: Math.round((calorieGoal * (proteinPct / 100)) / 4),
      carbs: Math.round((calorieGoal * (carbsPct / 100)) / 4),
      fat: Math.round((calorieGoal * (fatPct / 100)) / 9),
    };
  }, [calorieGoal, proteinPct, carbsPct, fatPct]);

  const filteredFood = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === '') return [];
    
    const combinedDatabase = [...customFoods, ...FOOD_DATABASE];
    
    return combinedDatabase.filter(f => 
      f.name.toLowerCase().includes(query) || 
      f.englishName.toLowerCase().includes(query)
    ).slice(0, 50);
  }, [searchQuery, customFoods]);

  const addFood = (food: Food, amount: number, mealType: MealType) => {
    // Calculate actual macros based on amount and type
    let multiplier = 1;
    if (food.type === 'unit') {
      multiplier = amount; // amount is number of units
    } else {
      multiplier = amount / 100; // amount is grams or ml
    }

    const newLog: LoggedFood = {
      ...food,
      logId: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      servings: amount, // We'll store the raw amount here
      mealType,
    };
    setDailyLogs([newLog, ...dailyLogs]);
    setSelectedFood(null);
    setServingsInput(1);
    setCurrentPage('homepage');
  };

  const quickAddMacros = () => {
    const p = parseFloat(quickProtein) || 0;
    const c = parseFloat(quickCarbs) || 0;
    const f = parseFloat(quickFat) || 0;
    
    if (p === 0 && c === 0 && f === 0) return;

    const calories = (p * 4) + (c * 4) + (f * 9);

    const manualFood: Food = {
      id: `manual-${Date.now()}`,
      name: 'Ajout manuel',
      englishName: 'Quick Add Macros',
      emoji: '⚡',
      calories: calories,
      protein: p,
      carbs: c,
      fat: f,
      servingSize: '1 unit',
      type: 'unit',
      weightPerUnit: 1
    };

    const newLog: LoggedFood = {
      ...manualFood,
      logId: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      servings: 1,
      mealType: selectedMealType,
    };

    setDailyLogs([newLog, ...dailyLogs]);
    setQuickProtein('');
    setQuickCarbs('');
    setQuickFat('');
    setCurrentPage('homepage');
  };

  const addCustomMeal = () => {
    const p = parseFloat(customProtein) || 0;
    const c = parseFloat(customCarbs) || 0;
    const f = parseFloat(customFat) || 0;
    const name = customMealName.trim();
    
    if (!name || (p === 0 && c === 0 && f === 0)) return;

    const calories = (p * 4) + (c * 4) + (f * 9);

    const newCustomFood: Food = {
      id: `custom-${Date.now()}`,
      name: name,
      englishName: name,
      emoji: '🍲',
      calories: calories,
      protein: p,
      carbs: c,
      fat: f,
      servingSize: '100g',
      type: 'solid'
    };

    setCustomFoods([newCustomFood, ...customFoods]);
    setCustomMealName('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    
    // No longer logging immediately
  };

  const addIngredientToRecipe = (food: Food, amount: number) => {
    setRecipeIngredients([...recipeIngredients, { food, amount }]);
    setSelectedFood(null);
    setServingsInput(1);
  };

  const removeIngredientFromRecipe = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const saveRecipe = () => {
    if (!recipeName.trim() || recipeIngredients.length === 0) return;

    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;
    let totalWeight = 0;

    recipeIngredients.forEach(({ food, amount }) => {
      let multiplier = 1;
      if (food.type === 'unit') {
        multiplier = amount;
        totalWeight += (food.weightPerUnit || 100) * amount;
      } else {
        multiplier = amount / 100;
        totalWeight += amount;
      }
      totalProtein += food.protein * multiplier;
      totalCarbs += food.carbs * multiplier;
      totalFat += food.fat * multiplier;
      totalCalories += food.calories * multiplier;
    });

    const factor = 100 / totalWeight;
    const newRecipe: Food = {
      id: `recipe-${Date.now()}`,
      name: recipeName,
      englishName: recipeName,
      emoji: '🥗',
      calories: Math.round(totalCalories * factor),
      protein: parseFloat((totalProtein * factor).toFixed(1)),
      carbs: parseFloat((totalCarbs * factor).toFixed(1)),
      fat: parseFloat((totalFat * factor).toFixed(1)),
      servingSize: '100g',
      type: 'solid'
    };

    const updatedCustomFoods = [newRecipe, ...customFoods];
    setCustomFoods(updatedCustomFoods);
    localStorage.setItem('macro_custom_foods', JSON.stringify(updatedCustomFoods));
    
    setRecipeName('');
    setRecipeIngredients([]);
    setIsCreatingRecipe(false);
    setSearchQuery('');
  };

  const removeLog = (logId: string) => {
    setDailyLogs(dailyLogs.filter(log => log.logId !== logId));
  };

  const applyDietPlan = (plan: DietPlan) => {
    setProteinPct(plan.proteinPct);
    setCarbsPct(plan.carbsPct);
    setFatPct(plan.fatPct);
  };

  const convertWeight = (val: number, from: 'kg' | 'lb', to: 'kg' | 'lb') => {
    if (from === to) return val;
    if (to === 'lb') return Math.round(val * 2.20462 * 10) / 10;
    return Math.round(val / 2.20462 * 10) / 10;
  };

  const convertHeight = (val: number, from: 'cm' | 'ft', to: 'cm' | 'ft') => {
    if (from === to) return val;
    if (to === 'ft') return Math.round(val / 30.48 * 100) / 100;
    return Math.round(val * 30.48 * 10) / 10;
  };

  const completeOnboarding = (profile: UserProfile) => {
    const updatedProfile = { ...profile, joinedAt: new Date().toLocaleDateString(), onboarded: true };
    setUserProfile(updatedProfile);
    
    // Convert to kg and cm for calorie calculation
    const weightInKg = profile.weightUnit === 'lb' ? profile.weight / 2.20462 : profile.weight;
    const heightInCm = profile.heightUnit === 'ft' ? profile.height * 30.48 : profile.height;
    
    // 1. Calculate BMR (Mifflin-St Jeor Equation)
    let bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * profile.age);
    if (profile.gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    
    // 2. Apply Activity Multiplier
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9
    };
    const tdee = bmr * multipliers[profile.activityLevel];
    
    // 3. Adjust for Goals
    let initialCalories = tdee;
    let planKey = 'balanced';
    
    if (profile.goal === 'cut') {
      initialCalories = tdee * 0.85; // 15% deficit
      planKey = 'cutting';
    } else if (profile.goal === 'bulk') {
      initialCalories = tdee * 1.075; // 7.5% surplus
      planKey = 'bulking';
    } else if (profile.goal === 'custom') {
      initialCalories = tdee;
      planKey = 'balanced';
    }
    
    const plan = DIET_PLANS[planKey];
    setCalorieGoal(Math.round(initialCalories));
    setProteinPct(plan.proteinPct);
    setCarbsPct(plan.carbsPct);
    setFatPct(plan.fatPct);
    
    setCurrentPage(profile.goal === 'custom' ? 'goal' : 'homepage');
  };

  const recalculateGoal = () => {
    // Convert to kg and cm for calorie calculation
    const weightInKg = userProfile.weightUnit === 'lb' ? userProfile.weight / 2.20462 : userProfile.weight;
    const heightInCm = userProfile.heightUnit === 'ft' ? userProfile.height * 30.48 : userProfile.height;
    
    // 1. Calculate BMR (Mifflin-St Jeor Equation)
    let bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * userProfile.age);
    if (userProfile.gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    
    // 2. Apply Activity Multiplier
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9
    };
    const tdee = bmr * multipliers[userProfile.activityLevel];
    
    // 3. Adjust for Goals
    let initialCalories = tdee;
    let planKey = 'balanced';
    
    if (userProfile.goal === 'cut') {
      initialCalories = tdee * 0.85; // 15% deficit
      planKey = 'cutting';
    } else if (userProfile.goal === 'bulk') {
      initialCalories = tdee * 1.075; // 7.5% surplus
      planKey = 'bulking';
    } else if (userProfile.goal === 'custom') {
      initialCalories = tdee;
      planKey = 'balanced';
    }
    
    const plan = DIET_PLANS[planKey];
    setCalorieGoal(Math.round(initialCalories));
    setProteinPct(plan.proteinPct);
    setCarbsPct(plan.carbsPct);
    setFatPct(plan.fatPct);
    
    alert(`Your calorie goal has been recalculated to ${Math.round(initialCalories)} kcal based on your updated profile.`);
  };

  const renderHeader = (title: string, subtitle?: string) => (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        {userProfile.photoUrl ? (
          <img 
            src={userProfile.photoUrl} 
            alt="Profile" 
            className="w-12 h-12 rounded-2xl object-cover border border-natural-muted dark:border-dark-muted shadow-sm"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-12 h-12 bg-natural-muted dark:bg-dark-accent rounded-2xl flex items-center justify-center text-natural-accent dark:text-dark-highlight border border-natural-muted dark:border-dark-muted shadow-sm">
            <User size={24} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-natural-ink dark:text-white leading-tight">
            {currentPage === 'homepage' && userProfile.name ? `Hey, ${userProfile.name}` : title}
          </h1>
          {subtitle && <p className="text-xs text-natural-accent dark:text-slate-400 font-medium uppercase tracking-wider">{subtitle}</p>}
        </div>
      </div>
      {currentPage !== 'onboarding' && (
        <button 
          onClick={() => setCurrentPage('settings')}
          className="p-3 bg-natural-card dark:bg-dark-card rounded-2xl border border-natural-muted dark:border-dark-muted shadow-sm text-natural-accent dark:text-slate-400 hover:text-natural-ink dark:hover:text-slate-100 transition-all"
        >
          <Settings size={20} />
        </button>
      )}
    </header>
  );

  const handleMacroChange = (type: 'p' | 'c' | 'f', newValue: number) => {
    const currentValues = { p: proteinPct, c: carbsPct, f: fatPct };
    const diff = newValue - currentValues[type];
    const otherKeys = (['p', 'c', 'f'] as const).filter(k => k !== type);
    const otherSum = currentValues[otherKeys[0]] + currentValues[otherKeys[1]];
    
    let nextValues = { ...currentValues, [type]: newValue };
    
    if (otherSum > 0) {
      let val0 = Math.max(0, currentValues[otherKeys[0]] - (diff * (currentValues[otherKeys[0]] / otherSum)));
      val0 = Math.round(val0);
      let val1 = 100 - newValue - val0;
      
      if (val1 < 0) {
        val1 = 0;
        val0 = 100 - newValue;
      }
      nextValues[otherKeys[0]] = val0;
      nextValues[otherKeys[1]] = val1;
    } else {
      const half = Math.round((100 - newValue) / 2);
      nextValues[otherKeys[0]] = half;
      nextValues[otherKeys[1]] = 100 - newValue - half;
    }
    
    setProteinPct(nextValues.p);
    setCarbsPct(nextValues.c);
    setFatPct(nextValues.f);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile({ ...userProfile, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'onboarding':
        const isStep1Valid = userProfile.name.trim() !== '' && userProfile.age > 0 && userProfile.weight > 0 && userProfile.height > 0;
        const isStep2Valid = !!userProfile.activityLevel && !!userProfile.goal;
        
        return (
          <div className="p-8 space-y-12 min-h-screen flex flex-col justify-center bg-natural-bg dark:bg-dark-bg">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-natural-ink dark:text-dark-ink">
                {onboardingStep === 1 ? translations[userProfile.language].welcome : translations[userProfile.language].almostThere}
              </h1>
              <p className="text-lg text-natural-accent dark:text-dark-highlight leading-relaxed">
                {onboardingStep === 1 
                  ? translations[userProfile.language].basicsPrompt 
                  : translations[userProfile.language].lifestylePrompt}
              </p>
            </div>

            <div className="space-y-8">
              {onboardingStep === 1 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-natural-accent dark:text-dark-highlight uppercase tracking-wider flex items-center gap-2">
                      <Globe size={14} /> {translations[userProfile.language].language}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['en', 'fr'] as const).map(lang => (
                        <button 
                          key={lang}
                          onClick={() => setUserProfile({...userProfile, language: lang})}
                          className={`py-3 rounded-2xl font-bold transition-all border ${userProfile.language === lang ? 'bg-natural-ink dark:bg-dark-highlight border-natural-ink dark:border-dark-highlight text-natural-bg dark:text-dark-bg' : 'bg-natural-card dark:bg-dark-card border-natural-muted dark:border-dark-muted text-natural-accent dark:text-dark-highlight'}`}
                        >
                          {lang === 'en' ? translations[userProfile.language].english : translations[userProfile.language].french}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-natural-muted dark:bg-dark-accent rounded-[32px] flex items-center justify-center text-natural-accent dark:text-dark-highlight overflow-hidden border-2 border-dashed border-natural-accent dark:border-dark-highlight">
                        {userProfile.photoUrl ? (
                          <img src={userProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Camera size={32} />
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold text-natural-accent dark:text-dark-highlight uppercase tracking-wider">{translations[userProfile.language].yourName}</label>
                      <input 
                        type="text" 
                        placeholder={translations[userProfile.language].enterName}
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        className="w-full bg-natural-card dark:bg-dark-card border border-natural-muted dark:border-dark-muted rounded-2xl py-4 px-6 text-xl font-bold focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-natural-accent dark:text-dark-highlight uppercase tracking-wider">{translations[userProfile.language].gender}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['male', 'female'] as const).map(g => (
                          <button 
                            key={g}
                            onClick={() => setUserProfile({...userProfile, gender: g})}
                            className={`py-3 rounded-2xl font-bold transition-all border ${userProfile.gender === g ? 'bg-natural-ink dark:bg-dark-highlight border-natural-ink dark:border-dark-highlight text-natural-bg dark:text-dark-bg' : 'bg-natural-card dark:bg-dark-card border-natural-muted dark:border-dark-muted text-natural-accent dark:text-dark-highlight'}`}
                          >
                            {g === 'male' ? translations[userProfile.language].male : translations[userProfile.language].female}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-natural-accent dark:text-dark-highlight uppercase tracking-wider">{translations[userProfile.language].age}</label>
                      <input 
                        type="number" 
                        value={userProfile.age || ''}
                        onChange={(e) => setUserProfile({...userProfile, age: Number(e.target.value)})}
                        className="w-full bg-natural-card dark:bg-dark-card border border-natural-muted dark:border-dark-muted rounded-2xl py-3 px-6 text-xl font-bold focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-natural-accent dark:text-dark-highlight uppercase tracking-wider">{translations[userProfile.language].weight}</label>
                        <div className="flex bg-natural-muted dark:bg-dark-accent p-0.5 rounded-lg text-[10px] font-bold">
                          {(['kg', 'lb'] as const).map(u => (
                            <button 
                              key={u}
                              onClick={() => setUserProfile({
                                ...userProfile, 
                                weight: convertWeight(userProfile.weight, userProfile.weightUnit, u),
                                weightUnit: u
                              })}
                              className={`px-2 py-1 rounded-md transition-all ${userProfile.weightUnit === u ? 'bg-natural-card dark:bg-dark-card shadow-sm text-natural-ink dark:text-dark-ink' : 'text-natural-accent dark:text-dark-highlight'}`}
                            >
                              {u.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input 
                        type="number" 
                        value={userProfile.weight || ''}
                        onChange={(e) => setUserProfile({...userProfile, weight: Number(e.target.value)})}
                        className="w-full bg-natural-card dark:bg-dark-card border border-natural-muted dark:border-dark-muted rounded-2xl py-4 px-6 text-xl font-bold focus:ring-2 focus:ring-natural-accent dark:text-dark-highlight transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-natural-accent dark:text-dark-highlight uppercase tracking-wider">{translations[userProfile.language].height}</label>
                        <div className="flex bg-natural-muted dark:bg-dark-accent p-0.5 rounded-lg text-[10px] font-bold">
                          {(['cm', 'ft'] as const).map(u => (
                            <button 
                              key={u}
                              onClick={() => setUserProfile({
                                ...userProfile, 
                                height: convertHeight(userProfile.height, userProfile.heightUnit, u),
                                heightUnit: u
                              })}
                              className={`px-2 py-1 rounded-md transition-all ${userProfile.heightUnit === u ? 'bg-natural-card dark:bg-dark-card shadow-sm text-natural-ink dark:text-dark-ink' : 'text-natural-accent dark:text-dark-highlight'}`}
                            >
                              {u.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input 
                        type="number" 
                        value={userProfile.height || ''}
                        onChange={(e) => setUserProfile({...userProfile, height: Number(e.target.value)})}
                        className="w-full bg-natural-card dark:bg-dark-card border border-natural-muted dark:border-dark-muted rounded-2xl py-4 px-6 text-xl font-bold focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={!isStep1Valid}
                    onClick={() => setOnboardingStep(2)}
                    className={`w-full py-5 rounded-[24px] font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-xl mt-4 ${
                      isStep1Valid 
                        ? 'bg-natural-ink dark:bg-dark-highlight text-natural-bg dark:text-dark-bg hover:opacity-90' 
                        : 'bg-natural-muted dark:bg-dark-accent text-natural-accent dark:text-dark-highlight cursor-not-allowed opacity-50'
                    }`}
                  >
                    {translations[userProfile.language].proceed} <ArrowRight size={20} />
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-natural-accent dark:text-dark-highlight uppercase tracking-wider">{translations[userProfile.language].activityLevel}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'sedentary', label: translations[userProfile.language].sedentary, desc: translations[userProfile.language].sedentaryDesc },
                        { id: 'light', label: translations[userProfile.language].light, desc: translations[userProfile.language].lightDesc },
                        { id: 'moderate', label: translations[userProfile.language].moderate, desc: translations[userProfile.language].moderateDesc },
                        { id: 'very', label: translations[userProfile.language].very, desc: translations[userProfile.language].veryDesc },
                        { id: 'extra', label: translations[userProfile.language].extra, desc: translations[userProfile.language].extraDesc }
                      ].map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setUserProfile({...userProfile, activityLevel: level.id as any})}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            userProfile.activityLevel === level.id 
                              ? 'bg-natural-ink dark:bg-dark-highlight border-natural-ink dark:border-dark-highlight text-natural-bg dark:text-dark-bg' 
                              : 'bg-natural-card dark:bg-dark-card border-natural-muted dark:border-dark-muted text-natural-ink dark:text-dark-ink'
                          }`}
                        >
                          <div className="text-left">
                            <span className="font-bold text-sm block">{level.label}</span>
                            <span className="text-[10px] opacity-60">{level.desc}</span>
                          </div>
                          {userProfile.activityLevel === level.id && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-natural-accent dark:text-dark-highlight uppercase tracking-wider">{translations[userProfile.language].goalPrompt}</label>
                    <div className="grid gap-3">
                      {(['cut', 'maintain', 'bulk', 'custom'] as const).map((goal) => (
                        <button
                          key={goal}
                          onClick={() => setUserProfile({...userProfile, goal})}
                          className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                            userProfile.goal === goal 
                              ? 'bg-natural-ink dark:bg-dark-highlight border-natural-ink dark:border-dark-highlight text-natural-bg dark:text-dark-bg shadow-lg shadow-natural-muted dark:shadow-none' 
                              : 'bg-natural-card dark:bg-dark-card border-natural-muted dark:border-dark-muted text-natural-ink dark:text-dark-ink hover:border-natural-accent dark:hover:border-dark-highlight'
                          }`}
                        >
                          <div className="text-left">
                            <span className="font-bold capitalize text-lg block">
                              {goal === 'cut' ? translations[userProfile.language].cut : 
                               goal === 'maintain' ? translations[userProfile.language].maintain : 
                               goal === 'bulk' ? translations[userProfile.language].bulk : 
                               translations[userProfile.language].custom}
                            </span>
                            <span className="text-xs opacity-60">
                              {goal === 'cut' && translations[userProfile.language].cutDesc}
                              {goal === 'maintain' && translations[userProfile.language].maintainDesc}
                              {goal === 'bulk' && translations[userProfile.language].bulkDesc}
                              {goal === 'custom' && translations[userProfile.language].customDesc}
                            </span>
                          </div>
                          {userProfile.goal === goal && <Check size={20} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button 
                      onClick={() => setOnboardingStep(1)}
                      className="flex-1 bg-natural-card dark:bg-dark-card text-natural-ink dark:text-dark-ink py-5 rounded-[24px] font-bold text-xl border border-natural-muted dark:border-dark-muted hover:bg-natural-muted dark:hover:bg-dark-accent transition-all"
                    >
                      {translations[userProfile.language].back}
                    </button>
                    <button 
                      disabled={!isStep2Valid}
                      onClick={() => completeOnboarding(userProfile)}
                      className={`flex-[2] py-5 rounded-[24px] font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-xl ${
                        isStep2Valid 
                          ? 'bg-natural-ink dark:bg-dark-highlight text-natural-bg dark:text-dark-bg hover:opacity-90 shadow-natural-muted dark:shadow-none' 
                          : 'bg-natural-muted dark:bg-dark-accent text-natural-accent dark:text-dark-highlight cursor-not-allowed opacity-50'
                      }`}
                    >
                      {translations[userProfile.language].getStarted} <Check size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 space-y-8 pb-24">
            <header className="flex items-center gap-4 mb-8">
              <button onClick={() => setCurrentPage('homepage')} className="p-2 bg-natural-card dark:bg-dark-card rounded-xl border border-natural-muted dark:border-dark-muted text-natural-accent dark:text-slate-400">
                <Plus size={24} className="rotate-45" />
              </button>
              <h1 className="text-2xl font-bold text-natural-ink dark:text-white">{translations[userProfile.language].settings}</h1>
            </header>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-natural-accent dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} /> {translations[userProfile.language].language}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(['en', 'fr'] as const).map(lang => (
                  <button 
                    key={lang}
                    onClick={() => setUserProfile({...userProfile, language: lang})}
                    className={`py-4 rounded-[24px] font-bold transition-all border ${
                      userProfile.language === lang 
                        ? 'bg-natural-ink dark:bg-dark-highlight border-natural-ink dark:border-dark-highlight text-natural-bg dark:text-dark-bg shadow-lg' 
                        : 'bg-natural-card dark:bg-[#1a2332] border-natural-muted dark:border-slate-800 text-natural-accent dark:text-slate-400'
                    }`}
                  >
                    {lang === 'en' ? translations[userProfile.language].english : translations[userProfile.language].french}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-natural-accent dark:text-white uppercase tracking-wider">Appearance</h2>
              <div className="bg-natural-card dark:bg-dark-card rounded-3xl p-6 border border-natural-muted dark:border-dark-muted shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-natural-muted dark:bg-dark-accent rounded-2xl flex items-center justify-center text-natural-accent dark:text-slate-400">
                      {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-natural-ink dark:text-white">Theme Mode</p>
                      <p className="text-xs text-natural-accent dark:text-slate-400">{isDarkMode ? 'Dark' : 'Light'} theme active</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-14 h-8 rounded-full transition-all relative ${isDarkMode ? 'bg-dark-highlight' : 'bg-natural-highlight'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-natural-card dark:bg-dark-card shadow-sm transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-natural-accent dark:text-white uppercase tracking-wider">{translations[userProfile.language].profile}</h2>
              <div className="bg-natural-card dark:bg-dark-card rounded-3xl p-6 border border-natural-muted dark:border-dark-muted shadow-sm space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-natural-muted dark:bg-dark-accent rounded-[28px] flex items-center justify-center text-natural-accent dark:text-slate-400 overflow-hidden border border-natural-muted dark:border-dark-muted">
                      {userProfile.photoUrl ? (
                        <img src={userProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Camera size={24} />
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium text-natural-accent dark:text-slate-400">{translations[userProfile.language].yourName}</label>
                    <input 
                      type="text" 
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="w-full bg-natural-bg dark:bg-dark-muted border-none rounded-xl py-3 px-4 font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-natural-accent dark:text-slate-400">{translations[userProfile.language].weight}</label>
                      <div className="flex bg-natural-muted dark:bg-dark-accent p-0.5 rounded-lg text-[8px] font-bold">
                        {(['kg', 'lb'] as const).map(u => (
                          <button 
                            key={u}
                            onClick={() => setUserProfile({
                              ...userProfile, 
                              weight: convertWeight(userProfile.weight, userProfile.weightUnit, u),
                              weightUnit: u
                            })}
                            className={`px-1.5 py-0.5 rounded-md transition-all ${userProfile.weightUnit === u ? 'bg-natural-card dark:bg-dark-card shadow-sm text-natural-ink dark:text-white' : 'text-natural-accent dark:text-slate-400'}`}
                          >
                            {u.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input 
                      type="number" 
                      value={userProfile.weight}
                      onChange={(e) => setUserProfile({...userProfile, weight: Number(e.target.value)})}
                      className="w-full bg-natural-bg dark:bg-dark-muted border-none rounded-xl py-3 px-4 font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-natural-accent dark:text-slate-400">{translations[userProfile.language].height}</label>
                      <div className="flex bg-natural-muted dark:bg-dark-accent p-0.5 rounded-lg text-[8px] font-bold">
                        {(['cm', 'ft'] as const).map(u => (
                          <button 
                            key={u}
                            onClick={() => setUserProfile({
                              ...userProfile, 
                              height: convertHeight(userProfile.height, userProfile.heightUnit, u),
                              heightUnit: u
                            })}
                            className={`px-1.5 py-0.5 rounded-md transition-all ${userProfile.heightUnit === u ? 'bg-natural-card dark:bg-dark-card shadow-sm text-natural-ink dark:text-white' : 'text-natural-accent dark:text-slate-400'}`}
                          >
                            {u.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input 
                      type="number" 
                      value={userProfile.height}
                      onChange={(e) => setUserProfile({...userProfile, height: Number(e.target.value)})}
                      className="w-full bg-natural-bg dark:bg-dark-muted border-none rounded-xl py-3 px-4 font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-natural-accent dark:text-slate-400">{translations[userProfile.language].gender}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['male', 'female'] as const).map(g => (
                        <button 
                          key={g}
                          onClick={() => setUserProfile({...userProfile, gender: g})}
                          className={`py-2 rounded-xl font-bold transition-all border ${userProfile.gender === g ? 'bg-natural-ink dark:bg-dark-highlight border-natural-ink dark:border-dark-highlight text-natural-bg dark:text-white' : 'bg-natural-bg dark:bg-dark-muted border-natural-muted dark:border-dark-muted text-natural-accent dark:text-slate-400'}`}
                        >
                          {g === 'male' ? translations[userProfile.language].male : translations[userProfile.language].female}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-natural-accent dark:text-slate-400">{translations[userProfile.language].age}</label>
                    <input 
                      type="number" 
                      value={userProfile.age}
                      onChange={(e) => setUserProfile({...userProfile, age: Number(e.target.value)})}
                      className="w-full bg-natural-bg dark:bg-dark-muted border-none rounded-xl py-3 px-4 font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-natural-accent dark:text-slate-400">{translations[userProfile.language].activityLevel}</label>
                  <select 
                    value={userProfile.activityLevel}
                    onChange={(e) => setUserProfile({...userProfile, activityLevel: e.target.value as any})}
                    className="w-full bg-natural-bg dark:bg-dark-muted border-none rounded-xl py-3 px-4 font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight"
                  >
                    <option value="sedentary">{translations[userProfile.language].sedentary}</option>
                    <option value="light">{translations[userProfile.language].light}</option>
                    <option value="moderate">{translations[userProfile.language].moderate}</option>
                    <option value="very">{translations[userProfile.language].very}</option>
                    <option value="extra">{translations[userProfile.language].extra}</option>
                  </select>
                </div>

                <button 
                  onClick={recalculateGoal}
                  className="w-full py-3 bg-natural-muted dark:bg-dark-accent text-natural-ink dark:text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all border border-natural-muted dark:border-dark-muted"
                >
                  {translations[userProfile.language].recalculate}
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-natural-accent dark:text-white uppercase tracking-wider">{translations[userProfile.language].history}</h2>
              <div className="bg-natural-card dark:bg-dark-card rounded-3xl p-6 border border-natural-muted dark:border-dark-muted shadow-sm space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-natural-muted dark:border-dark-muted">
                  <span className="text-sm text-natural-accent dark:text-slate-400">Current Goal</span>
                  <span className="text-sm font-bold capitalize px-3 py-1 bg-natural-muted dark:bg-dark-accent rounded-full text-natural-ink dark:text-white">{translations[userProfile.language][userProfile.goal as keyof typeof translations['en']]}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-natural-muted dark:border-dark-muted">
                  <span className="text-sm text-natural-accent dark:text-slate-400">Total Logs</span>
                  <span className="text-sm font-bold text-natural-ink dark:text-white">{dailyLogs.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-natural-accent dark:text-slate-400">{translations[userProfile.language].memberSince}</span>
                  <span className="text-sm font-bold text-natural-ink dark:text-white">{userProfile.joinedAt || 'Today'}</span>
                </div>
              </div>
            </section>

            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-4 text-red-500 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
            >
              {translations[userProfile.language].deleteData}
            </button>
          </div>
        );
      case 'homepage':
        return (
          <div className="p-6 space-y-8 pb-24">
            {renderHeader(translations[userProfile.language].today, translations[userProfile.language].trackProgress)}

            <div className="bg-natural-card dark:bg-dark-surface rounded-3xl p-8 shadow-sm border border-natural-muted dark:border-dark-muted relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-5xl font-light tracking-tight text-natural-ink dark:text-dark-ink">{Math.round(totals.calories)}</span>
                    <span className="text-natural-accent dark:text-slate-400 ml-2">/ {calorieGoal} kcal</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${totals.calories > calorieGoal ? 'text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {totals.calories > calorieGoal ? translations[userProfile.language].over : translations[userProfile.language].remaining} {Math.abs(Math.round(calorieGoal - totals.calories))}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-natural-muted dark:bg-dark-accent h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totals.calories / calorieGoal) * 100, 100)}%` }}
                    className={`h-full rounded-full ${totals.calories > calorieGoal ? 'bg-red-400' : 'bg-dark-highlight'}`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { 
                  label: translations[userProfile.language].protein.toUpperCase(), 
                  current: totals.protein, 
                  target: targetMacros.protein, 
                  color: 'text-emerald-500', 
                  bgColor: 'bg-emerald-500',
                  icon: Beef,
                  left: Math.max(0, Math.round(targetMacros.protein - totals.protein))
                },
                { 
                  label: translations[userProfile.language].carbs.toUpperCase(), 
                  current: totals.carbs, 
                  target: targetMacros.carbs, 
                  color: 'text-amber-500', 
                  bgColor: 'bg-amber-500',
                  icon: Wheat,
                  left: Math.max(0, Math.round(targetMacros.carbs - totals.carbs))
                },
                { 
                  label: translations[userProfile.language].fat.toUpperCase(), 
                  current: totals.fat, 
                  target: targetMacros.fat, 
                  color: 'text-rose-500', 
                  bgColor: 'bg-rose-500',
                  icon: Flame,
                  left: Math.max(0, Math.round(targetMacros.fat - totals.fat))
                },
              ].map((macro) => (
                <div key={macro.label} className="bg-natural-card dark:bg-[#1a2332] rounded-[32px] p-6 shadow-sm border border-natural-muted dark:border-dark-muted flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${macro.color.replace('text-', 'bg-')}/10`}>
                      <macro.icon size={24} className={macro.color} />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold tracking-widest ${macro.color} opacity-80`}>{macro.label}</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-bold text-natural-ink dark:text-white">
                          {macro.current > 0 && macro.current < 10 ? macro.current.toFixed(1) : Math.round(macro.current)}
                        </span>
                        <span className="text-xs text-natural-accent dark:text-slate-500">/ {macro.target}g</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${macro.color}`}>
                      {macro.left > 0 && macro.left < 10 ? macro.left.toFixed(1) : Math.round(macro.left)}g {translations[userProfile.language].left}
                    </p>
                      <div className="w-32 bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${Math.max(
                              macro.current > 0 ? 2 : 0, 
                              Math.min((macro.current / (macro.target || 1)) * 100, 100)
                            )}%` 
                          }}
                          className={`h-full rounded-full ${macro.bgColor}`}
                        />
                      </div>
                  </div>
                </div>
              ))}
            </div>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-natural-ink dark:text-slate-100">{translations[userProfile.language].recentLogs}</h2>
                <button onClick={() => setCurrentPage('daily')} className="text-sm text-natural-accent dark:text-slate-400 flex items-center gap-1 hover:text-natural-ink dark:hover:text-slate-200 transition-colors">
                  {translations[userProfile.language].viewAll} <ChevronRight size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {dailyLogs.slice(0, 3).map((log) => {
                  let multiplier = log.type === 'unit' ? log.servings : log.servings / 100;
                  return (
                    <div key={log.logId} className="flex items-center justify-between p-4 bg-natural-card dark:bg-dark-card rounded-2xl border border-natural-muted dark:border-dark-muted hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{log.emoji}</span>
                        <div>
                          <h3 className="font-medium text-natural-ink dark:text-slate-200">{log.englishName}</h3>
                          <p className="text-xs text-natural-accent dark:text-slate-500">
                            {log.servings}{log.type === 'unit' ? ' unit' : log.type === 'liquid' ? 'ml' : 'g'} • {Math.round(log.calories * multiplier)} kcal
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 text-[10px] font-mono text-natural-accent dark:text-slate-400">
                        <span>P: {Math.round(log.protein * multiplier)}g</span>
                        <span>C: {Math.round(log.carbs * multiplier)}g</span>
                        <span>F: {Math.round(log.fat * multiplier)}g</span>
                      </div>
                    </div>
                  );
                })}
                {dailyLogs.length === 0 && (
                  <div className="text-center py-12 text-natural-accent dark:text-slate-500 bg-natural-muted/20 dark:bg-dark-muted/20 rounded-[32px] border border-dashed border-natural-muted dark:border-dark-muted">
                    <p className="italic">{translations[userProfile.language].noLogs}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        );
      case 'daily':
        const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
        return (
          <div className="p-6 space-y-6 pb-24">
            {renderHeader(translations[userProfile.language].dailyLog, translations[userProfile.language].dailyLogDesc)}
            <div className="space-y-8">
              {meals.map((meal) => {
                const mealLogs = dailyLogs.filter(log => log.mealType === meal);
                if (mealLogs.length === 0) return null;
                
                return (
                  <div key={meal} className="space-y-3">
                    <h2 className="text-sm font-semibold text-natural-accent dark:text-dark-highlight uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-natural-muted dark:bg-dark-muted"></span>
                      {translations[userProfile.language][meal as keyof typeof translations['en']]}
                    </h2>
                    <div className="space-y-3">
                      {mealLogs.map((log) => {
                        let multiplier = log.type === 'unit' ? log.servings : log.servings / 100;
                        return (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={log.logId} 
                            className="flex items-center justify-between p-4 bg-natural-card dark:bg-dark-card rounded-2xl border border-natural-muted dark:border-dark-muted shadow-sm"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-2xl">{log.emoji}</span>
                              <div className="flex-1">
                                <h3 className="font-medium text-natural-ink dark:text-dark-ink">{log.englishName}</h3>
                                <div className="flex gap-3 mt-1">
                                  <p className="text-xs text-natural-accent dark:text-dark-highlight">
                                    {log.servings}{log.type === 'unit' ? ' unit' : log.type === 'liquid' ? 'ml' : 'g'} • {Math.round(log.calories * multiplier)} kcal
                                  </p>
                                  <div className="flex gap-2 text-[10px] font-mono text-natural-accent dark:text-dark-highlight">
                                    <span>P:{Math.round(log.protein * multiplier)}</span>
                                    <span>C:{Math.round(log.carbs * multiplier)}</span>
                                    <span>F:{Math.round(log.fat * multiplier)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeLog(log.logId)}
                              className="p-2 text-natural-accent dark:text-dark-highlight hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {dailyLogs.length === 0 && (
                <div className="text-center py-20 text-natural-accent dark:text-dark-highlight">
                  <Calendar className="mx-auto mb-4 opacity-20" size={48} />
                  <p>{translations[userProfile.language].emptyLog}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'add-food':
        return (
          <div className="p-6 space-y-6 pb-24 text-slate-500 dark:text-slate-400">
            {renderHeader(translations[userProfile.language].addFood)}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="text"
                placeholder={translations[userProfile.language].searchDatabase}
                className="w-full bg-natural-muted dark:bg-dark-accent border-none rounded-2xl py-3 pl-10 pr-10 focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-natural-accent dark:hover:text-dark-highlight transition-colors"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Quick Add Macros Section */}
            {!searchQuery.trim() && (
              <div className="space-y-6">
                <div className="bg-natural-card dark:bg-dark-card rounded-3xl p-6 border border-natural-muted dark:border-dark-muted shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PlusCircle size={18} className="text-natural-accent dark:text-dark-highlight" />
                    <h2 className="text-sm font-bold text-natural-ink dark:text-white uppercase tracking-wider">{translations[userProfile.language].quickAdd}</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">{translations[userProfile.language].protein} (g)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={quickProtein}
                        onChange={(e) => setQuickProtein(e.target.value)}
                        className="w-full bg-natural-muted dark:bg-dark-accent border-none rounded-xl py-2.5 px-3 text-sm font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">{translations[userProfile.language].carbs} (g)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={quickCarbs}
                        onChange={(e) => setQuickCarbs(e.target.value)}
                        className="w-full bg-natural-muted dark:bg-dark-accent border-none rounded-xl py-2.5 px-3 text-sm font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-amber-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">{translations[userProfile.language].fat} (g)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={quickFat}
                        onChange={(e) => setQuickFat(e.target.value)}
                        className="w-full bg-natural-muted dark:bg-dark-accent border-none rounded-xl py-2.5 px-3 text-sm font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-rose-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 flex bg-natural-muted dark:bg-dark-accent p-1 rounded-xl">
                      {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                        <button
                          key={meal}
                          onClick={() => setSelectedMealType(meal)}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${
                            selectedMealType === meal 
                              ? 'bg-natural-card dark:bg-dark-card text-natural-ink dark:text-white shadow-sm' 
                              : 'text-natural-accent dark:text-slate-500'
                          }`}
                        >
                          {translations[userProfile.language][meal as keyof typeof translations['en']]}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={quickAddMacros}
                      disabled={!quickProtein && !quickCarbs && !quickFat}
                      className="bg-natural-ink dark:bg-dark-highlight text-natural-bg dark:text-dark-bg p-2.5 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="bg-natural-card dark:bg-dark-card rounded-3xl p-6 border border-natural-muted dark:border-dark-muted shadow-sm space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PlusCircle size={18} className="text-natural-accent dark:text-dark-highlight" />
                    <h2 className="text-sm font-bold text-natural-ink dark:text-white uppercase tracking-wider">{translations[userProfile.language].addCustom}</h2>
                    <p className="text-[10px] text-natural-accent dark:text-slate-500 font-medium">{translations[userProfile.language].macrosPer100g}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-natural-accent dark:text-slate-400 tracking-widest uppercase">{translations[userProfile.language].mealName}</label>
                    <input 
                      type="text" 
                      placeholder={translations[userProfile.language].placeholderMeal}
                      value={customMealName}
                      onChange={(e) => setCustomMealName(e.target.value)}
                      className="w-full bg-natural-muted dark:bg-dark-accent border-none rounded-xl py-2.5 px-3 text-sm font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">{translations[userProfile.language].protein} (g)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                        className="w-full bg-natural-muted dark:bg-dark-accent border-none rounded-xl py-2.5 px-3 text-sm font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">{translations[userProfile.language].carbs} (g)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(e.target.value)}
                        className="w-full bg-natural-muted dark:bg-dark-accent border-none rounded-xl py-2.5 px-3 text-sm font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-amber-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">{translations[userProfile.language].fat} (g)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={customFat}
                        onChange={(e) => setCustomFat(e.target.value)}
                        className="w-full bg-natural-muted dark:bg-dark-accent border-none rounded-xl py-2.5 px-3 text-sm font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-rose-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={addCustomMeal}
                      disabled={!customMealName || (!customProtein && !customCarbs && !customFat)}
                      className="w-full bg-natural-ink dark:bg-dark-highlight text-natural-bg dark:text-dark-bg py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      <span>{translations[userProfile.language].saveToDatabase}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-natural-card dark:bg-dark-card rounded-3xl p-6 border border-natural-muted dark:border-dark-muted shadow-sm space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PlusCircle size={18} className="text-natural-accent dark:text-dark-highlight" />
                      <h2 className="text-sm font-bold text-natural-ink dark:text-white uppercase tracking-wider">{translations[userProfile.language].createRecipe}</h2>
                    </div>
                    {!isCreatingRecipe && (
                      <button 
                        onClick={() => setIsCreatingRecipe(true)}
                        className="text-[10px] font-bold text-natural-accent dark:text-dark-highlight uppercase tracking-widest hover:bg-natural-accent/10 dark:hover:bg-dark-highlight/10 transition-all border border-natural-accent/30 dark:border-dark-highlight/30 px-3 py-1.5 rounded-xl"
                      >
                        {translations[userProfile.language].startNew}
                      </button>
                    )}
                  </div>

                  {isCreatingRecipe ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-natural-accent dark:text-slate-400 tracking-widest uppercase">{translations[userProfile.language].recipeName}</label>
                        <input 
                          type="text" 
                          placeholder={translations[userProfile.language].placeholderRecipe}
                          value={recipeName}
                          onChange={(e) => setRecipeName(e.target.value)}
                          className="w-full bg-natural-muted dark:bg-dark-accent border-none rounded-xl py-2.5 px-3 text-sm font-bold text-natural-ink dark:text-white focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight transition-all"
                        />
                      </div>

                      {recipeIngredients.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-natural-accent dark:text-slate-400 tracking-widest uppercase">{translations[userProfile.language].ingredients}</label>
                          <div className="space-y-2">
                            {recipeIngredients.map((ingredient, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-natural-muted dark:bg-dark-accent p-3 rounded-xl">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{ingredient.food.emoji}</span>
                                  <div>
                                    <p className="text-xs font-bold text-natural-ink dark:text-white">{ingredient.food.englishName}</p>
                                    <p className="text-[10px] text-natural-accent dark:text-slate-500">{ingredient.amount}{ingredient.food.type === 'unit' ? ' units' : 'g'}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => removeIngredientFromRecipe(idx)}
                                  className="text-rose-500 hover:opacity-80 p-1"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => {
                            setIsCreatingRecipe(false);
                            setRecipeName('');
                            setRecipeIngredients([]);
                          }}
                          className="flex-1 bg-natural-muted dark:bg-dark-accent text-natural-accent dark:text-slate-400 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                        >
                          {translations[userProfile.language].cancel}
                        </button>
                        <button 
                          onClick={saveRecipe}
                          disabled={!recipeName.trim() || recipeIngredients.length === 0}
                          className="flex-[2] bg-natural-ink dark:bg-dark-highlight text-natural-bg dark:text-dark-bg py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Check size={20} />
                          <span>{translations[userProfile.language].saveRecipe}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-center text-natural-accent dark:text-slate-500 italic">
                        {translations[userProfile.language].searchIngredients}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-natural-accent dark:text-slate-500">
                      {translations[userProfile.language].recipeDesc}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {searchQuery.trim() === '' && (
                <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                  <Search className="mx-auto mb-4 opacity-20" size={48} />
                  <p>Start typing to search for food...</p>
                </div>
              )}
              {searchQuery.trim() !== '' && filteredFood.length === 0 && (
                <div className="text-center py-20 text-slate-400 dark:text-slate-500">
                  <p>No food found for "{searchQuery}"</p>
                </div>
              )}
              {filteredFood.map((food) => (
                <button 
                  key={food.id} 
                  onClick={() => {
                    setSelectedFood(food);
                    setServingsInput(food.type === 'unit' ? 1 : 100);
                  }}
                  className="w-full text-left bg-natural-card dark:bg-dark-card rounded-2xl border border-natural-muted dark:border-dark-muted p-4 flex items-center justify-between shadow-sm hover:border-natural-accent dark:hover:border-dark-highlight transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{food.emoji}</span>
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-white">{food.englishName}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{food.servingSize} • {food.calories} kcal</p>
                      <div className="flex gap-2 mt-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        <span>P: {food.protein}g</span>
                        <span>C: {food.carbs}g</span>
                        <span>F: {food.fat}g</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-natural-muted dark:bg-dark-muted p-2 rounded-xl text-slate-400 dark:text-slate-500">
                    <Plus size={20} />
                  </div>
                </button>
              ))}
            </div>

            <AnimatePresence>
              {selectedFood && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-dark-bg/80 backdrop-blur-sm">
                  <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="bg-natural-card dark:bg-dark-surface w-full max-w-md rounded-t-[32px] p-8 space-y-8 shadow-2xl border-t border-natural-muted dark:border-dark-muted"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{selectedFood.emoji}</span>
                        <div>
                          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedFood.englishName}</h2>
                          <p className="text-sm text-natural-accent dark:text-dark-highlight">{selectedFood.name}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedFood(null)} className="p-2 bg-natural-muted dark:bg-dark-accent rounded-full text-natural-accent dark:text-dark-highlight">
                        <Plus size={20} className="rotate-45" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {!isCreatingRecipe && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-natural-accent dark:text-dark-highlight">Select Meal</span>
                          <div className="grid grid-cols-4 gap-2">
                            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
                              <button
                                key={meal}
                                onClick={() => setSelectedMealType(meal)}
                                className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                  selectedMealType === meal 
                                    ? 'bg-natural-ink dark:bg-dark-highlight text-natural-bg dark:text-dark-bg border-natural-ink dark:border-dark-highlight' 
                                    : 'bg-natural-muted dark:bg-dark-accent text-natural-accent dark:text-dark-highlight border-natural-muted dark:border-dark-muted hover:border-natural-accent dark:hover:border-dark-highlight'
                                }`}
                              >
                                {meal}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="font-medium text-natural-accent dark:text-dark-highlight">Amount ({selectedFood.type === 'unit' ? 'units' : selectedFood.type === 'liquid' ? 'ml' : 'g'})</span>
                        <div className="flex items-center gap-4 bg-natural-muted dark:bg-dark-accent p-1 rounded-2xl">
                          <button 
                            onClick={() => setServingsInput(prev => Math.max(0, prev - (selectedFood.type === 'unit' ? 1 : 10)))}
                            className="p-2 bg-natural-card dark:bg-dark-card rounded-xl shadow-sm text-natural-ink dark:text-dark-ink"
                          >
                            <Minus size={16} />
                          </button>
                          <input 
                            type="number" 
                            value={servingsInput}
                            onChange={(e) => setServingsInput(Number(e.target.value))}
                            className="w-16 bg-transparent text-center font-bold text-lg focus:outline-none text-natural-ink dark:text-dark-ink"
                          />
                          <button 
                            onClick={() => setServingsInput(prev => prev + (selectedFood.type === 'unit' ? 1 : 10))}
                            className="p-2 bg-natural-card dark:bg-dark-card rounded-xl shadow-sm text-natural-ink dark:text-dark-ink"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-natural-muted dark:border-dark-muted">
                        {[
                          { label: 'Kcal', val: Math.round(selectedFood.calories * (selectedFood.type === 'unit' ? servingsInput : servingsInput / 100)), color: 'text-natural-ink dark:text-slate-100' },
                          { label: 'Prot', val: Math.round(selectedFood.protein * (selectedFood.type === 'unit' ? servingsInput : servingsInput / 100)), color: 'text-blue-500' },
                          { label: 'Carb', val: Math.round(selectedFood.carbs * (selectedFood.type === 'unit' ? servingsInput : servingsInput / 100)), color: 'text-[#b8860b]' },
                          { label: 'Fat', val: Math.round(selectedFood.fat * (selectedFood.type === 'unit' ? servingsInput : servingsInput / 100)), color: 'text-red-600' },
                        ].map(stat => (
                          <div key={stat.label} className="text-center">
                            <p className="text-[10px] uppercase tracking-wider text-natural-accent dark:text-slate-400 mb-1">{stat.label}</p>
                            <p className={`font-bold ${stat.color}`}>{stat.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (isCreatingRecipe) {
                          addIngredientToRecipe(selectedFood, servingsInput);
                        } else {
                          addFood(selectedFood, servingsInput, selectedMealType);
                        }
                      }}
                      className="w-full bg-natural-ink dark:bg-dark-highlight text-natural-bg dark:text-dark-bg py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-natural-muted dark:shadow-none"
                    >
                      {isCreatingRecipe ? 'Add to Recipe' : 'Add to Log'}
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'goal':
        return (
          <div className="p-6 space-y-8 pb-24">
            {renderHeader(translations[userProfile.language].settings, translations[userProfile.language].language)}

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-natural-accent dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} /> {translations[userProfile.language].language}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(['en', 'fr'] as const).map(lang => (
                  <button 
                    key={lang}
                    onClick={() => setUserProfile({...userProfile, language: lang})}
                    className={`py-4 rounded-[24px] font-bold transition-all border ${
                      userProfile.language === lang 
                        ? 'bg-natural-ink dark:bg-dark-highlight border-natural-ink dark:border-dark-highlight text-natural-bg dark:text-dark-bg shadow-lg' 
                        : 'bg-natural-card dark:bg-[#1a2332] border-natural-muted dark:border-slate-800 text-natural-accent dark:text-slate-400'
                    }`}
                  >
                    {lang === 'en' ? translations[userProfile.language].english : translations[userProfile.language].french}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-natural-accent dark:text-white uppercase tracking-wider">{translations[userProfile.language].calories}</h2>
              <div className="bg-natural-card dark:bg-dark-card rounded-3xl p-6 border border-natural-muted dark:border-dark-muted shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="number" 
                      value={calorieGoal}
                      onChange={(e) => setCalorieGoal(Math.max(0, Number(e.target.value)))}
                      className="w-full text-4xl font-light bg-natural-bg dark:bg-dark-muted border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-natural-accent dark:focus:ring-dark-highlight transition-all text-natural-ink dark:text-dark-ink"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-natural-accent dark:text-slate-400 font-medium">kcal</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setCalorieGoal(prev => prev + 100)} className="p-2 bg-natural-muted dark:bg-dark-accent rounded-xl hover:opacity-80 transition-colors text-natural-ink dark:text-dark-ink"><Plus size={20}/></button>
                    <button onClick={() => setCalorieGoal(prev => Math.max(0, prev - 100))} className="p-2 bg-natural-muted dark:bg-dark-accent rounded-xl hover:opacity-80 transition-colors text-natural-ink dark:text-dark-ink"><Minus size={20}/></button>
                  </div>
                </div>
                <p className="text-xs text-natural-accent dark:text-slate-500 mt-4">{translations[userProfile.language].dailyGoal}</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-natural-accent dark:text-white uppercase tracking-wider">Preset Plans</h2>
              <div className="grid gap-3">
                {Object.entries(DIET_PLANS).map(([key, plan]) => {
                  const isSelected = proteinPct === plan.proteinPct && carbsPct === plan.carbsPct;
                  return (
                    <button 
                      key={key}
                      onClick={() => applyDietPlan(plan)}
                      className={`text-left p-5 rounded-[24px] border transition-all duration-300 ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'border-natural-muted dark:border-slate-800 bg-natural-card dark:bg-[#1a2332] text-natural-ink dark:text-slate-300 hover:border-natural-accent dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg tracking-tight dark:text-white">{plan.name}</h3>
                        {isSelected && <Check size={18} className="text-emerald-500" />}
                      </div>
                      <p className={`text-sm mt-1 font-medium ${isSelected ? 'opacity-90' : 'text-natural-accent dark:text-slate-400'}`}>
                        {plan.description}
                      </p>
                      <div className="flex gap-4 mt-4 text-xs font-bold tracking-wider opacity-80">
                        <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">P: {plan.proteinPct}%</span>
                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg">C: {plan.carbsPct}%</span>
                        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg">F: {plan.fatPct}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-natural-accent dark:text-white uppercase tracking-wider">{translations[userProfile.language].protein} / {translations[userProfile.language].carbs} / {translations[userProfile.language].fat}</h2>
              <div className="bg-natural-card dark:bg-[#111827] rounded-[32px] p-8 border border-natural-muted dark:border-slate-800 shadow-xl space-y-10">
                {[
                  { label: translations[userProfile.language].protein, value: proteinPct, type: 'p' as const, grams: targetMacros.protein },
                  { label: translations[userProfile.language].carbs, value: carbsPct, type: 'c' as const, grams: targetMacros.carbs },
                  { label: translations[userProfile.language].fat, value: fatPct, type: 'f' as const, grams: targetMacros.fat },
                ].map((macro) => (
                  <div key={macro.label} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-natural-ink dark:text-white">{macro.label} ({macro.value}%)</span>
                      <span className="text-2xl font-bold text-natural-ink dark:text-white">{macro.grams}g</span>
                    </div>
                    <div className="relative h-2 bg-natural-muted dark:bg-slate-800 rounded-full">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={macro.value}
                        onChange={(e) => handleMacroChange(macro.type, Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div 
                        className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        style={{ width: `${macro.value}%` }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-4 border-emerald-500 z-0"
                        style={{ left: `calc(${macro.value}% - 12px)` }}
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setCurrentPage('homepage')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  {translations[userProfile.language].saveChanges}
                </button>

                <div className="text-center text-xs font-medium text-slate-500 dark:text-slate-500">
                  Total: {proteinPct + carbsPct + fatPct}% (Auto-balanced)
                </div>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg dark:bg-dark-bg text-natural-ink dark:text-dark-ink font-sans selection:bg-natural-accent/30 dark:selection:bg-dark-highlight/30">
      <main className="max-w-md mx-auto min-h-screen bg-natural-bg dark:bg-dark-bg relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation */}
        {currentPage !== 'onboarding' && (
          <nav className="fixed bottom-0 left-0 right-0 bg-natural-card/95 dark:bg-[#0a0f18]/95 backdrop-blur-xl border-t border-natural-muted dark:border-slate-800 px-6 py-1.5 z-50 pb-4">
            <div className="max-w-md mx-auto flex justify-between items-center">
              {[
                { id: 'homepage', icon: Home, label: 'HOME' },
                { id: 'add-food', icon: Search, label: 'FOOD' },
                { id: 'daily', icon: Calendar, label: 'DAILY' },
                { id: 'goal', icon: Settings, label: 'GOALS' },
              ].map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as Page)}
                    className="relative flex flex-col items-center gap-1 transition-all min-w-[64px]"
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-dot"
                        className="absolute -top-1.5 w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"
                      />
                    )}
                    <div className={`p-1.5 rounded-2xl transition-all ${
                      isActive ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-500'
                    }`}>
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[9px] font-bold tracking-widest transition-colors ${
                      isActive ? 'text-emerald-500' : 'text-slate-500'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}
