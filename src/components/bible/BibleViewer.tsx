import AppleLoginButton from '@/components/auth/AppleLoginButton'
import KakaoLoginButton from '@/components/auth/KakaoLoginButton'
import AmenButton from '@/components/bible/AmenButton'
import BiblePlayer from '@/components/bible/BiblePlayer'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useConfetti } from '@/contexts/confetti.context'
import { useLikes } from '@/hooks/useLikes'
import { usePlanCompletion } from '@/hooks/usePlanCompletion'
import { BIBLE_BOOK_MAPPER, bibleManager } from '@/lib/bible'
import { useAuthStore } from '@/stores/auth'
import { usePlanStore } from '@/stores/plan'
import { KAKAO_LOGIN_CONTEXT, KakaoLoginState } from '@/types/user'
import { encodeObjectToBase64 } from '@/utils'
import { shareLink } from '@/utils/shareLink'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { ArrowUpOnSquareIcon, ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { format, isSameDay } from 'date-fns'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import TextController from './TextController'
import { useTextSettingsStore } from '@/stores/text-setting'

interface ChapterContent {
  book: string
  chapter: number
  verses: { verse: number; content: string }[]
}

interface IProps {
  date: Date
}

const BibleViewer = ({ date }: IProps) => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { getReadingForDate } = usePlanStore()
  const [chapters, setChapters] = useState<Record<string, ChapterContent[]>>({})
  const reading = getReadingForDate(date)
  const today = useMemo(() => new Date(), [])
  const isToday = isSameDay(date, today)
  const { stats, isLoading } = useLikes(date)
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const { setCompletion } = usePlanCompletion(activePlanId)
  const [loginModal, setLoginModal] = useState(false)
  const { showConfetti } = useConfetti()

  const markAsReadAndLeave = useCallback(() => {
    if (!user) {
      setLoginModal(true)
    } else {
      setCompletion({ date: format(date, 'yyyy-MM-dd'), value: true })
      toast('🎉 읽기 체크완료!')
      navigate('/')
      showConfetti()
    }
  }, [user, setCompletion, navigate, date, showConfetti])

  useEffect(() => {
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
          rangeChapters.push({ book: range.book, chapter, verses })
        } catch (error) {
          console.error(`Error loading ${range.book} ${chapter}:`, error)
        }
      }
      const rangeKey = `${range.book}${range.startChapter}-${range.endChapter}`
      loadedChapters[rangeKey] = rangeChapters
    }

    setChapters(loadedChapters)
  }, [reading])

  const shareText = reading?.ranges
    .map(
      (range) =>
        `${BIBLE_BOOK_MAPPER[range.book]} ${
          range.startChapter === range.endChapter
            ? `${range.startChapter}장`
            : `${range.startChapter}-${range.endChapter}장`
        }`,
    )
    .join(', ')

  // text control
  const [controllerModal, setControllerModal] = useState(false)
  const { fontSize, lineHeight, letterSpacing } = useTextSettingsStore()

  if (!reading) {
    return <div>오늘의 읽기 분량이 없습니다.</div>
  }

  return (
    <>
      <div className="bg-primary/10 px-4">
        <div className="relative mx-auto min-h-screen max-w-screen-md pb-4 pt-20">
          <div className="absolute top-4 flex w-full items-start">
            <button className="-m-5 p-5" onClick={() => navigate('/')}>
              <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
            </button>

            <TextController className="ml-auto mr-4" isOpen={controllerModal} setIsOpen={setControllerModal} />

            <button
              className="-m-2 flex flex-col items-center justify-center p-2"
              onClick={() =>
                shareLink({
                  title: '오늘의 성경 읽기',
                  text: `성경 읽기: ${shareText}`,
                })
              }
            >
              <ArrowUpOnSquareIcon className="mb-1 h-6 w-6 text-gray-800" />
              <span className="text-xs">공유하기</span>
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
            <div className="mt-2 h-[20px] text-sm font-medium">
              {!isLoading && (
                <div className="animate-fade-in">
                  {stats.totalCompletions > 0 ? (
                    <p className="text-gray-700">
                      {isToday && <span>오늘 </span>} {stats.totalCompletions.toLocaleString()}명이 읽었어요 📖
                    </p>
                  ) : (
                    <p className="text-gray-500">아직 아무도 읽지 않았어요 😢</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <BiblePlayer
            date={date}
            bibleRange={reading.ranges}
            onEnded={() => {
              if (isToday) {
                toast.success('오늘의 성경 읽기를 완료했어요! 🎉')
              } else {
                toast.success('성경 읽기를 완료했어요! 🎉')
              }
            }}
          />

          {reading.ranges.map((range, index) => {
            const rangeKey = `${range.book}${range.startChapter}-${range.endChapter}`
            const rangeChapters = chapters[rangeKey] || []

            return (
              <div key={index} className="animate-fade-in-fast space-y-8">
                {rangeChapters.map((chapter) => (
                  <div key={chapter.chapter} className="text-gray-900">
                    <h3 className="mb-2 text-xl font-semibold">
                      {BIBLE_BOOK_MAPPER[range.book]} {chapter.chapter}장
                    </h3>
                    <div
                      className="font-myeongjo grid grid-cols-[auto,1fr] items-start gap-x-1.5 gap-y-1"
                      style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: lineHeight,
                        letterSpacing: `${letterSpacing}px`,
                      }}
                    >
                      {chapter.verses.map((verse) => (
                        <Fragment key={verse.verse}>
                          <div className="text-center font-semibold">{verse.verse}</div>
                          <div className="font-myeongjo">{verse.content}</div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

          {user && (
            <div className="mt-5 xs:mt-10">
              <AmenButton date={date} onLikeClick={() => showConfetti()} />
            </div>
          )}

          <div className="mb-4 mt-10 grid animate-fade-in grid-cols-2 gap-2">
            <Button className="py-5 !text-base" variant="secondary" onClick={() => navigate('/')}>
              읽기표 보러가기
            </Button>
            <Button onClick={markAsReadAndLeave}>
              <div className="flex items-center justify-center space-x-1 text-base">
                <CheckCircleIcon className="h-5 w-5" />
                <span>읽기표 체크하기</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={loginModal} setIsOpen={setLoginModal}>
        <div className="relative flex flex-col items-center justify-center px-8 pb-6 pt-8">
          <button className="absolute right-3 top-3 -m-2 p-2" onClick={() => setLoginModal(false)}>
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div className="mb-1 text-lg font-medium">로그인 하시겠습니까?</div>
          <div className="text-sm text-gray-800">로그인 후 읽기표에 체크할 수 있습니다.</div>
          <AppleLoginButton
            className="mt-4 w-44"
            onSuccess={(user) => {
              setLoginModal(false)
              setCompletion({ date: format(date, 'yyyy-MM-dd'), value: true, user })
              navigate('/')
              toast('🎉 읽기 체크완료!')
              showConfetti()
            }}
          />
          <KakaoLoginButton
            className="mt-2 w-44"
            from={encodeObjectToBase64<KakaoLoginState>({
              context: KAKAO_LOGIN_CONTEXT.CHECK,
              path: location.pathname,
            })}
          />
        </div>
      </Modal>
    </>
  )
}

export default BibleViewer
