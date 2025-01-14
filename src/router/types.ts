import { KAKAO_LOGIN_CONTEXT } from '@/types/user'

export type RouteParams = {
  '/': undefined
  '/auth/kakao/callback': undefined
  '/daily': undefined
  '/plan/:planId/:date': {
    planId: string
    date: string
  }
}

export type RoutePath = keyof RouteParams

export interface NavigationState {
  context?: KAKAO_LOGIN_CONTEXT
  path?: RoutePath
}
