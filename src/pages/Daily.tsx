import PlanViewer from '@/components/bible/PlanViewer'

const today = new Date()

const DailyPage = () => {
  return <PlanViewer date={today} />
}

export default DailyPage
