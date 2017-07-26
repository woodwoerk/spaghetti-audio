import { el } from 'redom';
import Tone from 'tone';
import MouseTracker from 'utils/mouse-tracker/MouseTracker';
import { debounce, throttle, attemptCall } from 'utils/helpers/PerformanceHelpers';
import { getKeyboard } from 'utils/helpers/audio-helpers/AudioHelpers';

const vars = {
  totalPoints: 6,
  viscosity: 10,
  mouseDist: 20,
  damping: 0.1,
  showIndicators: false,
  leftColor: '#a8d0e6',
  rightColor: '#f76c6c',
};


class VectorHelpers {
  /* Return a radian (0 - 2π)
   * Measured counter-clockwise from the positive x-axis
   */
  static getAngleBetweenVectors(a, b) {
    const angle = -Math.atan2(b.y - a.y, b.x - a.x);

    if (angle < 0) {
      return angle + (Math.PI * 2);
    }

    return angle;
  }

  static getCoordsBetweenPoints(x1, y1, x2, y2, segment) {
    return {
      x: (segment * x2) + ((1 - segment) * x1),
      y: (segment * y2) + ((1 - segment) * y1),
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

    return lines.every(({ a, b }) => {
      // D > 0 == point is on the left-hand side
      // D < 0 == point is on the right-hand side
      // D = 0 == point is on the line

      const A = -(b.y - a.y); // || 0;
      const B = b.x - a.x;
      const C = -((A * a.x) + (B * a.y));
      const D = (A * p.x) + (B * p.y) + C;

      return D > 0;
    });
  }
}

window.VectorHelpers = VectorHelpers;

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

// create a synth and connect it to the master output (your speakers)
const synth = new Tone.Synth().toMaster();
const keyboard = getKeyboard('C', 'major pentatonic', 2, 5).reverse();

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
        height: vars.mouseDist,
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
    this.velocity[axis] += (this.initial[axis] - this.current[axis]) / vars.viscosity;
  }

  applyForce(axis) {
    if (this.velocity[axis] < -0.05 || this.velocity[axis] > 0.05) {
      this.velocity[axis] *= (1 - vars.damping);
      this.current[axis] += this.velocity[axis];
    } else {
      this.velocity[axis] = 0;
    }
  }
}

const MIN_STRING_LENGTH = 30;
const LOCAL_KEY = 'strings';

class StringyCanvas {
  static getCanvas() {
    const style = {
      position: 'absolute',
      top: 0,
      left: 0,
    };
    const canvas = el('canvas', { style });

    return canvas;
  }

  static getClearButton() {
    const style = {
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 10,
    };
    const button = el('button', { style }, 'CLEAR');

    return button;
  }

  constructor() {
    this.canvas = StringyCanvas.getCanvas();
    this.clearButton = StringyCanvas.getClearButton();
    this.el = el('div', [
      this.canvas,
      this.clearButton,
    ]);
    this.renderLoopId = null;
    this.strings = [];
    this.context = this.canvas.getContext('2d');
    this.mouse = new MouseTracker(this.canvas, null, this.addNewString.bind(this));

    this.resizeHandler = debounce(this.resizeHandler.bind(this), 300);
  }

  static set store(string) {
    const strings = StringyCanvas.store;
    strings.push(string);
    localStorage.setItem('strings', JSON.stringify(strings));
  }

  static get store() {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  }

  clearStrings() {
    localStorage.removeItem(LOCAL_KEY);
    this.strings = [];
  }

  addRandomString() {
    const x1 = window.innerWidth * Math.random();
    const x2 = window.innerWidth * Math.random();
    const y1 = window.innerHeight * Math.random();
    const y2 = window.innerHeight * Math.random();
    this.addNewString(x1, y1, x2, y2);
  }

  addNewString(
    x1 = this.mouse.downPos.x,
    y1 = this.mouse.downPos.y,
    x2 = this.mouse.upPos.x,
    y2 = this.mouse.upPos.y,
  ) {
    StringyCanvas.store = { x1, y1, x2, y2 };
    this.buildString(x1, y1, x2, y2);
  }

  buildString(x1, y1, x2, y2) {
    const points = [];
    const length = VectorHelpers.getLength({ x: x1, y: y1 }, { x: x2, y: y2 });

    if (length < MIN_STRING_LENGTH) {
      return;
    }

    const angle = VectorHelpers.getAngleBetweenVectors({ x: x1, y: y1 }, { x: x2, y: y2 });
    console.log(angle);
    const vertexSeparation = length / (vars.totalPoints - 1);
    const note = length > 1000 ?
      keyboard[keyboard.length] :
      keyboard[Math.round(length / keyboard.length)];

    for (let i = 0; i <= vars.totalPoints - 1; i += 1) {
      const { x, y } = VectorHelpers.getCoordsBetweenPoints(
        x1, y1, x2, y2, i / (vars.totalPoints - 1),
      );
      points.push(new InteractiveVertex({
        anchor: i === 0 || i === vars.totalPoints - 1,
        canvas: this.canvas,
        mouse: this.mouse,
        x,
        y,
        angle,
        vertexSeparation,
        hitCallback: this.onhit.bind(this, note),
      }));
    }

    this.strings.push({
      length,
      vertexSeparation,
      points,
    });
  }

  addEventListeners() {
    this.clearButton.addEventListener('click', e => this.clearStrings(e));
    window.addEventListener('resize', this.resizeHandler);
  }

  removeEventListeners() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  onhit(note, hitVelocity) {
    synth.triggerAttackRelease(note, '8n');
  }

  onmount() {
    StringyCanvas.store.forEach(({ x1, y1, x2, y2 }) => this.buildString(x1, y1, x2, y2));
    this.addEventListeners();
    this.onremount();
  }

  onremount() {
    // console.log('StringyCanvas - onremount', this);

    cancelAnimationFrame(this.renderLoopId);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.render();
  }

  onunmount() {
    this.removeEventListeners();
    this.mouse.destroy();
    cancelAnimationFrame(this.renderLoopId);
  }

  resizeHandler() {
    this.onremount();
  }

  render() {
    this.renderLoopId = requestAnimationFrame(this.render.bind(this));

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.strings.forEach((string) => {
      this.drawString(string.points);
      if (vars.showIndicators) {
        this.showDebugLines(string.points);
      }
    });

    if (this.mouse.down) {
      this.drawLine(this.mouse.downPos, this.mouse.current);
    }
  }

  drawLine(p1, p2) {
    const { context } = this;

    context.strokeStyle = vars.rightColor;
    context.lineWidth = 4;

    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
  }

  drawString(points) {
    const { context } = this;

    for (let i = 1; i <= vars.totalPoints - 2; i += 1) {
      points[i].render();
    }

    context.strokeStyle = vars.rightColor;
    context.lineWidth = 4;
    context.beginPath();

    for (let i = 0; i <= vars.totalPoints - 1; i += 1) {
      const p = points[i];

      if (i > 0 && i < points.length - 1) {
        p.control.x = (p.current.x + points[i + 1].current.x) / 2;
        p.control.y = (p.current.y + points[i + 1].current.y) / 2;
      }

      context.bezierCurveTo(
        p.current.x, p.current.y, p.control.x, p.control.y, p.control.x, p.control.y,
      );
    }

    context.stroke();
  }

  showDebugLines(points) {
    const { context } = this;

    for (let i = 0; i <= vars.totalPoints - 1; i += 1) {
      const p = points[i];

      context.fillStyle = '#000';
      context.beginPath();
      context.rect(p.current.x - 2, p.current.y - 2, 4, 4);
      context.fill();

      context.fillStyle = '#fff';
      context.beginPath();
      context.rect(p.control.x - 1, p.control.y - 1, 2, 2);
      context.fill();

      if (p.hitbox) {
        context.strokeStyle = '#ff69b4';
        context.beginPath();
        context.moveTo(p.hitbox.a.x, p.hitbox.a.y);
        context.lineTo(p.hitbox.b.x, p.hitbox.b.y);
        context.lineTo(p.hitbox.c.x, p.hitbox.c.y);
        context.lineTo(p.hitbox.d.x, p.hitbox.d.y);
        context.closePath();
        context.stroke();
      }
    }
  }
}

export default StringyCanvas;
