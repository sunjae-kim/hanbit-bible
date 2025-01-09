export const classNames = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

export function encodeObjectToBase64<T extends object>(obj: T): string {
  try {
    const jsonString = JSON.stringify(obj)
    return btoa(encodeURIComponent(jsonString))
  } catch (error) {
    console.error('Object encoding failed:', error)
    throw new Error('Failed to encode object to base64')
  }
}

export function decodeBase64ToObject<T>(base64String: string): T {
  try {
    const jsonString = decodeURIComponent(atob(base64String))
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.error('Base64 decoding failed:', error)
    throw new Error('Failed to decode base64 to object')
  }
}
