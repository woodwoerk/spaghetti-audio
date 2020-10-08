import throttle from 'lodash/throttle'
import { attemptCall } from '@utils/helpers/performance-helpers'
import { Point } from '@utils/helpers/vector-helpers'

const POSITION_TRACKER_INTERVAL = 20

class MousedownEvents {
  private static getDirection(current: number, initial: number): number {
    if (current < initial) {
      return 1
    } else if (current > initial) {
      return -1
    }

    return 0
  }

  protected last: Point
  protected travel: number = 0

  public direction: Point = { x: 0, y: 0 }
  public drawing: boolean = false
  public startPos: Point = { x: -1, y: -1 }
  public endPos: Point = { x: undefined, y: undefined }
  public current: Point = { x: undefined, y: undefined }
  private touches: { start: Touch; end: Touch } = {
    start: undefined,
    end: undefined,
  }

  constructor(
    protected readonly canvas: HTMLCanvasElement,
    private readonly mouseDownCallback: () => void,
    private readonly mouseUpCallback: () => void
  ) {
    this.trackMouse = throttle(
      this.trackMouse.bind(this),
      POSITION_TRACKER_INTERVAL
    )

    this.addEventListeners()
  }

  addEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.onMouseDown)
    this.canvas.addEventListener('mouseup', this.onMouseUp)

    // Touch events
    this.canvas.addEventListener('touchstart', this.onTouchStart)
    this.canvas.addEventListener('touchmove', this.onTouchMove)
    this.canvas.addEventListener('touchend', this.onTouchEnd)
    this.canvas.addEventListener('touchcancel', this.onTouchEnd)

    document.addEventListener('mouseout', this.onLeaveDocument)
  }

  removeEventListeners() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown)
    this.canvas.removeEventListener('mouseup', this.onMouseUp)

    document.removeEventListener('mouseout', this.onLeaveDocument) // TODO: maybe this should be the canvas for non full screen demos
  }

  destroy() {
    this.removeEventListeners()
  }

  get touching(): boolean {
    return !this.touches.start && !this.touches.end
  }

  protected getEventPosition(e: MouseEvent): Point {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()

    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  /**
   * Track the mouse or touch position on mousemove, throttled by POSITION_TRACKER_INTERVAL
   *
   * @param e
   */
  protected trackMouse(eventOrTouch: MouseEvent | Touch): void {
    const nextPosition =
      eventOrTouch instanceof MouseEvent
        ? this.getEventPosition(eventOrTouch)
        : { x: eventOrTouch.clientX, y: eventOrTouch.clientY }

    this.direction.x = MousedownEvents.getDirection(
      this.current.x,
      nextPosition.x
    )

    this.direction.y = MousedownEvents.getDirection(
      this.current.y,
      nextPosition.y
    )

    if (this.drawing && eventOrTouch instanceof MouseEvent) {
      this.endPos = nextPosition
    }

    this.current = nextPosition

    if (this.last) {
      this.travel +=
        Math.abs(this.current.x - this.last.x) +
        Math.abs(this.current.y - this.last.y)
    }

    this.last = this.current
  }

  private onLeaveDocument = (e: MouseEvent) => {
    const from = e.relatedTarget

    if (!from) {
      this.onMouseUp(e)
    }
  }

  private onMouseDown = (e: MouseEvent) => {
    attemptCall(this.mouseDownCallback)

    this.drawing = true
    this.startPos = this.getEventPosition(e)
  }

  private onMouseUp = (e: MouseEvent) => {
    if (this.drawing) {
      attemptCall(this.mouseUpCallback)
      this.drawing = false
      this.startPos = { x: undefined, y: undefined }
      this.endPos = { x: undefined, y: undefined }
    }
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    const touches = Array.from(e.changedTouches)

    touches.map((touch) => {
      if (!this.touches.start) {
        this.touches.start = touch
        this.startPos = { x: touch.clientX, y: touch.clientY }
      } else if (!this.touches.end) {
        this.touches.end = touch
        this.endPos = { x: touch.clientX, y: touch.clientY }
      }
    })
  }

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    const touches = Array.from(e.changedTouches)

    touches.forEach((touch) => {
      if (this.touches.start?.identifier === touch.identifier) {
        this.startPos = { x: touch.clientX, y: touch.clientY }
        this.touches.start = touch
      } else if (this.touches.end?.identifier === touch.identifier) {
        this.endPos = { x: touch.clientX, y: touch.clientY }
        this.touches.end = touch
      }
    })

    if (!this.touches.end) {
      this.trackMouse(touches[0])
    } else if (this.touches.start && this.touches.end) {
      this.drawing = true
    }
  }

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    const touches = Array.from(e.changedTouches)

    touches.forEach((touch) => {
      if (this.touches.start?.identifier === touch.identifier) {
        this.touches.start = undefined
      } else if (this.touches.end?.identifier === touch.identifier) {
        this.touches.end = undefined
      }
    })

    if (this.drawing && !this.touches.start && !this.touches.end) {
      attemptCall(this.mouseUpCallback)

      this.drawing = false
      this.startPos = { x: undefined, y: undefined }
      this.endPos = { x: undefined, y: undefined }
    }
  }
}

export default MousedownEvents
