import { usePlanCompletion } from '@/hooks/usePlanCompletion'
import { kakaoAuth } from '@/lib/kakao'
import { usePlanStore } from '@/stores/plan'
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

  const onSignIn = useCallback(
    async (user: User) => {
      try {
        await setCompletion({ user, value: true })
        navigate('/')
        toast.success('읽기 체크완료!')
      } catch (error) {
        console.error('Error during sign-in:', error)
        toast.error('읽기 체크에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    },
    [setCompletion, navigate],
  )

  useEffect(() => {
    if (!code || signInAttempted.current) {
      return
    }

    signInAttempted.current = true
    const next = searchParams.get('state') || ''

    kakaoAuth
      .signIn(code)
      .then(async (user) => {
        if (!user) {
          toast.error('로그인 정보가 없습니다.')
          navigate('/')
          return
        }

        if (next === 'daily') {
          await onSignIn(user)
        } else {
          navigate('/' + next)
        }
      })
      .catch((error) => {
        console.error('Kakao 로그인 실패:', error)
        navigate('/')
        toast.error('로그인에 실패했습니다. 다시 시도해주세요.')
      })
  }, [code, searchParams, onSignIn, navigate])

  if (!code) {
    navigate('/')
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <BounceLoader color="#36d7b7" />
    </div>
  )
}
