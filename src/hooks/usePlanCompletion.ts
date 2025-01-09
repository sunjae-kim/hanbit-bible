import defaultPlan from '@/data/defaultPlan.json'
import { useAuthStore } from '@/stores/auth'
import { usePlanCompletionStore } from '@/stores/planCompletion'
import { Plan } from '@/types/plan'
import { format } from 'date-fns'
import { User } from 'firebase/auth'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRepository } from './useRepository'

export function usePlanCompletion(planId: string | null) {
  const user = useAuthStore((state) => state.user)
  const { userPlanMonthRepository } = useRepository()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const plan = defaultPlan as Plan

  const { getMonthlyPlans, setMonthlyPlans, updateMonthPlan } = usePlanCompletionStore()

  const currentYear = new Date().getFullYear()
  const cachedPlans = user && planId ? getMonthlyPlans(user.uid, planId) : null
  const monthlyPlans = useMemo(() => cachedPlans || [], [cachedPlans])

  useEffect(() => {
    if (!user || !planId) return

    const loadPlans = async () => {
      const cached = getMonthlyPlans(user.uid, planId)

      if (cached) {
        return
      }

      try {
        setLoading(true)
        setError(null)

        const loadedPlans = await userPlanMonthRepository.findAllMonths(user.uid, planId, currentYear)

        if (loadedPlans.length === 0) {
          await userPlanMonthRepository.initializeYear(user.uid, planId, currentYear)
          const initializedPlans = await userPlanMonthRepository.findAllMonths(user.uid, planId, currentYear)
          setMonthlyPlans(user.uid, planId, initializedPlans)
        } else {
          setMonthlyPlans(user.uid, planId, loadedPlans)
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [user, planId, userPlanMonthRepository, currentYear, getMonthlyPlans, setMonthlyPlans])

  const setCompletion = useCallback(
    async ({ date, value, user: inputUser }: { date?: string; value: boolean; user?: User }) => {
      const currentUser = inputUser ?? user
      const currentDate = date ?? format(new Date(), 'yyyy-MM-dd')

      if (!currentUser || !planId) return

      const [year, month, day] = currentDate.split('-').map(Number)

      // 1) Update store first for immediate UI feedback
      const localMonthPlan = monthlyPlans.find((plan) => plan.year === year && plan.month === month)
      if (localMonthPlan) {
        localMonthPlan.completions[String(day)] = value
        updateMonthPlan(currentUser.uid, planId, { ...localMonthPlan })
      }

      try {
        // 2) Then update repository
        const updatedMonth = await userPlanMonthRepository.updateCompletion(
          currentUser.uid,
          planId,
          year,
          month,
          String(day),
          value,
        )
        // 3) Sync final repository result in store
        updateMonthPlan(currentUser.uid, planId, updatedMonth)
      } catch (error) {
        // 4) Revert local update if needed
        if (localMonthPlan) {
          localMonthPlan.completions[String(day)] = !value
          updateMonthPlan(currentUser.uid, planId, { ...localMonthPlan })
        }
        setError(error as Error)
        throw error
      }
    },
    [user, planId, monthlyPlans, userPlanMonthRepository, updateMonthPlan],
  )

  const toggleCompletion = useCallback(
    async (date: string) => {
      if (!user || !planId) return

      try {
        const [_, month, day] = date.split('-').map(Number)
        const monthPlan = monthlyPlans.find((p) => p.month === month)
        const newValue = !(monthPlan?.completions[day] ?? false)

        setCompletion({ date, value: newValue })
        return newValue
      } catch (err) {
        setError(err as Error)
        throw err
      }
    },
    [user, planId, monthlyPlans, setCompletion],
  )

  const getAllCompletions = useCallback(() => {
    const allCompletions: { [date: string]: boolean } = {}
    monthlyPlans.forEach((monthPlan) => {
      Object.entries(monthPlan.completions).forEach(([day, completed]) => {
        const date = `${currentYear}-${String(monthPlan.month).padStart(2, '0')}-${day.padStart(2, '0')}`
        allCompletions[date] = completed
      })
    })
    return allCompletions
  }, [monthlyPlans, currentYear])

  const getCompletion = useCallback(
    (date: string) => {
      const [_, month, day] = date.split('-').map(Number)
      const monthPlan = monthlyPlans.find((p) => p.month === month)
      return monthPlan?.completions[String(day)] || false
    },
    [monthlyPlans],
  )

  return {
    monthlyPlans,
    plan,
    loading,
    error,
    toggleCompletion,
    getAllCompletions,
    getCompletion,
    setCompletion,
  }
}
