'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark';

const ThemeContext = createContext<{ theme: Theme }>({ theme: 'dark' });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }, [theme]);

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
