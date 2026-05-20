/** Canonical entry status values (stored in Firestore / localStorage). */
export const ENTRY_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REVIEW_NEEDED: 'review_needed',
};

export const ENTRY_STATUS_LIST = Object.values(ENTRY_STATUS);

const LEGACY_TO_CANONICAL = {
  '❌ Not Started': ENTRY_STATUS.NOT_STARTED,
  'not started': ENTRY_STATUS.NOT_STARTED,
  '🟡 In Progress': ENTRY_STATUS.IN_PROGRESS,
  'in progress': ENTRY_STATUS.IN_PROGRESS,
  '✅ Completed': ENTRY_STATUS.COMPLETED,
  completed: ENTRY_STATUS.COMPLETED,
  '🔄 Review Needed': ENTRY_STATUS.REVIEW_NEEDED,
  'review needed': ENTRY_STATUS.REVIEW_NEEDED,
};

export const STATUS_META = {
  [ENTRY_STATUS.NOT_STARTED]: {
    label: 'Not Started',
    shortLabel: 'Not started',
    color: 'gray',
    dotClass: 'bg-gray-400',
    textClass: 'text-gray-500',
    badgeDark: 'bg-gray-700/50 text-gray-300 border-gray-600',
    badgeLight: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  [ENTRY_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    shortLabel: 'In progress',
    color: 'amber',
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-500',
    badgeDark: 'bg-amber-900/40 text-amber-200 border-amber-700',
    badgeLight: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  [ENTRY_STATUS.COMPLETED]: {
    label: 'Completed',
    shortLabel: 'Done',
    color: 'emerald',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-500',
    badgeDark: 'bg-emerald-900/40 text-emerald-200 border-emerald-700',
    badgeLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  [ENTRY_STATUS.REVIEW_NEEDED]: {
    label: 'Review Needed',
    shortLabel: 'Review',
    color: 'blue',
    dotClass: 'bg-blue-400',
    textClass: 'text-blue-500',
    badgeDark: 'bg-blue-900/40 text-blue-200 border-blue-700',
    badgeLight: 'bg-blue-50 text-blue-800 border-blue-200',
  },
};

export function normalizeStatus(status) {
  if (!status) return ENTRY_STATUS.NOT_STARTED;
  if (ENTRY_STATUS_LIST.includes(status)) return status;
  return LEGACY_TO_CANONICAL[status] || ENTRY_STATUS.NOT_STARTED;
}

export function getStatusLabel(status) {
  return STATUS_META[normalizeStatus(status)]?.label ?? 'Unknown';
}

export function normalizeEntry(entry) {
  if (!entry) return entry;
  return { ...entry, status: normalizeStatus(entry.status) };
}

export function normalizeEntries(entries) {
  return (entries || []).map(normalizeEntry);
}

export function countByStatus(entries) {
  return (entries || []).reduce(
    (acc, entry) => {
      const key = normalizeStatus(entry.status);
      if (key === ENTRY_STATUS.COMPLETED) acc.completed += 1;
      else if (key === ENTRY_STATUS.IN_PROGRESS) acc.inProgress += 1;
      else if (key === ENTRY_STATUS.REVIEW_NEEDED) acc.review += 1;
      else acc.notStarted += 1;
      return acc;
    },
    { completed: 0, inProgress: 0, review: 0, notStarted: 0 }
  );
}

export function matchesStatusFilter(entry, filterStatus) {
  if (filterStatus === 'all') return true;
  return normalizeStatus(entry.status) === filterStatus;
}
