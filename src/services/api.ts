import { FilterOptions, MealRecipe } from '../types';

interface SuggestMealsPayload {
  ingredients: string[];
  filters: FilterOptions;
}

export async function fetchSuggestedMeals(payload: SuggestMealsPayload): Promise<MealRecipe[]> {
  const { ingredients, filters } = payload;

  const response = await fetch('/api/suggest-meals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ingredients,
      timeLimit: filters.timeLimit,
      servings: filters.servings,
      cookingSetup: filters.cookingSetup,
      useExpiringSoon: filters.useExpiringSoon,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Could not fetch meal suggestions. Please try again.');
  }

  const data = await response.json();
  const rawMeals = Array.isArray(data.meals) ? data.meals : [];

  return rawMeals.map((meal: any, idx: number) => ({
    id: meal.id || `meal-${Date.now()}-${idx}-${meal.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: meal.name || 'Delicious Kenyan Dish',
    localName: meal.localName || 'Chakula Kitamu',
    description: meal.description || 'A hearty home cooked meal.',
    timeMinutes: Number(meal.timeMinutes) || 30,
    servings: Number(meal.servings) || filters.servings || 4,
    difficulty: (meal.difficulty === 'Medium' ? 'Medium' : 'Easy') as 'Easy' | 'Medium',
    ingredientsUserHas: Array.isArray(meal.ingredientsUserHas) ? meal.ingredientsUserHas : [],
    ingredientsMissing: Array.isArray(meal.ingredientsMissing) ? meal.ingredientsMissing : [],
    ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
    steps: Array.isArray(meal.steps) ? meal.steps : [],
    tip: meal.tip || 'Cook on gentle heat to lock in natural flavors.',
  }));
}
