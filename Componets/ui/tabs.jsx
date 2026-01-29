import React, { useState } from 'react';

export const Tabs = ({ defaultValue, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={className}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsList = ({ children, activeTab, setActiveTab, className }) => {
  return (
    <div className={`flex border-b border-zinc-800 ${className}`}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
};

export const TabsTrigger = ({ value, children, activeTab, setActiveTab, className }) => {
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 font-medium transition-colors ${isActive 
        ? 'text-red-500 border-b-2 border-red-500' 
        : 'text-zinc-400 hover:text-zinc-300'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, activeTab }) => {
  if (activeTab !== value) return null;
  
  return (
    <div className="py-4">
      {children}
    </div>
  );
};