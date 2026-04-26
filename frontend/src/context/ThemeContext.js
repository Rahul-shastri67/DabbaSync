import React, { createContext, useContext, useEffect, useState } from 'react';

// Default value prevents useTheme() from ever returning undefined
const ThemeContext = createContext({
  dark: false,
  toggle: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('dabbsync-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('dabbsync-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('dabbsync-theme', 'light');
    }
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Safe hook — always returns an object, never undefined
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { dark: false, toggle: () => {} };
  return ctx;
};