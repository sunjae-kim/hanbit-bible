import Logo from '@/assets/logo.png'
import KakaoLoginButton from '@/components/auth/KakaoLoginButton'
import { usePlanCompletion } from '@/hooks/usePlanCompletion'
import { BIBLE_BOOK_MAPPER } from '@/lib/bible'
import { useAuthStore } from '@/stores/auth'
import { usePlanStore } from '@/stores/plan'
import { classNames } from '@/utils'
import { Button } from '@headlessui/react'
import { BookOpenIcon } from '@heroicons/react/20/solid'
import { isBefore, isSameDay } from 'date-fns'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'

const LOGIN_TOAST_ID = 'login-required-toast'

const MainPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const activePlan = usePlanStore((state) => {
    const plans = state.plans
    const activePlanId = state.activePlanId
    if (!activePlanId) return null
    return plans[activePlanId]
  })
  const activePlanId = usePlanStore((state) => state.activePlanId)

  const today = new Date()
  const currentMonth = String(today.getMonth() + 1)
  const todayRef = useRef<HTMLDivElement>(null)

  const { toggleCompletion, monthlyPlans } = usePlanCompletion(activePlanId)

  useEffect(() => {
    if (todayRef.current) {
      // * Temporarily disabled
      // todayRef.current.scrollIntoView({
      //   behavior: 'auto',
      //   block: 'start',
      // })
    }
  }, [activePlan])

  const onCompletionToggle = (date: string) => {
    if (!user) {
      if (!toast.isActive(LOGIN_TOAST_ID)) {
        toast.info('로그인 후 이용해주세요', {
          toastId: LOGIN_TOAST_ID,
        })
      }
      return
    }
    toggleCompletion(date)
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-gray-50 p-4 pt-10">
        <div className="mx-auto w-full max-w-screen-md grow">
          <header className="mb-10 flex items-end justify-between">
            <img className="h-[50px]" src={Logo} alt="logo" />
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex flex-col items-end space-y-1.5">
                  <p className="text-gray-900">
                    안녕하세요, <span className="font-semibold">{user.providerData[0].displayName || '사용자'}</span>님!
                  </p>
                  <Button
                    className="rounded border border-solid border-gray-400 px-1 text-xs text-gray-600"
                    onClick={useAuthStore.getState().signOut}
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <KakaoLoginButton className="w-40" />
              )}
            </div>
          </header>

          {activePlan && (
            <section className="mt-5 space-y-10">
              {Object.entries(activePlan.months).map(([month, monthlyPlan]) => {
                const isToday = month === currentMonth
                return (
                  <div key={month}>
                    <div className="mb-5 scroll-m-5 text-2xl font-medium" ref={isToday ? todayRef : null}>
                      {today.getFullYear()}년 {month}월
                    </div>
                    <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
                      {Object.entries(monthlyPlan).map(([day, dailyPlan]) => {
                        const isToday = month === currentMonth && day === String(today.getDate())
                        const dateString = `${today.getFullYear()}-${month}-${day}`
                        const date = new Date(dateString.replace(/-/g, '/'))
                        const route = isToday ? '/daily' : `/plan/${activePlanId}/${dateString}`
                        const isBeforeToday = isBefore(date, today)

                        return (
                          <div
                            key={day}
                            className={classNames(
                              'relative flex h-[100px] flex-col overflow-hidden rounded-lg bg-white p-2 shadow-new-lg transition-shadow',
                              isBeforeToday ? 'cursor-pointer hover:shadow-new-2xl' : 'cursor-not-allowed',
                            )}
                            onClick={() => {
                              if (isBeforeToday) {
                                navigate(route)
                              }
                            }}
                          >
                            {!isBeforeToday && <div className="absolute inset-0 z-10 bg-gray-100/70" />}
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {month}월 {day}일
                              </p>

                              {isSameDay(date, today) && <div className="text-xs font-semibold text-primary">오늘</div>}
                            </div>
                            {dailyPlan.ranges.map((range) => {
                              return (
                                <div key={range.book} className="text-xs text-gray-700 xs:text-sm">
                                  <span>{BIBLE_BOOK_MAPPER[range.book]} </span>
                                  {range.startChapter !== range.endChapter ? (
                                    <span>
                                      {range.startChapter}-{range.endChapter}장
                                    </span>
                                  ) : (
                                    <span>{range.startChapter}장</span>
                                  )}
                                </div>
                              )
                            })}

                            <div className="absolute bottom-2 right-2 h-6 w-6">
                              <input
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onCompletionToggle(dateString)
                                }}
                                disabled={!isBeforeToday}
                                onChange={() => {}}
                                checked={monthlyPlans.find((p) => p.month === Number(month))?.completions[day] || false}
                                className="h-6 w-6 accent-primary"
                                type="checkbox"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </section>
          )}

          <footer className="mt-5 flex h-10 items-center text-sm text-gray-700">
            <span>문의사항</span>
            <div className="mx-2 h-3 w-px bg-gray-700" />
            <a className="mr-1 underline" href="tel:010-3747-8756">
              010-3747-8756
            </a>
            <span>1청년부 김선재</span>
          </footer>
        </div>
      </div>

      <button
        onClick={() => navigate('/daily')}
        className="fixed bottom-5 right-5 z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-[#719728]"
      >
        <BookOpenIcon className="h-8 w-8" />
        <span className="text-xs">읽으러 가기</span>
      </button>
    </>
  )
}

export default MainPage
