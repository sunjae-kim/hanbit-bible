export interface ConfettiCanvas extends HTMLCanvasElement {
  position: {
    initX: number
    initY: number
  }
  rotation: number
  speed: number
}

export interface ConfettiOptions {
  duration?: number
  length?: number
  width?: number
  height?: number
  rotationRange?: number
  speedRange?: number
  yRange?: number
  isLoop?: boolean
  onEnd?: () => void
}
