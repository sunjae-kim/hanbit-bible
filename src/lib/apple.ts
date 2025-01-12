import { auth } from '@/lib/firebase'
import { OAuthProvider, browserLocalPersistence, setPersistence, signInWithPopup } from 'firebase/auth'

export const appleAuth = {
  async signIn() {
    try {
      await setPersistence(auth, browserLocalPersistence)

      const provider = new OAuthProvider('apple.com')
      provider.addScope('email')
      provider.addScope('name')
      provider.setCustomParameters({
        locale: 'ko_KR',
      })

      const userCredential = await signInWithPopup(auth, provider)
      return userCredential.user
    } catch (error) {
      console.error('Apple login error:', error)
      throw error
    }
  },
}
