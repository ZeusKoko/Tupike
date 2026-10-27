export interface IngredientItem {
  id: string;
  name: string;
  swahiliName?: string;
  category: 'vegetables' | 'proteins' | 'grains' | 'fruit_others';
  emoji: string;
  aliases: string[]; // for bilingual search (English + Swahili)
}

export interface FilterOptions {
  timeLimit: 'Under 20 minutes' | '30 minutes' | '1 hour or more' | 'Any time';
  servings: number;
  cookingSetup: 'One burner' | 'Two burners' | 'Jiko' | 'Has an oven';
  useExpiringSoon: boolean;
}

export interface MealRecipe {
  id: string;
  name: string;
  localName: string;
  description: string;
  timeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium';
  ingredientsUserHas: string[];
  ingredientsMissing: string[];
  ingredients: string[];
  steps: string[];
  tip: string;
  savedAt?: number;
}
