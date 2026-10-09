import { formatInTimeZone } from 'date-fns-tz'
import { format } from 'date-fns'

/**
 * Convert a UTC timestamp to a specific timezone for display
 * @param utcDate - Date in UTC (ISO string or Date object)
 * @param timezone - IANA timezone string (e.g., "Europe/Berlin")
 * @returns Formatted string with timezone info
 */
export function formatDateInTimezone(utcDate: string | Date, timezone: string = 'UTC'): string {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
    try {
        return formatInTimeZone(date, timezone, 'HH:mm')
    } catch {
        return format(date, 'HH:mm')
    }
}

/**
 * Get user's timezone from browser hint (passed in headers/body)
 * Fallback to UTC
 */
export function getUserTimezone(hint?: string): string {
    if (hint && isValidTimezone(hint)) {
        return hint
    }
    return 'UTC'
}

/**
 * Validate IANA timezone string
 */
export function isValidTimezone(tz: string): boolean {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz })
        return true
    } catch {
        return false
    }
}

/**
 * Get list of common timezones
 */
export const COMMON_TIMEZONES = [
    'UTC',
    'Europe/Berlin',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
]
