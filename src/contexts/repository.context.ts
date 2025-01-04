import { PlanRepository } from '@/repositories/firebase/plan.repository'
import { UserPlanMonthRepository } from '@/repositories/firebase/user-plan-month.repository'
import { UserRepository } from '@/repositories/firebase/user.repository'
import { createContext } from 'react'

interface RepositoryContextType {
  userRepository: UserRepository
  userPlanMonthRepository: UserPlanMonthRepository
  planRepository: PlanRepository
}

export const RepositoryContext = createContext<RepositoryContextType>({} as RepositoryContextType)
