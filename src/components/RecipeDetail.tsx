import React from 'react';
import {
  ChevronLeft,
  Heart,
  Clock,
  Users,
  Flame,
  Check,
  Lightbulb,
  Share2,
  ChefHat,
  ShieldAlert,
} from 'lucide-react';
import { MealRecipe } from '../types';

interface RecipeDetailProps {
  recipe: MealRecipe;
  onBack: () => void;
  onToggleFavorite: (recipe: MealRecipe) => void;
  isSaved: boolean;
  userIngredients: string[];
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onBack,
  onToggleFavorite,
  isSaved,
  userIngredients,
}) => {
  // Check if an ingredient item matches what user has
  const checkHasIngredient = (itemStr: string) => {
    const lowerItem = itemStr.toLowerCase();
    // User ingredients check
    const matchUser = userIngredients.some((u) => lowerItem.includes(u.toLowerCase()));
    // Check if recorded in recipe.ingredientsUserHas
    const matchRecorded = recipe.ingredientsUserHas?.some((u) => lowerItem.includes(u.toLowerCase()));
    return matchUser || matchRecorded;
  };

  const isBasicStaple = (itemStr: string) => {
    return /salt|chumvi|oil|mafuta|water|maji|onion|kitunguu|curry|royco|pepper/i.test(itemStr);
  };

  return (
    <div className="pb-32 pt-3 max-w-2xl mx-auto px-4">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-4 sticky top-14 z-10 bg-[#F7F0F0]/95 backdrop-blur-xs py-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#25671E] bg-white border border-[#25671E]/15 hover:border-[#48A111] py-2 px-3 rounded-xl shadow-2xs transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={() => onToggleFavorite(recipe)}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 ${
            isSaved
              ? 'bg-[#F2B50B] text-[#25671E]'
              : 'bg-white text-[#25671E] border border-[#25671E]/20 hover:border-[#48A111]'
          }`}
        >
          <Heart
            size={16}
            className={isSaved ? 'fill-[#25671E] text-[#25671E]' : 'text-[#25671E]'}
          />
          <span>{isSaved ? 'Saved in Favorites' : 'Save to Favorites'}</span>
        </button>
      </div>

      {/* Main Recipe Card Header */}
      <div className="bg-white rounded-3xl p-5 border-2 border-[#25671E]/15 shadow-sm mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {recipe.localName && (
            <span className="text-xs font-extrabold text-[#25671E] bg-[#48A111]/15 px-2.5 py-1 rounded-lg">
              {recipe.localName}
            </span>
          )}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
            recipe.difficulty === 'Easy'
              ? 'bg-emerald-100 text-[#25671E]'
              : 'bg-amber-100 text-amber-900'
          }`}>
            {recipe.difficulty} Level
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#25671E] tracking-tight leading-tight mb-2">
          {recipe.name}
        </h1>

        <p className="text-sm text-stone-700 leading-relaxed mb-4">
          {recipe.description}
        </p>

        {/* Quick metrics grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-100 text-center">
          <div className="bg-[#F7F0F0] p-2.5 rounded-2xl">
            <Clock size={16} className="text-[#48A111] mx-auto mb-1" />
            <div className="text-[11px] font-bold text-stone-500 uppercase">Prep & Cook</div>
            <div className="text-xs sm:text-sm font-black text-[#25671E]">
              {recipe.timeMinutes} mins
            </div>
          </div>

          <div className="bg-[#F7F0F0] p-2.5 rounded-2xl">
            <Users size={16} className="text-[#48A111] mx-auto mb-1" />
            <div className="text-[11px] font-bold text-stone-500 uppercase">Servings</div>
            <div className="text-xs sm:text-sm font-black text-[#25671E]">
              {recipe.servings} people
            </div>
          </div>

          <div className="bg-[#F7F0F0] p-2.5 rounded-2xl">
            <Flame size={16} className="text-[#48A111] mx-auto mb-1" />
            <div className="text-[11px] font-bold text-stone-500 uppercase">Kitchen Setup</div>
            <div className="text-xs sm:text-sm font-black text-[#25671E]">
              1-2 Burners
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients List */}
      <div className="bg-white rounded-3xl p-5 border-2 border-[#25671E]/15 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-[#25671E] flex items-center gap-2">
            <span>🥗</span>
            <span>Ingredients Needed</span>
          </h2>
          <span className="text-xs font-bold text-stone-500">
            {recipe.ingredients.length} items
          </span>
        </div>

        <div className="space-y-2">
          {recipe.ingredients.map((ing, idx) => {
            const userHasIt = checkHasIngredient(ing);
            const isStaple = isBasicStaple(ing);

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F0F0] text-xs font-semibold text-[#25671E]"
              >
                <div className="flex items-center gap-2.5 pr-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    userHasIt
                      ? 'bg-[#48A111] text-white'
                      : isStaple
                      ? 'bg-[#25671E]/20 text-[#25671E]'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {userHasIt || isStaple ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <span className="text-[10px] font-bold">!</span>
                    )}
                  </span>
                  <span className="leading-tight">{ing}</span>
                </div>

                <div className="shrink-0 text-[10px] font-bold">
                  {userHasIt ? (
                    <span className="text-[#48A111] bg-emerald-100 px-2 py-0.5 rounded-full">
                      In kitchen
                    </span>
                  ) : isStaple ? (
                    <span className="text-[#25671E] bg-[#25671E]/10 px-2 py-0.5 rounded-full">
                      Pantry staple
                    </span>
                  ) : (
                    <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                      Extra
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step by Step Instructions */}
      <div className="bg-white rounded-3xl p-5 border-2 border-[#25671E]/15 shadow-sm mb-4">
        <h2 className="text-lg font-black text-[#25671E] flex items-center gap-2 mb-3">
          <span>👩🏽‍🍳</span>
          <span>Step-by-Step Instructions</span>
        </h2>

        <div className="space-y-4">
          {recipe.steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              <span className="w-7 h-7 rounded-full bg-[#25671E] text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pt-0.5">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chef's Practical Tip */}
      {recipe.tip && (
        <div className="bg-[#F2B50B]/20 border-2 border-[#F2B50B] rounded-3xl p-4 shadow-sm mb-6 flex items-start gap-3">
          <div className="p-2 bg-[#F2B50B] rounded-xl text-[#25671E] shrink-0">
            <Lightbulb size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#25671E] mb-1">
              Cook&apos;s Pro Tip
            </h3>
            <p className="text-xs text-stone-800 leading-relaxed font-semibold">
              {recipe.tip}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons at bottom of recipe */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-[#25671E] text-[#25671E] font-black text-xs hover:bg-[#25671E]/5 transition-colors text-center"
        >
          Back to Recipes
        </button>

        <button
          onClick={() => onToggleFavorite(recipe)}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 ${
            isSaved
              ? 'bg-[#F2B50B] text-[#25671E]'
              : 'bg-[#25671E] text-white hover:bg-[#1b4d16]'
          }`}
        >
          <Heart size={16} className={isSaved ? 'fill-[#25671E]' : ''} />
          <span>{isSaved ? 'Saved in Favorites' : 'Save to Favorites'}</span>
        </button>
      </div>
    </div>
  );
};
