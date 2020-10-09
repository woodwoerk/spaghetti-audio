export const attemptCall = (func: () => void): void => {
  if (typeof func === 'function') {
    func()
  }
}
