import { el } from 'redom';
import Tone from 'tone';
import MouseTracker from 'utils/mouse-tracker/MouseTracker';
import VectorHelpers from 'utils/helpers/VectorHelpers';
import { debounce } from 'utils/helpers/PerformanceHelpers';
import { getKeyboard } from 'utils/helpers/audio-helpers/AudioHelpers';
import InteractiveVertex from './InteractiveVertex';
import * as constants from './Constants';

const MIN_STRING_LENGTH = 30;
const LOCAL_KEY = 'spaghettiStrings';
const HI_RANGE = { start: 0, end: 600 };
// const LO_RANGE = { start: 600, end: 1200 };

const synth = new Tone.PolySynth(4, Tone.Synth).toMaster();
const keyboard = getKeyboard('C', 'major pentatonic', 2, 5).reverse();

class SpaghettiAudio {
  static getCanvas() {
    const style = {
      position: 'absolute',
      top: 0,
      left: 0,
    };

    return el('canvas', { style });
  }

  static getUIContainer() {
    const style = {
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 10,
    };

    return el('div', { style });
  }

  static getButton(text) {
    const style = {
      display: 'inline-block',
    };

    return el('button', { style }, text);
  }

  constructor(options = {}) {
    this.settings = Object.assign(constants, options);
    this.canvas = SpaghettiAudio.getCanvas();
    this.el = el('div', [
      this.canvas,
      this.getUI(),
    ], { style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, zIndex: 5 } });

    this.renderLoopId = null;
    this.strings = [];
    this.context = this.canvas.getContext('2d');
    this.mouse = new MouseTracker(this.canvas, null, this.addNewString.bind(this));
    this.resizeHandler = debounce(this.resizeHandler.bind(this), 300);
  }

  getUI() {
    const ui = [];

    if (this.settings.clearButton) {
      const clear = SpaghettiAudio.getButton('clear');
      clear.addEventListener('click', e => this.clearStrings(e));
      ui.push(clear);
    }

    if (this.settings.muteButton) {
      const mute = SpaghettiAudio.getButton('mute');
      mute.addEventListener('click', e => console.log('mute', e));
      ui.push(mute);
    }

    return el(SpaghettiAudio.getUIContainer(), ui);
  }

  set store(string) {
    if (!this.settings.localStorage) {
      return;
    }

    const strings = this.store;
    strings.push(string);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(strings));
  }

  get store() {
    if (!this.settings.localStorage) {
      return [];
    }

    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  }

  clearStrings() {
    if (this.settings.localStorage) {
      localStorage.removeItem(LOCAL_KEY);
    }

    this.strings = [];
  }

  addRandomString() {
    const a = {
      x: window.innerWidth * Math.random(),
      y: window.innerHeight * Math.random(),
    };
    const b = {
      x: window.innerWidth * Math.random(),
      y: window.innerHeight * Math.random(),
    };

    this.addNewString(a, b);
  }

  addNewString(a = {}, b = {}) {
    a.x = a.x || this.mouse.downPos.x;
    a.y = a.y || this.mouse.downPos.y;
    b.x = b.x || this.mouse.upPos.x;
    b.y = b.y || this.mouse.upPos.y;

    this.store = { a, b };
    this.buildString(a, b);
  }

  buildString(a, b) {
    const points = [];
    const length = VectorHelpers.getLength(a, b);

    if (length < MIN_STRING_LENGTH) {
      return;
    }

    const angle = VectorHelpers.getAngle(a, b);
    const vertexSeparation = length / (this.settings.totalPoints - 1);
    const note = length > HI_RANGE.end ?
      keyboard[keyboard.length - 1] :
      keyboard[Math.round(keyboard.length * (length / HI_RANGE.end))];

    console.log(`Angle: ${angle}`, `Length: ${length}`, `Note: ${note}`);

    for (let i = 0; i <= this.settings.totalPoints - 1; i += 1) {
      const { x, y } = VectorHelpers.getPointOnVector(
        a, b, i / (this.settings.totalPoints - 1),
      );
      points.push(new InteractiveVertex({
        anchor: i === 0 || i === this.settings.totalPoints - 1,
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
      note,
    });
  }

  addEventListeners() {
    window.addEventListener('resize', this.resizeHandler);
  }

  removeEventListeners() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  onhit(note, hitVelocity) {
    synth.triggerAttackRelease(note, '8n');
  }

  onmount() {
    this.store.forEach(({ a, b }) => this.buildString(a, b));
    this.addEventListeners();
    this.onremount();
  }

  onremount() {
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
      if (this.settings.debug) {
        this.debug(string);
      }
    });

    if (this.mouse.down) {
      this.canvas.style.cursor = 'grabbing';
      this.drawLine(this.mouse.downPos, this.mouse.current);
    } else {
      this.canvas.style.cursor = 'crosshair';
    }
  }

  drawLine(p1, p2) {
    const { context } = this;

    context.strokeStyle = this.settings.rightColor;
    context.lineWidth = 4;

    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
  }

  drawString(points) {
    const { context } = this;

    for (let i = 1; i <= this.settings.totalPoints - 2; i += 1) {
      points[i].render();
    }

    context.strokeStyle = this.settings.rightColor;
    context.lineWidth = 4;
    context.beginPath();

    for (let i = 0; i <= this.settings.totalPoints - 1; i += 1) {
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

  debug({ note, points }) {
    const { context } = this;

    context.font = '16px Arial';
    context.fillStyle = '#424242';
    context.fillText(note, points[0].initial.x - 20, points[0].initial.y - 10);

    for (let i = 0; i <= this.settings.totalPoints - 1; i += 1) {
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
        context.strokeStyle = 'rgba(0, 0, 255, 0.2)';
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

export default SpaghettiAudio;
