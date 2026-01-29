import React from 'react';

export const Slider = ({ value, onValueChange, min = 0, max = 100, step = 1, className = '' }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onValueChange && onValueChange([parseInt(e.target.value)])}
      className={`w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 ${className}`}
    />
  );
};