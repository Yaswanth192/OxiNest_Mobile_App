import React, { createContext, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

export type ThemeType = 'auto' | 'light' | 'dark';

export const ThemeContext = createContext({
  theme: 'auto' as ThemeType,
  setTheme: (theme: ThemeType) => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('auto');

  // Compute the effective theme
  const effectiveTheme = useMemo(() => {
    if (theme === 'auto') {
      return Appearance.getColorScheme() || 'light';
    }
    return theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 