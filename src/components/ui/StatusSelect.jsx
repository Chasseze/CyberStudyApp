import React from 'react';
import { ENTRY_STATUS, ENTRY_STATUS_LIST, getStatusLabel } from '../../constants/status';

export function StatusSelect({ darkMode, value, onChange, name = 'status', id = 'status', className = '' }) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e)}
      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        darkMode
          ? 'bg-gray-700 border-gray-600 text-white'
          : 'bg-white border-gray-300 text-gray-900'
      } ${className}`}
    >
      {ENTRY_STATUS_LIST.map((s) => (
        <option key={s} value={s}>
          {getStatusLabel(s)}
        </option>
      ))}
    </select>
  );
}

export { ENTRY_STATUS as DEFAULT_STATUS };
