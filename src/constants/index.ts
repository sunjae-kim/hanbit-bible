// KAKAO
export const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY as string
export const KAKAO_CLIENT_SECRET = import.meta.env.VITE_KAKAO_CLIENT_SECRET as string
export const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI as string
export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`

export const COLLECTIONS = {
  USERS: 'users',
  PLANS: 'plans',
  USER_PLANS: 'userPlans',
} as const
