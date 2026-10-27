import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, Info, Sparkles, X } from 'lucide-react';
import { CATEGORIES, COMMON_INGREDIENTS, ASSUMED_STAPLES } from '../data/ingredients';
import { FilterOptions, IngredientItem } from '../types';
import { FilterOptionsModal } from './FilterOptionsModal';

interface IngredientPickerProps {
  selectedIngredients: string[];
  onToggleIngredient: (name: string) => void;
  onAddCustomIngredient: (name: string) => void;
  filters: FilterOptions;
  onFiltersChange: (updated: FilterOptions) => void;
}

export const IngredientPicker: React.FC<IngredientPickerProps> = ({
  selectedIngredients,
  onToggleIngredient,
  onAddCustomIngredient,
  filters,
  onFiltersChange,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Search logic matching English, Swahili names, and aliases
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COMMON_INGREDIENTS.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchSwahili = item.swahiliName?.toLowerCase().includes(q) ?? false;
      const matchAlias = item.aliases.some((alias) => alias.toLowerCase().includes(q));
      return matchName || matchSwahili || matchAlias;
    });
  }, [query]);

  // Is exact query already in selected list?
  const isAlreadySelected = (name: string) => {
    const lower = name.toLowerCase();
    return selectedIngredients.some((i) => i.toLowerCase() === lower);
  };

  const handleAddCustom = () => {
    const clean = query.trim();
    if (!clean) return;
    onAddCustomIngredient(clean);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0 && !isAlreadySelected(searchResults[0].name)) {
        onToggleIngredient(searchResults[0].name);
        setQuery('');
      } else {
        handleAddCustom();
      }
    }
  };

  return (
    <div className="pb-36 pt-4 max-w-2xl mx-auto px-4">
      {/* 1. Heading & explanation */}
      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-[#25671E] tracking-tight">
          What&apos;s in your kitchen today?
        </h1>
        <p className="text-sm text-stone-700 mt-1 max-w-md mx-auto">
          Pick or type what you have at home. We&apos;ll craft 3 delicious meals tailored to your kitchen.
        </p>
      </div>

      {/* 2. Search & Type box */}
      <div className="relative mb-3">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-[#25671E] pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type ingredient (e.g. nyanya, sukuma, beef, eggs)..."
            className="w-full pl-10 pr-20 py-3.5 rounded-2xl bg-white border-2 border-[#25671E]/20 focus:border-[#48A111] focus:ring-3 focus:ring-[#48A111]/20 outline-none text-sm font-semibold text-[#25671E] placeholder:text-stone-400 shadow-sm"
          />
          {query.trim() && (
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
              <button
                type="button"
                onClick={handleAddCustom}
                className="bg-[#25671E] hover:bg-[#1b4d16] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          )}
        </div>

        {/* Search suggestions dropdown */}
        {query.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1.5 bg-white border border-[#25671E]/20 rounded-2xl shadow-xl overflow-hidden divide-y divide-stone-100 max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((item) => {
                const selected = isAlreadySelected(item.name);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onToggleIngredient(item.name);
                      setQuery('');
                    }}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-[#F7F0F0] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <div className="text-sm font-bold text-[#25671E]">
                          {item.name}
                        </div>
                        {item.swahiliName && (
                          <div className="text-xs text-stone-600">
                            {item.swahiliName}
                          </div>
                        )}
                      </div>
                    </div>
                    {selected ? (
                      <span className="text-xs font-bold text-[#48A111] flex items-center gap-1">
                        <Check size={14} strokeWidth={3} />
                        Added
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#25671E] bg-[#F7F0F0] px-2 py-1 rounded-lg">
                        + Add
                      </span>
                    )}
                  </button>
                );
              })
            ) : null}

            {/* Always give option to add as custom item */}
            <button
              type="button"
              onClick={handleAddCustom}
              className="w-full px-4 py-3 flex items-center justify-between bg-[#F7F0F0] hover:bg-[#eae0e0] text-left transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#25671E]">
                <Plus size={15} className="text-[#48A111]" />
                <span>Add &quot;{query.trim()}&quot; as custom ingredient</span>
              </div>
              <span className="text-[11px] font-extrabold uppercase bg-[#25671E] text-white px-2 py-0.5 rounded-md">
                Add
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Basic Staples Note */}
      <div className="mb-4 bg-emerald-50/80 border border-[#48A111]/30 rounded-2xl p-3 flex items-start gap-2.5 shadow-2xs">
        <span className="text-lg leading-none mt-0.5">🧂</span>
        <div className="text-xs text-[#25671E]">
          <span className="font-extrabold">Good news: </span>
          We already assume you have <span className="font-bold underline decoration-[#48A111]/60">salt, cooking oil, water, onions and basic spices</span> in your kitchen. No need to add them!
        </div>
      </div>

      {/* 6. Optional Filters (More options) */}
      <FilterOptionsModal
        isOpen={isFiltersOpen}
        onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
        filters={filters}
        onChange={onFiltersChange}
      />

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-[#25671E] text-white shadow-xs'
              : 'bg-white text-[#25671E] border border-[#25671E]/15 hover:border-[#25671E]/30'
          }`}
        >
          ✨ All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              selectedCategory === cat.id
                ? 'bg-[#25671E] text-white shadow-xs'
                : 'bg-white text-[#25671E] border border-[#25671E]/15 hover:border-[#25671E]/30'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Tap Grid of common Kenyan ingredients grouped by category */}
      <div className="space-y-6">
        {CATEGORIES.filter((c) => selectedCategory === 'all' || selectedCategory === c.id).map(
          (category) => {
            const items = COMMON_INGREDIENTS.filter((i) => i.category === category.id);

            return (
              <section key={category.id} className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#25671E]/10 pb-1">
                  <h2 className="text-sm font-extrabold text-[#25671E] uppercase tracking-wider flex items-center gap-1.5">
                    <span>{category.emoji}</span>
                    <span>{category.label}</span>
                    <span className="text-stone-500 font-semibold text-xs lowercase">
                      ({category.swahiliLabel})
                    </span>
                  </h2>
                  <span className="text-[11px] font-bold text-stone-600">
                    {items.length} items
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {items.map((item) => {
                    const isSelected = isAlreadySelected(item.name);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onToggleIngredient(item.name)}
                        className={`relative p-3 rounded-2xl text-left border-2 transition-all flex flex-col justify-between h-24 select-none active:scale-95 ${
                          isSelected
                            ? 'bg-[#25671E] text-white border-[#25671E] shadow-sm ring-2 ring-[#48A111]/50'
                            : 'bg-white text-[#25671E] border-stone-200 hover:border-[#48A111]/50 shadow-2xs'
                        }`}
                        aria-pressed={isSelected}
                      >
                        {/* Top row: Emoji & Selected Tick */}
                        <div className="flex items-center justify-between w-full">
                          <span className="text-2xl leading-none">{item.emoji}</span>
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-[#48A111] text-white flex items-center justify-center shadow-xs">
                              <Check size={13} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border border-stone-300 text-stone-300 flex items-center justify-center text-[10px]">
                              +
                            </span>
                          )}
                        </div>

                        {/* Name and Swahili subtitle */}
                        <div>
                          <div
                            className={`text-xs font-bold leading-tight line-clamp-1 ${
                              isSelected ? 'text-white' : 'text-[#25671E]'
                            }`}
                          >
                            {item.name}
                          </div>
                          {item.swahiliName && (
                            <div
                              className={`text-[10px] leading-tight mt-0.5 line-clamp-1 ${
                                isSelected ? 'text-emerald-100' : 'text-stone-600'
                              }`}
                            >
                              {item.swahiliName}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          }
        )}
      </div>
    </div>
  );
};
