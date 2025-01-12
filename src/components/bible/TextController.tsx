import { useTextSettingsStore } from '@/stores/text-setting'
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid'
import { Fragment } from 'react'
import Modal from '../ui/Modal'
import RangeInput from '../ui/RangeInput'
import Button from '../ui/Button'

interface IProps {
  className?: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const TextController = ({ className = '', isOpen, setIsOpen }: IProps) => {
  const { fontSize, lineHeight, letterSpacing, setFontSize, setLineHeight, setLetterSpacing, resetSettings } =
    useTextSettingsStore()

  const sampleText = {
    book: '창세기',
    chapter: 1,
    verses: [
      { verse: 1, content: '태초에 하나님이 천지를 창조하시니라' },
      { verse: 2, content: '땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라' },
    ],
  }

  return (
    <div className={className}>
      <button onClick={() => setIsOpen(true)} className="-m-2 flex flex-col items-center p-2">
        <AdjustmentsHorizontalIcon className="mb-1 h-6 w-6 text-gray-800" />
        <span className="text-xs">글자설정</span>
      </button>

      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="space-y-6 pt-6">
          <div className="mb-6 flex items-center justify-between px-6">
            <h2 className="text-xl font-bold">글자 크기 및 간격 설정</h2>
            <button
              onClick={resetSettings}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200"
            >
              초기화
            </button>
          </div>

          <div className="space-y-3 px-6">
            <RangeInput label="글자 크기" value={fontSize} onChange={setFontSize} min={12} max={24} />

            <RangeInput label="행간" value={lineHeight} onChange={setLineHeight} min={1} max={2.5} step={0.1} />

            <RangeInput label="자간" value={letterSpacing} onChange={setLetterSpacing} min={-1} max={2} step={0.1} />
          </div>

          <div className="mt-8 px-6">
            <h3 className="mb-3 font-semibold text-gray-900">미리보기</h3>
            <div className="rounded-lg border bg-gray-50/50 p-4">
              <div
                className="font-myeongjo grid grid-cols-[auto,1fr] items-start gap-x-1.5 gap-y-1"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`,
                }}
              >
                {sampleText.verses.map((verse) => (
                  <Fragment key={verse.verse}>
                    <div className="text-center font-semibold">{verse.verse}</div>
                    <div className="font-myeongjo">{verse.content}</div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 !mt-0 bg-white p-6">
            <Button onClick={() => setIsOpen(false)} className="w-full !py-4 !text-lg">
              적용하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TextController
