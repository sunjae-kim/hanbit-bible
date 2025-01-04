import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'
import { PropsWithChildren, useEffect } from 'react'

export const AuthProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      useAuthStore.getState().setUser(user)
    })
    return () => unsubscribe()
  }, [])

  return <>{children}</>
}
