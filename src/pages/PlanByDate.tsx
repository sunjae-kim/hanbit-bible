import PlanViewer from '@/components/bible/PlanViewer'
import { useNavigate, useParams } from 'react-router'

const PlanByDatePage = () => {
  const { date } = useParams<{ plainId: string; date: string }>()
  const navigate = useNavigate()

  if (!date) {
    navigate('/')
    return null
  }

  return <PlanViewer date={new Date(date.replace(/-/g, '/'))} />
}

export default PlanByDatePage
