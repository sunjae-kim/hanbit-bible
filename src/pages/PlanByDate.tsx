import KakaoLoginButton from '@/components/auth/KakaoLoginButton'
import PlanViewer from '@/components/bible/PlanViewer'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { usePlanCompletion } from '@/hooks/usePlanCompletion'
import { useAuthStore } from '@/stores/auth'
import { usePlanStore } from '@/stores/plan'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useCallback, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { toast } from 'react-toastify'

const PlanByDatePage = () => {
  const { date } = useParams<{ plainId: string; date: string }>()
  const location = useLocation()

  const navigate = useNavigate()
  const [loginModal, setLoginModal] = useState(false)
  const user = useAuthStore((state) => state.user)

  const activePlanId = usePlanStore((state) => state.activePlanId)
  const { setCompletion } = usePlanCompletion(activePlanId)

  const markAsRead = useCallback(() => {
    if (!date) return

    if (!user) {
      setLoginModal(true)
    } else {
      setCompletion({ date, value: true })
      navigate('/')
      toast.success('읽기 체크완료!')
    }
  }, [date, user, setCompletion, navigate])

  if (!date) {
    navigate('/')
    return null
  }

  return (
    <>
      <PlanViewer date={new Date(date.replace(/-/g, '/'))}>
        <div className="mb-4 mt-10 flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => navigate('/')}>
            홈으로
          </Button>
          <Button onClick={markAsRead}>읽기표 체크</Button>
        </div>
      </PlanViewer>

      <Modal isOpen={loginModal} setIsOpen={setLoginModal}>
        <div className="relative flex flex-col items-center justify-center px-8 pb-6 pt-8">
          <button className="absolute right-3 top-3 -m-2 p-2" onClick={() => setLoginModal(false)}>
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
          <div className="mb-1 text-lg font-medium">로그인 하시겠습니까?</div>
          <div className="text-sm text-gray-800">로그인 후 읽기표에 체크할 수 있습니다.</div>
          <KakaoLoginButton className="mt-4 w-44" next={location.pathname} />
        </div>
      </Modal>
    </>
  )
}

export default PlanByDatePage
