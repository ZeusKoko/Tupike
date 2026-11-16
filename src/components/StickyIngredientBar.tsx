import React from 'react';
import { X, ChefHat, Wallet } from 'lucide-react';

interface StickyIngredientBarProps {
  selectedIngredients: string[];
  budgetKsh: number | null;
  onBudgetChange: (value: number | null) => void;
  onRemoveIngredient: (name: string) => void;
  onClearAll: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const BUDGET_PRESETS = [100, 200, 500];

export const StickyIngredientBar: React.FC<StickyIngredientBarProps> = ({
  selectedIngredients,
  budgetKsh,
  onBudgetChange,
  onRemoveIngredient,
  onClearAll,
  onSubmit,
  isLoading,
}) => {
  const count = selectedIngredients.length;
  const hasValidBudget = budgetKsh !== null && budgetKsh > 0;
  const canSubmit = count > 0 || hasValidBudget;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onBudgetChange(null);
      return;
    }
    const num = Math.floor(Number(raw));
    if (!Number.isNaN(num) && num >= 0) {
      onBudgetChange(num === 0 ? null : Math.min(num, 100000));
    }
  };

  return (
    <div className="fixed bottom-14 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-[#25671E]/20 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] py-2.5 px-4">
      <div className="max-w-2xl mx-auto space-y-2">
        {/* Selected ingredients header & chips */}
        {count > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#25671E] mb-1">
              <div className="flex items-center gap-1.5">
                <span>Your ingredients</span>
                <span className="text-stone-400" aria-hidden="true">·</span>
                <span className="text-[#48A111] font-extrabold tabular-nums">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                type="button"
                onClick={onClearAll}
                className="text-stone-500 hover:text-red-700 text-xs font-semibold underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {selectedIngredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1 bg-[#25671E] text-white text-xs font-bold pl-2.5 pr-1.5 py-1 rounded-full shadow-xs shrink-0"
                >
                  <span className="whitespace-nowrap">{ing}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveIngredient(ing)}
                    className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors ml-0.5"
                    aria-label={`Remove ${ing}`}
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-stone-600 font-semibold leading-tight">
            No home ingredients picked yet — add items above or set a budget below.
          </p>
        )}

        {/* Budget in KSh Field (directly above "What can I cook?") */}
        <div className="bg-[#F7F0F0] border border-[#25671E]/15 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <label
              htmlFor="budget-ksh-input"
              className="flex items-center gap-1 text-xs font-extrabold text-[#25671E] whitespace-nowrap shrink-0"
            >
              <Wallet size={14} className="text-[#48A111]" />
              <span>Budget in KSh</span>
            </label>
            <div className="relative flex-1 max-w-[120px]">
              <input
                id="budget-ksh-input"
                type="number"
                min={0}
                inputMode="numeric"
                value={budgetKsh ?? ''}
                onChange={handleInputChange}
                placeholder="Optional"
                className="w-full bg-white border border-[#25671E]/25 focus:border-[#48A111] focus:ring-2 focus:ring-[#48A111]/20 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-[#25671E] placeholder:text-stone-400 placeholder:font-medium outline-none tabular-nums"
              />
              {hasValidBudget && (
                <button
                  type="button"
                  onClick={() => onBudgetChange(null)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#25671E] p-0.5"
                  aria-label="Clear budget"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {/* Quick preset chips: 100, 200, 500 */}
          <div className="flex items-center gap-1.5 shrink-0">
            {BUDGET_PRESETS.map((preset) => {
              const isSelected = budgetKsh === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onBudgetChange(isSelected ? null : preset)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold tabular-nums transition-all active:scale-95 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#25671E] text-white shadow-xs'
                      : 'bg-white text-[#25671E] border border-[#25671E]/20 hover:border-[#48A111]'
                  }`}
                  aria-pressed={isSelected}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big "What can I cook?" Button */}
        <button
          type="button"
          disabled={!canSubmit || isLoading}
          onClick={onSubmit}
          className={`w-full py-3 px-5 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] min-h-[46px] ${
            !canSubmit
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
              : 'bg-[#F2B50B] text-[#25671E] hover:bg-[#e4aa0a] shadow-md hover:shadow-lg ring-2 ring-[#25671E]/20'
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
              {canSubmit && (
                <span className="bg-[#25671E] text-white text-xs px-2.5 py-0.5 rounded-full font-extrabold ml-1 tabular-nums">
                  {count > 0 && hasValidBudget
                    ? `${count} · KSh ${budgetKsh}`
                    : hasValidBudget
                      ? `KSh ${budgetKsh}`
                      : count}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
