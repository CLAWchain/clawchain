import { readFileSync, writeFileSync } from 'fs';

const THEME_KEY = 'clawchain-theme';

export function setTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.remove('theme-light', 'theme-dark');
  document.documentElement.classList.add(`theme-${theme}`);
  localStorage.setItem(THEME_KEY, theme);
}

export function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark') {
    setTheme('dark');
  } else {
    setTheme('light');
  }
}

export function toggleTheme() {
  const currentTheme = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
  setTheme(currentTheme);
}