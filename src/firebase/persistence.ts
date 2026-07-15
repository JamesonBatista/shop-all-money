export type PersistenceStatus = 'unknown' | 'online' | 'denied' | 'offline'

const STATUS_KEY = 'bankshop_firestore_status'
const ERROR_KEY = 'bankshop_firestore_error'

let memoryStatus: PersistenceStatus = 'unknown'
let memoryError = ''

export function getPersistenceStatus(): PersistenceStatus {
  if (memoryStatus !== 'unknown') return memoryStatus
  return (localStorage.getItem(STATUS_KEY) as PersistenceStatus | null) ?? 'unknown'
}

export function getPersistenceError(): string {
  return memoryError || localStorage.getItem(ERROR_KEY) || ''
}

export function markPersistenceOnline() {
  memoryStatus = 'online'
  memoryError = ''
  localStorage.setItem(STATUS_KEY, 'online')
  localStorage.removeItem(ERROR_KEY)
}

export function markPersistenceDenied(error: unknown) {
  memoryStatus = 'denied'
  memoryError = error instanceof Error ? error.message : String(error)
  localStorage.setItem(STATUS_KEY, 'denied')
  localStorage.setItem(ERROR_KEY, memoryError)
}

export function markPersistenceOffline(error?: unknown) {
  memoryStatus = 'offline'
  memoryError = error instanceof Error ? error.message : error ? String(error) : ''
  localStorage.setItem(STATUS_KEY, 'offline')
  if (memoryError) localStorage.setItem(ERROR_KEY, memoryError)
}

/** Runs a Firestore write/read and tracks permission status for the admin panel. */
export async function withFirestore<T>(operation: () => Promise<T>): Promise<T | null> {
  try {
    const result = await operation()
    markPersistenceOnline()
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/permission|insufficient/i.test(message)) {
      markPersistenceDenied(error)
    } else {
      markPersistenceOffline(error)
    }
    return null
  }
}
