import BibleViewer from '@/components/bible/BibleViewer'
import { startOfDay } from 'date-fns'
import { useNavigate, useParams } from 'react-router'

const PlanByDatePage = () => {
  const { date } = useParams<{ plainId: string; date: string }>()
  const navigate = useNavigate()

  if (!date) {
    navigate('/')
    return null
  }

  const selectedDate = startOfDay(new Date(date.replace(/-/g, '/')))
  const today = startOfDay(new Date())

  // 미래 날짜인 경우 루트로 이동
  if (selectedDate > today) {
    navigate('/')
    return null
  }

  return <BibleViewer date={selectedDate} />
}

export default PlanByDatePage
