import BibleViewer from '@/components/bible/BibleViewer'
import { routes, useTypedNavigate, useTypedParams } from '@/router'
import { startOfDay } from 'date-fns'
import { ScrollRestoration } from 'react-router'

const PlanByDatePage = () => {
  const { date } = useTypedParams<'/plan/:planId/:date'>()
  const { navigate } = useTypedNavigate()

  if (!date) {
    navigate(routes.home)
    return null
  }

  const selectedDate = startOfDay(new Date(date.replace(/-/g, '/')))
  const today = startOfDay(new Date())

  // 미래 날짜인 경우 루트로 이동
  if (selectedDate > today) {
    navigate(routes.home)
    return null
  }

  return (
    <>
      <ScrollRestoration />
      <BibleViewer date={selectedDate} />
    </>
  )
}

export default PlanByDatePage
