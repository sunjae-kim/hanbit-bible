import { ConfettiContext } from '@/contexts/confetti.context'
import { ConfettiOptions } from '@/types/confetti'
import Confetti from '@/utils/Confetti'
import { useCallback, useState } from 'react'

export const ConfettiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConfettiActive, setIsConfettiActive] = useState(false)

  const showConfetti = useCallback(
    (options: ConfettiOptions = {}) => {
      if (isConfettiActive) return
      new Confetti({
        width: window.innerWidth,
        height: window.innerHeight,
        length: options.length || 120,
        duration: options.duration || 8000,
        yRange: options.yRange || window.innerHeight * 2,
        onEnd: () => {
          options.onEnd?.()
          setIsConfettiActive(false)
        },
        ...options,
      })
      setIsConfettiActive(true)
    },
    [isConfettiActive],
  )

  return <ConfettiContext.Provider value={{ showConfetti }}>{children}</ConfettiContext.Provider>
}
