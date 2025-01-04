import Layout from '@/components/Layout'
import AuthKakaoCallbackPage from '@/pages/AuthKakaoCallback'
import DailyPage from '@/pages/Daily'
import MainPage from '@/pages/Main'
import PlanByDatePage from '@/pages/PlanByDate'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './globals.css'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <MainPage />,
      },
      {
        path: '/daily',
        element: <DailyPage />,
      },
      {
        path: '/auth/kakao/callback',
        element: <AuthKakaoCallbackPage />,
      },
      {
        path: '/plan/:planId/:date',
        element: <PlanByDatePage />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
