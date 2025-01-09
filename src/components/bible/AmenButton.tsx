import { HeartIcon } from '@heroicons/react/20/solid'
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline'

import { useLikes } from '@/hooks/useLikes'
import { classNames } from '@/utils'
import { format } from 'date-fns'
import { usePlanCompletion } from '@/hooks/usePlanCompletion'
import { usePlanStore } from '@/stores/plan'

interface IProps {
  date: Date
  onLikeClick?: (liked: boolean) => void
}

const AmenButton = ({ date, onLikeClick }: IProps) => {
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const { setCompletion } = usePlanCompletion(activePlanId)
  const { liked, animate, stats, setAsLike, isLoading } = useLikes(date)

  return (
    <div className="flex flex-col items-center justify-center">
      <button
        className="h-16 xs:h-[104px]"
        onClick={() => {
          setCompletion({ date: format(date, 'yyyy-MM-dd'), value: true })
          setAsLike()
          onLikeClick?.(liked)
        }}
      >
        {!isLoading && (
          <div className="flex animate-fade-in flex-col items-center space-y-1">
            {liked ? (
              <HeartIcon
                className={classNames(
                  'h-10 w-10 text-red-500 xs:h-20 xs:w-20',
                  animate ? 'animate__animated animate__rubberBand' : '',
                )}
              />
            ) : (
              <HeartIconOutline className="animate__animated animate__rubberBand h-10 w-10 text-red-500 xs:h-20 xs:w-20" />
            )}

            {liked ? (
              <span className="animate-fade-in text-sm font-medium text-red-500">
                {stats.totalLikes.toLocaleString()}명이 아멘했어요
              </span>
            ) : (
              <span className="invisible text-sm">아멘하기</span>
            )}
          </div>
        )}
      </button>
    </div>
  )
}

export default AmenButton
