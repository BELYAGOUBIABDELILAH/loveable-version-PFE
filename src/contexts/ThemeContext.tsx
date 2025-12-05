/**
 * ThemeContext - Light mode only (Google Antigravity Design System)
 * Dark mode has been removed per Requirements 20.8
 */

import React, { createContext, useContext } from 'react';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always light mode - Google Antigravity Design System
  const theme: Theme = 'light';

  // No-op function since dark mode is removed
  const toggleTheme = () => {
    // Dark mode has been removed per Requirements 20.8
    // This function is kept for API compatibility but does nothing
    if (process.env.NODE_ENV !== 'production') {
      console.warn('toggleTheme is deprecated: Dark mode has been removed per Requirements 20.8');
    }
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
