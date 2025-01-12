import { UserPlanMonth } from '@/types/userPlan'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlanCompletionState {
  monthlyPlansCache: {
    [key: string]: {
      plans: UserPlanMonth[]
      timestamp: number
    }
  }
  getMonthlyPlans: (userId: string, planId: string) => UserPlanMonth[] | null
  setMonthlyPlans: (userId: string, planId: string, plans: UserPlanMonth[]) => void
  updateMonthPlan: (userId: string, planId: string, updatedPlan: UserPlanMonth) => void
  clearCache: (userId: string, planId: string) => void
}

const CACHE_DURATION = 30 * 60 * 1000 // 30분으로 연장

export const usePlanCompletionStore = create<PlanCompletionState>()(
  persist(
    (set, get) => ({
      monthlyPlansCache: {},

      getMonthlyPlans: (userId: string, planId: string) => {
        const cacheKey = `${userId}_${planId}`
        const cachedData = get().monthlyPlansCache[cacheKey]

        if (!cachedData) return null

        const now = Date.now()
        if (now - cachedData.timestamp > CACHE_DURATION) {
          get().clearCache(userId, planId)
          return null
        }

        return cachedData.plans
      },

      setMonthlyPlans: (userId: string, planId: string, plans: UserPlanMonth[]) => {
        const cacheKey = `${userId}_${planId}`
        set((state) => ({
          monthlyPlansCache: {
            ...state.monthlyPlansCache,
            [cacheKey]: {
              plans,
              timestamp: Date.now(),
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
                timestamp: Date.now(),
              },
            },
          }
        })
      },

      clearCache: (userId: string, planId: string) => {
        const cacheKey = `${userId}_${planId}`
        set((state) => {
          const newCache = { ...state.monthlyPlansCache }
          delete newCache[cacheKey]
          return { monthlyPlansCache: newCache }
        })
      },
    }),
    {
      name: 'plan-completion-storage',
    },
  ),
)
