import VectorHelpers from '../../utils/helpers/VectorHelpers';
import { attemptCall } from '../../utils/helpers/PerformanceHelpers';

class Hitbox {
  constructor(options) {
    const { center, length, height, angle } = options;

    this.length = length;
    this.height = height;
    this.angle = angle;
    this.coords = center;
    this.hitting = false;
  }

  set coords(center) {
    const { angle, length, height } = this;
    const p1 = VectorHelpers.getPointFromAngle(center, angle + Math.PI, length / 2);
    const p2 = VectorHelpers.getPointFromAngle(center, angle, length / 2);

    this.a = VectorHelpers.getPointFromAngle(p1, angle + (Math.PI / 4), height);
    this.b = VectorHelpers.getPointFromAngle(p2, angle + (Math.PI / 4), height);
    this.c = VectorHelpers.getPointFromAngle(p2, angle - (Math.PI / 4), height);
    this.d = VectorHelpers.getPointFromAngle(p1, angle - (Math.PI / 4), height);
  }

  get coords() {
    const { a, b, c, d } = this;
    return { a, b, c, d };
  }

  hitTest(position, enterCallback, insideCallback, leaveCallback) {
    const { a, b, c, d } = this.coords;

    if (VectorHelpers.isPointInRectangle(position, a, b, c, d)) {
      if (!this.hitting) {
        attemptCall(enterCallback);
      } else {
        attemptCall(insideCallback);
      }
      this.hitting = true;
    } else if (this.hitting) {
      this.hitting = false;
      attemptCall(leaveCallback);
    }

    return this.hitting;
  }
}

export default Hitbox;
