import React from 'react';
import { Heart, Clock, Users, Trash2, ArrowRight, ChefHat, Sparkles } from 'lucide-react';
import { MealRecipe } from '../types';

interface FavoritesListProps {
  favorites: MealRecipe[];
  onSelectMeal: (meal: MealRecipe) => void;
  onRemoveFavorite: (idOrName: string) => void;
  onGoToHome: () => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  onSelectMeal,
  onRemoveFavorite,
  onGoToHome,
}) => {
  return (
    <div className="pb-28 pt-4 max-w-2xl mx-auto px-4">
      {/* Title & Storage Notice */}
      <div className="mb-4">
        <h1 className="text-2xl font-black text-[#25671E] tracking-tight flex items-center gap-2">
          <Heart size={22} className="fill-[#F2B50B] text-[#25671E]" />
          <span>My Favorite Recipes</span>
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Your saved dishes ready anytime, even when you have low network.
        </p>
      </div>

      {/* Mandatory note: "Your favorites are saved on this phone and browser." */}
      <div className="mb-5 bg-emerald-50/80 border border-[#48A111]/30 rounded-2xl p-3 flex items-center gap-2 text-xs text-[#25671E]">
        <span className="text-base">📱</span>
        <span className="font-semibold">
          Your favorites are saved on this phone and browser. No account needed.
        </span>
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border-2 border-dashed border-[#25671E]/20">
          <div className="w-16 h-16 rounded-3xl bg-[#F7F0F0] text-[#25671E] flex items-center justify-center text-3xl mb-3 shadow-inner">
            🥘
          </div>
          <h2 className="text-base font-extrabold text-[#25671E] mb-1">
            No saved recipes yet
          </h2>
          <p className="text-xs text-stone-600 max-w-xs mb-5 leading-relaxed">
            Whenever you find a meal suggestion you love, tap the heart icon to save it here forever on your phone.
          </p>
          <button
            onClick={onGoToHome}
            className="py-3 px-6 rounded-2xl bg-[#25671E] text-white text-xs font-black hover:bg-[#1b4d16] transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <ChefHat size={16} />
            <span>Find meals to cook</span>
          </button>
        </div>
      ) : (
        /* Saved Recipes Grid */
        <div className="space-y-3.5">
          {favorites.map((recipe, idx) => (
            <div
              key={recipe.id || idx}
              onClick={() => onSelectMeal(recipe)}
              className="group bg-white rounded-2xl border-2 border-[#25671E]/15 hover:border-[#48A111] p-4 shadow-sm hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {recipe.localName && (
                      <span className="text-[11px] font-extrabold text-[#25671E] bg-[#48A111]/15 px-2 py-0.5 rounded-md">
                        {recipe.localName}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-stone-500 bg-[#F7F0F0] px-2 py-0.5 rounded-md">
                      {recipe.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#25671E] leading-snug group-hover:text-[#48A111] transition-colors">
                    {recipe.name}
                  </h3>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(recipe.id || recipe.name);
                  }}
                  className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  aria-label="Remove from favorites"
                  title="Remove from favorites"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                {recipe.description}
              </p>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 text-xs font-bold text-stone-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-[#48A111]" />
                    {recipe.timeMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-[#48A111]" />
                    {recipe.servings} servings
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[#25671E] group-hover:translate-x-0.5 transition-transform text-xs font-black">
                  <span>Open Recipe</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
