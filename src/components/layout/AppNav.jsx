import React from 'react';

export function AppNav({ darkMode, tabs, activeTab, onTabChange }) {
  return (
    <>
      {/* Desktop / tablet top tabs */}
      <nav
        className={`hidden sm:block max-w-4xl mx-auto mb-8 p-1.5 rounded-2xl border shadow-lg backdrop-blur ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/70 border-gray-200'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 min-w-0 py-2 px-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} aria-hidden />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        className={`sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t px-2 py-2 safe-area-pb ${
          darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
        } backdrop-blur-md`}
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around max-w-lg mx-auto">
          {tabs
            .filter((t) => t.mobile !== false)
            .slice(0, 5)
            .map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={tab.label}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive ? 'text-indigo-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <Icon size={20} aria-hidden />
                  <span className="truncate max-w-[4rem]">{tab.shortLabel || tab.label}</span>
                </button>
              );
            })}
        </div>
      </nav>
    </>
  );
}
