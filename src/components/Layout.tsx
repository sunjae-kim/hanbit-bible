import { SplashLayout } from '@/components/auth/SplashLayout.tsx'
import { AuthProvider } from '@/contexts/auth.provider'
import { RepositoryProvider } from '@/contexts/repository.provider'
import { usePlanStore } from '@/stores/plan'
import { useEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

const Layout = () => {
  const { loadDefaultPlan } = usePlanStore()

  useEffect(() => {
    loadDefaultPlan()
  }, [loadDefaultPlan])

  return (
    <RepositoryProvider>
      <AuthProvider>
        <SplashLayout>
          <ScrollRestoration />
          <Outlet />
          <ToastContainer position="top-center" autoClose={2000} hideProgressBar closeOnClick pauseOnHover />
        </SplashLayout>
      </AuthProvider>
    </RepositoryProvider>
  )
}

export default Layout
