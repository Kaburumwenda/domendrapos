/**
 * useToast - Global toast notification composable.
 */
export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function show(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    show,
    dismiss,
    success: (m: string) => show(m, 'success'),
    error: (m: string) => show(m, 'error'),
    info: (m: string) => show(m, 'info'),
    warning: (m: string) => show(m, 'warning'),
  }
}
