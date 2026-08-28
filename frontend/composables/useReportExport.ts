/**
 * useReportExport — Comprehensive client-side report exporter.
 *
 * Supports three export formats:
 *   1. **CSV**  — lightweight flat-file via Blob
 *   2. **Excel** — .xlsx workbook via ExcelJS with styled headers, borders, and banded rows
 *   3. **PDF**  — world-class designed PDF via jsPDF + autoTable with:
 *      - Business header (logo, name, email, phone)
 *      - Report title, date range, generated-at timestamp
 *      - KPI summary cards for summary-type reports
 *      - Bar charts drawn natively in jsPDF (Revenue / Cost / Profit)
 *      - Auto-paginated data tables
 *      - Footer with page numbers and copyright
 *
 * Usage:
 * ```ts
 * const { exportReport, exporting } = useReportExport()
 * await exportReport('pdf', { reportId, reportLabel, items, columns, kpis, chartData, dateFrom, dateTo })
 * ```
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import FileSaver from 'file-saver'
import ExcelJS from 'exceljs'

export interface ReportColumn {
  key: string
  label: string
  format?: 'currency' | 'number' | 'percent' | 'date'
}

export interface ReportKpi {
  label: string
  value: string
  color?: string
}

export interface DonutSegment {
  label: string
  value: number
  color?: string
}
export interface HBarItem {
  label: string
  value: number
  color?: string
}
export interface ReportChartData {
  type: 'bar' | 'line' | 'donut' | 'hbar'
  // Bar / Line chart
  labels?: string[]
  datasets?: { label: string; data: number[]; color?: [number, number, number] }[]
  // Donut chart
  segments?: { label: string; value: number; color?: string }[]
  // Horizontal bar chart
  hbarItems?: { label: string; value: number; color?: string }[]
  // Meta
  title?: string
  subtitle?: string
}

interface ExportParams {
  reportId: string
  reportLabel: string
  items: Record<string, any>[]
  columns: ReportColumn[]
  kpis?: ReportKpi[]
  chartData?: ReportChartData
  charts?: ReportChartData[]
  dateFrom?: string
  dateTo?: string
}

// ── General Report (multi-section) types ──
export interface GeneralReportSection {
  reportId: string
  reportLabel: string
  items: Record<string, any>[]
  columns: ReportColumn[]
  kpis?: ReportKpi[]
  chartData?: ReportChartData
  charts?: ReportChartData[]
}

export function useReportExport() {
  const auth = useAuthStore()
  const { currency: fmtCurrency, number: fmtNumber, date: fmtDate } = useFormat()

  const exporting = ref(false)
  const exportingGeneral = ref(false)
  const exportFormats = ref<'csv' | 'excel' | 'pdf'>('pdf')

  // ── Color palette (shared across PDF helper functions) ──
  const PRIMARY: [number, number, number] = [26, 35, 126] // #1A237E
  const ACCENT: [number, number, number] = [25, 118, 210]  // #1976D2
  const LIGHT_BG: [number, number, number] = [232, 240, 254]
  const DARK_TEXT: [number, number, number] = [33, 33, 33]
  const MUTED: [number, number, number] = [97, 97, 97]

  function _bizName(): string {
    return auth.tenantName || 'DomendraPOS'
  }
  function _bizEmail(): string {
    return auth.tenantEmail || ''
  }
  function _bizPhone(): string {
    return auth.tenantPhone || ''
  }
  function _bizAddress(): string {
    return auth.tenantAddress || ''
  }
  function _logoUrl(): string {
    return auth.tenantLogo || ''
  }

  function _formatCell(raw: any, fmt?: ReportColumn['format']): string {
    if (raw === null || raw === undefined) return ''
    if (fmt === 'currency') return fmtCurrency(raw)
    if (fmt === 'number') return fmtNumber(raw)
    if (fmt === 'percent') return `${Number(raw).toFixed(1)}%`
    if (fmt === 'date') return fmtDate(raw)
    return String(raw)
  }

  function _dateLabel(from?: string, to?: string): string {
    if (!from && !to) return 'All Time'
    if (from && to && from === to) return fmtDate(from)
    if (from && to) return `${fmtDate(from)} — ${fmtDate(to)}`
    return from ? fmtDate(from) : fmtDate(to || '')
  }

  function _fileName(reportLabel: string, ext: string): string {
    const date = new Date().toISOString().slice(0, 10)
    return `${reportLabel.replace(/\s+/g, '_')}_${date}.${ext}`
  }

  // ── CSV Export ───────────────────────────────────────────────
  function _exportCSV(params: ExportParams) {
    const { reportLabel, items, columns } = params
    if (!items.length) return

    const header = columns.map(c => `"${c.label}"`).join(',')
    const rows = items.map(row =>
      columns.map(c => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(','),
    )
    const csv = [header, ...rows].join('\n')

    // Prepend metadata as comment-style header lines
    const meta = [
      `# ${_bizName()}`,
      `# Report: ${reportLabel}`,
      `# Date Range: ${_dateLabel(params.dateFrom, params.dateTo)}`,
    ].filter(Boolean).join('\n')

    const full = `${meta}\n${csv}`
    const blob = new Blob(['\ufeff' + full], { type: 'text/csv;charset=utf-8;' })
    FileSaver.saveAs(blob, _fileName(reportLabel, 'csv'))
  }

  // ── Excel Export ─────────────────────────────────────────────
  async function _exportExcel(params: ExportParams) {
    const { reportId, reportLabel, items, columns, kpis, dateFrom, dateTo } = params
    if (!items.length && !kpis?.length) return

    const wb = new ExcelJS.Workbook()
    wb.creator = _bizName()
    wb.created = new Date()
    const ws = wb.addWorksheet(reportLabel.slice(0, 28) || 'Report', {
      views: [{ state: 'frozen', ySplit: 6 }],
      properties: { defaultRowHeight: 20 },
    })

    // Define columns
    ws.columns = columns.map(c => ({
      header: c.label,
      key: c.key,
      width: _colWidth(c, items),
    }))

    // ── Title section (rows 1-2) ──
    const maxCol = Math.max(columns.length, 8)
    const lastCol = _colLetter(maxCol)
    ws.mergeCells(`A1:${lastCol}1`)
    const titleCell = ws.getCell('A1')
    titleCell.value = _bizName()
    titleCell.font = { size: 18, bold: true, color: { argb: 'FF1A237E' } }
    titleCell.alignment = { horizontal: 'left', vertical: 'middle' }
    ws.getRow(1).height = 30

    ws.mergeCells(`A2:${lastCol}2`)
    const subCell = ws.getCell('A2')
    const subParts = [reportLabel, `Date Range: ${_dateLabel(dateFrom, dateTo)}`, `Generated: ${new Date().toLocaleString('en-GB')}`]
    subCell.value = subParts.join('  |  ')
    subCell.font = { size: 10, italic: true, color: { argb: 'FF616161' } }
    subCell.alignment = { horizontal: 'left' }
    ws.getRow(2).height = 18

    // ── Contact info (row 3) ──
    const contactParts = [_bizEmail(), _bizPhone(), _bizAddress()].filter(Boolean)
    if (contactParts.length) {
      ws.mergeCells(`A3:${lastCol}3`)
      const cCell = ws.getCell('A3')
      cCell.value = contactParts.join('  •  ')
      cCell.font = { size: 9, color: { argb: 'FF9E9E9E' } }
      cCell.alignment = { horizontal: 'left' }
    }

    // ── KPI summary (row 5) ──
    if (kpis && kpis.length) {
      ws.getRow(5).height = 30
      kpis.forEach((kpi, i) => {
        const col = i + 1
        const labelCell = ws.getCell(5, col)
        labelCell.value = kpi.label
        labelCell.font = { size: 9, bold: true, color: { argb: 'FF37474F' } }
        labelCell.fill = { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFE3F2FD' } }
        labelCell.border = { bottom: { style: 'medium', color: { argb: 'FF1565C0' } } }
        labelCell.alignment = { horizontal: 'center' }

        const valCell = ws.getCell(6, col)
        valCell.value = kpi.value
        valCell.font = { size: 13, bold: true, color: { argb: 'FF1565C0' } }
        valCell.fill = { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFE3F2FD' } }
        valCell.alignment = { horizontal: 'center' }
        ws.getColumn(col).width = Math.max(ws.getColumn(col).width || 18, 20)
      })
      ws.getRow(6).height = 28
    }

    // ── Header row (shifted down by kpis) ──
    const headerRowNum = kpis && kpis.length ? 8 : 5

    // Style header row
    const hdrRow = ws.getRow(headerRowNum)
    columns.forEach((c, i) => {
      const cell = hdrRow.getCell(i + 1)
      cell.value = c.label
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A237E' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      }
    })
    hdrRow.height = 26

    // ── Data rows ──
    items.forEach((row, idx) => {
      const rowNum = headerRowNum + 1 + idx
      const r = ws.getRow(rowNum)
      columns.forEach((c, ci) => {
        const cell = r.getCell(ci + 1)
        const raw = row[c.key]
        if (c.format === 'currency') {
          cell.value = Number(raw) || 0
          cell.numFmt = '#,##0.00'
        } else if (c.format === 'number') {
          cell.value = Number(raw) || 0
          cell.numFmt = '#,##0'
        } else if (c.format === 'percent') {
          cell.value = Number(raw) || 0
          cell.numFmt = '0.0"%"'
        } else if (c.format === 'date') {
          cell.value = raw ? fmtDate(raw) : ''
        } else {
          cell.value = raw ?? ''
        }
        // Banded rows
        if (idx % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        }
        cell.alignment = { vertical: 'middle' }
      })
      r.height = 20
    })

    // ── Set print area and page setup ──
    ws.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    }
    ws.pageMargins = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
    ws.headerFooter = {
      oddHeader: `&L&B${_bizName()}&R${reportLabel}`,
      oddFooter: `&LGenerated: ${new Date().toLocaleString('en-GB')}&RPage &P of &N`,
    }

    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    FileSaver.saveAs(blob, _fileName(reportLabel, 'xlsx'))
  }

  function _colWidth(col: ReportColumn, items: Record<string, any>[]): number {
    const sample = items.slice(0, 50).map(row => String(row[col.key] ?? ''))
    const maxLen = Math.max(col.label.length, ...sample.map(s => s.length), 10)
    return Math.min(Math.max(maxLen + 3, 14), 45)
  }

  function _colLetter(n: number): string {
    let result = ''
    while (n > 0) {
      const rem = (n - 1) % 26
      result = String.fromCharCode(65 + rem) + result
      n = Math.floor((n - 1) / 26)
    }
    return result
  }

  // ── PDF Export (world-class design) ──────────────────────────
  async function _exportPDF(params: ExportParams) {
    const { reportLabel, items, columns, kpis, chartData, dateFrom, dateTo } = params
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 14

    // ── Header: Logo + Business Name + Contact ──
    const logoUrl = _logoUrl()
    let logoLoaded = false
    if (logoUrl && import.meta.client) {
      try {
        logoLoaded = await _addLogoToPdf(doc, logoUrl, margin, 12, 18, 18)
      } catch {
        logoLoaded = false
      }
    }

    if (!logoLoaded) {
      // Draw business-initial badge as logo fallback
      doc.setFillColor(...PRIMARY)
      doc.roundedRect(margin, 11, 18, 18, 3, 3, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      const initials = _bizName().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
      doc.text(initials || 'D', margin + 9, 22, { align: 'center' })
    }

    const textX = logoLoaded || !logoUrl ? margin + 22 : margin + 22

    // Business name
    doc.setTextColor(...PRIMARY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text(_bizName(), textX, 18)

    // Contact line
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    const contactParts = [_bizEmail(), _bizPhone(), _bizAddress()].filter(Boolean)
    if (contactParts.length) {
      doc.text(contactParts.join('  •  '), textX, 24)
    }

    // ── Report title and date range (right side) ──
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...DARK_TEXT)
    doc.text(reportLabel, pageW - margin, 16, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text(`Date Range: ${_dateLabel(dateFrom, dateTo)}`, pageW - margin, 21, { align: 'right' })
    doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, pageW - margin, 26, { align: 'right' })

    // ── Header divider line ──
    doc.setDrawColor(...ACCENT)
    doc.setLineWidth(0.8)
    doc.line(margin, 30, pageW - margin, 30)
    doc.setLineWidth(0.2)
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, 30.5, pageW - margin, 30.5)

    let yPos = 36

    // ── KPI summary cards ──
    if (kpis && kpis.length) {
      yPos = _drawKpiCards(doc, kpis, margin, yPos, pageW - 2 * margin)
    }

    // ── Charts ──
    const allCharts = [
      ...(chartData ? [chartData] : []),
      ...(params.charts || []),
    ].filter(c => c)
    for (const ch of allCharts) {
      if (ch.type === 'donut' && ch.segments && ch.segments.length) {
        yPos = _drawDonutChart(doc, ch, margin, yPos, pageW - 2 * margin)
      } else if (ch.type === 'hbar' && ch.hbarItems && ch.hbarItems.length) {
        yPos = _drawHBarChart(doc, ch, margin, yPos, pageW - 2 * margin)
      } else if (ch.labels && ch.labels.length) {
        yPos = _drawChart(doc, ch, margin, yPos, pageW - 2 * margin)
      }
    }

    // ── Data table ──
    if (items.length) {
      autoTable(doc, {
        startY: yPos + 2,
        head: [columns.map(c => c.label)],
        body: items.map(row => columns.map(c => _formatCell(row[c.key], c.format))),
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2.5,
          textColor: DARK_TEXT,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: PRIMARY,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        columnStyles: columns.reduce((acc, c, i) => {
          if (c.format === 'currency' || c.format === 'number' || c.format === 'percent') {
            acc[i] = { halign: 'right' }
          } else if (c.format === 'date') {
            acc[i] = { halign: 'center' }
          }
          return acc
        }, {} as Record<number, any>),
        margin: { left: margin, right: margin },
        didDrawPage: (data: any) => {
          _drawFooter(doc, pageW, pageH, margin)
        },
      })
    } else {
      // No data — draw empty state
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(...MUTED)
      doc.text('No data available for this report.', pageW / 2, yPos + 10, { align: 'center' })
    }

    // ── Footer on the last page (drawn by didDrawPage, but add for first page if table was short) ──
    doc.save(_fileName(reportLabel, 'pdf'))
  }

  function _drawKpiCards(
    doc: jsPDF,
    kpis: ReportKpi[],
    x: number,
    y: number,
    totalW: number,
  ): number {
    const cardH = 18
    const gap = 4
    const cardW = (totalW - gap * (kpis.length - 1)) / kpis.length

    kpis.forEach((kpi, i) => {
      const cx = x + i * (cardW + gap)

      // Card background
      doc.setFillColor(...LIGHT_BG)
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'F')

      // Top accent bar
      const barColor = kpi.color ? _hexToRgb(kpi.color) : [25, 118, 210] as [number, number, number]
      doc.setFillColor(...barColor)
      doc.roundedRect(cx, y, cardW, 1.5, 0, 0, 'F')

      // Label
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      doc.text(kpi.label.toUpperCase(), cx + 3, y + 6)

      // Value
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...barColor)
      doc.text(kpi.value, cx + 3, y + 13)
    })

    return y + cardH + 6
  }

  function _drawChart(
    doc: jsPDF,
    chartData: ReportChartData,
    x: number,
    y: number,
    totalW: number,
  ): number {
    const chartH = 50
    const labelArea = 14
    const chartLeft = x + labelArea
    const chartW = totalW - labelArea - 4

    // Chart title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...[33, 33, 33])
    doc.text('Revenue Trend', x, y + 2)
    y += 4

    // Chart background
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(chartLeft, y, chartW, chartH, 1, 1, 'F')

    const labels = chartData.labels
    if (!labels.length) return y + chartH + 6

    // Find max value across all datasets
    const maxVal = Math.max(...chartData.datasets.flatMap(d => d.data), 1)

    // Draw Y-axis grid lines
    doc.setDrawColor(225, 225, 225)
    doc.setLineWidth(0.1)
    for (let i = 0; i <= 4; i++) {
      const ly = y + chartH - (chartH * i) / 4
      doc.line(chartLeft, ly, chartLeft + chartW, ly)
    }

    const barCount = labels.length
    const groupW = chartW / barCount
    const barCountPerGroup = chartData.datasets.length
    const barW = Math.min((groupW * 0.7) / barCountPerGroup, 8)
    const barGap = 1

    labels.forEach((label, li) => {
      const groupStart = chartLeft + li * groupW + (groupW - barW * barCountPerGroup - barGap * (barCountPerGroup - 1)) / 2

      chartData.datasets.forEach((ds, di) => {
        const val = ds.data[li] || 0
        const barH = (val / maxVal) * (chartH - 6)
        const bx = groupStart + di * (barW + barGap)
        const by = y + chartH - barH

        const color = ds.color || [
          di === 0 ? 25 : di === 1 ? 198 : 46,
          di === 0 ? 118 : di === 1 ? 40 : 125,
          di === 0 ? 210 : di === 1 ? 40 : 50,
        ]
        doc.setFillColor(...color)
        // Only draw if bar height is meaningful
        if (barH > 0.5) {
          doc.rect(bx, by, barW, barH, 'F')
        }
      })
    })

    // X-axis labels (show roughly 8-12 labels max)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...[120, 120, 120])
    const labelInterval = Math.ceil(barCount / 10)
    labels.forEach((label, li) => {
      if (li % labelInterval === 0 || li === barCount - 1) {
        const lx = chartLeft + li * groupW + groupW / 2
        const shortLabel = label.length > 10 ? label.slice(5) : label
        doc.text(shortLabel, lx, y + chartH + 3, { align: 'center' })
      }
    })

    // Legend
    let legX = chartLeft + chartW - 60
    chartData.datasets.forEach((ds, di) => {
      const color = ds.color || [
        di === 0 ? 25 : di === 1 ? 198 : 46,
        di === 0 ? 118 : di === 1 ? 40 : 125,
        di === 0 ? 210 : di === 1 ? 40 : 50,
      ]
      doc.setFillColor(...color)
      doc.rect(legX, y - 2, 3, 3, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...[80, 80, 80])
      doc.text(ds.label, legX + 5, y + 1)
      legX += 25
    })

    return y + chartH + 8
  }

  function _drawDonutChart(
    doc: jsPDF,
    ch: ReportChartData,
    x: number,
    y: number,
    totalW: number,
  ): number {
    const segments = ch.segments!
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
    const title = ch.title || 'Distribution'
    const donutR = 35
    const cx = x + donutR + 10
    const cy = y + donutR + 6
    const chartH = donutR * 2 + 12

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...DARK_TEXT)
    doc.text(title, x, y + 2)
    if (ch.subtitle) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      doc.text(ch.subtitle, x, y + 5.5)
    }

    // Donut slices
    let cumPct = 0
    const palette = ['#1976D2', '#2E7D32', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548', '#607D8B', '#8BC34A', '#CDDC39']
    segments.forEach((seg, i) => {
      const startAngle = (cumPct / total) * 360 - 90
      cumPct += seg.value
      const endAngle = (cumPct / total) * 360 - 90
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180
      const x1 = cx + donutR * Math.cos(startRad)
      const y1 = cy + donutR * Math.sin(startRad)
      const x2 = cx + donutR * Math.cos(endRad)
      const y2 = cy + donutR * Math.sin(endRad)
      const largeArc = endAngle - startAngle > 180 ? 1 : 0
      const hex = seg.color || palette[i % palette.length]
      const rgb = _hexToRgb(hex)
      doc.setFillColor(...rgb)
      // Arc path as triangle fan (approximation for donut slice)
      // Draw filled triangle from center
      doc.triangle(cx, cy, x1, y1, x2, y2, 'F')

      // Draw arc segments to approximate the curved edge
      const steps = Math.max(4, Math.ceil((endAngle - startAngle) / 5))
      for (let s = 0; s < steps; s++) {
        const a1 = startAngle + ((endAngle - startAngle) * s) / steps
        const a2 = startAngle + ((endAngle - startAngle) * (s + 1)) / steps
        const ar1 = (a1 * Math.PI) / 180
        const ar2 = (a2 * Math.PI) / 180
        const px1 = cx + donutR * Math.cos(ar1)
        const py1 = cy + donutR * Math.sin(ar1)
        const px2 = cx + donutR * Math.cos(ar2)
        const py2 = cy + donutR * Math.sin(ar2)
        doc.triangle(cx, cy, px1, py1, px2, py2, 'F')
      }
    })
    // Donut hole (white circle)
    doc.setFillColor(255, 255, 255)
    doc.circle(cx, cy, donutR - 10, 'F')
    // Total in center
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...DARK_TEXT)
    doc.text(fmtCurrency(total), cx, cy - 1, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...MUTED)
    doc.text('Total', cx, cy + 3, { align: 'center' })

    // Legend (right side)
    const legX = cx + donutR + 14
    let legY = y + 2
    segments.forEach((seg, i) => {
      const hex = seg.color || palette[i % palette.length]
      const rgb = _hexToRgb(hex)
      doc.setFillColor(...rgb)
      doc.circle(legX, legY, 1.5, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...DARK_TEXT)
      const pct = ((seg.value / total) * 100).toFixed(1)
      const label = seg.label.length > 24 ? seg.label.slice(0, 22) + '…' : seg.label
      doc.text(`${label}: ${pct}%`, legX + 4, legY)
      legY += 5
    })

    return y + Math.max(chartH, legY - y) + 6
  }

  function _drawHBarChart(
    doc: jsPDF,
    ch: ReportChartData,
    x: number,
    y: number,
    totalW: number,
  ): number {
    const items = ch.hbarItems!
    const maxVal = Math.max(...items.map(i => i.value), 1)
    const labelW = 70
    const title = ch.title || 'Top Items'
    const rowH = 5
    const chartH = items.length * rowH + 8

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...DARK_TEXT)
    doc.text(title, x, y + 2)
    if (ch.subtitle) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      doc.text(ch.subtitle, x, y + 5.5)
    }
    let cy = y + 8
    const trackX = x + labelW
    const trackW = totalW - labelW - 30

    const palette = ['#1976D2', '#2E7D32', '#FF9800', '#9C27B0', '#F44336', '#00BCD4']
    items.forEach((item, i) => {
      // Label
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      const label = item.label.length > 20 ? item.label.slice(0, 18) + '…' : item.label
      doc.text(label, x, cy + 3)

      // Track background
      doc.setFillColor(240, 242, 245)
      doc.roundedRect(trackX, cy, trackW, rowH - 1, 1, 1, 'F')

      // Bar fill
      const fillW = Math.max(2, (item.value / maxVal) * trackW)
      const hex = item.color || palette[i % palette.length]
      doc.setFillColor(..._hexToRgb(hex))
      doc.roundedRect(trackX, cy, fillW, rowH - 1, 1, 1, 'F')

      // Value text
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(255, 255, 255)
      const valText = fmtCurrency(item.value)
      // If bar is small, put text outside
      if (fillW < 25) {
        doc.setTextColor(...DARK_TEXT)
        doc.text(valText, trackX + fillW + 2, cy + 3.5)
      } else {
        doc.text(valText, trackX + fillW - 2, cy + 3.5, { align: 'right' })
      }

      cy += rowH
    })

    return y + chartH + 6
  }

  function _drawFooter(doc: jsPDF, pageW: number, pageH: number, margin: number) {
    const y = pageH - 10
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.line(margin, y - 2, pageW - margin, y - 2)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...[130, 130, 130])
    const left = `© ${new Date().getFullYear()} ${_bizName()} — DomendraPOS`
    const right = `Page ${doc.getCurrentPageInfo().pageNumber}`
    doc.text(left, margin, y)
    doc.text(right, pageW - margin, y, { align: 'right' })
    doc.text('Confidential', pageW / 2, y, { align: 'center' })
  }

  async function _addLogoToPdf(
    doc: jsPDF,
    url: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ): Promise<boolean> {
    return new Promise(resolve => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return resolve(false)
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          const dataUrl = canvas.toDataURL('image/png')
          // Detect format from URL
          const fmt = url.match(/\.(jpg|jpeg)$/i) ? 'JPEG' : 'PNG'
          doc.addImage(dataUrl, fmt, x, y, w, h)
          resolve(true)
        } catch {
          resolve(false)
        }
      }
      img.onerror = () => resolve(false)
      img.src = url
    })
  }

  function _hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [25, 118, 210]
  }

  // ── General Report PDF (multi-section) ─────────────────────
  async function exportGeneralReport(
    sections: GeneralReportSection[],
    opts: { dateFrom?: string; dateTo?: string },
  ) {
    if (exportingGeneral.value || !sections.length) return
    exportingGeneral.value = true
    try {
      await _exportGeneralPDF(sections, opts)
    } catch (e) {
      console.error('General report export failed:', e)
    } finally {
      exportingGeneral.value = false
    }
  }

  async function _exportGeneralPDF(
    sections: GeneralReportSection[],
    opts: { dateFrom?: string; dateTo?: string },
  ) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 14

    // ── Cover Page ──
    // Logo
    const logoUrl = _logoUrl()
    if (logoUrl) {
      try {
        await _addLogoToPdf(doc, logoUrl, pageW / 2 - 15, 45, 30, 30)
      } catch { /* ignore */ }
    }

    // Company name
    doc.setTextColor(...PRIMARY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    doc.text(_bizName(), pageW / 2, 90, { align: 'center' })
    doc.setFontSize(14)
    doc.setTextColor(...MUTED)
    doc.setFont('helvetica', 'normal')
    doc.text('Comprehensive Business Report', pageW / 2, 98, { align: 'center' })

    // Date range
    doc.setFontSize(11)
    doc.text(`Date Range: ${_dateLabel(opts.dateFrom, opts.dateTo)}`, pageW / 2, 106, { align: 'center' })
    doc.setFontSize(9)
    doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, pageW / 2, 112, { align: 'center' })

    // Contact
    const contactParts = [_bizEmail(), _bizPhone(), _bizAddress()].filter(Boolean)
    if (contactParts.length) {
      doc.setFontSize(8)
      doc.text(contactParts.join('  •  '), pageW / 2, 118, { align: 'center' })
    }

    // Footer for the cover page
    _drawFooter(doc, pageW, pageH, margin)

    // ── Page 2: Table of Contents ──
    doc.addPage()

    // Section header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...PRIMARY)
    doc.text('Table of Contents', pageW / 2, 30, { align: 'center' })

    // Divider
    doc.setDrawColor(...ACCENT)
    doc.setLineWidth(0.8)
    doc.line(margin, 36, pageW - margin, 36)
    doc.setLineWidth(0.2)
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, 36.5, pageW - margin, 36.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    let tocY = 46
    sections.forEach((sec, i) => {
      const num = `${i + 1}.`
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...ACCENT)
      doc.setFontSize(10)
      doc.text(num, margin, tocY)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...DARK_TEXT)
      doc.text(sec.reportLabel, margin + 8, tocY)
      // Dotted line
      doc.setTextColor(...MUTED)
      doc.text(`Page ${i + 3}`, pageW - margin, tocY, { align: 'right' })
      tocY += 6
    })

    _drawFooter(doc, pageW, pageH, margin)

    // ── One page per section ──
    for (const sec of sections) {
      doc.addPage()
      let yPos = 36

      // Section header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(...PRIMARY)
      doc.text(sec.reportLabel, margin, 18)

      // Draw header divider (same as single report)
      doc.setDrawColor(...ACCENT)
      doc.setLineWidth(0.8)
      doc.line(margin, 30, pageW - margin, 30)
      doc.setLineWidth(0.2)
      doc.setDrawColor(220, 220, 220)
      doc.line(margin, 30.5, pageW - margin, 30.5)

      // KPIs
      if (sec.kpis && sec.kpis.length) {
        yPos = _drawKpiCards(doc, sec.kpis, margin, yPos, pageW - 2 * margin)
      }

      // Charts
      const allCharts = [
        ...(sec.chartData ? [sec.chartData] : []),
        ...(sec.charts || []),
      ].filter(c => c)
      for (const ch of allCharts) {
        if (ch.type === 'donut' && ch.segments && ch.segments.length) {
          yPos = _drawDonutChart(doc, ch, margin, yPos, pageW - 2 * margin)
        } else if (ch.type === 'hbar' && ch.hbarItems && ch.hbarItems.length) {
          yPos = _drawHBarChart(doc, ch, margin, yPos, pageW - 2 * margin)
        } else if (ch.labels && ch.labels.length) {
          yPos = _drawChart(doc, ch, margin, yPos, pageW - 2 * margin)
        }
      }

      // Data table (limit rows for general report to keep it manageable)
      const maxRows = 20
      const displayItems = sec.items.length > maxRows ? sec.items.slice(0, maxRows) : sec.items

      if (displayItems.length) {
        autoTable(doc, {
          startY: yPos + 2,
          head: [sec.columns.map(c => c.label)],
          body: displayItems.map(row => sec.columns.map(c => _formatCell(row[c.key], c.format))),
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 7.5,
            cellPadding: 2,
            textColor: DARK_TEXT,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: PRIMARY,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.5,
            halign: 'center',
          },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          columnStyles: sec.columns.reduce((acc, c, i) => {
            if (c.format === 'currency' || c.format === 'number' || c.format === 'percent') {
              acc[i] = { halign: 'right' }
            } else if (c.format === 'date') {
              acc[i] = { halign: 'center' }
            }
            return acc
          }, {} as Record<number, any>),
          margin: { left: margin, right: margin },
          didDrawPage: () => { _drawFooter(doc, pageW, pageH, margin) },
        })

        // Add note if truncated
        if (sec.items.length > maxRows) {
          const finalY = (doc as any).lastAutoTable?.finalY || yPos + 10
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(7)
          doc.setTextColor(...MUTED)
          doc.text(
            `Showing ${maxRows} of ${sec.items.length} rows. Export this report individually for full data.`,
            margin, finalY + 5,
          )
        }
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(...MUTED)
        doc.text('No data available for this section.', pageW / 2, yPos + 10, { align: 'center' })
        _drawFooter(doc, pageW, pageH, margin)
      }
    }

    doc.save(_fileName('General_Report', 'pdf'))
  }

  // ── Public API ───────────────────────────────────────────────
  async function exportReport(
    format: 'csv' | 'excel' | 'pdf',
    params: ExportParams,
  ) {
    if (exporting.value) return
    exporting.value = true
    try {
      if (format === 'csv') {
        _exportCSV(params)
      } else if (format === 'excel') {
        await _exportExcel(params)
      } else {
        await _exportPDF(params)
      }
    } catch (e) {
      console.error('Export failed:', e)
    } finally {
      exporting.value = false
    }
  }

  return {
    exporting,
    exportingGeneral,
    exportFormats,
    exportReport,
    exportGeneralReport,
  }
}
