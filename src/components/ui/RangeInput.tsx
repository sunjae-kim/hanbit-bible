import { classNames } from '@/utils'

const RangeInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label: string
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={classNames(
          'h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-100',
          'focus:outline-none',
          '[&::-webkit-slider-thumb]:h-4',
          '[&::-webkit-slider-thumb]:w-4',
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:bg-white',
          '[&::-webkit-slider-thumb]:transition-all',
          '[&::-webkit-slider-thumb]:bg-primary',
          '[&::-moz-range-thumb]:h-4',
          '[&::-moz-range-thumb]:w-4',
          '[&::-moz-range-thumb]:appearance-none',
          '[&::-moz-range-thumb]:rounded-full',
          '[&::-moz-range-thumb]:border-0',
          '[&::-moz-range-thumb]:bg-white',
          '[&::-moz-range-thumb]:transition-all',
          '[&::-moz-range-thumb]:bg-primary',
          '[&::-webkit-slider-runnable-track]:rounded-lg',
          '[&::-moz-range-track]:rounded-lg',
        )}
      />
    </div>
  )
}

export default RangeInput
