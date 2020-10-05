import throttle from 'lodash/throttle'
import { attemptCall } from '@utils/helpers/performance-helpers'
import { Point } from '@utils/helpers/vector-helpers'
import MouseTracker from '@utils/mouse-tracker'
import Hitbox from './hitbox'
import * as constants from './constants'

type Axis = 'x' | 'y'

class InteractiveVertex {
  current: Point
  control: Point
  initial: Point
  hitbox: null | Hitbox
  private velocity: Point = { x: 0, y: 0 }

  constructor(
    anchor: boolean,
    x: number,
    y: number,
    angle: number,
    vertexSeparation: number,
    private readonly mouse: MouseTracker,
    private readonly hitCallback: () => void
  ) {
    this.current = { x, y }
    this.initial = { x, y }
    this.control = { x, y }

    this.hitbox = anchor
      ? null
      : new Hitbox(this.current, angle, vertexSeparation, constants.mouseDist)

    this.handleStrum = throttle(this.handleStrum.bind(this), 400, {
      leading: true,
      trailing: false,
    })
  }

  private handleDrag(): void {
    this.current.x =
      (this.mouse.current.x - this.initial.x) * 0.8 + this.initial.x
    this.current.y =
      (this.mouse.current.y - this.initial.y) * 0.8 + this.initial.y
  }

  private handleStrum(): void {
    this.velocity.x = ((this.mouse.direction.x || 1) * this.mouse.speed) / 20
    this.velocity.y = ((this.mouse.direction.y || 1) * this.mouse.speed) / 20

    attemptCall(this.hitCallback)
  }

  render(): void {
    this.lerpVertex('x')
    this.lerpVertex('y')

    if (this.hitbox) {
      this.hitbox.setCoordsByCenter(this.current)
    }

    if (!this.mouse.down && this.hitbox && this.mouse.speed) {
      this.hitbox.hitTest(
        this.mouse.current,
        this.handleDrag.bind(this),
        this.handleStrum.bind(this)
      )
    }
  }

  /**
   * Set the control point between this and the next vertex
   * Used to create bezier curves via canvas context bezierCurveTo
   * @param nextVertex
   */
  setControlPoint(nextVertex: InteractiveVertex): void {
    this.control.x = (this.current.x + nextVertex.current.x) / 2
    this.control.y = (this.current.y + nextVertex.current.y) / 2
  }

  private lerpVertex(axis: Axis): void {
    if (this.velocity[axis] < -0.01 || this.velocity[axis] > 0.01) {
      this.applyForce(axis)

      if (!this.hitbox || !this.hitbox.hitting) {
        this.dampen(axis)
      }
    } else if (this.velocity[axis] !== 0) {
      this.velocity[axis] = 0
      this.current[axis] = this.initial[axis]
    }
  }

  private dampen(axis: Axis): void {
    this.velocity[axis] +=
      (this.initial[axis] - this.current[axis]) / constants.viscosity
  }

  private applyForce(axis: Axis): void {
    this.velocity[axis] *= 1 - constants.damping
    this.current[axis] += this.velocity[axis]
  }
}

export default InteractiveVertex
