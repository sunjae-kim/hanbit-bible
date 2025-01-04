import { KAKAO_AUTH_URL } from '@/constants'
import kakaoButton from './kakako-button.png'

interface KakaoLoginButtonProps {
  className?: string
  next?: string
}

const KakaoLoginButton = (props: KakaoLoginButtonProps) => {
  const onClick = () => {
    window.location.href = KAKAO_AUTH_URL + (props.next ? `&state=${props.next}` : '')
  }

  return (
    <button className={props.className || ''} type="button" onClick={onClick}>
      <img className="w-[166px] object-contain" src={kakaoButton} alt="Kakao" />
    </button>
  )
}

export default KakaoLoginButton
