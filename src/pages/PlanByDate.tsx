import PlanViewer from '@/components/bible/PlanViewer'
import Button from '@/components/ui/Button'
import { useNavigate, useParams } from 'react-router'

const PlanByDatePage = () => {
  const { date } = useParams<{ plainId: string; date: string }>()
  const navigate = useNavigate()

  if (!date) {
    navigate('/')
    return null
  }

  return (
    <>
      <PlanViewer date={new Date(date)}>
        <div className="mb-4 mt-10 flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => navigate('/')}>
            홈으로
          </Button>
        </div>
      </PlanViewer>
    </>
  )
}

export default PlanByDatePage
