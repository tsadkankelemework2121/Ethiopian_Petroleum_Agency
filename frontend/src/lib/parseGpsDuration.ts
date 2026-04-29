/**
 * Parses the GPS API status string to extract the duration in hours.
 *
 * Examples:
 *   "Stopped 1 d 5 h 34 min 3 s"  → 29.57 hours
 *   "Offline 20 h 8 min 23 s"     → 20.14 hours
 *   "Moving 1 h 22 min 40 s"      → 1.38 hours
 *   "Engine idle 45 min 10 s"     → 0.75 hours
 *   "Offline 444 d 23 h 37 min 42 s" → 10703.63 hours
 */
export function parseStatusDurationHours(status: string): number {
  let hours = 0
  const dayMatch = status.match(/(\d+)\s*d\b/)
  const hourMatch = status.match(/(\d+)\s*h\b/)
  const minMatch = status.match(/(\d+)\s*min/)
  const secMatch = status.match(/(\d+)\s*s\b/)

  if (dayMatch) hours += parseInt(dayMatch[1], 10) * 24
  if (hourMatch) hours += parseInt(hourMatch[1], 10)
  if (minMatch) hours += parseInt(minMatch[1], 10) / 60
  if (secMatch) hours += parseInt(secMatch[1], 10) / 3600

  return hours
}

/**
 * Returns the status category prefix from the GPS API status string.
 * e.g. "Stopped 1 d 5 h" → "stopped"
 *      "Offline 20 h 8 min" → "offline"
 *      "Engine idle 45 min" → "engine idle"
 *      "Moving 1 h 22 min" → "moving"
 */
export function getStatusCategory(status: string): string {
  const lower = status.toLowerCase()
  if (lower.startsWith('offline')) return 'offline'
  if (lower.startsWith('stopped')) return 'stopped'
  if (lower.startsWith('engine idle')) return 'idle'
  if (lower.startsWith('moving')) return 'moving'
  return lower.split(/\d/)[0].trim()
}
