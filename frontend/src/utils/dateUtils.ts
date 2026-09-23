/**
 * Utility functions for safe and robust date/time parsing and formatting.
 * Prevents "Invalid Date" output when handling time-only strings, space-separated dates,
 * UTC strings, numeric timestamps, or missing values.
 */

export function parseDate(val: any): Date | null {
  if (val === null || val === undefined || val === '') return null;
  
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // 1. Direct JS Date constructor parse (ISO 8601, standard formats)
    let d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    // 2. Remove trailing UTC/GMT if present
    const cleaned = trimmed.replace(/\s*(UTC|GMT)\s*$/i, '');
    d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;

    // 3. Handle space-separated date-time strings: "2026-09-22 12:00:00" -> "2026-09-22T12:00:00"
    if (cleaned.includes(' ')) {
      const isoCandidate = cleaned.replace(' ', 'T');
      d = new Date(isoCandidate);
      if (!isNaN(d.getTime())) return d;
    }

    // 4. Handle time-only strings: "12:04:12", "12:04:12 PM", "12:04"
    const timeMatch = cleaned.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (timeMatch) {
      const today = new Date();
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const ampm = timeMatch[4] ? timeMatch[4].toUpperCase() : null;

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      today.setHours(hours, minutes, seconds, 0);
      return today;
    }
  }

  return null;
}

/**
 * Formats a date/timestamp as a full localized date and time string.
 * Example: "Sep 23, 2026, 12:04:12 PM"
 */
export function formatDateTime(val: any, fallback: string = 'N/A'): string {
  if (val === null || val === undefined) return fallback;
  
  const parsed = parseDate(val);
  if (parsed) {
    return parsed.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Fallback for relative descriptive text like "Just now" or "10 mins ago"
  if (typeof val === 'string' && val.trim()) {
    return val.trim();
  }

  return fallback;
}

/**
 * Formats a date/timestamp as a localized time string.
 * Example: "12:04:12 PM"
 */
export function formatTime(val: any, fallback: string = 'N/A'): string {
  if (val === null || val === undefined) return fallback;

  const parsed = parseDate(val);
  if (parsed) {
    return parsed.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  if (typeof val === 'string' && val.trim()) {
    return val.trim();
  }

  return fallback;
}

/**
 * Formats a date/timestamp as a localized date-only string.
 * Example: "Sep 23, 2026"
 */
export function formatDate(val: any, fallback: string = 'N/A'): string {
  if (val === null || val === undefined) return fallback;

  const parsed = parseDate(val);
  if (parsed) {
    return parsed.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (typeof val === 'string' && val.trim()) {
    return val.trim();
  }

  return fallback;
}
