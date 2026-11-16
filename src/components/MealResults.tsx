import React, { useEffect, useState } from 'react';
import {
  Clock,
  Users,
  Heart,
  RefreshCw,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  ArrowRight,
  Wallet,
  Info,
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
  activeBudgetKsh: number | null;
  budgetTooLow: boolean;
  suggestedMinBudget?: number;
  lowestCostMeal?: MealRecipe | null;
  friendlyBudgetMessage?: string;
  onApplySuggestedBudget?: (minBudget: number) => void;
}

const LOADING_MESSAGES = [
  'Checking your kitchen & local prices...',
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
  activeBudgetKsh,
  budgetTooLow,
  suggestedMinBudget,
  lowestCostMeal,
  friendlyBudgetMessage,
  onApplySuggestedBudget,
}) => {
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const hasBudget = activeBudgetKsh !== null && activeBudgetKsh > 0;

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

        <div className="w-48 h-2 bg-stone-200 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#25671E] via-[#48A111] to-[#F2B50B] rounded-full animate-pulse w-3/4" />
        </div>

        <p className="text-xs text-stone-600 mt-4 max-w-xs">
          {selectedIngredients.length === 0 && hasBudget
            ? `Planning 3 realistic Kenyan meals within your KSh ${activeBudgetKsh} budget.`
            : hasBudget
              ? `Combining your ${selectedIngredients.length} items with a KSh ${activeBudgetKsh} budget.`
              : `Designing 3 practical Kenyan recipes from your ${selectedIngredients.length} ingredients.`}
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
        <p className="text-sm text-stone-600 mb-6">{error}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onBackToIngredients}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-[#25671E] text-[#25671E] font-bold text-xs hover:bg-[#25671E]/5 transition-colors"
          >
            Back Home
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

  // Reusable Meal Card Renderer
  const renderMealCard = (
    meal: MealRecipe,
    index: number,
    options?: { isLowestSuggestion?: boolean }
  ) => {
    const favorite = isSaved(meal.id) || isSaved(meal.name);
    const toBuyCount = meal.shoppingList?.length ?? 0;
    const hasMissing = toBuyCount > 0 || (meal.ingredientsMissing?.length ?? 0) > 0;
    const isWithinBudget =
      hasBudget && !options?.isLowestSuggestion && meal.estimatedCost <= activeBudgetKsh!;

    const costLabel =
      meal.estimatedCost === 0
        ? 'KSh 0 extra'
        : `About KSh ${meal.estimatedCost}`;

    return (
      <div
        key={meal.id || index}
        onClick={() => onSelectMeal(meal)}
        className="group relative bg-white rounded-2xl border-2 border-[#25671E]/15 hover:border-[#48A111] p-4 shadow-sm hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.99]"
      >
        {/* Header row inside card */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {!options?.isLowestSuggestion && (
                <span className="w-5 h-5 rounded-full bg-[#25671E] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
              )}
              {meal.localName && (
                <span className="text-[11px] font-extrabold text-[#25671E] bg-[#48A111]/15 px-2 py-0.5 rounded-md">
                  {meal.localName}
                </span>
              )}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  meal.difficulty === 'Easy'
                    ? 'bg-emerald-100 text-[#25671E]'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
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
            className={`p-2 rounded-xl transition-transform active:scale-90 shrink-0 ${
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

        {/* Budget & Cost Row */}
        <div className="flex items-center flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center gap-1 bg-[#F2B50B] text-[#25671E] text-xs font-black px-2.5 py-1 rounded-lg tabular-nums">
            <Wallet size={12} className="text-[#25671E]" />
            <span>{costLabel}</span>
          </span>

          {isWithinBudget && (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-[#25671E] text-[11px] font-extrabold px-2.5 py-1 rounded-lg">
              <CheckCircle2 size={12} className="text-[#48A111]" />
              <span>Within your budget</span>
            </span>
          )}
        </div>

        {/* Meta stats: time, servings */}
        <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-stone-100 text-xs text-stone-700 font-bold tabular-nums">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#48A111]" />
            <span>{meal.timeMinutes} mins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-[#48A111]" />
            <span>{meal.servings} servings</span>
          </div>
        </div>

        {/* Ingredients / Shopping summary */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          {!hasMissing ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#25671E]">
              <CheckCircle2 size={15} className="text-[#48A111] shrink-0" />
              <span>You have everything!</span>
            </div>
          ) : (
            <div className="text-xs font-semibold text-[#25671E] flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#F2B50B] shrink-0" />
              <span className="truncate">
                {selectedIngredients.length === 0 ? 'To buy: ' : 'You are missing: '}
                <span className="font-bold">
                  {toBuyCount > 0
                    ? meal.shoppingList
                        .slice(0, 2)
                        .map((s) => s.item)
                        .join(', ')
                    : meal.ingredientsMissing.slice(0, 2).join(', ')}
                </span>
                {(toBuyCount > 2 || meal.ingredientsMissing.length > 2) &&
                  ` +${Math.max(toBuyCount, meal.ingredientsMissing.length) - 2} more`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs font-bold text-[#25671E] group-hover:translate-x-0.5 transition-transform shrink-0">
            <span>View Recipe</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>
    );
  };

  // Too-Small Budget Friendly Screen
  if (budgetTooLow) {
    return (
      <div className="pb-28 pt-4 max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToIngredients}
            className="flex items-center gap-1 text-xs font-bold text-[#25671E] hover:text-[#48A111] transition-colors py-1.5 px-2.5 rounded-lg bg-white border border-[#25671E]/15 shadow-2xs"
          >
            <ChevronLeft size={16} />
            <span>Adjust Budget or Kitchen</span>
          </button>
        </div>

        {/* Friendly Notice Card */}
        <div className="bg-white rounded-3xl border-2 border-[#F2B50B] p-5 shadow-sm mb-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F2B50B] text-[#25671E] flex items-center justify-center text-2xl shrink-0">
              🧺
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-black text-[#25671E]">
                Your budget is a bit tight for a full meal
              </h1>
              <p className="text-xs sm:text-sm text-stone-700 mt-1 leading-relaxed">
                {friendlyBudgetMessage ||
                  `KSh ${activeBudgetKsh} is slightly too small to buy ingredients for a sensible meal right now.`}
              </p>

              {suggestedMinBudget && (
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <div className="bg-[#F7F0F0] px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#25671E] tabular-nums">
                    Suggested minimum: KSh {suggestedMinBudget}
                  </div>
                  {onApplySuggestedBudget && (
                    <button
                      type="button"
                      onClick={() => onApplySuggestedBudget(suggestedMinBudget)}
                      className="bg-[#25671E] hover:bg-[#1b4d16] text-white text-xs font-black px-4 py-2 rounded-xl transition-all active:scale-95 shadow-xs"
                    >
                      Search with KSh {suggestedMinBudget}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lowest Cost Meal Option */}
        {lowestCostMeal && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#25671E] uppercase tracking-wider">
                Lowest-cost option you can make
              </h2>
            </div>
            {renderMealCard(lowestCostMeal, 0, { isLowestSuggestion: true })}
          </div>
        )}

        <p className="text-[11px] text-stone-600 mt-4 flex items-center gap-1.5">
          <Info size={13} className="text-[#48A111] shrink-0" />
          <span>Prices are estimates and can differ in your area.</span>
        </p>
      </div>
    );
  }

  // Standard Results Screen
  return (
    <div className="pb-28 pt-4 max-w-2xl mx-auto px-4">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={onBackToIngredients}
          className="flex items-center gap-1 text-xs font-bold text-[#25671E] hover:text-[#48A111] transition-colors py-1.5 px-2.5 rounded-lg bg-white border border-[#25671E]/15 shadow-2xs"
        >
          <ChevronLeft size={16} />
          <span>Change Inputs</span>
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
      <div className="mb-3">
        <h1 className="text-2xl font-black text-[#25671E] tracking-tight">
          {meals.length === 1
            ? '1 Meal Within Your Budget'
            : `${meals.length} Meals You Can Cook`}
        </h1>
        <p className="text-xs text-stone-600 mt-0.5">
          {selectedIngredients.length === 0 && hasBudget
            ? `Shopping from scratch within KSh ${activeBudgetKsh} + free home staples. Tap any card for recipe & shopping list.`
            : hasBudget
              ? `Using your ${selectedIngredients.length} home items + up to KSh ${activeBudgetKsh} extra. Tap any card for full recipe!`
              : `Based on your ${selectedIngredients.length} ingredients + pantry staples. Tap any card for full recipe!`}
        </p>
      </div>

      {/* Price estimate note */}
      <div className="mb-4 flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 bg-white/80 border border-[#25671E]/10 px-3 py-2 rounded-xl">
        <Info size={13} className="text-[#48A111] shrink-0" />
        <span>Prices are estimates and can differ in your area.</span>
      </div>

      {/* Meal Cards */}
      <div className="space-y-4">
        {meals.map((meal, index) => renderMealCard(meal, index))}
      </div>

      {/* Bottom Try Different Suggestions button */}
      <div className="mt-6 text-center">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#25671E] text-white text-xs font-black hover:bg-[#1b4d16] shadow-sm transition-all active:scale-95"
        >
          <RefreshCw size={14} />
          <span>Give me {meals.length < 3 ? 'new' : '3 different'} ideas</span>
        </button>
      </div>
    </div>
  );
};
