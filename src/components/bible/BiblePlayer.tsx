import AppleLoginButton from '@/components/auth/AppleLoginButton'
import KakaoLoginButton from '@/components/auth/KakaoLoginButton'
import AmenButton from '@/components/bible/AmenButton'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useConfetti } from '@/contexts/confetti.context'
import bibleYoutubeData from '@/data/bibleYoutubeData'
import { useLikes } from '@/hooks/useLikes'
import { BIBLE_BOOK_MAPPER } from '@/lib/bible'
import { useAuthStore } from '@/stores/auth'
import { BibleRange } from '@/types/plan'
import { KAKAO_LOGIN_CONTEXT, KakaoLoginState } from '@/types/user'
import { classNames, encodeObjectToBase64 } from '@/utils'
import { shareLink } from '@/utils/shareLink'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid'
import 'animate.css'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import YouTube, { YouTubeEvent } from 'react-youtube'

interface VideoSequenceItem {
  videoId: string
  startTime: string
  endTime: string
}

interface PlayerControls {
  isPlaying: boolean
  isEnded: boolean
  playbackRate: number
}

const timeToSeconds = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number)
  return minutes * 60 + seconds
}

const playbackRates = [0.5, 1, 1.5, 2] as const

interface IProps {
  bibleRange: BibleRange[]
  date: Date
  onEnded?: () => void
}

function createVideoSequence(bibleRange: BibleRange[], csvData: string): VideoSequenceItem[] {
  // CSV 파싱
  const rows = csvData.trim().split('\n').slice(1) // 헤더 제거
  const bibleData = rows.map((row) => {
    const [book, chapter, youtubeId, startTime, endTime] = row.split(',')
    return {
      book,
      chapter: parseInt(chapter),
      youtubeId,
      startTime,
      endTime,
    }
  })

  const videoSequence: VideoSequenceItem[] = []

  // 각 bible range에 대해 처리
  bibleRange.forEach((range) => {
    let currentVideoId = ''
    let currentStartTime = ''
    let currentEndTime = ''

    // range에 해당하는 챕터들 필터링
    const chaptersInRange = bibleData.filter(
      (item) => item.book === range.book && item.chapter >= range.startChapter && item.chapter <= range.endChapter,
    )

    // 연속된 챕터들을 하나의 시퀀스로 묶기
    chaptersInRange.forEach((chapter, index) => {
      if (currentVideoId === '') {
        // 새로운 시퀀스 시작
        currentVideoId = chapter.youtubeId
        currentStartTime = chapter.startTime
        currentEndTime = chapter.endTime
      } else if (currentVideoId === chapter.youtubeId) {
        // 같은 비디오ID면 endTime만 업데이트
        currentEndTime = chapter.endTime
      } else {
        // 다른 비디오ID를 만나면 이전 시퀀스 저장하고 새로 시작
        videoSequence.push({
          videoId: currentVideoId,
          startTime: currentStartTime,
          endTime: currentEndTime,
        })
        currentVideoId = chapter.youtubeId
        currentStartTime = chapter.startTime
        currentEndTime = chapter.endTime
      }

      // 마지막 챕터이면 현재 시퀀스 저장
      if (index === chaptersInRange.length - 1) {
        videoSequence.push({
          videoId: currentVideoId,
          startTime: currentStartTime,
          endTime: currentEndTime,
        })
      }
    })
  })

  return videoSequence
}

const BiblePlayer = ({ bibleRange, onEnded, date }: IProps) => {
  const user = useAuthStore((state) => state.user)
  const videoSequence = createVideoSequence(bibleRange, bibleYoutubeData)
  const [continueModal, setContinueModal] = useState(false)
  const [loginModal, setLoginModal] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isAllPlayersReady, setIsAllPlayersReady] = useState(false) // 추가된 상태
  const { showConfetti } = useConfetti()
  const [controls, setControls] = useState<PlayerControls>({
    isPlaying: false,
    isEnded: false,
    playbackRate: 1,
  })

  const playerRefs = useRef<any[]>(videoSequence.map(() => null))
  const readyPlayersCount = useRef(0)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const getPlayerOpts = (videoItem: VideoSequenceItem) => ({
    height: '100%',
    width: '100%',
    playerVars: {
      start: timeToSeconds(videoItem.startTime),
      end: timeToSeconds(videoItem.endTime),
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      rel: 0,
      showinfo: 0,
      playsinline: 1,
      autoplay: 0,
      mute: 1,
    },
  })

  const playNextVideo = useCallback(() => {
    const nextIndex = currentVideoIndex + 1
    if (nextIndex < videoSequence.length) {
      setCurrentVideoIndex(nextIndex)
      const nextPlayer = playerRefs.current[nextIndex]
      if (nextPlayer) {
        nextPlayer.playVideo()
        nextPlayer.unMute()
      }
    }
  }, [currentVideoIndex, videoSequence.length])

  const handleStateChange = useCallback(
    (event: YouTubeEvent) => {
      const ENDED = 0
      const PLAYING = 1
      const PAUSED = 2

      switch (event.data) {
        case PLAYING:
          event.target.setPlaybackRate(controls.playbackRate)
          setControls((prev) => ({ ...prev, isPlaying: true }))
          break

        case PAUSED:
          setControls((prev) => ({ ...prev, isPlaying: false }))
          break

        case ENDED:
          if (currentVideoIndex < videoSequence.length - 1) {
            if (isMobile) {
              setContinueModal(true)
              setCurrentVideoIndex((prev) => prev + 1)
              setControls((prev) => ({ ...prev, isPlaying: false }))
            } else {
              playNextVideo()
            }
          } else {
            setControls((prev) => ({ ...prev, isEnded: true, isPlaying: false }))
            onEnded?.()
            showConfetti()
          }
          break
      }
    },
    [controls.playbackRate, currentVideoIndex, videoSequence.length, isMobile, playNextVideo, onEnded, showConfetti],
  )

  const togglePlay = useCallback(() => {
    if (!user) {
      setLoginModal(true)
      return
    }

    const playerRef = playerRefs.current[currentVideoIndex]

    if (playerRef) {
      if (controls.isPlaying) {
        playerRef.pauseVideo()
        playerRef.mute()
      } else {
        playerRef.playVideo()
        playerRef.unMute()
      }
    }
  }, [controls.isPlaying, currentVideoIndex, user])

  const changePlaybackRate = useCallback(
    (rate: number) => {
      const playerRef = playerRefs.current[currentVideoIndex]

      if (playerRef) {
        playerRef.setPlaybackRate(rate)
        setControls((prev) => ({ ...prev, playbackRate: rate }))
      }
    },
    [currentVideoIndex],
  )

  const handleReady = useCallback(
    (target: any, index: number) => {
      playerRefs.current[index] = target
      readyPlayersCount.current += 1

      if (readyPlayersCount.current === videoSequence.length) {
        setIsAllPlayersReady(true)
      }
    },
    [videoSequence.length],
  )

  const getNextChapterInfo = useCallback(() => {
    const nextVideo = videoSequence[currentVideoIndex]
    const rows = bibleYoutubeData.trim().split('\n').slice(1)
    const matchingChapter = rows.find((row) => {
      const [, , youtubeId, startTime] = row.split(',')
      return youtubeId === nextVideo.videoId && startTime === nextVideo.startTime
    })

    if (matchingChapter) {
      const [book, chapter] = matchingChapter.split(',')
      const bookName = BIBLE_BOOK_MAPPER[book]
      return `${bookName} ${chapter}장`
    }

    return ''
  }, [currentVideoIndex, videoSequence])

  const { liked } = useLikes(date)

  const shareText = bibleRange
    .map(
      (range) =>
        `${BIBLE_BOOK_MAPPER[range.book]} ${
          range.startChapter === range.endChapter
            ? `${range.startChapter}장`
            : `${range.startChapter}-${range.endChapter}장`
        }`,
    )
    .join(', ')

  if (videoSequence.length === 0) {
    return (
      <div className="mb-10 flex w-full flex-col items-center">
        <div className="relative mb-2 w-full">
          <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-white p-4">
            <div className="mb-2 text-xl font-medium text-gray-800">영상 준비중 🎬</div>
            <p className="text-center text-gray-600">
              해당 성경 구절의 영상을 준비하고 있습니다.
              <br />
              조금만 기다려주세요!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative mb-2 w-full">
        {controls.isEnded ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-white p-4">
            <div className="animate__animated animate__tada mb-1 flex text-base font-medium xs:text-xl">
              성경을 다 읽었어요 🥳
            </div>
            <p
              className={classNames('text-sm text-gray-500 xs:text-base', liked ? 'h-0 opacity-0' : 'h-5 xs:h-6')}
              style={{ transition: 'height 0.3s, opacity 0.3s' }}
            >
              하트 버튼을 클릭해서 아멘해보세요
            </p>

            <div className="mt-5">
              <AmenButton date={date} />
            </div>

            <button
              className="mt-5 font-medium text-gray-600 underline underline-offset-2"
              onClick={() =>
                shareLink({
                  title: '오늘의 성경 읽기',
                  text: `성경 읽기: ${shareText}`,
                })
              }
            >
              친구에게 링크 공유하기
            </button>
          </div>
        ) : (
          <div className="relative aspect-video w-full">
            <div
              className="absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-center bg-black bg-opacity-50"
              onClick={() => {
                togglePlay()
              }}
            />
            {videoSequence.map((videoItem, index) => {
              const isCurrent = index === currentVideoIndex

              return (
                <YouTube
                  key={videoItem.videoId}
                  className={classNames(
                    'pointer-events-none absolute left-0 top-0 h-full w-full',
                    isCurrent ? 'block' : 'hidden',
                  )}
                  videoId={videoItem.videoId}
                  opts={getPlayerOpts(videoItem)}
                  onStateChange={isCurrent ? handleStateChange : undefined}
                  onReady={(event: any) => handleReady(event.target, index)}
                />
              )
            })}
          </div>
        )}
      </div>
      <div className={classNames('mb-5 self-end text-xs text-gray-500', controls.isEnded ? 'invisible' : 'visible')}>
        영상출처: CGN 유튜브
      </div>

      <div className="mb-16">
        {isAllPlayersReady && !controls.isEnded ? (
          <div className="flex animate-fade-in items-center space-x-4 rounded-lg bg-white p-2 shadow-new-2xl">
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-colors duration-200 hover:bg-blue-600"
              aria-label={controls.isPlaying ? '일시정지' : '재생'}
            >
              {controls.isEnded ? (
                <div className="h-3 w-3 rounded-sm bg-white" />
              ) : controls.isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </button>

            <div className="grid grid-cols-4 gap-2">
              {playbackRates.map((rate) => (
                <button
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    controls.playbackRate === rate
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-300'
                  } `}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-14" />
        )}
      </div>

      {isMobile && (
        <Modal isOpen={continueModal} setIsOpen={setContinueModal}>
          <div className="px-14 pb-5 pt-8">
            <p className="text-lg font-medium">다음 영상을 재생할까요?</p>
            <p className="mt-2 text-center text-gray-800">{getNextChapterInfo()}</p>
            <Button
              onClick={() => {
                togglePlay()
                setContinueModal(false)
              }}
              className="mt-6 w-full !bg-blue-500 !text-base"
            >
              계속 재생
            </Button>
          </div>
        </Modal>
      )}

      <Modal isOpen={loginModal} setIsOpen={setLoginModal}>
        <div className="relative flex flex-col items-center justify-center px-8 pb-6 pt-8">
          <button className="absolute right-3 top-3 -m-2 p-2" onClick={() => setLoginModal(false)}>
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div className="mb-1 text-lg font-medium">로그인 하시겠습니까?</div>
          <div className="text-sm text-gray-800">영상은 로그인 후에 이용하실 수 있습니다.</div>
          <AppleLoginButton
            className="mt-4 w-44"
            onSuccess={() => {
              setLoginModal(false)
              toast.success('로그인 성공!')
            }}
          />
          <KakaoLoginButton
            className="mt-2 w-44"
            from={encodeObjectToBase64<KakaoLoginState>({
              context: KAKAO_LOGIN_CONTEXT.PLAYER,
              path: location.pathname,
            })}
          />
        </div>
      </Modal>
    </div>
  )
}

export default BiblePlayer
