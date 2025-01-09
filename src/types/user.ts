export interface User {
  id: string
  displayName: string
  provider: 'kakao'
  createdAt: Date
  updatedAt: Date
}

export enum KAKAO_LOGIN_CONTEXT {
  CHECK = 'check',
  PLAYER = 'player',
}

export interface KakaoLoginState {
  path: string
  context?: KAKAO_LOGIN_CONTEXT
}
