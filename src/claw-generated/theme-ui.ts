import { loadTheme, toggleTheme } from './theme';

const themeToggle = document.createElement('button');
themeToggle.textContent = 'Toggle Theme';
themeToggle.addEventListener('click', toggleTheme);

document.body.appendChild(themeToggle);

loadTheme();