import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'light'
  | 'danger'
  | 'glass';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm hover:shadow-md focus:ring-blue-500 border border-transparent',
    secondary:
      'bg-[#101B2D] hover:bg-[#1E293B] text-white shadow-sm hover:shadow-md focus:ring-slate-700 border border-transparent',
    outline:
      'border border-[#E2E8F0] hover:border-[#CBD5E1] bg-white text-[#1E293B] hover:bg-[#F8FAFC] focus:ring-slate-400 shadow-sm',
    ghost:
      'text-[#64748B] hover:text-[#101B2D] hover:bg-slate-100 focus:ring-slate-300',
    light:
      'bg-blue-50 text-[#2563EB] hover:bg-blue-100 focus:ring-blue-300 font-semibold',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md focus:ring-red-500 border border-transparent',
    glass:
      'bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </button>
  );
};
