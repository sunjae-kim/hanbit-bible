import BibleViewer from '@/components/bible/BibleViewer'

const today = new Date()

const DailyPage = () => {
  return <BibleViewer date={today} />
}

export default DailyPage
