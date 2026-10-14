import React from 'react';

export const SeniorButton = ({
  children,
  onClick,
  variant = 'primary', // primary | secondary | success | warning | danger | outline | ghost
  size = 'lg',        // md | lg | xl
  icon: Icon = null,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ariaLabel = ''
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 select-none shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none focus:outline-none focus:ring-4';

  const sizeStyles = {
    md: 'px-5 py-3 text-lg min-h-[50px] gap-2.5',
    lg: 'px-7 py-4 text-xl min-h-[58px] gap-3',
    xl: 'px-8 py-5 text-2xl min-h-[68px] gap-4'
  };

  const variantStyles = {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white focus:ring-blue-300 border-2 border-transparent shadow-blue-900/10',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-300 border-2 border-slate-300',
    success: 'bg-emerald-700 hover:bg-emerald-800 text-white focus:ring-emerald-300 border-2 border-transparent shadow-emerald-900/10',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-300 border-2 border-transparent',
    danger: 'bg-rose-700 hover:bg-rose-800 text-white focus:ring-rose-300 border-2 border-transparent',
    outline: 'bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-600 focus:ring-blue-200',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-200'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.lg} ${variantStyles[variant] || variantStyles.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon className={size === 'xl' ? 'w-8 h-8' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} strokeWidth={2.5} />}
      <span>{children}</span>
    </button>
  );
};
