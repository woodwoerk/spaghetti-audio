export interface Point {
  x: number
  y: number
}

export interface Rect {
  a: Point
  b: Point
  c: Point
  d: Point
}

class VectorHelpers {
  /*
   * Get the angle of a vector determined by two points
   * Measured counter-clockwise from the positive x-axis
   * Returns a radian (0 - 2π)
   */
  static getAngle(a: Point, b: Point): number {
    const angle = -Math.atan2(b.y - a.y, b.x - a.x)

    if (angle < 0) {
      return angle + Math.PI * 2
    }

    return angle
  }

  static getPointOnVector(a: Point, b: Point, segment: number): Point {
    return {
      x: segment * b.x + (1 - segment) * a.x,
      y: segment * b.y + (1 - segment) * a.y,
    }
  }

  static getPointFromAngle(a: Point, angle: number, distance: number): Point {
    return {
      x: a.x + Math.cos(angle) * distance,
      y: a.y - Math.sin(angle) * distance,
    }
  }

  static getLength(a: Point, b: Point): number {
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
  }

  static isPointInRectangle(p: Point, { a, b, c, d }: Rect): boolean {
    const lines = [
      { a, b },
      { a: b, b: c },
      { a: c, b: d },
      { a: d, b: a },
    ]

    return lines.every((line) => {
      const A = -(line.b.y - line.a.y)
      const B = line.b.x - line.a.x
      const C = -(A * line.a.x + B * line.a.y)
      const D = A * p.x + B * p.y + C

      return D > 0
    })
  }
}

export default VectorHelpers
