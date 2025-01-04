import { useBibleStore } from '@/stores/bible'
import { useEffect, useState } from 'react'

export const useSplashState = () => {
  const { initialized, initialize, loadingState } = useBibleStore()
  const [showSplash, setShowSplash] = useState(false)
  const [isHiding, setIsHiding] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (loadingState.stage === 'downloading' || loadingState.stage === 'initializing') {
      setShowSplash(true)
    }
  }, [loadingState.stage])

  useEffect(() => {
    if (initialized && showSplash) {
      const timer = setTimeout(() => {
        setIsHiding(true)
        const hideTimer = setTimeout(() => {
          setShowSplash(false)
          setIsHiding(false)
        }, 500)
        return () => clearTimeout(hideTimer)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [initialized, showSplash])

  return {
    initialized,
    showSplash,
    isHiding,
    loadingState,
  }
}
