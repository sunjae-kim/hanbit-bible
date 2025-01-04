import defaultPlan from '@/data/defaultPlan.json'
import { useAuthStore } from '@/stores/auth'
import { usePlanCompletionStore } from '@/stores/planCompletion'
import { Plan } from '@/types/plan'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRepository } from './useRepository'

export function usePlanCompletion(planId: string | null) {
  const user = useAuthStore((state) => state.user)
  const { userPlanMonthRepository } = useRepository()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const plan = defaultPlan as Plan

  const { getMonthlyPlans, setMonthlyPlans, updateMonthPlan } = usePlanCompletionStore()

  const currentYear = new Date().getFullYear()

  // 캐시된 데이터 가져오기
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

  const toggleCompletion = useCallback(
    async (date: string) => {
      if (!user || !planId) return

      try {
        const [year, month, day] = date.split('-').map(Number)
        const monthPlan = monthlyPlans.find((p) => p.month === month)
        const newValue = !(monthPlan?.completions[day] ?? false)

        const updatedMonth = await userPlanMonthRepository.updateCompletion(
          user.uid,
          planId,
          year,
          month,
          String(day),
          newValue,
        )

        updateMonthPlan(user.uid, planId, updatedMonth)
      } catch (err) {
        setError(err as Error)
        throw err
      }
    },
    [user, planId, userPlanMonthRepository, updateMonthPlan, monthlyPlans],
  )

  const setCompletion = useCallback(
    async (date: string, value: boolean) => {
      if (!user || !planId) return

      try {
        const [year, month, day] = date.split('-').map(Number)

        const updatedMonth = await userPlanMonthRepository.updateCompletion(
          user.uid,
          planId,
          year,
          month,
          String(day),
          value,
        )

        updateMonthPlan(user.uid, planId, updatedMonth)
      } catch (err) {
        setError(err as Error)
        throw err
      }
    },
    [user, planId, userPlanMonthRepository, updateMonthPlan],
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
