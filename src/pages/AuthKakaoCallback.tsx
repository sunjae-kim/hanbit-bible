import { useConfetti } from '@/contexts/confetti.context'
import { usePlanCompletion } from '@/hooks/usePlanCompletion'
import { kakaoAuth } from '@/lib/kakao'
import { usePlanStore } from '@/stores/plan'
import { KAKAO_LOGIN_CONTEXT, KakaoLoginState } from '@/types/user'
import { decodeBase64ToObject } from '@/utils'
import { User } from 'firebase/auth'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { BounceLoader } from 'react-spinners'
import { toast } from 'react-toastify'

export default function AuthKakaoCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const code = searchParams.get('code')
  const signInAttempted = useRef(false)

  const activePlanId = usePlanStore((state) => state.activePlanId)
  const { setCompletion } = usePlanCompletion(activePlanId)
  const { showConfetti } = useConfetti()

  const checkAsRead = useCallback(
    async (user: User) => {
      try {
        await setCompletion({ user, value: true })
        navigate('/')
        toast('🎉 읽기 체크완료!')
        showConfetti()
      } catch (error) {
        console.error('Error during sign-in:', error)
        toast.error('읽기 체크에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    },
    [setCompletion, navigate, showConfetti],
  )

  useEffect(() => {
    if (!code || signInAttempted.current) {
      return
    }

    signInAttempted.current = true
    const state = searchParams.get('state') || ''
    const stateObj = decodeBase64ToObject<KakaoLoginState>(state)

    kakaoAuth
      .signIn(code)
      .then(async (user) => {
        if (!user) {
          toast.error('로그인 정보가 없습니다.')
          navigate('/')
          return
        }

        if (stateObj.context === KAKAO_LOGIN_CONTEXT.CHECK) {
          await checkAsRead(user)
        } else {
          toast.success('로그인 성공!')
          navigate(stateObj.path || '/')
        }
      })
      .catch((error) => {
        console.error('Kakao 로그인 실패:', error)
        navigate('/')
        toast.error('로그인에 실패했습니다. 다시 시도해주세요.')
      })
  }, [code, searchParams, checkAsRead, navigate])

  if (!code) {
    navigate('/')
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <BounceLoader color="#36d7b7" />
      <p className="mt-5 text-gray-600">로그인 중입니다</p>
    </div>
  )
}
