import React from 'react';
import { ChefHat, Heart, Sparkles } from 'lucide-react';

interface HeaderProps {
  favoritesCount: number;
  onOpenFavorites: () => void;
  onGoHome: () => void;
  currentScreen: string;
}

export const Header: React.FC<HeaderProps> = ({
  favoritesCount,
  onOpenFavorites,
  onGoHome,
  currentScreen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#25671E] text-white shadow-md border-b border-[#25671E]/80">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left focus:outline-none focus:ring-2 focus:ring-[#F2B50B] rounded-lg p-1 -ml-1 transition-transform active:scale-95"
          aria-label="Tupike Home"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner">
            🍲
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-['Poppins']">
                Tupike?
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F2B50B] text-[#25671E] px-1.5 py-0.5 rounded-full">
                Kenya
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              What should I cook?
            </p>
          </div>
        </button>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFavorites}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentScreen === 'favorites'
                ? 'bg-[#F2B50B] text-[#25671E] shadow-sm'
                : 'bg-white/15 text-white hover:bg-white/25 active:scale-95'
            }`}
            aria-label="Saved favorite recipes"
          >
            <Heart
              size={15}
              className={currentScreen === 'favorites' ? 'fill-[#25671E] text-[#25671E]' : 'text-white'}
            />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  currentScreen === 'favorites'
                    ? 'bg-[#25671E] text-white'
                    : 'bg-[#F2B50B] text-[#25671E]'
                }`}
              >
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
