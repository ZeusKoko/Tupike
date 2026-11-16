import { FilterOptions, MealRecipe, ShoppingListItem, SuggestMealsResponse } from '../types';

interface SuggestMealsPayload {
  ingredients: string[];
  budgetKsh?: number | null;
  filters: FilterOptions;
}

function normalizeMeal(meal: any, idx: number, defaultServings: number): MealRecipe {
  const shoppingList: ShoppingListItem[] = Array.isArray(meal?.shoppingList)
    ? meal.shoppingList
        .filter((item: any) => item && typeof item.item === 'string')
        .map((item: any) => ({
          item: String(item.item).trim(),
          quantity: String(item.quantity || '1 portion').trim(),
          price: Math.max(0, Math.round(Number(item.price) || 0)),
          isApproximate: Boolean(item.isApproximate),
        }))
    : [];

  const computedSum = shoppingList.reduce((acc, s) => acc + s.price, 0);
  const estimatedCost =
    shoppingList.length > 0
      ? computedSum
      : Math.max(0, Math.round(Number(meal?.estimatedCost) || 0));

  const safeName = String(meal?.name || 'Delicious Kenyan Dish');

  return {
    id:
      meal?.id ||
      `meal-${Date.now()}-${idx}-${safeName.replace(/\s+/g, '-').toLowerCase()}`,
    name: safeName,
    localName: String(meal?.localName || 'Chakula Kitamu'),
    description: String(meal?.description || 'A hearty home cooked meal.'),
    timeMinutes: Number(meal?.timeMinutes) || 30,
    servings: Number(meal?.servings) || defaultServings || 4,
    difficulty: (meal?.difficulty === 'Medium' ? 'Medium' : 'Easy') as 'Easy' | 'Medium',
    ingredientsUserHas: Array.isArray(meal?.ingredientsUserHas)
      ? meal.ingredientsUserHas
      : [],
    ingredientsMissing: Array.isArray(meal?.ingredientsMissing)
      ? meal.ingredientsMissing
      : [],
    ingredients: Array.isArray(meal?.ingredients) ? meal.ingredients : [],
    steps: Array.isArray(meal?.steps) ? meal.steps : [],
    tip: String(meal?.tip || 'Cook on gentle heat to lock in natural flavors.'),
    estimatedCost,
    shoppingList,
  };
}

export async function fetchSuggestedMeals(
  payload: SuggestMealsPayload
): Promise<SuggestMealsResponse> {
  const { ingredients, budgetKsh, filters } = payload;

  const response = await fetch('/api/suggest-meals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ingredients,
      budgetKsh: budgetKsh && budgetKsh > 0 ? Math.round(budgetKsh) : null,
      timeLimit: filters.timeLimit,
      servings: filters.servings,
      cookingSetup: filters.cookingSetup,
      useExpiringSoon: filters.useExpiringSoon,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || 'Could not fetch meal suggestions. Please try again.'
    );
  }

  const data = await response.json();
  const rawMeals = Array.isArray(data.meals) ? data.meals : [];
  const meals = rawMeals.map((m: any, idx: number) =>
    normalizeMeal(m, idx, filters.servings)
  );

  const lowestCostMeal = data.lowestCostMeal
    ? normalizeMeal(data.lowestCostMeal, 99, filters.servings)
    : null;

  return {
    meals,
    budgetKsh: typeof data.budgetKsh === 'number' ? data.budgetKsh : null,
    budgetTooLow: Boolean(data.budgetTooLow),
    suggestedMinBudget:
      typeof data.suggestedMinBudget === 'number'
        ? data.suggestedMinBudget
        : lowestCostMeal?.estimatedCost,
    lowestCostMeal,
    friendlyBudgetMessage: data.friendlyBudgetMessage || undefined,
  };
}
