/**
 * useCsvExport — Download any array of records as a CSV file in the browser.
 *
 * Usage:
 *   const { exportCsv } = useCsvExport()
 *   exportCsv('sales-summary.csv', [
 *     { date: '2026-01-01', revenue: 1200, transactions: 15 },
 *     { date: '2026-01-02', revenue: 980,  transactions: 12 },
 *   ])
 *
 * For nested objects, pass an explicit columns array:
 *   exportCsv('items.csv', rows, { columns: ['id', 'name', 'price'] })
 */
export function useCsvExport() {
  function escapeCell(value: unknown): string {
    if (value === null || value === undefined) return ''
    let str = typeof value === 'string' ? value : String(value)
    if (/["\n\r,]/.test(str)) {
      str = `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  function exportCsv(
    filename: string,
    rows: Record<string, any>[],
    opts: { columns?: string[]; delimiter?: string } = {},
  ): void {
    if (!rows || rows.length === 0) {
      console.warn('[useCsvExport] No rows to export')
      return
    }
    const delimiter = opts.delimiter || ','
    const cols = opts.columns ||
      Array.from(rows.reduce((s, r) => { Object.keys(r).forEach(k => s.add(k)); return s }, new Set<string>()))

    const header = cols.map(c => escapeCell(c)).join(delimiter)
    const body = rows.map(r => cols.map(c => escapeCell(r[c])).join(delimiter)).join('\r\n')
    const csv = `${header}\r\n${body}`

    // Prepend BOM so Excel detects UTF-8
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { exportCsv, escapeCell }
}
