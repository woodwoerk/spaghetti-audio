export const attemptCall = (func: () => any) => {
  if (typeof func === 'function') {
    return func()
  }

  return false
}
