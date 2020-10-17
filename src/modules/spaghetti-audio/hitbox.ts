import { attemptCall } from '@utils/helpers/performance-helpers'
import VectorHelpers, { Point, Rect } from '@utils/helpers/vector-helpers'

const RIGHT_ANGLE = Math.PI / 2

class Hitbox {
  hitting = false
  a: Point
  b: Point
  c: Point
  d: Point

  constructor(
    hitboxCenter: Point,
    readonly angle: number,
    readonly length: number,
    width: number
  ) {
    this.setCoordsByCenter(hitboxCenter, width)
  }

  setCoordsByCenter(center: Point, width: number): void {
    const { angle, length } = this

    const halfLength = length / 2
    const halfWidth = width / 2

    const p1 = VectorHelpers.getPointFromAngle(
      center,
      angle + Math.PI,
      halfLength
    )
    const p2 = VectorHelpers.getPointFromAngle(center, angle, halfLength)

    this.coords = {
      a: VectorHelpers.getPointFromAngle(p1, angle + RIGHT_ANGLE, halfWidth),
      b: VectorHelpers.getPointFromAngle(p2, angle + RIGHT_ANGLE, halfWidth),
      c: VectorHelpers.getPointFromAngle(p2, angle - RIGHT_ANGLE, halfWidth),
      d: VectorHelpers.getPointFromAngle(p1, angle - RIGHT_ANGLE, halfWidth),
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
  ): boolean {
    if (VectorHelpers.isPointInRectangle(position, this.coords)) {
      attemptCall(insideCallback)
      this.hitting = true
    } else if (this.hitting) {
      this.endHit(leaveCallback)
    }

    return this.hitting
  }

  endHit(leaveCallback: () => void): void {
    this.hitting = false
    attemptCall(leaveCallback)
  }
}

export default Hitbox
