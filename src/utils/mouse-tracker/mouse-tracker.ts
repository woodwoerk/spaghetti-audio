import MousedownEvents from './mousedown-events'

const SPEED_TRACKER_INTERVAL = 100

class MouseTracker extends MousedownEvents {
  speed = 0
  private mouseSpeedInterval: number

  constructor(
    canvas: HTMLCanvasElement,
    mouseDownCallback: () => void,
    mouseUpCallback: () => void
  ) {
    super(canvas, mouseDownCallback, mouseUpCallback)

    this.init()
  }

  destroy(): void {
    super.destroy()
    clearInterval(this.mouseSpeedInterval)
    this.canvas.removeEventListener('mousemove', this.trackMouse)
  }

  private init(): void {
    this.trackMouseSpeed()
    this.canvas.addEventListener('mousemove', this.trackMouse)
  }

  /**
   * Continuously track the mouse speed, throttled by SPEED_TRACKER_INTERVAL
   */
  private trackMouseSpeed(): void {
    let lastTimestamp: number
    clearInterval(this.mouseSpeedInterval)

    const track = () => {
      const timestamp = Date.now()

      this.speed = Math.round(
        (this.travel / (timestamp - lastTimestamp)) * 1000
      )

      this.travel = 0

      lastTimestamp = timestamp
    }

    this.mouseSpeedInterval = window.setInterval(track, SPEED_TRACKER_INTERVAL)
  }
}

export default MouseTracker
