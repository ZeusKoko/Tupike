import React from 'react';
import { SlidersHorizontal, Clock, Users, Flame, AlertCircle, Check } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterOptionsModalProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: FilterOptions;
  onChange: (updated: FilterOptions) => void;
}

export const FilterOptionsModal: React.FC<FilterOptionsModalProps> = ({
  isOpen,
  onToggle,
  filters,
  onChange,
}) => {
  const timeOptions: FilterOptions['timeLimit'][] = [
    'Under 20 minutes',
    '30 minutes',
    '1 hour or more',
    'Any time',
  ];

  const setupOptions: FilterOptions['cookingSetup'][] = [
    'One burner',
    'Two burners',
    'Jiko',
    'Has an oven',
  ];

  return (
    <div className="mb-4">
      {/* Toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
          isOpen
            ? 'bg-[#25671E] text-white border-[#25671E] shadow-sm'
            : 'bg-white text-[#25671E] border-[#25671E]/20 hover:border-[#25671E]/40'
        }`}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} className={isOpen ? 'text-[#F2B50B]' : 'text-[#48A111]'} />
          <span>More cooking options</span>
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          isOpen ? 'bg-[#F2B50B] text-[#25671E]' : 'bg-[#25671E]/10 text-[#25671E]'
        }`}>
          {isOpen ? 'Close' : `${filters.timeLimit} • ${filters.servings} people • ${filters.cookingSetup}`}
        </span>
      </button>

      {/* Expanded filters panel */}
      {isOpen && (
        <div className="mt-2.5 bg-white p-4 rounded-2xl border border-[#25671E]/20 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Time Available */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#25671E] mb-2">
              <Clock size={14} className="text-[#48A111]" />
              Time Available
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((time) => {
                const isSelected = filters.timeLimit === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onChange({ ...filters, timeLimit: time })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'bg-[#25671E] text-white border-[#25671E] shadow-xs'
                        : 'bg-[#F7F0F0] text-[#25671E] border-transparent hover:border-[#48A111]'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of People */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#25671E] mb-2">
              <Users size={14} className="text-[#48A111]" />
              People Eating (Servings)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const isSelected = filters.servings === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onChange({ ...filters, servings: num })}
                    className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#25671E] text-white border-[#25671E] shadow-xs'
                        : 'bg-[#F7F0F0] text-[#25671E] border-transparent hover:border-[#48A111]'
                    }`}
                  >
                    {num === 6 ? '6+' : num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cooking Setup */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#25671E] mb-2">
              <Flame size={14} className="text-[#48A111]" />
              Cooking Setup
            </label>
            <div className="grid grid-cols-2 gap-2">
              {setupOptions.map((setup) => {
                const isSelected = filters.cookingSetup === setup;
                return (
                  <button
                    key={setup}
                    type="button"
                    onClick={() => onChange({ ...filters, cookingSetup: setup })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#25671E] text-white border-[#25671E] shadow-xs'
                        : 'bg-[#F7F0F0] text-[#25671E] border-transparent hover:border-[#48A111]'
                    }`}
                  >
                    {isSelected && <Check size={13} className="text-[#F2B50B]" />}
                    <span>{setup}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Use Up Expiring Soon Toggle */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="pr-3">
              <span className="text-xs font-bold text-[#25671E] block">
                Use up things that may go bad soon
              </span>
              <span className="text-[11px] text-stone-600 block">
                Prioritizes ripe tomatoes, soft greens, or leftover items
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={filters.useExpiringSoon}
              onClick={() => onChange({ ...filters, useExpiringSoon: !filters.useExpiringSoon })}
              className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center shrink-0 ${
                filters.useExpiringSoon ? 'bg-[#48A111]' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  filters.useExpiringSoon ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
