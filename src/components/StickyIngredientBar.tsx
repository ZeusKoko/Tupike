import React from 'react';
import { X, Sparkles, ChefHat } from 'lucide-react';

interface StickyIngredientBarProps {
  selectedIngredients: string[];
  onRemoveIngredient: (name: string) => void;
  onClearAll: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const StickyIngredientBar: React.FC<StickyIngredientBarProps> = ({
  selectedIngredients,
  onRemoveIngredient,
  onClearAll,
  onSubmit,
  isLoading,
}) => {
  const count = selectedIngredients.length;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-[#25671E]/20 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] py-3 px-4">
      <div className="max-w-2xl mx-auto space-y-2.5">
        {/* Selected ingredients header & chips */}
        <div className="flex items-center justify-between text-xs font-bold text-[#25671E]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#48A111] animate-pulse" />
            <span>Your Ingredients</span>
            <span className="bg-[#25671E]/10 text-[#25671E] px-2 py-0.5 rounded-full text-[11px] font-extrabold">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </div>
          {count > 0 && (
            <button
              onClick={onClearAll}
              className="text-stone-500 hover:text-red-600 text-xs font-semibold underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Scrollable chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 min-h-[36px]">
          {count === 0 ? (
            <p className="text-xs text-stone-500 italic">
              Tap any food item below or type above to add...
            </p>
          ) : (
            selectedIngredients.map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center gap-1 bg-[#25671E] text-white text-xs font-bold pl-2.5 pr-1.5 py-1 rounded-full shadow-xs shrink-0 animate-in fade-in zoom-in-95 duration-100"
              >
                <span>{ing}</span>
                <button
                  type="button"
                  onClick={() => onRemoveIngredient(ing)}
                  className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors ml-0.5"
                  aria-label={`Remove ${ing}`}
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Big "What can I cook?" Button */}
        <button
          type="button"
          disabled={count === 0 || isLoading}
          onClick={onSubmit}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
            count === 0
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
              : 'bg-[#F2B50B] text-[#25671E] hover:bg-[#e4aa0a] hover:shadow-lg ring-2 ring-[#25671E]/20'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-3 border-[#25671E] border-t-transparent rounded-full animate-spin" />
              <span>Cooking up ideas...</span>
            </>
          ) : (
            <>
              <ChefHat size={20} className="text-[#25671E]" />
              <span>What can I cook?</span>
              {count > 0 && (
                <span className="bg-[#25671E] text-white text-xs px-2 py-0.5 rounded-full font-extrabold ml-1">
                  {count}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
