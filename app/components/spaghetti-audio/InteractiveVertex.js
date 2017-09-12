import { throttle, attemptCall } from 'utils/helpers/PerformanceHelpers';
import Hitbox from './Hitbox';
import * as constants from './Constants';

class InteractiveVertex {
  constructor(options) {
    const { anchor, canvas, mouse, x, y, angle, vertexSeparation, hitCallback } = options;
    this.canvas = canvas;
    this.mouse = mouse;
    this.vertexSeparation = vertexSeparation;

    this.current = { x, y };
    this.initial = { x, y };
    this.control = { x, y };
    this.velocity = { x: 0, y: 0 };

    this.hitbox = anchor ?
      null :
      new Hitbox({
        center: this.current,
        angle,
        length: vertexSeparation,
        height: constants.mouseDist,
      });
    this.hitCallback = hitCallback;
    this.handleHit = throttle(this.handleHit.bind(this), 400);
  }

  handleDrag() {
    this.current.x = ((this.mouse.current.x - this.initial.x) * 0.8) + this.initial.x;
    this.current.y = ((this.mouse.current.y - this.initial.y) * 0.8) + this.initial.y;
  }

  handleHit() {
    this.velocity.x = (this.mouse.direction.x * this.mouse.speed) / 20;
    this.velocity.y = (this.mouse.direction.y * this.mouse.speed) / 20;
    attemptCall(this.hitCallback);
  }

  render() {
    this.applyForce('x');
    this.applyForce('y');

    if (!this.hitbox || !this.hitbox.hitting) {
      this.dampen('x');
      this.dampen('y');
    }

    if (this.hitbox) {
      this.hitbox.coords = { x: this.current.x, y: this.current.y };
    }

    if (!this.mouse.down && this.hitbox && this.mouse.speed) {
      this.hitbox.hitTest(
        this.mouse.current,
        null,
        this.handleDrag.bind(this),
        this.handleHit.bind(this),
      );
    }
  }

  dampen(axis) {
    this.velocity[axis] += (this.initial[axis] - this.current[axis]) / constants.viscosity;
  }

  applyForce(axis) {
    if (this.velocity[axis] < -0.05 || this.velocity[axis] > 0.05) {
      this.velocity[axis] *= (1 - constants.damping);
      this.current[axis] += this.velocity[axis];
    } else {
      this.velocity[axis] = 0;
    }
  }
}

export default InteractiveVertex;
