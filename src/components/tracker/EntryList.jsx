import React from 'react';
import { BookOpen, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { ENTRY_STATUS_LIST, getStatusLabel } from '../../constants/status';

export function EntryList({
  darkMode,
  entries,
  searchTerm,
  filterStatus,
  isLoading,
  onEdit,
  onDelete,
  onAddFirst,
}) {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading entries">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`rounded-2xl h-28 animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-white/80'}`}
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card darkMode={darkMode} hover={false} className="text-center py-12">
        <BookOpen
          size={48}
          className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
          aria-hidden
        />
        <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {searchTerm || filterStatus !== 'all' ? 'No entries match your filters' : 'Start your study journey'}
        </p>
        <p className={`mb-6 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          {searchTerm || filterStatus !== 'all'
            ? 'Try adjusting search or status filter.'
            : 'Log your first topic to track progress, streaks, and focus time.'}
        </p>
        {!searchTerm && filterStatus === 'all' && (
          <Button variant="primary" onClick={onAddFirst}>
            Add your first entry
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id} darkMode={darkMode} className="!p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    darkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {entry.week}
                </span>
                <h3 className="text-lg font-semibold truncate">{entry.topic}</h3>
                <StatusBadge status={entry.status} darkMode={darkMode} />
              </div>
              <p className={`mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">Goal:</span> {entry.goal}
              </p>
              {entry.notes && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{entry.notes}</p>
              )}
              {entry.updatedAt && (
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Updated {typeof entry.updatedAt === 'string' ? entry.updatedAt : 'recently'}
                </p>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => onEdit(entry)}
                className={`p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  darkMode ? 'hover:bg-indigo-900/30 text-indigo-300' : 'hover:bg-indigo-50 text-indigo-600'
                }`}
                aria-label={`Edit ${entry.topic}`}
              >
                <Edit2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                className={`p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-red-500 ${
                  darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'
                }`}
                aria-label={`Delete ${entry.topic}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function EntryFilters({ darkMode, searchTerm, filterStatus, sortBy, onSearch, onFilter, onSort, searchInputRef }) {
  return (
    <Card darkMode={darkMode} className="!p-5">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[12rem]">
          <label htmlFor="entry-search" className="sr-only">
            Search entries
          </label>
          <input
            ref={searchInputRef}
            id="entry-search"
            type="search"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search entries… (press /)"
            className={`w-full px-4 py-2 rounded-lg border focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilter(e.target.value)}
          aria-label="Filter by status"
          className={`px-4 py-2 rounded-lg border focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
        >
          <option value="all">All statuses</option>
          {ENTRY_STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(s)}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSort(e.target.value)}
          aria-label="Sort entries"
          className={`px-4 py-2 rounded-lg border focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="week">By week</option>
          <option value="topic">By topic</option>
        </select>
      </div>
    </Card>
  );
}
