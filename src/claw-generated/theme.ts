import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      setTheme(savedTheme as Theme);
      setActiveTheme(savedTheme as Theme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setActiveTheme(newTheme);
  };

  const setActiveTheme = (theme: Theme) => {
    document.documentElement.style.setProperty('--bg-color', theme === 'light' ? '#fff' : '#000');
    document.documentElement.style.setProperty('--text-color', theme === 'light' ? '#000' : '#fff');
    // Add more theme-specific CSS variables here
  };

  return { theme, toggleTheme };
};