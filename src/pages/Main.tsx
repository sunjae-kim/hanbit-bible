import Logo from '@/assets/logo.png'
import AppleLoginButton from '@/components/auth/AppleLoginButton'
import KakaoLoginButton from '@/components/auth/KakaoLoginButton'
import { useConfetti } from '@/contexts/confetti.context'
import { usePlanCompletion } from '@/hooks/usePlanCompletion'
import { BIBLE_BOOK_MAPPER } from '@/lib/bible'
import { routes, useTypedNavigate } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { usePlanStore } from '@/stores/plan'
import { KakaoLoginState } from '@/types/user'
import { classNames, encodeObjectToBase64 } from '@/utils'
import { Button } from '@headlessui/react'
import { BookOpenIcon } from '@heroicons/react/20/solid'
import { isBefore, isSameDay } from 'date-fns'
import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'

const LOGIN_TOAST_ID = 'login-required-toast'

const MainPage = () => {
  const { navigate } = useTypedNavigate()
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
  const isInitialMount = useRef(true)
  const curMonthRef = useRef<HTMLDivElement>(null)

  const { toggleCompletion, monthlyPlans, loading } = usePlanCompletion(activePlanId)

  useEffect(() => {
    if (curMonthRef.current && isInitialMount.current) {
      requestAnimationFrame(() => {
        curMonthRef.current?.scrollIntoView({ behavior: 'auto' })
      })
      isInitialMount.current = false
    }
  }, [])

  const { showConfetti } = useConfetti()
  const onCompletionToggle = async (date: string) => {
    if (!user) {
      if (!toast.isActive(LOGIN_TOAST_ID)) {
        toast.info('로그인 후 이용해주세요', {
          toastId: LOGIN_TOAST_ID,
        })
      }
      return
    } else {
      const value = await toggleCompletion(date)
      if (value) {
        showConfetti()
        toast('🎉 읽기 체크완료!')
      }
    }
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="sticky top-0 z-20 bg-gray-50 px-5">
          <header className="mx-auto flex w-full max-w-screen-md items-start justify-between pb-5 pt-10">
            <img className="h-[50px]" src={Logo} alt="logo" />
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex flex-col items-end space-y-1.5">
                  <p className="text-gray-900">
                    안녕하세요,{' '}
                    <span className="font-semibold">
                      {user.displayName || user.providerData[0].displayName || '사용자'}
                    </span>
                    님!
                  </p>
                  <Button
                    className="rounded border border-solid border-gray-400 px-1 text-xs text-gray-600"
                    onClick={useAuthStore.getState().signOut}
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <AppleLoginButton className="h-10" />
                  <KakaoLoginButton className="h-10" from={encodeObjectToBase64<KakaoLoginState>({ path: '/' })} />
                </div>
              )}
            </div>
          </header>
        </div>

        {activePlanId && activePlan && (
          <div className="animate-fade-in p-5">
            <section className="mx-auto w-full max-w-screen-md space-y-10">
              {Object.entries(activePlan.months).map(([month, monthlyPlan]) => {
                const isCurMonth = month === currentMonth

                return (
                  <div key={month}>
                    <div
                      id={month}
                      className="mb-5 scroll-m-[130px] text-2xl font-medium"
                      ref={isCurMonth ? curMonthRef : null}
                    >
                      {today.getFullYear()}년 {month}월
                    </div>
                    <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 sm:grid-cols-4">
                      {Object.entries(monthlyPlan).map(([day, dailyPlan]) => {
                        const isToday = month === currentMonth && day === String(today.getDate())
                        const dateString = `${today.getFullYear()}-${month}-${day}`
                        const date = new Date(dateString.replace(/-/g, '/'))
                        const route = isToday ? routes.daily : routes.toPlanByDate(activePlanId, dateString)
                        const isBeforeToday = isBefore(date, today)
                        const isAfterToday = !isBeforeToday

                        return (
                          <div
                            key={day}
                            className={classNames(
                              'relative flex h-[120px] flex-col overflow-hidden rounded-lg bg-white p-2 shadow-new-lg transition-shadow',
                              isBeforeToday ? 'cursor-pointer hover:shadow-new-2xl' : 'cursor-not-allowed',
                            )}
                            onClick={() => {
                              if (isBeforeToday) {
                                navigate(route)
                              }
                            }}
                          >
                            {!isBeforeToday && <div className="absolute inset-0 z-10 bg-gray-100/70" />}
                            <div className="flex items-start justify-between">
                              <p className="text-lg font-medium text-gray-900">
                                {month}월 {day}일
                              </p>

                              {isSameDay(date, today) && <div className="text-sm font-semibold text-primary">오늘</div>}
                            </div>
                            {dailyPlan.ranges.map((range) => {
                              return (
                                <div key={range.book} className="text-gray-700">
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

                            <div className="absolute bottom-2 right-2 h-8 w-8">
                              {!loading && !isAfterToday && (
                                <input
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onCompletionToggle(dateString)
                                  }}
                                  disabled={!isBeforeToday}
                                  onChange={() => {}}
                                  checked={
                                    monthlyPlans.find((p) => p.month === Number(month))?.completions[day] || false
                                  }
                                  className="h-8 w-8 animate-fade-in accent-primary"
                                  type="checkbox"
                                />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </section>
          </div>
        )}

        <div className="px-5 pb-28">
          <footer className="mx-auto mt-5 flex h-10 w-full max-w-screen-md items-center text-sm text-gray-700">
            <span>문의사항</span>
            <div className="mx-2 h-3 w-px bg-gray-700" />
            <a className="mr-1 underline" href="mailto:json@kakao.com">
              json@kakao.com
            </a>
            <span>한빛교회 1청년부 김선재</span>
          </footer>
        </div>
      </div>

      <button
        onClick={() => navigate(routes.daily)}
        className="fixed bottom-5 right-5 z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-[#719728]"
      >
        <BookOpenIcon className="h-8 w-8" />
        <span className="text-xs">읽으러 가기</span>
      </button>
    </>
  )
}

export default MainPage
