export const attemptCall = (func) => {
  if (func && typeof func === 'function') {
    return func()
  }

  return false
}
