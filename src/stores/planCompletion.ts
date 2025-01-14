import { UserPlanMonth } from '@/types/userPlan'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlanCompletionState {
  monthlyPlansCache: {
    [key: string]: {
      plans: UserPlanMonth[]
      lastUpdated: number
    }
  }
  getMonthlyPlans: (userId: string, planId: string) => UserPlanMonth[] | null
  setMonthlyPlans: (userId: string, planId: string, plans: UserPlanMonth[]) => void
  updateMonthPlan: (userId: string, planId: string, updatedPlan: UserPlanMonth) => void
  getLastUpdated: (userId: string, planId: string) => number
}

export const usePlanCompletionStore = create<PlanCompletionState>()(
  persist(
    (set, get) => ({
      monthlyPlansCache: {},

      getMonthlyPlans: (userId: string, planId: string) => {
        const cacheKey = `${userId}_${planId}`
        const cachedData = get().monthlyPlansCache[cacheKey]
        return cachedData?.plans || null
      },

      getLastUpdated: (userId: string, planId: string) => {
        const cacheKey = `${userId}_${planId}`
        return get().monthlyPlansCache[cacheKey]?.lastUpdated || 0
      },

      setMonthlyPlans: (userId: string, planId: string, plans: UserPlanMonth[]) => {
        const cacheKey = `${userId}_${planId}`
        set((state) => ({
          monthlyPlansCache: {
            ...state.monthlyPlansCache,
            [cacheKey]: {
              plans,
              lastUpdated: Date.now(),
            },
          },
        }))
      },

      updateMonthPlan: (userId: string, planId: string, updatedPlan: UserPlanMonth) => {
        const cacheKey = `${userId}_${planId}`
        set((state) => {
          const cachedData = state.monthlyPlansCache[cacheKey]
          if (!cachedData) return state

          return {
            monthlyPlansCache: {
              ...state.monthlyPlansCache,
              [cacheKey]: {
                plans: cachedData.plans.map((plan) => (plan.month === updatedPlan.month ? updatedPlan : plan)),
                lastUpdated: Date.now(),
              },
            },
          }
        })
      },
    }),
    {
      name: 'plan-completion-storage',
    },
  ),
)
