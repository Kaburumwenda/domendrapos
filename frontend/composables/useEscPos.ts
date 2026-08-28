/**
 * useEscPos - ESC/POS thermal printer support for web frontend.
 *
 * Uses the Web USB / Web Bluetooth API (where available) to connect
 * directly to ESC/POS-compatible thermal printers (e.g., Epson TM-T20,
 * XP-58, Goojprt, etc.). Falls back to browser `window.print()` when
 * no Web USB / Bluetooth is available.
 *
 * The composable generates raw ESC/POS byte commands and can also
 * produce a printable HTML receipt for the fallback path.
 */

/** ESC/POS command constants */
const ESC = 0x1b
const GS = 0x1d
const LF = 0x0a

const CMD = {
  INIT: new Uint8Array([ESC, 0x40]),
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([ESC, 0x61, 0x02]),
  BOLD_ON: new Uint8Array([ESC, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([ESC, 0x45, 0x00]),
  DOUBLE_WIDTH_ON: new Uint8Array([GS, 0x21, 0x20]),
  DOUBLE_WIDTH_OFF: new Uint8Array([GS, 0x21, 0x00]),
  DOUBLE_HEIGHT_ON: new Uint8Array([GS, 0x21, 0x10]),
  DOUBLE_HEIGHT_OFF: new Uint8Array([GS, 0x21, 0x00]),
  SIZE_NORMAL: new Uint8Array([GS, 0x21, 0x00]),
  SIZE_DOUBLE: new Uint8Array([GS, 0x21, 0x11]),
  SIZE_DOUBLE_HEIGHT: new Uint8Array([GS, 0x21, 0x10]),
  CUT_PAPER: new Uint8Array([GS, 0x56, 0x00]),
  CUT_PARTIAL: new Uint8Array([GS, 0x56, 0x01]),
  FEED_LINES: (n: number) => new Uint8Array([ESC, 0x64, n]),
  FEED_PAPER: (n: number) => new Uint8Array([ESC, 0x4a, n]),
  OPEN_DRAWER: new Uint8Array([ESC, 0x70, 0x00, 0x19, 0xfa]),
  SET_CODEPAGE: (n: number) => new Uint8Array([ESC, 0x74, n]),
}

export interface ReceiptData {
  businessName: string
  branchName?: string
  transactionNumber: string
  Date: string
  cashierName?: string
  customerName?: string
  customerPhone?: string
  items: { name: string; qty: number; price: number }[]
  subtotal: number
  discount: number
  itemDiscounts?: number
  tax: number
  total: number
  paymentMethod: string
  tendered?: number | null
  change?: number | null
  paymentReference?: string
  currencySymbol: string
  footer?: string
}

export interface PrinterConfig {
  paperWidth: 32 | 48 | 80 // characters
  codepage: number // ESC/POS codepage (0 = PC437, 1 = PC850, etc.)
}

/**
 * Format a currency value for receipt display.
 */
function formatMoney(v: number, symbol: string): string {
  const num = typeof v === 'string' ? parseFloat(v) : v
  if (isNaN(num)) return `${symbol}0.00`
  return `${symbol}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * Pad/truncate a line to the paper width.
 */
function fitLine(text: string, width: number): string {
  if (text.length <= width) return text
  return text.substring(0, width)
}

/**
 * Build a two-column line (left label, right value) for the given paper width.
 */
function twoColumnLine(left: string, right: string, width: number): string {
  left = String(left ?? '')
  right = String(right ?? '')
  const space = width - left.length - right.length
  if (space < 1) {
    // Truncate left if too long
    const maxLeft = width - right.length - 1
    return left.substring(0, Math.max(0, maxLeft)) + ' ' + right
  }
  return left + ' '.repeat(space) + right
}

/**
 * Build a three-column line for items: name | qty | total
 */
function itemLine(name: string, qty: number, price: number, total: number, width: number, symbol: string): string {
  name = String(name ?? '')
  const qtyStr = String(qty ?? 0)
  const totalStr = formatMoney(total, symbol)
  const nameMax = width - qtyStr.length - totalStr.length - 4
  const nameFit = name.length > nameMax ? name.substring(0, nameMax) : name
  const space1 = nameMax - nameFit.length + 1
  const space2 = width - nameFit.length - space1 - qtyStr.length - totalStr.length
  return nameFit + ' '.repeat(space1) + qtyStr + ' '.repeat(Math.max(1, space2)) + totalStr
}

/**
 * Encode a string to bytes using the specified codepage.
 * For simplicity, we use UTF-8 encoding; most modern ESC/POS printers
 * support UTF-8 when codepage 99 is set.
 */
function encode(text: string): Uint8Array {
  return new TextEncoder().encode(String(text ?? ''))
}

/**
 * Concatenate multiple Uint8Arrays into one.
 */
function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

/**
 * Build ESC/POS byte buffer for a receipt.
 */
export function buildEscPosReceipt(data: ReceiptData, config: PrinterConfig = { paperWidth: 48, codepage: 0 }): Uint8Array {
  const w = config.paperWidth
  const sym = data.currencySymbol || '$'
  const parts: Uint8Array[] = []

  // Initialize printer
  parts.push(CMD.INIT)
  parts.push(CMD.SET_CODEPAGE(config.codepage))

  // Header
  parts.push(CMD.ALIGN_CENTER)
  parts.push(CMD.BOLD_ON)
  parts.push(CMD.SIZE_DOUBLE)
  parts.push(encode(fitLine(data.businessName || 'DomendraPOS', w / 2) + '\n'))
  parts.push(CMD.SIZE_NORMAL)
  parts.push(CMD.BOLD_OFF)
  if (data.branchName) {
    parts.push(encode(fitLine(data.branchName, w) + '\n'))
  }
  parts.push(encode(fitLine(data.Date, w) + '\n'))
  parts.push(encode('\n'))

  // Separator
  parts.push(CMD.ALIGN_LEFT)
  parts.push(encode('-'.repeat(w) + '\n'))

  // Meta
  parts.push(encode(twoColumnLine('Receipt #:', data.transactionNumber, w) + '\n'))
  parts.push(encode(twoColumnLine('Date:', data.Date, w) + '\n'))
  if (data.cashierName) {
    parts.push(encode(twoColumnLine('Cashier:', data.cashierName, w) + '\n'))
  }
  if (data.customerName && data.customerName !== 'Walk-in') {
    parts.push(encode(twoColumnLine('Customer:', data.customerName, w) + '\n'))
  }
  if (data.customerPhone) {
    parts.push(encode(twoColumnLine('Phone:', data.customerPhone, w) + '\n'))
  }

  // Separator
  parts.push(encode('-'.repeat(w) + '\n'))

  // Items header
  parts.push(CMD.BOLD_ON)
  parts.push(encode(twoColumnLine('Item', 'Qty  Total', w) + '\n'))
  parts.push(CMD.BOLD_OFF)
  parts.push(encode('-'.repeat(w) + '\n'))

  // Items
  for (const item of data.items) {
    const lineTotal = item.price * item.qty
    parts.push(encode(itemLine(item.name, item.qty, item.price, lineTotal, w, sym) + '\n'))
    if (item.name.length > w - 12) {
      // Long name: show price on next line
      // Already handled by fitLine in itemLine
    }
  }

  // Separator
  parts.push(encode('-'.repeat(w) + '\n'))

  // Totals
  parts.push(encode(twoColumnLine('Subtotal:', formatMoney(data.subtotal, sym), w) + '\n'))
  if (data.discount > 0) {
    parts.push(encode(twoColumnLine('Discount:', '-' + formatMoney(data.discount, sym), w) + '\n'))
  }
  if (data.itemDiscounts && data.itemDiscounts > 0) {
    parts.push(encode(twoColumnLine('Item Discounts:', '-' + formatMoney(data.itemDiscounts, sym), w) + '\n'))
  }
  if (data.tax > 0) {
    parts.push(encode(twoColumnLine('Tax:', formatMoney(data.tax, sym), w) + '\n'))
  }

  // Grand total (bold + double height)
  parts.push(encode('\n'))
  parts.push(CMD.BOLD_ON)
  parts.push(CMD.SIZE_DOUBLE_HEIGHT)
  parts.push(encode(twoColumnLine('TOTAL:', formatMoney(data.total, sym), w) + '\n'))
  parts.push(CMD.SIZE_NORMAL)
  parts.push(CMD.BOLD_OFF)

  // Separator
  parts.push(encode('-'.repeat(w) + '\n'))

  // Payment
  parts.push(encode(twoColumnLine('Payment:', data.paymentMethod, w) + '\n'))
  if (data.tendered != null) {
    parts.push(encode(twoColumnLine('Tendered:', formatMoney(data.tendered, sym), w) + '\n'))
  }
  if (data.change != null && data.change > 0) {
    parts.push(encode(twoColumnLine('Change:', formatMoney(data.change, sym), w) + '\n'))
  }
  if (data.paymentReference) {
    parts.push(encode(twoColumnLine('Ref:', data.paymentReference, w) + '\n'))
  }

  // Separator
  parts.push(encode('-'.repeat(w) + '\n'))

  // Footer
  parts.push(CMD.ALIGN_CENTER)
  parts.push(encode('\n'))
  parts.push(CMD.BOLD_ON)
  parts.push(encode('Thank you for shopping with us!\n'))
  parts.push(CMD.BOLD_OFF)
  parts.push(encode('Returns accepted within 7 days with receipt.\n'))
  parts.push(encode('Powered by DomendraPOS\n'))
  parts.push(encode('\n'))

  // Feed and cut
  parts.push(CMD.FEED_LINES(3))
  parts.push(CMD.CUT_PAPER)

  // Open cash drawer (for cash payments)
  if (data.paymentMethod === 'cash') {
    parts.push(CMD.OPEN_DRAWER)
  }

  return concat(...parts)
}

/**
 * Web USB printer connection manager.
 * Connects to USB ESC/POS printers and sends raw bytes.
 */
export function useEscPos() {
  const connected = ref(false)
  const device = ref<USBDevice | null>(null)
  const error = ref<string | null>(null)
  const supportsWebUsb = ref(false)
  const supportsWebBluetooth = ref(false)

  onMounted(() => {
    supportsWebUsb.value = typeof navigator !== 'undefined' && 'usb' in navigator
    supportsWebBluetooth.value = typeof navigator !== 'undefined' && 'bluetooth' in navigator
  })

  // Default USB filters for common ESC/POS printer vendors
  const USB_FILTERS: USBDeviceFilter[] = [
    { vendorId: 0x04b8, productId: 0x0e03 }, // Epson TM-T20
    { vendorId: 0x04b8, productId: 0x0202 }, // Epson TM-T88
    { vendorId: 0x04b8, productId: 0x0e15 }, // Epson TM-T20III
    { vendorId: 0x0fe4, productId: 0x0001 }, // Goobang Doo / generic
    { vendorId: 0x154f }, // Snoder
    { vendorId: 0x0416 }, // Winbond / generic
    { vendorId: 0x1504 }, // Xprinter
    { vendorId: 0x1fc9 }, // NXP
    { classCode: 0x07 }, // Printer class (fallback)
  ]

  /**
   * Request user to select a USB printer.
   */
  async function connectUsb(): Promise<boolean> {
    if (!supportsWebUsb.value) {
      error.value = 'Web USB is not supported in this browser. Use Chrome or Edge.'
      return false
    }
    try {
      error.value = null
      const device_ = await navigator.usb.requestDevice({ filters: USB_FILTERS })
      await device_.open()
      if (device_.configuration === null) await device_.selectConfiguration(1)
      await device_.claimInterface(0)
      device.value = device_
      connected.value = true
      return true
    } catch (e: any) {
      if (e.name === 'NotFoundError') {
        error.value = 'No printer selected.'
      } else {
        error.value = e.message || 'Failed to connect to printer.'
      }
      connected.value = false
      return false
    }
  }

  /**
   * Connect via Web Bluetooth (for Bluetooth ESC/POS printers).
   * Common service: 0x18f0 (generic) or 0x1101 (SPP)
   */
  async function connectBluetooth(): Promise<boolean> {
    if (!supportsWebBluetooth.value) {
      error.value = 'Web Bluetooth is not supported in this browser. Use Chrome or Edge.'
      return false
    }
    try {
      error.value = null
      // Request a device with printer-like services
      const device_ = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: [0x18f0] },
          { services: [0x1101] },
          { namePrefix: 'Printer' },
          { namePrefix: 'printer' },
          { namePrefix: 'TM-' },
          { namePrefix: 'XP-' },
          { namePrefix: 'RPP' },
        ],
        optionalServices: [0x18f0, 0x1101],
      })
      const server = await device_.gatt.connect()
      // Try common printer characteristics
      const service = await server.getPrimaryService(0x18f0)
      const characteristic = await service.getCharacteristic(0x2af1)
      device.value = device_
      ;(device.value as any)._characteristic = characteristic
      connected.value = true
      return true
    } catch (e: any) {
      if (e.name === 'NotFoundError') {
        error.value = 'No printer selected.'
      } else {
        error.value = e.message || 'Failed to connect to Bluetooth printer.'
      }
      connected.value = false
      return false
    }
  }

  /**
   * Send raw ESC/POS bytes to the connected printer.
   */
  async function printRaw(data: Uint8Array): Promise<boolean> {
    if (!connected.value || !device.value) {
      error.value = 'Not connected to a printer.'
      return false
    }
    try {
      // USB path
      if ('transferOut' in device.value) {
        const usbDevice = device.value as USBDevice
        // Find an output endpoint
        const iface = usbDevice.configuration?.interfaces[0]
        const endpoint = iface?.alternates[0]?.endpoints.find(e => e.direction === 'out')
        if (endpoint) {
          await usbDevice.transferOut(endpoint.endpointNumber, data)
        } else {
          // Some printers use control transfers
          await usbDevice.controlTransferOut(
            { requestType: 'class', recipient: 'interface', index: 0, value: 0 },
            data,
          )
        }
        return true
      }
      // Bluetooth path
      const char = (device.value as any)._characteristic
      if (char) {
        // BLE has a max write size (usually 20-512 bytes); chunk it
        const chunkSize = 180
        for (let offset = 0; offset < data.length; offset += chunkSize) {
          const chunk = data.slice(offset, offset + chunkSize)
          await char.writeValue(chunk)
          await new Promise(r => setTimeout(r, 20))
        }
        return true
      }
      error.value = 'Unknown printer type.'
      return false
    } catch (e: any) {
      error.value = e.message || 'Failed to print.'
      return false
    }
  }

  /**
   * Build and print a receipt directly to the connected thermal printer.
   */
  async function printReceipt(data: ReceiptData, config?: PrinterConfig): Promise<boolean> {
    const bytes = buildEscPosReceipt(data, config)
    return printRaw(bytes)
  }

  /**
   * Fallback: generate a printable HTML receipt and open the browser print dialog.
   * Used when no thermal printer is connected.
   */
  function printHtmlFallback(data: ReceiptData): void {
    const w = 320
    const html = buildHtmlReceipt(data, w)
    const win = window.open('', '_blank', `width=${w + 40},height=600`)
    if (!win) {
      error.value = 'Pop-up blocked. Please allow pop-ups for this site.'
      return
    }
    win.document.write(html)
    win.document.close()
    setTimeout(() => {
      win.focus()
      win.print()
    }, 250)
  }

  /**
   * Smart print: try thermal printer first, fall back to browser print.
   */
  async function smartPrint(data: ReceiptData, config?: PrinterConfig): Promise<void> {
    if (connected.value && device.value) {
      const ok = await printReceipt(data, config)
      if (!ok) {
        // Print failed, fall back
        printHtmlFallback(data)
      }
    } else {
      printHtmlFallback(data)
    }
  }

  /**
   * Disconnect from the printer.
   */
  async function disconnect(): Promise<void> {
    if (device.value) {
      try {
        if ('usb' in navigator && device.value instanceof USBDevice) {
          await device.value.close()
        } else if ('gatt' in device.value) {
          await (device.value as any).gatt.disconnect()
        }
      } catch { /* ignore */ }
    }
    device.value = null
    connected.value = false
  }

  return {
    connected,
    device,
    error,
    supportsWebUsb,
    supportsWebBluetooth,
    connectUsb,
    connectBluetooth,
    printRaw,
    printReceipt,
    printHtmlFallback,
    smartPrint,
    disconnect,
    buildEscPosReceipt,
  }
}

/**
 * Build a minimal printable HTML receipt (for browser fallback).
 */
function buildHtmlReceipt(data: ReceiptData, width: number): string {
  const sym = data.currencySymbol || '$'
  const fmt = (v: number) => formatMoney(v, sym)
  const itemsHtml = data.items.map(item => `
    <tr>
      <td class="l">${escapeHtml(item.name)}</td>
      <td class="c">${item.qty}</td>
      <td class="r">${fmt(item.price)}</td>
      <td class="r">${fmt(item.price * item.qty)}</td>
    </tr>`).join('')

  const metaRows = [
    `<tr><td class="l">Receipt #</td><td class="r mono">${escapeHtml(data.transactionNumber)}</td></tr>`,
    `<tr><td class="l">Date</td><td class="r">${escapeHtml(data.Date)}</td></tr>`,
  ]
  if (data.cashierName) metaRows.push(`<tr><td class="l">Cashier</td><td class="r">${escapeHtml(data.cashierName)}</td></tr>`)
  if (data.customerName && data.customerName !== 'Walk-in') metaRows.push(`<tr><td class="l">Customer</td><td class="r">${escapeHtml(data.customerName)}</td></tr>`)
  if (data.customerPhone) metaRows.push(`<tr><td class="l">Phone</td><td class="r">${escapeHtml(data.customerPhone)}</td></tr>`)

  let totalsRows = `<tr><td class="l">Subtotal</td><td class="r">${fmt(data.subtotal)}</td></tr>`
  if (data.discount > 0) totalsRows += `<tr><td class="l">Discount</td><td class="r">-${fmt(data.discount)}</td></tr>`
  if (data.itemDiscounts && data.itemDiscounts > 0) totalsRows += `<tr><td class="l">Item Discounts</td><td class="r">-${fmt(data.itemDiscounts)}</td></tr>`
  if (data.tax > 0) totalsRows += `<tr><td class="l">Tax</td><td class="r">${fmt(data.tax)}</td></tr>`

  let paymentRows = `<tr><td class="l">Payment Method</td><td class="r cap">${escapeHtml(data.paymentMethod)}</td></tr>`
  if (data.tendered != null) paymentRows += `<tr><td class="l">Tendered</td><td class="r">${fmt(data.tendered)}</td></tr>`
  if (data.change != null && data.change > 0) paymentRows += `<tr><td class="l">Change</td><td class="r">${fmt(data.change)}</td></tr>`
  if (data.paymentReference) paymentRows += `<tr><td class="l">Ref</td><td class="r mono">${escapeHtml(data.paymentReference)}</td></tr>`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt ${data.transactionNumber}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'SF Mono', 'Courier New', monospace; margin: 0; padding: 20px; color: #000; background: #fff; }
  .receipt { max-width: ${width}px; margin: 0 auto; font-size: 12px; line-height: 1.5; }
  .header { text-align: center; margin-bottom: 12px; }
  .header h2 { font-size: 16px; margin: 0 0 4px; }
  .header p { font-size: 11px; color: #666; margin: 2px 0; }
  .sep { border: none; border-top: 1px dashed #ccc; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 3px 0; font-size: 11px; }
  .l { text-align: left; }
  .c { text-align: center; }
  .r { text-align: right; }
  .mono { font-family: monospace; }
  .cap { text-transform: capitalize; }
  thead th { font-size: 10px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #eee; padding: 4px 0; }
  .grand { font-weight: bold; font-size: 14px; }
  .grand td { padding: 8px 0; }
  .footer { text-align: center; margin-top: 12px; }
  .footer p { margin: 2px 0; }
  .footer .bold { font-weight: bold; }
  .footer .small { font-size: 10px; color: #888; }
  @media print {
    body { padding: 0; }
    @page { margin: 0; size: ${width}px auto; }
  }
</style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h2>${escapeHtml(data.businessName || 'DomendraPOS')}</h2>
      ${data.branchName ? `<p>${escapeHtml(data.branchName)}</p>` : ''}
      <p>${escapeHtml(data.Date)}</p>
    </div>
    <hr class="sep">
    <table><tbody>${metaRows.join('')}</tbody></table>
    <hr class="sep">
    <table>
      <thead><tr><th class="l">Item</th><th class="c">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <hr class="sep">
    <table><tbody>${totalsRows}</tbody></table>
    <table class="grand"><tbody><tr><td class="l">TOTAL</td><td class="r">${fmt(data.total)}</td></tr></tbody></table>
    <hr class="sep">
    <table><tbody>${paymentRows}</tbody></table>
    <hr class="sep">
    <div class="footer">
      <p class="bold">Thank you for shopping with us!</p>
      <p class="small">Returns accepted within 7 days with receipt.</p>
      <p class="small">Powered by DomendraPOS</p>
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
