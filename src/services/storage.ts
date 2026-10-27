import { MealRecipe } from '../types';

const STORAGE_KEY = 'tupike_favorites_v1';

export function getFavorites(): MealRecipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load favorites from localStorage', err);
    return [];
  }
}

export function saveFavorite(recipe: MealRecipe): MealRecipe[] {
  try {
    const existing = getFavorites();
    const alreadySaved = existing.some(r => r.id === recipe.id || r.name.toLowerCase() === recipe.name.toLowerCase());
    if (alreadySaved) return existing;

    const toSave: MealRecipe = {
      ...recipe,
      savedAt: recipe.savedAt || Date.now(),
    };
    const updated = [toSave, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save favorite', err);
    return getFavorites();
  }
}

export function removeFavorite(recipeIdOrName: string): MealRecipe[] {
  try {
    const existing = getFavorites();
    const updated = existing.filter(
      r => r.id !== recipeIdOrName && r.name.toLowerCase() !== recipeIdOrName.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to remove favorite', err);
    return getFavorites();
  }
}

export function isFavorite(recipeIdOrName: string, favorites: MealRecipe[]): boolean {
  return favorites.some(
    r => r.id === recipeIdOrName || r.name.toLowerCase() === recipeIdOrName.toLowerCase()
  );
}
