import { useEffect } from 'react';

export function useKeyboardShortcuts({ onTab, onFocusSearch, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
        if (e.key !== 'Escape') return;
      }

      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onFocusSearch?.();
        return;
      }

      const map = {
        '1': 'home',
        '2': 'tracker',
        '3': 'pomodoro',
        '4': 'insights',
        '5': 'goals',
        '6': 'profile',
      };
      if (map[e.key] && !e.metaKey && !e.ctrlKey && !e.altKey) {
        onTab?.(map[e.key]);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onTab, onFocusSearch, enabled]);
}
