import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({ value, onValueChange, children, ...props }) => {
  return (
    <div className="relative" {...props}>
      {children}
    </div>
  );
};

export const SelectTrigger = ({ children, className, ...props }) => {
  return (
    <button
      className={`flex items-center justify-between w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-left hover:border-zinc-700 transition-colors ${className}`}
      {...props}
    >
      {children}
      <ChevronDown className="w-4 h-4 text-zinc-400" />
    </button>
  );
};

export const SelectValue = ({ placeholder, value }) => {
  return (
    <span className={value ? 'text-white' : 'text-zinc-500'}>
      {value || placeholder}
    </span>
  );
};

export const SelectContent = ({ children, className }) => {
  return (
    <div className={`absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg ${className}`}>
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

export const SelectItem = ({ value, children, onSelect }) => {
  return (
    <div
      className="px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer transition-colors"
      onClick={() => onSelect && onSelect(value)}
    >
      {children}
    </div>
  );
};