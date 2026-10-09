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

/** Zeitzone des Browsers, z. B. "Europe/Berlin" */
export function browserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/** Zeigt einen UTC-Zeitpunkt in der gewünschten Zeitzone an */
export function formatInTz(iso: string, tz: string): string {
    return new Intl.DateTimeFormat('de-DE', {
        timeZone: tz,
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(iso))
}

/**
 * Wandelt eine lokale Zeitangabe aus <input type="datetime-local"> ("2025-01-20T13:00")
 * in einen UTC-ISO-String um, und zwar so, als wäre die Zeit in `tz` gemeint.
 */
export function zonedLocalToIso(local: string, tz: string): string {
    const wallAsUtc = Date.parse(local.length === 16 ? `${local}:00Z` : `${local}Z`)
    const offset = tzOffsetMs(wallAsUtc, tz)
    return new Date(wallAsUtc - offset).toISOString()
}

/** Offset der Zeitzone zu UTC in Millisekunden, zum gegebenen Zeitpunkt */
function tzOffsetMs(utcMs: number, tz: string): number {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hourCycle: 'h23',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
            .formatToParts(new Date(utcMs))
            .map(p => [p.type, p.value])
    )
    const wallClockAsUtc = Date.UTC(
        Number(parts['year']),
        Number(parts['month']) - 1,
        Number(parts['day']),
        Number(parts['hour']),
        Number(parts['minute']),
        Number(parts['second'])
    )
    return wallClockAsUtc - utcMs
}
