import React, { useEffect, useState } from 'react';
import {
  Clock,
  Users,
  Heart,
  RefreshCw,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  ArrowRight,
} from 'lucide-react';
import { MealRecipe } from '../types';

interface MealResultsProps {
  meals: MealRecipe[];
  isLoading: boolean;
  error: string | null;
  onSelectMeal: (meal: MealRecipe) => void;
  onToggleFavorite: (meal: MealRecipe) => void;
  isSaved: (mealIdOrName: string) => boolean;
  onRetry: () => void;
  onBackToIngredients: () => void;
  selectedIngredients: string[];
}

const LOADING_MESSAGES = [
  'Checking your kitchen ingredients...',
  'Balancing one or two burner steps...',
  'Talking to our Kenyan home cook...',
  'Simmering 3 tasty ideas for you...',
];

export const MealResults: React.FC<MealResultsProps> = ({
  meals,
  isLoading,
  error,
  onSelectMeal,
  onToggleFavorite,
  isSaved,
  onRetry,
  onBackToIngredients,
  selectedIngredients,
}) => {
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center max-w-md mx-auto">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-[#25671E] flex items-center justify-center text-4xl shadow-lg ring-4 ring-[#48A111]/30 animate-bounce">
            🍲
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#F2B50B] text-[#25671E] flex items-center justify-center font-black shadow-xs">
            <ChefHat size={16} />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-[#25671E] mb-2 font-['Poppins']">
          Tupike nini leo?
        </h2>
        <p className="text-sm font-bold text-[#48A111] transition-all duration-300 min-h-[24px]">
          {LOADING_MESSAGES[loadingMsgIdx]}
        </p>

        {/* Progress bar accent */}
        <div className="w-48 h-2 bg-stone-200 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#25671E] via-[#48A111] to-[#F2B50B] rounded-full animate-pulse w-3/4" />
        </div>

        <p className="text-xs text-stone-600 mt-4 max-w-xs">
          Designing 3 practical Kenyan recipes from your {selectedIngredients.length} ingredients.
        </p>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-lg font-black text-[#25671E] mb-2">
          Pole sana! (Sorry about that)
        </h2>
        <p className="text-sm text-stone-600 mb-6">
          {error}
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onBackToIngredients}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-[#25671E] text-[#25671E] font-bold text-xs hover:bg-[#25671E]/5 transition-colors"
          >
            Edit Ingredients
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-[#25671E] text-white font-bold text-xs hover:bg-[#1b4d16] flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-4 max-w-2xl mx-auto px-4">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBackToIngredients}
          className="flex items-center gap-1 text-xs font-bold text-[#25671E] hover:text-[#48A111] transition-colors py-1.5 px-2.5 rounded-lg bg-white border border-[#25671E]/15 shadow-2xs"
        >
          <ChevronLeft size={16} />
          <span>Change Ingredients</span>
        </button>

        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs font-extrabold text-[#25671E] bg-[#F2B50B] hover:bg-[#e4aa0a] py-1.5 px-3 rounded-full transition-all shadow-xs"
        >
          <RefreshCw size={13} />
          <span>Try different suggestions</span>
        </button>
      </div>

      {/* Screen title */}
      <div className="mb-4">
        <h1 className="text-2xl font-black text-[#25671E] tracking-tight">
          3 Meals You Can Cook
        </h1>
        <p className="text-xs text-stone-600 mt-0.5">
          Based on your {selectedIngredients.length} ingredients + pantry staples. Tap any card for full recipe!
        </p>
      </div>

      {/* 3 Recipe Cards */}
      <div className="space-y-4">
        {meals.map((meal, index) => {
          const favorite = isSaved(meal.id) || isSaved(meal.name);
          const hasMissing = meal.ingredientsMissing && meal.ingredientsMissing.length > 0;

          return (
            <div
              key={meal.id || index}
              onClick={() => onSelectMeal(meal)}
              className="group relative bg-white rounded-2xl border-2 border-[#25671E]/15 hover:border-[#48A111] p-4 shadow-sm hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.99]"
            >
              {/* Header row inside card */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#25671E] text-white text-[11px] font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    {meal.localName && (
                      <span className="text-[11px] font-extrabold text-[#25671E] bg-[#48A111]/15 px-2 py-0.5 rounded-md">
                        {meal.localName}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      meal.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-[#25671E]'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {meal.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-[#25671E] leading-snug group-hover:text-[#48A111] transition-colors">
                    {meal.name}
                  </h3>
                </div>

                {/* Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(meal);
                  }}
                  className={`p-2 rounded-xl transition-transform active:scale-90 ${
                    favorite
                      ? 'bg-[#F2B50B] text-[#25671E] shadow-xs'
                      : 'bg-stone-100 text-stone-400 hover:text-[#25671E] hover:bg-stone-200'
                  }`}
                  aria-label={favorite ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Heart
                    size={20}
                    className={favorite ? 'fill-[#25671E] text-[#25671E]' : ''}
                  />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                {meal.description}
              </p>

              {/* Meta stats: time, servings */}
              <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-stone-100 text-xs text-stone-700 font-bold">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#48A111]" />
                  <span>{meal.timeMinutes} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#48A111]" />
                  <span>{meal.servings} servings</span>
                </div>
              </div>

              {/* Ingredients match status */}
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                {!hasMissing ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#25671E]">
                    <CheckCircle2 size={15} className="text-[#48A111]" />
                    <span>You have everything!</span>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F2B50B]" />
                    <span>
                      Missing: <span className="font-bold">{meal.ingredientsMissing.slice(0, 2).join(', ')}</span>
                      {meal.ingredientsMissing.length > 2 && ` +${meal.ingredientsMissing.length - 2} more`}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs font-bold text-[#25671E] group-hover:translate-x-0.5 transition-transform">
                  <span>View Recipe</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Try Different Suggestions button */}
      <div className="mt-6 text-center">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#25671E] text-white text-xs font-black hover:bg-[#1b4d16] shadow-sm transition-all active:scale-95"
        >
          <RefreshCw size={14} />
          <span>Give me 3 different ideas</span>
        </button>
      </div>
    </div>
  );
};
