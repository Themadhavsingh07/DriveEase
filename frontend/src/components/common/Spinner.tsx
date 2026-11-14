import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <Loader2 className={cn('animate-spin text-blue-500', sizeMap[size])} />
    </div>
  );
};
