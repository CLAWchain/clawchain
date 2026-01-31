import React, { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme preference from localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme as 'light' | 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeVars(newTheme);
  };

  const updateThemeVars = (newTheme: 'light' | 'dark') => {
    // Update CSS variables based on the new theme
    if (newTheme === 'dark') {
      document.documentElement.style.setProperty('--bg-color', '#1f1f1f');
      document.documentElement.style.setProperty('--text-color', '#f0f0f0');
      // Add more variable updates for dark theme
    } else {
      document.documentElement.style.setProperty('--bg-color', '#f0f0f0');
      document.documentElement.style.setProperty('--text-color', '#1f1f1f');
      // Add more variable updates for light theme
    }
  };

  return (
    <div className="theme-toggle">
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'} Toggle Theme
      </button>
    </div>
  );
};

export default ThemeToggle;