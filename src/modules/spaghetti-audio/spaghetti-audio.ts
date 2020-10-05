import * as Tone from 'tone'
import debounce from 'lodash/debounce'
import MouseTracker from '@utils/mouse-tracker'
import VectorHelpers, { Point } from '@utils/helpers/vector-helpers'
import { getKeyboard } from '@utils/helpers/audio-helpers'
import el from '@utils/dom-helpers/dom-helpers'
import InteractiveVertex from './interactive-vertex'
import settings, { Setting } from './constants'

type Settings = { [key in Setting]: any }

interface StringPosition {
  a: Point
  b: Point
}

interface String {
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
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }

    return el.canvas({ style }) as HTMLCanvasElement
  }

  private static createUIContainer(ui: HTMLElement[]) {
    const style = {
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 10,
    }

    return el.div({ style }, ui)
  }

  private renderLoopId: number = null
  private strings: String[] = []
  private settings: Partial<Settings>
  private context: CanvasRenderingContext2D
  private mouse: MouseTracker
  readonly canvas = SpaghettiAudio.createCanvas()
  ui: HTMLElement

  constructor(options: Partial<Settings> = {}) {
    this.settings = { ...settings, ...options }

    this.init()
  }

  private createUI(): HTMLElement {
    const ui = []
    const buttonStyle = {
      display: 'inline-block',
    }

    if (this.settings.withClearButton) {
      const clearButton = el.button(
        {
          style: buttonStyle,
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
    localStorage.setItem(
      <string>this.settings.localStorageKey,
      JSON.stringify(strings)
    )
  }

  private get store(): StringPosition[] {
    if (!this.settings.withLocalStorage) {
      return []
    }

    return JSON.parse(localStorage.getItem(this.settings.localStorageKey)) || []
  }

  private addNewString = (a?: Point, b?: Point): void => {
    const string = {
      a: {
        x: a?.x || this.mouse.downPos.x,
        y: a?.y || this.mouse.downPos.y,
      },
      b: {
        x: b?.x || this.mouse.upPos.x,
        y: b?.y || this.mouse.upPos.y,
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
          () => this.onStrumString(note)
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
      console.log(`Angle: ${angle}`, `Length: ${length}`, `Note: ${note}`)
    }
  }

  private addEventListeners(): void {
    window.addEventListener('resize', this.onResize)
  }

  private removeEventListeners(): void {
    window.removeEventListener('resize', this.onResize)
  }

  private onStrumString(note: string): void {
    if (Tone.context.state !== 'running') {
      Tone.context.resume()
    }

    synth.triggerAttackRelease(note, '8n')
  }

  private init(): void {
    this.ui = this.createUI()
    this.context = this.canvas.getContext('2d')
    this.mouse = new MouseTracker(this.canvas, null, this.addNewString)
    this.store.forEach(({ a, b }) => this.buildString(a, b))
    this.onResize = debounce(this.onResize.bind(this), 300)
    this.addEventListeners()

    this.start()
  }

  private start(): void {
    cancelAnimationFrame(this.renderLoopId)

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.render()
  }

  private render(): void {
    this.renderLoopId = requestAnimationFrame(this.render.bind(this))

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.strings.forEach((string) => {
      this.drawString(string.points)

      if (this.settings.debug) {
        this.drawDebugger(string)
      }
    })

    if (this.mouse.down) {
      this.canvas.style.cursor = 'grabbing'
      this.drawLine(this.mouse.downPos, this.mouse.current)
    } else {
      this.canvas.style.cursor = 'crosshair'
    }
  }

  private onResize(): void {
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
        point.render()
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

  private drawDebugger(string: String): void {
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

      if (p.hitbox) {
        context.strokeStyle = 'rgba(0, 0, 255, 0.2)'
        context.beginPath()
        context.moveTo(p.hitbox.a.x, p.hitbox.a.y)
        context.lineTo(p.hitbox.b.x, p.hitbox.b.y)
        context.lineTo(p.hitbox.c.x, p.hitbox.c.y)
        context.lineTo(p.hitbox.d.x, p.hitbox.d.y)
        context.closePath()
        context.stroke()
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
