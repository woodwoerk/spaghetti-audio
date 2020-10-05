export const totalPoints: number = 6
export const viscosity: number = 10
export const mouseDist: number = 20
export const damping: number = 0.1
export const debug: boolean = false
export const spaghettiColor: string = '#f76c6c'
export const spaghettiWidth: number = 4
export const minStringLength: number = 30
export const localStorageKey: string = 'SPAGHETTI_STRINGS'
export const withLocalStorage: boolean = true
export const withClearButton: boolean = true
export const hiRange: { start: number; end: number } = { start: 0, end: 600 }
// const LO_RANGE = { start: 600, end: 1200 };

const settings = {
  totalPoints,
  viscosity,
  mouseDist,
  damping,
  debug,
  spaghettiColor,
  spaghettiWidth,
  minStringLength,
  localStorageKey,
  withLocalStorage,
  withClearButton,
  hiRange,
}

export type Setting = keyof typeof settings

export default settings
