/**
 * useFormat - Common formatting utilities for currency, dates, etc.
 *
 * Currency symbol is resolved dynamically from the auth store (tenant settings).
 * Falls back to 'KSh' (Kenyan Shilling) then '$' (USD) if no tenant data is loaded.
 */
export function useFormat() {
  // Try to read the currency symbol from the Pinia auth store.
  // This is safe in any component since the store is auto-imported by Nuxt.
  let symbol = 'KSh'
  try {
    const auth = useAuthStore()
    if (auth?.currencySymbol) {
      symbol = auth.currencySymbol
    }
  } catch {
    // Store not available yet (e.g., during SSR boot) — use fallback
  }

  function currency(value: number | string | null | undefined, overrideSymbol?: string): string {
    const sym = overrideSymbol || symbol
    if (value === null || value === undefined) return `${sym}0.00`
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return `${sym}0.00`
    return `${sym}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }

  function date(value: string | Date): string {
    return new Date(value).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function datetime(value: string | Date): string {
    return new Date(value).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function number(value: number | string): string {
    return Number(value).toLocaleString('en-GB')
  }

  function percent(value: number | string, decimals = 1): string {
    return `${Number(value).toFixed(decimals)}%`
  }

  return { currency, date, datetime, number, percent }
}
