import throttle from 'lodash/throttle'
import { Point } from '@utils/helpers/vector-helpers'
import MousedownEvents from './mousedown-events'

const POSITION_TRACKER_INTERVAL = 20
const SPEED_TRACKER_INTERVAL = 100

class MouseTracker extends MousedownEvents {
  private static getDirection(current: number, initial: number): number {
    if (current < initial) {
      return 1
    } else if (current > initial) {
      return -1
    }

    return 0
  }

  current: Point = { x: 0, y: 0 }
  speed: number = 0
  direction: Point = { x: 0, y: 0 }
  private last: Point
  private travel: number = 0
  private mouseSpeedInterval: number

  constructor(
    element: HTMLElement,
    mouseDownCallback: () => void,
    mouseUpCallback: () => void
  ) {
    super(element, mouseDownCallback, mouseUpCallback)

    this.trackMouse = throttle(
      this.trackMouse.bind(this),
      POSITION_TRACKER_INTERVAL
    )
    this.init()
  }

  destroy(): void {
    super.destroy()
    clearInterval(this.mouseSpeedInterval)
    document.removeEventListener('mousemove', this.trackMouse)
  }

  private init(): void {
    this.trackMouseSpeed()
    document.addEventListener('mousemove', this.trackMouse)
  }

  /**
   * Track the mouse position on mousemove, throttled by POSITION_TRACKER_INTERVAL
   *
   * @param e
   */
  private trackMouse(e: MouseEvent): void {
    this.direction.x = MouseTracker.getDirection(this.current.x, e.pageX)
    this.direction.y = MouseTracker.getDirection(this.current.y, e.pageY)

    this.current = { x: e.pageX, y: e.pageY }

    if (this.last) {
      this.travel +=
        Math.abs(this.current.x - this.last.x) +
        Math.abs(this.current.y - this.last.y)
    }

    this.last = this.current
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
