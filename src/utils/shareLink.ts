import { toast } from "react-toastify"

interface ShareOptions {
  title?: string
  text?: string
  url?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * 모바일 브라우저에서 공유하기 기능을 실행합니다.
 * Share API를 지원하지 않는 환경에서는 클립보드에 URL을 복사합니다.
 */
export const shareLink = async ({
  title = document.title,
  text = '',
  url = window.location.href,
  onSuccess,
  onError,
}: ShareOptions = {}) => {
  try {
    // Web Share API 지원 확인
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      })
      onSuccess?.()
      return true
    }

    // Share API를 지원하지 않는 경우 클립보드에 복사
    await copyToClipboard(url)
    toast.success('링크가 클립보드에 복사되었습니다.')
    onSuccess?.()
    return true
  } catch (error) {
    console.error('공유하기 실패:', error)
    onError?.(error as Error)
    return false
  }
}

/**
 * 클립보드에 텍스트를 복사합니다.
 */
const copyToClipboard = async (text: string): Promise<void> => {
  try {
    // 현대적인 Clipboard API 사용
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }

    // 레거시 방식으로 복사
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-999999px'
    textarea.style.top = '-999999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  } catch (error) {
    console.error('클립보드 복사 실패:', error)
    throw error
  }
}
