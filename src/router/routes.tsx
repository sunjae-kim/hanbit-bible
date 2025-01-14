import Layout from '@/components/Layout'
import AuthKakaoCallbackPage from '@/pages/AuthKakaoCallback'
import DailyPage from '@/pages/Daily'
import MainPage from '@/pages/Main'
import PlanByDatePage from '@/pages/PlanByDate'
import { createBrowserRouter } from 'react-router-dom'
import { RoutePath } from './types'

export const routes = {
  home: '/' as const,
  kakaoCallback: '/auth/kakao/callback' as const,
  daily: '/daily' as const,
  planByDate: '/plan/:planId/:date' as const,
  toPlanByDate: (planId: string, date: string): RoutePath => `/plan/${planId}/${date}` as RoutePath,
} satisfies Record<string, string | ((...args: any[]) => RoutePath)>

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: routes.home,
        element: <MainPage />,
      },
      {
        path: routes.daily,
        element: <DailyPage />,
      },
      {
        path: routes.kakaoCallback,
        element: <AuthKakaoCallbackPage />,
      },
      {
        path: routes.planByDate,
        element: <PlanByDatePage />,
      },
    ],
  },
])
