import { attemptCall } from '@utils/helpers/performance-helpers'
import { Point } from '@utils/helpers/vector-helpers'

class MousedownEvents {
  public down: boolean = false
  public downPos: Point = { x: -1, y: -1 }
  public upPos: Point = { x: -1, y: -1 }

  constructor(
    private readonly element: HTMLElement,
    private readonly mouseDownCallback: () => void,
    private readonly mouseUpCallback: () => void
  ) {
    this.addEventListeners()
  }

  addEventListeners(): void {
    this.element.addEventListener('mousedown', this.onMouseDown)
    this.element.addEventListener('mouseup', this.onMouseUp)

    document.addEventListener('mouseout', this.onLeaveDocument)
  }

  removeEventListeners() {
    this.element.removeEventListener('mousedown', this.onMouseDown)
    this.element.removeEventListener('mouseup', this.onMouseUp)

    document.removeEventListener('mouseout', this.onLeaveDocument) // TODO: maybe this should be the canvas for non full screen demos
  }

  destroy() {
    this.removeEventListeners()
  }

  private onLeaveDocument = (e: MouseEvent) => {
    const from = e.relatedTarget

    if (!from) {
      this.onMouseUp(e)
    }
  }

  private onMouseDown = (e: MouseEvent) => {
    attemptCall(this.mouseDownCallback)

    this.down = true
    this.downPos.x = e.pageX
    this.downPos.y = e.pageY
  }

  private onMouseUp = (e: MouseEvent) => {
    if (this.down) {
      this.down = false
      this.upPos.x = e.pageX
      this.upPos.y = e.pageY

      attemptCall(this.mouseUpCallback)
    }
  }
}

export default MousedownEvents
