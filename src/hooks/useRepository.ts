import { RepositoryContext } from '@/contexts/repository.context'
import { useContext } from 'react'

export const useRepository = () => {
  const context = useContext(RepositoryContext)

  if (!context) {
    throw new Error('useRepository must be used within RepositoryProvider')
  }

  return context
}
