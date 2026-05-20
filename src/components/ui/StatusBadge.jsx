import React from 'react';
import { getStatusLabel, normalizeStatus, STATUS_META } from '../../constants/status';

export function StatusBadge({ status, darkMode, className = '' }) {
  const key = normalizeStatus(status);
  const meta = STATUS_META[key];
  const badgeClass = darkMode ? meta.badgeDark : meta.badgeLight;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeClass} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} aria-hidden />
      {getStatusLabel(status)}
    </span>
  );
}
