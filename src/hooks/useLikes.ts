import { useAuthStore } from '@/stores/auth'
import { usePlanStore } from '@/stores/plan'
import { useCallback, useEffect, useState } from 'react'
import { useRepository } from './useRepository'

export const useLikes = (date: Date) => {
  const [liked, setLiked] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [stats, setStats] = useState({ totalLikes: 0, totalCompletions: 0 })
  const [isLoading, setIsLoading] = useState(true) // 로딩 상태 추가

  const user = useAuthStore((state) => state.user)
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const { userPlanMonthRepository } = useRepository()

  useEffect(() => {
    if (!activePlanId) return
    setIsLoading(true)
    const unsubscribe = userPlanMonthRepository.listenToPlanStats(activePlanId, date, (stats) => {
      setStats(stats)
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
      setIsLoading(true)
    }
  }, [activePlanId, userPlanMonthRepository, date])

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const loadData = async () => {
      if (!user || !activePlanId) return

      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = String(date.getDate())

      const monthData = await userPlanMonthRepository.findMonth(user.uid, activePlanId, year, month)

      if (!isMounted) return
      setLiked(!!monthData?.likes?.[day])
      setIsLoading(false)
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [user, activePlanId, date, userPlanMonthRepository])

  const setAsLike = useCallback(async () => {
    if (!user || !activePlanId) return

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = String(date.getDate())

    setAnimate(true)
    setTimeout(() => setAnimate(false), 1000)

    try {
      if (!liked) {
        const newLikedState = !liked
        setLiked(newLikedState)
        setStats((prev) => ({
          ...prev,
          totalLikes: prev.totalLikes + (newLikedState ? 1 : -1),
        }))

        await userPlanMonthRepository.updateLike(user.uid, activePlanId, year, month, day, newLikedState)
      }

      // Refresh stats after update
    } catch (err) {
      // Revert on error
      setLiked(!liked)
      console.error('Failed to update like:', err)
    }
  }, [user, activePlanId, date, liked, userPlanMonthRepository])

  return {
    liked,
    animate,
    stats,
    isLoading,
    setAsLike,
  }
}
