import type { DispatchTask } from '../data/types'

export function formatDurationMs(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000))
  const days = Math.floor(totalMin / (60 * 24))
  const hours = Math.floor((totalMin - days * 60 * 24) / 60)
  const mins = totalMin - days * 60 * 24 - hours * 60
  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (mins) parts.push(`${mins}m`)
  return parts.length > 0 ? parts.join(' ') : '0m'
}

export function getStatusDetails(task: DispatchTask): string | null {
  const now = new Date()
  
  if (task.status === 'Exceeded ETA') {
    const eta = new Date(task.etaDateTime)
    if (now > eta) {
      const lateMs = now.getTime() - eta.getTime()
      return `${formatDurationMs(lateMs)} late`
    }
    return null
  }
  
  if (task.status === 'GPS Offline >24h' && task.lastGpsPoint) {
    const lastGps = new Date(task.lastGpsPoint.timestamp)
    const offlineMs = now.getTime() - lastGps.getTime()
    const hours = Math.floor(offlineMs / (1000 * 60 * 60))
    const location = `${task.lastGpsPoint.position.lat.toFixed(3)}, ${task.lastGpsPoint.position.lng.toFixed(3)}`
    return `Offline ${hours}h • Last: ${location}`
  }
  
  if (task.status === 'Stopped >5h' && task.lastGpsPoint) {
    const lastGps = new Date(task.lastGpsPoint.timestamp)
    const stoppedMs = now.getTime() - lastGps.getTime()
    const hours = Math.floor(stoppedMs / (1000 * 60 * 60))
    const location = `${task.lastGpsPoint.position.lat.toFixed(3)}, ${task.lastGpsPoint.position.lng.toFixed(3)}`
    return `Stopped ${hours}h • Last: ${location}`
  }
  
  return null
}
