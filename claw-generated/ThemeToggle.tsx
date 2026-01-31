import React, { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme preference from local storage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.style.setProperty('--bg-color', '#080810');
      document.documentElement.style.setProperty('--text-primary', '#F5F5F5');
      document.documentElement.style.setProperty('--text-secondary', '#ABABAB');
      document.documentElement.style.setProperty('--border-color', '#2E2E2E');
      document.documentElement.style.setProperty('--coral', '#E85A4F');
      document.documentElement.style.setProperty('--teal', '#4ECDC4');
    } else {
      setIsDarkMode(false);
      document.documentElement.style.setProperty('--bg-color', '#F5F5F5');
      document.documentElement.style.setProperty('--text-primary', '#080810');
      document.documentElement.style.setProperty('--text-secondary', '#7F7F7F');
      document.documentElement.style.setProperty('--border-color', '#D4D4D4');
      document.documentElement.style.setProperty('--coral', '#E85A4F');
      document.documentElement.style.setProperty('--teal', '#4ECDC4');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');

    if (isDarkMode) {
      document.documentElement.style.setProperty('--bg-color', '#F5F5F5');
      document.documentElement.style.setProperty('--text-primary', '#080810');
      document.documentElement.style.setProperty('--text-secondary', '#7F7F7F');
      document.documentElement.style.setProperty('--border-color', '#D4D4D4');
    } else {
      document.documentElement.style.setProperty('--bg-color', '#080810');
      document.documentElement.style.setProperty('--text-primary', '#F5F5F5');
      document.documentElement.style.setProperty('--text-secondary', '#ABABAB');
      document.documentElement.style.setProperty('--border-color', '#2E2E2E');
    }
  };

  return (
    <div className="theme-toggle">
      <button onClick={toggleTheme}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

export default ThemeToggle;