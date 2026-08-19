export function useCountUp(source: () => number, duration = 800) {
  const display = ref(0)
  let raf: number | undefined
  let from = 0
  let startTime = 0

  function animate(target: number) {
    if (from === target) {
      display.value = target
      return
    }
    startTime = performance.now()
    const startVal = from

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      display.value = startVal + (target - startVal) * eased
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      } else {
        from = target
      }
    }

    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(step)
  }

  watch(source, (target) => {
    animate(target)
  }, { immediate: true })

  onScopeDispose(() => {
    if (raf) cancelAnimationFrame(raf)
  })

  return display
}
