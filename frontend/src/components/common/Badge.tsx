import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant =
  | 'blue'
  | 'success'
  | 'warning'
  | 'danger'
  | 'navy'
  | 'neutral'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'slate'
  | 'electric';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  className,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    navy: 'bg-[#101B2D] text-white border-transparent',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    slate: 'bg-slate-700/50 text-slate-300 border-slate-600',
    electric: 'bg-blue-600 text-white border-blue-500 shadow-sm',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
