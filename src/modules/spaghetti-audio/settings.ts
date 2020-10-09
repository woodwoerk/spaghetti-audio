export interface Settings {
  /** How fast motion dies down. The higher the number, the less oscillation and more al dente the spaghetti. */
  damping?: number
  /** Show the hitboxes and other helpful debugger annotations on the canvas. */
  debug?: boolean
  /** The frequency range of the keyboard. */
  hiRange?: { start: number; end: number }
  /** The key to store the spaghetti strings under in local storage. */
  localStorageKey?: string
  /** It's spaghetti, not scialatelli, so let's set a minimum length. */
  minStringLength?: number
  /** The space around the spaghetti that's interactive. */
  hitboxSize?: number
  /** Spaghetti color. */
  spaghettiColor?: string
  /** Spaghetti width. */
  spaghettiWidth?: number
  /** The total interactive points along each spaghetti string. Minimum is 3 – Two anchor points on each end, and one interactive wobbly point in the middle. */
  totalPoints?: number
  /** How quickly the spaghetti oscillates back to center. The higher the number, the stickier or more molasses-like the spaghetti. */
  viscosity?: number
  /** Show a clear button to clear all the strings. */
  withClearButton?: boolean
  /** Store the spaghetti strings in local storage. */
  withLocalStorage?: boolean
  /** A HTML element, if the spaghetti canvas is attached to a wrapper. */
  wrapper?: HTMLElement
}

const settings: Settings = {
  damping: 0.1,
  hiRange: { start: 0, end: 600 },
  localStorageKey: 'spaghetti',
  minStringLength: 30,
  hitboxSize: 50,
  spaghettiColor: '#f76c6c',
  spaghettiWidth: 4,
  totalPoints: 5,
  viscosity: 10,
}

export default settings
