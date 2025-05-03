"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TtsContextType {
  isTtsInitialized: boolean;
  setIsTtsInitialized: (isInitialized: boolean) => void;
}

const TtsContext = createContext<TtsContextType | undefined>(undefined);

export const TtsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTtsInitialized, setIsTtsInitialized] = useState(false);

  return (
    <TtsContext.Provider value={{ isTtsInitialized, setIsTtsInitialized }}>
      {children}
    </TtsContext.Provider>
  );
};

export const useTts = (): TtsContextType => {
  const context = useContext(TtsContext);
  if (context === undefined) {
    throw new Error('useTts must be used within a TtsProvider');
  }
  return context;
}; 