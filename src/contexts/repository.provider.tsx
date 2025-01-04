import { PlanRepository } from '@/repositories/firebase/plan.repository'
import { UserPlanMonthRepository } from '@/repositories/firebase/user-plan-month.repository'
import { UserRepository } from '@/repositories/firebase/user.repository'
import { ReactNode } from 'react'
import { RepositoryContext } from './repository.context'

interface RepositoryProviderProps {
  children: ReactNode
}

export const RepositoryProvider = ({ children }: RepositoryProviderProps) => {
  const repositories = {
    userRepository: new UserRepository(),
    userPlanMonthRepository: new UserPlanMonthRepository(),
    planRepository: new PlanRepository(),
  }

  return <RepositoryContext.Provider value={repositories}>{children}</RepositoryContext.Provider>
}
