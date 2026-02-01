import React, { useState, useEffect } from 'react';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load user's preferred theme from local storage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className={`theme-toggle ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <button onClick={toggleTheme}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
};

export default ThemeToggle;