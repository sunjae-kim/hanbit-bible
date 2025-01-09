import { createContext, useContext } from 'react'
import { ConfettiOptions } from '../types/confetti'

interface ConfettiContextType {
  showConfetti: (options?: ConfettiOptions) => void
}

export const ConfettiContext = createContext<ConfettiContextType | null>(null)

export const useConfetti = () => {
  const context = useContext(ConfettiContext)
  if (!context) {
    throw new Error('useConfetti must be used within a ConfettiProvider')
  }
  return context
}
