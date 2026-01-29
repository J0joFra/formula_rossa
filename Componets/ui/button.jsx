import React from 'react';

export const Button = ({ 
  children, 
  onClick, 
  disabled, 
  className = '', 
  variant = 'default',
  size = 'default',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    outline: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600',
    ghost: 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};