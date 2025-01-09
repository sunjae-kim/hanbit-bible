import { ConfettiCanvas, ConfettiOptions } from '@/types/confetti'
import Progress from '@/utils/progress'

class Confetti {
  private static readonly CONST = {
    SPRITE_WIDTH: 9,
    SPRITE_HEIGHT: 16,
    PAPER_LENGTH: 100,
    DURATION: 8000,
    ROTATION_RATE: 50,
    COLORS: ['#7CD0FF', '#EDCF56', '#EA7A29', '#73D986', '#BBF8BA', '#F0FFEE'],
  }

  private parent: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number
  private length: number
  private yRange: number
  private progress: Progress
  private rotationRange: number
  private speedRange: number
  private sprites: ConfettiCanvas[] = []

  constructor(options: ConfettiOptions) {
    this.parent = document.body
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.width = options.width || window.innerWidth
    this.height = options.height || window.innerHeight
    this.length = options.length || Confetti.CONST.PAPER_LENGTH
    this.yRange = options.yRange || this.height * 2
    this.rotationRange = options.rotationRange || 10
    this.speedRange = options.speedRange || 10

    this.progress = new Progress({
      duration: options.duration || Confetti.CONST.DURATION,
      isLoop: options.isLoop || false,
      end: () => {
        options.onEnd?.()
        this.canvas.parentNode?.removeChild(this.canvas)
      },
    })

    this.setupCanvas()
    this.build()
    this.start()
  }

  private setupCanvas() {
    this.canvas.style.cssText = [
      'display: block',
      'position: fixed',
      'top: 0',
      'left: 0',
      'pointer-events: none',
      'z-index: 999999',
    ].join(';')
  }

  private build() {
    for (let i = 0; i < this.length; ++i) {
      const canvas = document.createElement('canvas') as ConfettiCanvas
      const ctx = canvas.getContext('2d')
      if (!ctx) continue

      canvas.width = Confetti.CONST.SPRITE_WIDTH
      canvas.height = Confetti.CONST.SPRITE_HEIGHT

      canvas.position = {
        initX: Math.random() * this.width,
        initY: -canvas.height - Math.random() * this.yRange,
      }

      canvas.rotation = this.rotationRange / 2 - Math.random() * this.rotationRange
      canvas.speed = this.speedRange / 2 + Math.random() * (this.speedRange / 2)

      ctx.fillStyle = Confetti.CONST.COLORS[(Math.random() * Confetti.CONST.COLORS.length) | 0]
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      this.sprites.push(canvas)
    }
  }

  private start() {
    this.parent.appendChild(this.canvas)
    this.progress.start(performance.now())
    requestAnimationFrame(this.render.bind(this))
  }

  private render(now: number) {
    const progress = this.progress.tick(now)

    this.canvas.width = this.width
    this.canvas.height = this.height

    for (let i = 0; i < this.length; ++i) {
      this.ctx.save()
      this.ctx.translate(
        this.sprites[i].position.initX + this.sprites[i].rotation * Confetti.CONST.ROTATION_RATE * progress,
        this.sprites[i].position.initY + progress * (this.height + this.yRange),
      )
      this.ctx.rotate(this.sprites[i].rotation)
      this.ctx.drawImage(
        this.sprites[i],
        (-Confetti.CONST.SPRITE_WIDTH * Math.abs(Math.sin(progress * Math.PI * 2 * this.sprites[i].speed))) / 2,
        -Confetti.CONST.SPRITE_HEIGHT / 2,
        Confetti.CONST.SPRITE_WIDTH * Math.abs(Math.sin(progress * Math.PI * 2 * this.sprites[i].speed)),
        Confetti.CONST.SPRITE_HEIGHT,
      )
      this.ctx.restore()
    }

    requestAnimationFrame(this.render.bind(this))
  }
}

export default Confetti
