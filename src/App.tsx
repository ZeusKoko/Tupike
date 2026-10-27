import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IngredientPicker } from './components/IngredientPicker';
import { StickyIngredientBar } from './components/StickyIngredientBar';
import { MealResults } from './components/MealResults';
import { RecipeDetail } from './components/RecipeDetail';
import { FavoritesList } from './components/FavoritesList';
import { BottomNav } from './components/BottomNav';
import { FilterOptions, MealRecipe } from './types';
import { fetchSuggestedMeals } from './services/api';
import { getFavorites, saveFavorite, removeFavorite, isFavorite } from './services/storage';

type Screen = 'home' | 'results' | 'detail' | 'favorites';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');

  // Selected ingredients state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    'Sukuma Wiki (Kale)',
    'Tomatoes',
    'Eggs',
    'Maize Flour (Ugali)',
  ]);

  // Filters state
  const [filters, setFilters] = useState<FilterOptions>({
    timeLimit: '30 minutes',
    servings: 4,
    cookingSetup: 'One burner',
    useExpiringSoon: false,
  });

  // Generated meals state
  const [meals, setMeals] = useState<MealRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<MealRecipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Favorites state (loaded from localStorage)
  const [favorites, setFavorites] = useState<MealRecipe[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // Handle toggling ingredient selection
  const handleToggleIngredient = (name: string) => {
    setSelectedIngredients((prev) => {
      const exists = prev.some((i) => i.toLowerCase() === name.toLowerCase());
      if (exists) {
        return prev.filter((i) => i.toLowerCase() !== name.toLowerCase());
      } else {
        return [...prev, name];
      }
    });
  };

  // Add custom typed ingredient
  const handleAddCustomIngredient = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setSelectedIngredients((prev) => {
      if (prev.some((i) => i.toLowerCase() === clean.toLowerCase())) {
        return prev;
      }
      return [...prev, clean];
    });
  };

  // Remove individual ingredient chip
  const handleRemoveIngredient = (name: string) => {
    setSelectedIngredients((prev) =>
      prev.filter((i) => i.toLowerCase() !== name.toLowerCase())
    );
  };

  // Clear all ingredients
  const handleClearAllIngredients = () => {
    setSelectedIngredients([]);
  };

  // Trigger Gemini API call to get 3 meals
  const handleFindMeals = async () => {
    if (selectedIngredients.length === 0) return;

    setIsLoading(true);
    setError(null);
    setCurrentScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const results = await fetchSuggestedMeals({
        ingredients: selectedIngredients,
        filters,
      });
      setMeals(results);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Pole sana! Could not load recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open recipe details
  const handleSelectMeal = (meal: MealRecipe) => {
    setPreviousScreen(currentScreen);
    setSelectedRecipe(meal);
    setCurrentScreen('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle favorite recipe
  const handleToggleFavorite = (recipe: MealRecipe) => {
    const currentlySaved = isFavorite(recipe.id, favorites) || isFavorite(recipe.name, favorites);
    let updated: MealRecipe[];
    if (currentlySaved) {
      updated = removeFavorite(recipe.id || recipe.name);
    } else {
      updated = saveFavorite(recipe);
    }
    setFavorites(updated);
  };

  // Check if a recipe is saved in favorites
  const checkIsSaved = (idOrName: string) => {
    return isFavorite(idOrName, favorites);
  };

  // Navigation handlers
  const handleGoHome = () => {
    setCurrentScreen('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFavorites = () => {
    if (currentScreen !== 'favorites') {
      setPreviousScreen(currentScreen);
      setCurrentScreen('favorites');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackFromDetail = () => {
    if (previousScreen === 'favorites') {
      setCurrentScreen('favorites');
    } else {
      setCurrentScreen('results');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F0F0] text-[#25671E] flex flex-col font-['Nunito'] selection:bg-[#48A111]/20">
      {/* Top Header */}
      <Header
        favoritesCount={favorites.length}
        onOpenFavorites={handleOpenFavorites}
        onGoHome={handleGoHome}
        currentScreen={currentScreen}
      />

      {/* Main Screen Content */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <>
            <IngredientPicker
              selectedIngredients={selectedIngredients}
              onToggleIngredient={handleToggleIngredient}
              onAddCustomIngredient={handleAddCustomIngredient}
              filters={filters}
              onFiltersChange={setFilters}
            />
            <StickyIngredientBar
              selectedIngredients={selectedIngredients}
              onRemoveIngredient={handleRemoveIngredient}
              onClearAll={handleClearAllIngredients}
              onSubmit={handleFindMeals}
              isLoading={isLoading}
            />
          </>
        )}

        {currentScreen === 'results' && (
          <MealResults
            meals={meals}
            isLoading={isLoading}
            error={error}
            onSelectMeal={handleSelectMeal}
            onToggleFavorite={handleToggleFavorite}
            isSaved={checkIsSaved}
            onRetry={handleFindMeals}
            onBackToIngredients={handleGoHome}
            selectedIngredients={selectedIngredients}
          />
        )}

        {currentScreen === 'detail' && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={handleBackFromDetail}
            onToggleFavorite={handleToggleFavorite}
            isSaved={checkIsSaved(selectedRecipe.id || selectedRecipe.name)}
            userIngredients={selectedIngredients}
          />
        )}

        {currentScreen === 'favorites' && (
          <FavoritesList
            favorites={favorites}
            onSelectMeal={handleSelectMeal}
            onRemoveFavorite={(idOrName) => {
              const updated = removeFavorite(idOrName);
              setFavorites(updated);
            }}
            onGoToHome={handleGoHome}
          />
        )}
      </main>

      {/* Mobile-first bottom navigation bar */}
      <BottomNav
        currentScreen={currentScreen}
        favoritesCount={favorites.length}
        onNavigateHome={handleGoHome}
        onNavigateFavorites={handleOpenFavorites}
      />
    </div>
  );
}
