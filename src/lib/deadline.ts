// src/lib/deadline.ts
import { supabase } from './supabase';

export interface EarliestEvent {
  id: number;
  commence_time: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get the configured earliest event table name from environment variables.
 * Defaults to 'earliest_event' if not specified.
 * Set VITE_EARLIEST_EVENT_TABLE to 'earliest_event_test' for testing.
 */
const getEarliestEventTable = (): string => {
  return import.meta.env.VITE_EARLIEST_EVENT_TABLE || 'earliest_event';
};

/**
 * Fetch the earliest event commence time from the database
 * Uses the table configured via VITE_EARLIEST_EVENT_TABLE environment variable
 */
export const fetchEarliestEvent = async (): Promise<{
  data: EarliestEvent | null;
  error: any;
}> => {
  try {
    const tableName = getEarliestEventTable();
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('commence_time', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Check if picks submission is still allowed based on current time vs commence_time
 * Returns true if current time is before commence_time
 */
export const isBeforeDeadline = (commenceTime: string): boolean => {
  const deadlineDate = new Date(commenceTime);
  const now = new Date();
  return now < deadlineDate;
};

/**
 * Format a UTC timestamp to user's local timezone (time and timezone only)
 */
export const formatDeadlineTime = (commenceTime: string): string => {
  const date = new Date(commenceTime);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
};

/**
 * Calculate time remaining until deadline
 * Returns an object with days, hours, minutes, seconds
 */
export const getTimeRemaining = (
  commenceTime: string
): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} => {
  const deadline = new Date(commenceTime);
  const now = new Date();
  const total = deadline.getTime() - now.getTime();

  if (total <= 0) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
  };
};

/**
 * Format time remaining as a human-readable string
 */
export const formatTimeRemaining = (commenceTime: string): string => {
  const { days, hours, minutes, seconds, isPast } = getTimeRemaining(commenceTime);

  if (isPast) {
    return 'Deadline has passed';
  }

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && days === 0) parts.push(`${seconds}s`);

  return parts.join(' ') || 'Less than a second';
};
