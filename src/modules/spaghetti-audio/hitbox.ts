import { attemptCall } from '@utils/helpers/performance-helpers'
import VectorHelpers, { Point, Rect } from '@utils/helpers/vector-helpers'

class Hitbox {
  hitting: boolean = false
  a: Point
  b: Point
  c: Point
  d: Point

  constructor(
    hitboxCenter: Point,
    readonly angle: number,
    readonly length: number,
    readonly height: number
  ) {
    this.setCoordsByCenter(hitboxCenter)
  }

  setCoordsByCenter(center: Point): void {
    const { angle, length, height } = this
    const p1 = VectorHelpers.getPointFromAngle(
      center,
      angle + Math.PI,
      length / 2
    )
    const p2 = VectorHelpers.getPointFromAngle(center, angle, length / 2)

    this.coords = {
      a: VectorHelpers.getPointFromAngle(p1, angle + Math.PI / 4, height),
      b: VectorHelpers.getPointFromAngle(p2, angle + Math.PI / 4, height),
      c: VectorHelpers.getPointFromAngle(p2, angle - Math.PI / 4, height),
      d: VectorHelpers.getPointFromAngle(p1, angle - Math.PI / 4, height),
    }
  }

  get coords(): Rect {
    const { a, b, c, d } = this

    return { a, b, c, d }
  }

  set coords({ a, b, c, d }: Rect) {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
  }

  hitTest(
    position: Point,
    insideCallback: () => void,
    leaveCallback: () => void
  ) {
    const { a, b, c, d } = this.coords

    if (VectorHelpers.isPointInRectangle(position, a, b, c, d)) {
      attemptCall(insideCallback)
      this.hitting = true
    } else if (this.hitting) {
      this.hitting = false
      attemptCall(leaveCallback)
    }

    return this.hitting
  }
}

export default Hitbox
