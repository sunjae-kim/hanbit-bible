import { SplashLayout } from '@/components/auth/SplashLayout.tsx'
import { AuthProvider } from '@/contexts/auth.provider'
import { RepositoryProvider } from '@/contexts/repository.provider'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

const Layout = () => (
  <RepositoryProvider>
    <AuthProvider>
      <SplashLayout>
        <ScrollRestoration />
        <Outlet />
        <ToastContainer />
      </SplashLayout>
    </AuthProvider>
  </RepositoryProvider>
)

export default Layout
