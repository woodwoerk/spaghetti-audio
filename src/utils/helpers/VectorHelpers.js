class VectorHelpers {
  /*
   * Get the angle of a vector determined by two points
   * Measured counter-clockwise from the positive x-axis
   * Returns a radian (0 - 2π)
   */
  static getAngle(a, b) {
    const angle = -Math.atan2(b.y - a.y, b.x - a.x);

    if (angle < 0) {
      return angle + (Math.PI * 2);
    }

    return angle;
  }

  static getPointOnVector(a, b, segment) {
    return {
      x: (segment * b.x) + ((1 - segment) * a.x),
      y: (segment * b.y) + ((1 - segment) * a.y),
    };
  }

  static getPointFromAngle(a, angle, distance) {
    return {
      x: a.x + (Math.cos(angle) * distance),
      y: a.y - (Math.sin(angle) * distance),
    };
  }

  static getLength(a, b) {
    return Math.sqrt(((b.x - a.x) ** 2) + ((b.y - a.y) ** 2));
  }

  static getTriangleArea(a, b, c) {
    const area = ((a.x * b.y) + (b.x * c.y) + (c.x * a.y)) -
                  (a.x * c.y) - (b.x * a.y) - (c.x * b.y);
    return Math.sqrt(area ** 2);
  }

  static getRectangleArea(a, b, c) {
    return VectorHelpers.getLength(a, b) * VectorHelpers.getLength(b, c);
  }

  static isPointInRectangle(p, a, b, c, d) {
    const lines = [
      { a, b },
      { a: b, b: c },
      { a: c, b: d },
      { a: d, b: a },
    ];

    return lines.every((line) => {
      const A = -(line.b.y - line.a.y);
      const B = line.b.x - line.a.x;
      const C = -((A * line.a.x) + (B * line.a.y));
      const D = (A * p.x) + (B * p.y) + C;

      return D > 0;
    });
  }
}

export default VectorHelpers;
