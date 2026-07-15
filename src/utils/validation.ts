export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidFullName(name: string): boolean {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.length >= 2 && name.trim().length >= 5
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

export function generateAccountNumber(): string {
  const n = Math.floor(10000000 + Math.random() * 89999999)
  return `${String(n).slice(0, 5)}-${String(n).slice(5)}`
}

export function generateAgency(): string {
  return String(Math.floor(1000 + Math.random() * 8999))
}
