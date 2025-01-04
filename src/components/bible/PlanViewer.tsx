import { BIBLE_BOOK_MAPPER, bibleManager } from '@/lib/bible'
import { usePlanStore } from '@/stores/plan'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { format, isSameDay } from 'date-fns'
import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

interface ChapterContent {
  book: string
  chapter: number
  verses: { verse: number; content: string }[]
}

interface IProps {
  date: Date
  children?: React.ReactNode
}

const PlanViewer = ({ date, children }: IProps) => {
  const navigate = useNavigate()
  const { getReadingForDate } = usePlanStore()
  const [chapters, setChapters] = useState<Record<string, ChapterContent[]>>({})
  const reading = getReadingForDate(date)
  const today = new Date()
  const isToday = isSameDay(date, today)

  useEffect(() => {
    const loadChapters = () => {
      if (!reading) return

      const loadedChapters: Record<string, ChapterContent[]> = {}

      for (const range of reading.ranges) {
        const rangeChapters: ChapterContent[] = []
        for (let chapter = range.startChapter; chapter <= range.endChapter; chapter++) {
          try {
            const chapterVerses = bibleManager.getChapter(range.book, chapter)
            const verses = Object.entries(chapterVerses).map(([verseNum, content]) => ({
              verse: parseInt(verseNum),
              content,
            }))

            rangeChapters.push({
              book: range.book,
              chapter,
              verses,
            })
          } catch (error) {
            console.error(`Error loading ${range.book} ${chapter}:`, error)
          }
        }
        const rangeKey = `${range.book}${range.startChapter}-${range.endChapter}`
        loadedChapters[rangeKey] = rangeChapters
      }

      setChapters(loadedChapters)
    }

    loadChapters()
  }, [reading])

  if (!reading) {
    return <div>오늘의 읽기 분량이 없습니다.</div>
  }

  return (
    <div className="bg-primary/10 px-4">
      <div className="relative mx-auto max-w-screen-md pb-4 pt-10">
        <div className="absolute left-0 top-4">
          <button className="-m-5 p-5" onClick={() => navigate('/')}>
            <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
          </button>
        </div>

        <div className="mb-10 flex flex-col items-center justify-center">
          <h1 className="mb-2 text-xl font-bold">{isToday && <span>오늘의 </span>}성경 읽기</h1>
          <div className="flex items-center text-sm text-gray-700">
            <div>{format(date, 'yyyy년 MM월 dd일')}</div>
            <div className="mx-1.5 h-3 w-px bg-gray-700" />
            <div>
              {reading.ranges.map((range, index) => (
                <Fragment key={range.book}>
                  <span>
                    <span>{BIBLE_BOOK_MAPPER[range.book]} </span>
                    {range.startChapter !== range.endChapter ? (
                      <span>
                        {range.startChapter}-{range.endChapter}장
                      </span>
                    ) : (
                      <span>{range.startChapter}장</span>
                    )}
                  </span>
                  {index < reading.ranges.length - 1 && <span>, </span>}
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        {reading.ranges.map((range, index) => {
          const rangeKey = `${range.book}${range.startChapter}-${range.endChapter}`
          const rangeChapters = chapters[rangeKey] || []

          return (
            <div key={index} className="space-y-8">
              {rangeChapters.map((chapter) => (
                <div key={chapter.chapter} className="text-gray-900">
                  <h3 className="mb-2 text-xl font-semibold">
                    {BIBLE_BOOK_MAPPER[range.book]} {chapter.chapter}장
                  </h3>
                  <div className="grid grid-cols-[auto,1fr] items-start gap-x-1.5 gap-y-1 leading-loose">
                    {chapter.verses.map((verse) => (
                      <Fragment key={verse.verse}>
                        <div className="mt-[5px] text-center text-sm font-medium">{verse.verse}</div>
                        <div>{verse.content}</div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {children}
      </div>
    </div>
  )
}

export default PlanViewer
