import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import SyncStatusIndicator from '../../../SyncStatusIndicator';

export function AppHeader({
  darkMode,
  toggleDarkMode,
  user,
  isAuthenticated,
  onLogout,
  showDemoBanner,
}) {
  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b mb-6 -mx-4 px-4 py-3 ${
          darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/70 border-gray-200'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/chassze-logo.svg"
              alt=""
              className="h-9 w-9 flex-shrink-0"
              width={36}
              height={36}
            />
            <div className="min-w-0">
              <h1
                className={`text-lg sm:text-xl font-bold truncate ${
                  darkMode
                    ? 'bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent'
                }`}
              >
                CyberStudy Tracker
              </h1>
              <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.displayName || user?.email || 'Demo mode'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAuthenticated && <SyncStatusIndicator darkMode={darkMode} show />}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className={`p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </header>
      {showDemoBanner && (
        <div
          className={`max-w-4xl mx-auto mb-6 rounded-xl p-4 border-2 border-dashed ${
            darkMode ? 'bg-amber-900/30 border-amber-600 text-amber-100' : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
          role="status"
        >
          <p className="text-sm font-medium">Demo mode — data stays in this browser only.</p>
        </div>
      )}
    </>
  );
}
