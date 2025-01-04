import { kakaoAuth } from '@/lib/kakao'
import { useNavigate, useLocation } from 'react-router'
import { useEffect, useRef, useMemo } from 'react'
import { BounceLoader } from 'react-spinners'

export default function AuthKakaoCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const code = searchParams.get('code')
  const signInAttempted = useRef(false)

  useEffect(() => {
    if (!code || signInAttempted.current) {
      return
    }

    signInAttempted.current = true
    const next = searchParams.get('state') || ''

    kakaoAuth
      .signIn(code)
      .then(() => navigate('/' + next))
      .catch(() => navigate('/' + next))
  }, [code, navigate, searchParams])

  if (!code) {
    navigate('/')
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <BounceLoader color="#557C03" size={50} />
      <div className="mt-4 text-gray-800">로그인 중입니다</div>
    </div>
  )
}
