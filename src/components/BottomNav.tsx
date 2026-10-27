import React from 'react';
import { UtensilsCrossed, Heart } from 'lucide-react';

interface BottomNavProps {
  currentScreen: 'home' | 'results' | 'detail' | 'favorites';
  favoritesCount: number;
  onNavigateHome: () => void;
  onNavigateFavorites: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  favoritesCount,
  onNavigateHome,
  onNavigateFavorites,
}) => {
  const isHomeActive = currentScreen === 'home' || currentScreen === 'results';
  const isFavoritesActive = currentScreen === 'favorites';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#25671E]/15 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="max-w-md mx-auto grid grid-cols-2 h-14">
        {/* Home / Cook Button */}
        <button
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${
            isHomeActive
              ? 'text-[#25671E] font-bold'
              : 'text-stone-500 hover:text-[#25671E] font-medium'
          }`}
          aria-label="Home ingredient picker"
        >
          <div
            className={`p-1 rounded-full transition-transform ${
              isHomeActive ? 'bg-[#25671E]/10 scale-110' : ''
            }`}
          >
            <UtensilsCrossed size={19} className={isHomeActive ? 'text-[#25671E]' : 'text-stone-500'} />
          </div>
          <span className="text-[11px] leading-tight">Tupike? Home</span>
        </button>

        {/* Favorites Button */}
        <button
          onClick={onNavigateFavorites}
          className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
            isFavoritesActive
              ? 'text-[#25671E] font-bold'
              : 'text-stone-500 hover:text-[#25671E] font-medium'
          }`}
          aria-label="Saved favorites"
        >
          <div
            className={`relative p-1 rounded-full transition-transform ${
              isFavoritesActive ? 'bg-[#F2B50B]/30 scale-110' : ''
            }`}
          >
            <Heart
              size={19}
              className={
                isFavoritesActive
                  ? 'fill-[#25671E] text-[#25671E]'
                  : 'text-stone-500'
              }
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F2B50B] text-[#25671E] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {favoritesCount > 9 ? '9+' : favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight">Favorites</span>
        </button>
      </div>
    </nav>
  );
};
