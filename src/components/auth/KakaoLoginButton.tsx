import { KAKAO_AUTH_URL } from '@/constants'
import kakaoLogo from './kakao-logo.png'
import { classNames } from '@/utils'

interface KakaoLoginButtonProps {
  className?: string
  from?: string
}

const KakaoLoginButton = ({ className, from }: KakaoLoginButtonProps) => {
  const onClick = () => {
    window.location.href = KAKAO_AUTH_URL + (from ? `&state=${from}` : '')
  }

  return (
    <button
      onClick={onClick}
      className={classNames(
        'flex h-[44px] min-w-[200px] items-center justify-center rounded-[8px] px-4 py-0',
        'text-[17px] font-normal leading-[44px]',
        'border border-transparent bg-[#FEE500] hover:bg-[#FFEB00]',
        className,
      )}
    >
      <div className="w-[17px] text-black">
        <img src={kakaoLogo} alt="Kakao" />
      </div>
      <span className="ml-[12px]">Kakao로 로그인</span>
    </button>
  )
}

export default KakaoLoginButton
