import { format } from 'date-fns';

/**
 * Normalize various timestamp formats (ISO strings, numbers, Firestore Timestamps)
 * into a native Date instance. Returns null when the value cannot be parsed.
 */
export const parseFirestoreDate = (value) => {
  if (!value) return null;

  // Already a valid Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Number (timestamp in ms) or ISO string
  if (typeof value === 'number' || typeof value === 'string') {
    // Handle numeric string timestamps
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      const numVal = parseInt(value, 10);
      const parsed = new Date(numVal);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Firestore Timestamp object or similar
  if (typeof value === 'object') {
    // Firestore Timestamp with toDate() method
    if (typeof value.toDate === 'function') {
      try {
        const parsed = value.toDate();
        return parsed instanceof Date && !isNaN(parsed.getTime()) ? parsed : null;
      } catch (e) {
        return null;
      }
    }

    // Firestore Timestamp as plain object { seconds, nanoseconds }
    if (value.seconds != null) {
      const millis = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6);
      const parsed = new Date(millis);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    // Handle {_seconds, _nanoseconds} format (serialized Firestore Timestamp)
    if (value._seconds != null) {
      const millis = value._seconds * 1000 + Math.floor((value._nanoseconds || 0) / 1e6);
      const parsed = new Date(millis);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
};

/**
 * Safely format a timestamp for UI display. Falls back to "Unknown" when parsing fails.
 */
export const formatDateDisplay = (value, locale) => {
  const parsed = parseFirestoreDate(value);
  if (!parsed) {
    return 'Unknown';
  }
  try {
    return parsed.toLocaleDateString(locale);
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Return an ISO date key (yyyy-MM-dd) used for grouping entries by day.
 */
export const getDateKey = (value) => {
  const parsed = parseFirestoreDate(value);
  return parsed ? format(parsed, 'yyyy-MM-dd') : null;
};
