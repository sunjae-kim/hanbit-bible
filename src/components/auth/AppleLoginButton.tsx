import { auth } from '@/lib/firebase'
import { classNames } from '@/utils'
import { OAuthProvider, signInWithPopup, User } from 'firebase/auth'

interface AppleLoginButtonProps {
  className?: string
  onSuccess?: (user: User) => void
}

const AppleLoginButton = ({ className, onSuccess }: AppleLoginButtonProps) => {
  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider('apple.com')
      provider.addScope('email')
      provider.addScope('name')
      provider.setCustomParameters({
        locale: 'ko_KR',
      })

      const userCredential = await signInWithPopup(auth, provider)
      onSuccess?.(userCredential.user)
    } catch (error) {
      console.error('Apple login error:', error)
      throw error
    }
  }

  return (
    <button
      onClick={signInWithApple}
      className={classNames(
        'flex h-[44px] min-w-[200px] items-center justify-center rounded-[8px] px-4 py-0',
        'font-sf-pro text-[17px] font-normal leading-[44px]',
        'border border-black hover:bg-[#f2f2f2]',
        className,
      )}
    >
      <div className="flex w-[17px] flex-col items-center justify-center text-black">
        <svg className="h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000" fill="currentColor">
          <path d="M788.1,340.9c-5.8,4.5-108.2,62.2-108.2,190.5c0,148.4,130.3,200.9,134.2,202.2c-0.6,3.2-20.7,71.9-68.7,141.9  c-42.8,61.6-87.5,123.1-155.5,123.1s-85.5-39.5-164-39.5c-76.5,0-103.7,40.8-165.9,40.8s-105.6-57-155.5-127  C46.7,790.7,0,663,0,541.8c0-194.4,126.4-297.5,250.8-297.5c66.1,0,121.2,43.4,162.7,43.4c39.5,0,101.1-46,176.3-46  C618.3,241.7,720.7,244.3,788.1,340.9z M554.1,159.4c31.1-36.9,53.1-88.1,53.1-139.3c0-7.1-0.6-14.3-1.9-20.1  c-50.6,1.9-110.8,33.7-147.1,75.8c-28.5,32.4-55.1,83.6-55.1,135.5c0,7.8,1.3,15.6,1.9,18.1c3.2,0.6,8.4,1.3,13.6,1.3  C464,230.7,521.1,200.3,554.1,159.4z" />
        </svg>
      </div>
      <span className="ml-[12px]">Apple로 로그인</span>
    </button>
  )
}

export default AppleLoginButton
