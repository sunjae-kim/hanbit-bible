import BibleViewer from '@/components/bible/BibleViewer'
import { ScrollRestoration } from 'react-router'

const today = new Date()

const DailyPage = () => {
  return (
    <>
      <ScrollRestoration />
      <BibleViewer date={today} />
    </>
  )
}

export default DailyPage
