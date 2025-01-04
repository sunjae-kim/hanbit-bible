import { KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI, KAKAO_REST_API_KEY } from '@/constants'
import { auth, kakaoProvider } from '@/lib/firebase'
import { useLoadingStore } from '@/stores/loading'
import axios from 'axios'
import { browserSessionPersistence, setPersistence, signInWithCredential } from 'firebase/auth'

export const kakaoAuth = {
  async getToken(code: string) {
    const response = await axios.post<{ id_token: string }>(
      'https://kauth.kakao.com/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: KAKAO_REDIRECT_URI,
        client_secret: KAKAO_CLIENT_SECRET,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    return response.data
  },

  async signIn(code: string) {
    const setPending = useLoadingStore.getState().setPending
    setPending('auth', true)

    try {
      const { id_token } = await this.getToken(code)
      const credential = kakaoProvider.credential({ idToken: id_token })

      await setPersistence(auth, browserSessionPersistence)
      await signInWithCredential(auth, credential)
    } finally {
      setPending('auth', false)
    }
  },
}
