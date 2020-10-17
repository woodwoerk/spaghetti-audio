import * as Tone from 'tone'
import debounce from 'lodash/debounce'
import MouseTracker from '@utils/mouse-tracker'
import VectorHelpers, { Point } from '@utils/helpers/vector-helpers'
import { getKeyboard } from '@utils/helpers/audio-helpers'
import el from '@utils/dom-helpers/dom-helpers'
import InteractiveVertex from './interactive-vertex'
import settings, { Settings } from './settings'

interface StringPosition {
  a: Point
  b: Point
}

interface SpaghettiString {
  length: number
  vertexSeparation: number
  points: InteractiveVertex[]
  note: string
}

const synth = new Tone.PolySynth(Tone.Synth).toDestination()

const keyboard = getKeyboard('C', 'major pentatonic', 2, 5).reverse()

class SpaghettiAudio {
  private static createCanvas(): HTMLCanvasElement {
    const style = {
      position: 'absolute',
    }

    return el.canvas({ style }) as HTMLCanvasElement
  }

  private static createUIContainer(ui: HTMLElement[]) {
    const style = {
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 10,
    }

    return el.div({ className: 'spaghetti-audio__ui', style }, ui)
  }

  private renderLoopId: number = null
  private strings: SpaghettiString[] = []
  private settings: Settings
  private context: CanvasRenderingContext2D
  private mouse: MouseTracker
  readonly canvas: HTMLCanvasElement = SpaghettiAudio.createCanvas()
  ui: HTMLElement

  constructor(options: Settings = {}) {
    this.settings = { ...settings, ...options }

    this.init()
  }

  private createUI(): HTMLElement {
    const ui = []

    if (this.settings.withClearButton) {
      const clearButton = el.button(
        {
          className: 'spaghetti-audio__clear',
          onclick: () => this.clearStrings(),
        },
        'Clear'
      )

      ui.push(clearButton)
    }

    return SpaghettiAudio.createUIContainer(ui)
  }

  private addStringToStore(string: StringPosition) {
    if (!this.settings.withLocalStorage) {
      return
    }

    const strings = this.store

    this.store = [...strings, string]
  }

  private clearStrings() {
    if (this.settings.withLocalStorage) {
      localStorage.removeItem(<string>this.settings.localStorageKey)
    }

    this.strings = []
  }

  private set store(strings: StringPosition[]) {
    if (!this.settings.withLocalStorage) {
      return
    }

    try {
      localStorage.setItem(
        <string>this.settings.localStorageKey,
        JSON.stringify(strings)
      )
    } catch {
      /* Ignore */
    }
  }

  private get store(): StringPosition[] {
    if (!this.settings.withLocalStorage) {
      return []
    }

    try {
      return (
        JSON.parse(localStorage.getItem(this.settings.localStorageKey)) || []
      )
    } catch {
      return []
    }
  }

  private addNewString = (a?: Point, b?: Point): void => {
    const string = {
      a: {
        x: a?.x || this.mouse.startPos.x,
        y: a?.y || this.mouse.startPos.y,
      },
      b: {
        x: b?.x || this.mouse.endPos.x,
        y: b?.y || this.mouse.endPos.y,
      },
    }

    this.addStringToStore(string)
    this.buildString(string.a, string.b)
  }

  private buildStringVertices(
    a: Point,
    b: Point,
    angle: number,
    vertexSeparation: number,
    note: string
  ): InteractiveVertex[] {
    const points: InteractiveVertex[] = []

    for (let i = 0; i <= this.settings.totalPoints - 1; i += 1) {
      const { x, y } = VectorHelpers.getPointOnVector(
        a,
        b,
        i / (this.settings.totalPoints - 1)
      )

      points.push(
        new InteractiveVertex(
          i === 0 || i === this.settings.totalPoints - 1,
          x,
          y,
          angle,
          vertexSeparation,
          this.mouse,
          () => this.onStrumString(note),
          this.settings.hitboxSize
        )
      )
    }

    return points
  }

  private buildString(a: Point, b: Point): void {
    const length = VectorHelpers.getLength(a, b)

    if (length < this.settings.minStringLength) {
      return
    }

    const angle = VectorHelpers.getAngle(a, b)
    const vertexSeparation = length / (this.settings.totalPoints - 1)
    const note =
      length > this.settings.hiRange.end
        ? keyboard[keyboard.length - 1]
        : keyboard[
            Math.round(keyboard.length * (length / this.settings.hiRange.end))
          ]

    this.strings.push({
      length,
      vertexSeparation,
      points: this.buildStringVertices(a, b, angle, vertexSeparation, note),
      note,
    })

    if (this.settings.debug) {
      // eslint-disable-next-line no-console
      console.log(`Angle: ${angle}`, `Length: ${length}`, `Note: ${note}`)
    }
  }

  private addEventListeners(): void {
    this.canvas.addEventListener('click', this.startAudioContext)
    this.canvas.addEventListener('touchstart', this.startAudioContext)
    window.addEventListener('resize', this.onResize)
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener('click', this.startAudioContext)
    this.canvas.removeEventListener('touchstart', this.startAudioContext)
    window.removeEventListener('resize', this.onResize)
  }

  /**
   * Most browsers require interaction before starting the Web Audio context
   */
  private async startAudioContext(): Promise<void> {
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
  }

  private onStrumString(note: string): void {
    synth.triggerAttackRelease(note, '8n')
  }

  private init(): void {
    this.ui = this.createUI()
    this.context = this.canvas.getContext('2d')
    this.mouse = new MouseTracker(this.canvas, null, this.addNewString)
    this.store.forEach(({ a, b }) => this.buildString(a, b))
    this.onResize = debounce(this.onResize, 300)
    this.addEventListeners()

    this.start()
  }

  private start(): void {
    cancelAnimationFrame(this.renderLoopId)

    this.canvas.width = this.settings.wrapper?.offsetWidth || window.innerWidth
    this.canvas.height =
      this.settings.wrapper?.offsetHeight || window.innerHeight

    this.render()
  }

  private render = (): void => {
    this.renderLoopId = requestAnimationFrame(this.render)

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.strings.forEach((string) => {
      this.drawString(string.points)

      if (this.settings.debug) {
        this.drawDebugger(string)
      }
    })

    if (this.mouse.drawing) {
      this.canvas.style.cursor = 'grabbing'
      this.drawLine(this.mouse.startPos, this.mouse.endPos)
    } else {
      this.canvas.style.cursor = 'crosshair'
    }
  }

  private onResize = (): void => {
    this.start()
  }

  private drawLine(p1: Point, p2: Point): void {
    const { context } = this

    context.lineCap = 'round'
    context.strokeStyle = this.settings.spaghettiColor
    context.lineWidth = this.settings.spaghettiWidth

    context.beginPath()
    context.moveTo(p1.x, p1.y)
    context.lineTo(p2.x, p2.y)
    context.stroke()
  }

  private drawString(points: InteractiveVertex[]): void {
    const { context } = this

    context.lineCap = 'round'
    context.strokeStyle = this.settings.spaghettiColor
    context.lineWidth = this.settings.spaghettiWidth
    context.beginPath()

    points.forEach((point, i) => {
      const isFirst = i === 0
      const isLast = i === points.length - 1

      if (!isLast) {
        point.setControlPoint(points[i + 1])
      }

      // First and last points are static, so no need to animate them
      if (!isFirst && !isLast) {
        point.render(
          this.settings.viscosity,
          this.settings.damping,
          this.settings.hitboxSize
        )
      }

      context.bezierCurveTo(
        point.current.x,
        point.current.y,
        point.control.x,
        point.control.y,
        point.control.x,
        point.control.y
      )
    })

    context.stroke()
  }

  private drawDebugger(string: SpaghettiString): void {
    const { note, points } = string
    const { context } = this

    context.font = '16px Andale Mono, Monospace'
    context.fillStyle = '#424242'
    context.fillText(note, points[0].initial.x - 20, points[0].initial.y - 10)

    for (let i = 0; i <= this.settings.totalPoints - 1; i += 1) {
      const p = points[i]

      context.fillStyle = '#000'
      context.beginPath()
      context.rect(p.current.x - 2, p.current.y - 2, 4, 4)
      context.fill()

      context.fillStyle = '#fff'
      context.beginPath()
      context.rect(p.control.x - 1, p.control.y - 1, 2, 2)
      context.fill()

      context.fillStyle = '#424242'
      context.font = '11px Andale Mono, Monospace'

      context.fillText(
        `[${Math.round(p.current.x)} ${Math.round(p.current.y)}]`,
        p.current.x,
        p.current.y
      )

      context.fillText(
        `[${Math.round(p.velocity.x * 100) / 100} ${Math.round(
          p.velocity.x * 100
        )}] v→`,
        p.current.x,
        p.current.y + 10
      )

      if (p.hitbox) {
        context.lineWidth = 4
        context.strokeStyle = 'rgba(100, 0, 255, 0.2)'
        context.fillStyle = 'rgba(0, 255, 0, 0.2'
        context.beginPath()
        context.moveTo(p.hitbox.a.x, p.hitbox.a.y)
        context.lineTo(p.hitbox.b.x, p.hitbox.b.y)
        context.lineTo(p.hitbox.c.x, p.hitbox.c.y)
        context.lineTo(p.hitbox.d.x, p.hitbox.d.y)
        context.closePath()
        context.stroke()

        if (p.hitbox.hitting) {
          context.fill()
        }
      }
    }
  }

  destroy(): void {
    this.removeEventListeners()
    this.mouse.destroy()

    cancelAnimationFrame(this.renderLoopId)
  }
}

export default SpaghettiAudio
