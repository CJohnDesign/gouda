export function getPlatform() {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  
  if (/iphone|ipad|ipod|macintosh/.test(userAgent)) {
    return 'apple'
  }
  if (/android/.test(userAgent)) {
    return 'android'
  }
  return 'desktop'
}

export function getEmailService(email: string): string {
  const emailLower = email.toLowerCase()
  
  if (/@gmail\.com$/.test(emailLower)) return 'gmail'
  if (/@outlook\.com$|@hotmail\.com$|@live\.com$/.test(emailLower)) return 'outlook'
  if (/@protonmail\.com$|@pm\.me$/.test(emailLower)) return 'proton'
  
  return 'gmail' // Default to Gmail
} 