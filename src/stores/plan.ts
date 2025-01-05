import defaultPlan from '@/data/defaultPlan.json'
import { DailyReading, Plan } from '@/types/plan'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlanState {
  plans: { [planId: string]: Plan }
  activePlanId: string | null
  isLoading: boolean
  error: string | null
}

interface PlanActions {
  setActivePlan: (planId: string) => void
  getReadingForDate: (date: Date) => DailyReading | null
  createCustomPlan: (plan: Plan) => void
  loadDefaultPlan: () => void
}

export const usePlanStore = create<PlanState & PlanActions>()(
  persist(
    (set, get) => ({
      plans: {},
      activePlanId: null,
      isLoading: true,
      error: null,

      loadDefaultPlan: () => {
        try {
          set({ isLoading: true, error: null })

          const plan = defaultPlan as Plan

          set((state) => ({
            plans: {
              ...state.plans,
              [plan.id]: plan,
            },
            activePlanId: plan.id,
            isLoading: false,
          }))
        } catch {
          set({
            error: '기본 플랜을 불러오는데 실패했습니다.',
            isLoading: false,
          })
        }
      },

      setActivePlan: (planId) => {
        set({ activePlanId: planId })
      },

      getReadingForDate: (date) => {
        const { plans, activePlanId } = get()
        if (!activePlanId) return null

        const plan = plans[activePlanId]
        const month = String(date.getMonth() + 1)
        const day = String(date.getDate())

        return plan?.months[month]?.[day] || null
      },

      createCustomPlan: (plan) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [plan.id]: plan,
          },
        }))
      },
    }),
    {
      name: 'bible-reading-plan',
      partialize: (state) => ({
        plans: state.plans,
        activePlanId: state.activePlanId,
      }),
    },
  ),
)
