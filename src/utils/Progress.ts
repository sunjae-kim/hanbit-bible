class Progress {
  private timestamp: number | null = null
  private duration: number
  private progress: number = 0
  private delta: number = 0
  private isLoop: boolean
  private end: () => void
  private ended: boolean = false

  static readonly CONST = {
    DURATION: 1000,
  }

  constructor(param: { duration: number; isLoop: boolean; end: () => void }) {
    this.duration = param.duration || Progress.CONST.DURATION
    this.isLoop = !!param.isLoop
    this.end = param.end || (() => {})
    this.reset()
  }

  reset() {
    this.timestamp = null
  }

  start(now: number) {
    this.timestamp = now
  }

  tick(now: number) {
    if (this.timestamp) {
      this.delta = now - this.timestamp
      this.progress = Math.min(this.delta / this.duration, 1)

      if (this.progress >= 1 && this.isLoop) {
        this.start(now)
      }

      if (this.progress >= 1 && !this.isLoop && !this.ended) {
        this.ended = true
        this.end()
      }

      return this.progress
    }
    return 0
  }
}

export default Progress
