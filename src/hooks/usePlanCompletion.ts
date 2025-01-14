import defaultPlan from '@/data/defaultPlan.json'
import { useAuthStore } from '@/stores/auth'
import { usePlanCompletionStore } from '@/stores/planCompletion'
import { Plan } from '@/types/plan'
import { format } from 'date-fns'
import { User } from 'firebase/auth'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRepository } from './useRepository'

export function usePlanCompletion(planId: string | null) {
  const user = useAuthStore((state) => state.user)
  const { userPlanMonthRepository } = useRepository()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const plan = defaultPlan as Plan
  const lastRequestId = useRef(0)

  const { getMonthlyPlans, setMonthlyPlans, updateMonthPlan, getLastUpdated } = usePlanCompletionStore()

  const currentYear = new Date().getFullYear()
  const cachedPlans = user && planId ? getMonthlyPlans(user.uid, planId) : null
  const monthlyPlans = useMemo(() => cachedPlans || [], [cachedPlans])

  const fetchAndUpdateCache = useCallback(
    async (force = false, signal?: AbortSignal) => {
      if (!user || !planId) return

      const requestId = ++lastRequestId.current

      try {
        const lastUpdate = getLastUpdated(user.uid, planId)
        const now = Date.now()

        if (!force && now - lastUpdate < 5000) {
          return
        }

        if (requestId !== lastRequestId.current) {
          return
        }

        setLoading(true)
        const loadedPlans = await userPlanMonthRepository.findAllMonths(user.uid, planId, currentYear, signal)

        if (requestId !== lastRequestId.current) {
          return
        }

        // 현재 캐시된 데이터 확인
        const currentCachedPlans = getMonthlyPlans(user.uid, planId)

        if (loadedPlans.length === 0) {
          // 캐시에 데이터가 있다면 Firestore 로딩이 덜 된 것일 수 있음
          if (currentCachedPlans && currentCachedPlans.length > 0) {
            console.warn('Firestore returned empty data but cache exists')
            return // 캐시 데이터 유지
          }

          // 정말 새로운 데이터라면 초기화 진행
          await userPlanMonthRepository.initializeYear(user.uid, planId, currentYear)
          const initializedPlans = await userPlanMonthRepository.findAllMonths(user.uid, planId, currentYear, signal)

          // 초기화 후에도 데이터가 없다면 문제가 있는 것
          if (initializedPlans.length === 0) {
            throw new Error('Failed to initialize plan data')
          }

          setMonthlyPlans(user.uid, planId, initializedPlans)
        } else {
          // 로드된 데이터의 유효성 검증
          if (currentCachedPlans) {
            // 새로 로드된 데이터가 캐시보다 적다면 의심스러운 상황
            if (loadedPlans.length < currentCachedPlans.length) {
              console.warn('Loaded data is smaller than cached data')
              return // 캐시 데이터 유지
            }
          }

          setMonthlyPlans(user.uid, planId, loadedPlans)
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return
        setError(error)
      } finally {
        if (requestId === lastRequestId.current) {
          setLoading(false)
        }
      }
    },
    [user, planId, currentYear, userPlanMonthRepository, setMonthlyPlans, getMonthlyPlans, getLastUpdated],
  )

  useEffect(() => {
    if (!user || !planId) return

    const abortController = new AbortController()

    const fetchData = async () => {
      try {
        if (!cachedPlans) {
          await fetchAndUpdateCache(true, abortController.signal)
        } else {
          await fetchAndUpdateCache(false, abortController.signal)
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return
        }
        setError(error)
      }
    }

    fetchData()

    const intervalId = setInterval(() => {
      fetchAndUpdateCache(false, abortController.signal)
    }, 60000)

    return () => {
      abortController.abort()
      clearInterval(intervalId)
    }
  }, [user, planId, cachedPlans, fetchAndUpdateCache])

  const setCompletion = useCallback(
    async ({ date, value, user: inputUser }: { date?: string; value: boolean; user?: User }) => {
      const currentUser = inputUser ?? user
      const currentDate = date ?? format(new Date(), 'yyyy-MM-dd')

      if (!currentUser || !planId) return

      const [year, month, day] = currentDate.split('-').map(Number)

      // 1) Update store first for immediate UI feedback
      const localMonthPlan = monthlyPlans.find((plan) => plan.year === year && plan.month === month)
      if (localMonthPlan) {
        const updatedLocalPlan = {
          ...localMonthPlan,
          completions: {
            ...localMonthPlan.completions,
            [String(day)]: value,
          },
        }
        updateMonthPlan(currentUser.uid, planId, updatedLocalPlan)
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

        // 4) Force fetch latest data
        await fetchAndUpdateCache(true)
      } catch (error) {
        if (localMonthPlan) {
          // Rollback on error
          const rollbackPlan = {
            ...localMonthPlan,
            completions: {
              ...localMonthPlan.completions,
              [String(day)]: !value,
            },
          }
          updateMonthPlan(currentUser.uid, planId, rollbackPlan)
        }
        setError(error as Error)
        throw error
      }
    },
    [user, planId, monthlyPlans, userPlanMonthRepository, updateMonthPlan, fetchAndUpdateCache],
  )

  const toggleCompletion = useCallback(
    async (date: string) => {
      if (!user || !planId) return

      try {
        const [_, month, day] = date.split('-').map(Number)
        const monthPlan = monthlyPlans.find((p) => p.month === month)
        const newValue = !(monthPlan?.completions[day] ?? false)

        await setCompletion({ date, value: newValue })
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
    refreshData: () => fetchAndUpdateCache(true),
    lastUpdated: user && planId ? getLastUpdated(user.uid, planId) : null,
  }
}
