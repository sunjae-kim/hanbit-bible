import { create } from 'zustand'
import { auth } from '@/lib/firebase'
import { User, signOut as firebaseSignOut } from 'firebase/auth'

interface AuthStore {
  user: User | null
  initialized: boolean
  initializedPromise: Promise<User | null>
  setUser: (user: User | null) => void
  signOut: () => Promise<void>
}

const STORAGE_KEY = 'auth-user'

const storage = {
  get: () => {
    if (typeof window === 'undefined') return null
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },
  set: (user: User | null) => {
    if (typeof window === 'undefined') return
    try {
      if (user) {
        const userToStore = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerData: user.providerData,
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userToStore))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  },
}

const getInitialState = () => {
  if (typeof window === 'undefined') return null
  return auth.currentUser || storage.get()
}

const initializedPromise = new Promise<User | null>((resolve) => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    storage.set(user)
    unsubscribe()
    resolve(user)
  })
})

export const useAuthStore = create<AuthStore>()((set) => ({
  user: getInitialState(),
  initialized: false,
  initializedPromise,
  setUser: (user) => {
    storage.set(user)
    set({ user, initialized: true })
  },
  signOut: async () => {
    await firebaseSignOut(auth)
  },
}))
