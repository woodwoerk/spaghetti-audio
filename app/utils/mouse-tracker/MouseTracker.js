import { throttle } from '../helpers/PerformanceHelpers';
import MousedownEvents from './MousedownEvents';

class MouseTracker extends MousedownEvents {
  static getDirection(current, initial) {
    if (current < initial) {
      return 1;
    } else if (current > initial) {
      return -1;
    }

    return 0;
  }

  constructor(...args) {
    super(...args);

    this.current = { x: 0, y: 0 };
    this.last = { x: -1, y: -1 };
    this.direction = { x: 0, y: 0 };
    this.travel = 0;
    this.speed = 0;
    this.trackMouse = throttle(this.trackMouse.bind(this), 20);

    this.init();
  }

  init() {
    this.trackMouseSpeed();
    document.addEventListener('mousemove', this.trackMouse);
  }

  destroy() {
    super.destroy();
    document.removeEventListener('mousemove', this.trackMouse);
  }

  trackMouse(e) {
    this.direction.x = MouseTracker.getDirection(this.current.x, e.pageX);
    this.direction.y = MouseTracker.getDirection(this.current.y, e.pageY);

    this.current = { x: e.pageX, y: e.pageY };
    if (this.last.x > -1) {
      this.travel += Math.max(
        Math.abs(this.current.x - this.last.x),
        Math.abs(this.current.y - this.last.y),
      );
    }
    this.last = this.current;
  }

  trackMouseSpeed() {
    let lastStamp;
    const timeout = 200;

    const track = () => {
      const timestamp = Date.now();

      if (lastStamp && lastStamp !== timestamp) {
        this.speed = Math.round((this.travel / (timestamp - lastStamp)) * 1000);
        this.travel = 0;
      }

      lastStamp = timestamp;
      setTimeout(track, timeout);
    };

    track();
  }
}

export default MouseTracker;
