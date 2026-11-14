import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { cn } from '../../lib/utils';

interface WishlistButtonProps {
  carId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  carId,
  className,
  size = 'md',
  showLabel = false,
}) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(carId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(carId);
  };

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      title={active ? 'Remove from favourites' : 'Save to favourites'}
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-sm active:scale-90 cursor-pointer',
        active
          ? 'bg-rose-50 text-rose-500 border border-rose-200'
          : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-200/80',
        sizeStyles[size],
        showLabel && 'px-3 w-auto gap-2 rounded-xl',
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-all duration-300',
          active ? 'fill-rose-500 text-rose-500 scale-110' : 'text-current'
        )}
      />
      {showLabel && (
        <span className="font-semibold text-xs">
          {active ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};
