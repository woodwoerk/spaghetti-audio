export interface Settings {
  damping?: number
  debug?: boolean
  hiRange?: { start: number; end: number }
  localStorageKey?: string
  minStringLength?: number
  hitboxSize?: number
  spaghettiColor?: string
  spaghettiWidth?: number
  totalPoints?: number
  viscosity?: number
  withClearButton?: boolean
  withLocalStorage?: boolean
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
  totalPoints: 6,
  viscosity: 10,
}

export default settings
