import { useSplashState } from '@/hooks/useSplashState'
import { PropsWithChildren } from 'react'
import { BarLoader } from 'react-spinners'

export const SplashLayout = ({ children }: PropsWithChildren) => {
  const { initialized, showSplash, isHiding, loadingState } = useSplashState()

  if (!initialized || showSplash) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center text-center transition-opacity duration-500 ${
          !isHiding ? 'animate-fade-in opacity-100' : 'opacity-0'
        }`}
      >
        <div className="px-4">
          <img
            className="w-50"
            src="https://hanbit-bible.vercel.app/images/icons/icon-512x512.png"
            width={200}
            height={200}
            alt="한빛교회"
          />
          <h1 className="sr-only text-2xl font-bold text-gray-800">한빛교회</h1>
          <p className="text-lg text-gray-600">공동체 성경읽기</p>
          <p className="mt-2 text-sm text-gray-400">{loadingState.message}</p>
          <BarLoader className="mx-auto mt-4" color="#557C03" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
