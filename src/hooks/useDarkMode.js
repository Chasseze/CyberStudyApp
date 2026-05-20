import { useState, useEffect, useCallback } from 'react';

function getInitialDarkMode() {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) {
    try {
      return JSON.parse(stored);
    } catch {
      /* fall through */
    }
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  return { darkMode, setDarkMode, toggleDarkMode };
}
