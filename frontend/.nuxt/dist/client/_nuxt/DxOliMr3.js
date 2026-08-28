import{o as T,r as D}from"./DUXQASKQ.js";const y=27,b=29,c={INIT:new Uint8Array([y,64]),ALIGN_LEFT:new Uint8Array([y,97,0]),ALIGN_CENTER:new Uint8Array([y,97,1]),ALIGN_RIGHT:new Uint8Array([y,97,2]),BOLD_ON:new Uint8Array([y,69,1]),BOLD_OFF:new Uint8Array([y,69,0]),DOUBLE_WIDTH_ON:new Uint8Array([b,33,32]),DOUBLE_WIDTH_OFF:new Uint8Array([b,33,0]),DOUBLE_HEIGHT_ON:new Uint8Array([b,33,16]),DOUBLE_HEIGHT_OFF:new Uint8Array([b,33,0]),SIZE_NORMAL:new Uint8Array([b,33,0]),SIZE_DOUBLE:new Uint8Array([b,33,17]),SIZE_DOUBLE_HEIGHT:new Uint8Array([b,33,16]),CUT_PAPER:new Uint8Array([b,86,0]),CUT_PARTIAL:new Uint8Array([b,86,1]),FEED_LINES:e=>new Uint8Array([y,100,e]),FEED_PAPER:e=>new Uint8Array([y,74,e]),OPEN_DRAWER:new Uint8Array([y,112,0,25,250]),SET_CODEPAGE:e=>new Uint8Array([y,116,e])};function v(e,r){const n=typeof e=="string"?parseFloat(e):e;return isNaN(n)?`${r}0.00`:`${r}${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",")}`}function x(e,r){return e.length<=r?e:e.substring(0,r)}function l(e,r,n){e=String(e??""),r=String(r??"");const o=n-e.length-r.length;if(o<1){const t=n-r.length-1;return e.substring(0,Math.max(0,t))+" "+r}return e+" ".repeat(o)+r}function A(e,r,n,o,t,a){e=String(e??"");const h=String(r??0),f=v(o,a),u=t-h.length-f.length-4,w=e.length>u?e.substring(0,u):e,E=u-w.length+1,O=t-w.length-E-h.length-f.length;return w+" ".repeat(E)+h+" ".repeat(Math.max(1,O))+f}function s(e){return new TextEncoder().encode(String(e??""))}function L(...e){const r=e.reduce((t,a)=>t+a.length,0),n=new Uint8Array(r);let o=0;for(const t of e)n.set(t,o),o+=t.length;return n}function I(e,r={paperWidth:48,codepage:0}){const n=r.paperWidth,o=e.currencySymbol||"$",t=[];t.push(c.INIT),t.push(c.SET_CODEPAGE(r.codepage)),t.push(c.ALIGN_CENTER),t.push(c.BOLD_ON),t.push(c.SIZE_DOUBLE),t.push(s(x(e.businessName||"DomendraPOS",n/2)+`
`)),t.push(c.SIZE_NORMAL),t.push(c.BOLD_OFF),e.branchName&&t.push(s(x(e.branchName,n)+`
`)),t.push(s(x(e.Date,n)+`
`)),t.push(s(`
`)),t.push(c.ALIGN_LEFT),t.push(s("-".repeat(n)+`
`)),t.push(s(l("Receipt #:",e.transactionNumber,n)+`
`)),t.push(s(l("Date:",e.Date,n)+`
`)),e.cashierName&&t.push(s(l("Cashier:",e.cashierName,n)+`
`)),e.customerName&&e.customerName!=="Walk-in"&&t.push(s(l("Customer:",e.customerName,n)+`
`)),e.customerPhone&&t.push(s(l("Phone:",e.customerPhone,n)+`
`)),t.push(s("-".repeat(n)+`
`)),t.push(c.BOLD_ON),t.push(s(l("Item","Qty  Total",n)+`
`)),t.push(c.BOLD_OFF),t.push(s("-".repeat(n)+`
`));for(const a of e.items){const h=a.price*a.qty;t.push(s(A(a.name,a.qty,a.price,h,n,o)+`
`)),a.name.length>n-12}return t.push(s("-".repeat(n)+`
`)),t.push(s(l("Subtotal:",v(e.subtotal,o),n)+`
`)),e.discount>0&&t.push(s(l("Discount:","-"+v(e.discount,o),n)+`
`)),e.itemDiscounts&&e.itemDiscounts>0&&t.push(s(l("Item Discounts:","-"+v(e.itemDiscounts,o),n)+`
`)),e.tax>0&&t.push(s(l("Tax:",v(e.tax,o),n)+`
`)),t.push(s(`
`)),t.push(c.BOLD_ON),t.push(c.SIZE_DOUBLE_HEIGHT),t.push(s(l("TOTAL:",v(e.total,o),n)+`
`)),t.push(c.SIZE_NORMAL),t.push(c.BOLD_OFF),t.push(s("-".repeat(n)+`
`)),t.push(s(l("Payment:",e.paymentMethod,n)+`
`)),e.tendered!=null&&t.push(s(l("Tendered:",v(e.tendered,o),n)+`
`)),e.change!=null&&e.change>0&&t.push(s(l("Change:",v(e.change,o),n)+`
`)),e.paymentReference&&t.push(s(l("Ref:",e.paymentReference,n)+`
`)),t.push(s("-".repeat(n)+`
`)),t.push(c.ALIGN_CENTER),t.push(s(`
`)),t.push(c.BOLD_ON),t.push(s(`Thank you for shopping with us!
`)),t.push(c.BOLD_OFF),t.push(s(`Returns accepted within 7 days with receipt.
`)),t.push(s(`Powered by DomendraPOS
`)),t.push(s(`
`)),t.push(c.FEED_LINES(3)),t.push(c.CUT_PAPER),e.paymentMethod==="cash"&&t.push(c.OPEN_DRAWER),L(...t)}function R(){const e=D(!1),r=D(null),n=D(null),o=D(!1),t=D(!1);T(()=>{o.value=typeof navigator<"u"&&"usb"in navigator,t.value=typeof navigator<"u"&&"bluetooth"in navigator});const a=[{vendorId:1208,productId:3587},{vendorId:1208,productId:514},{vendorId:1208,productId:3605},{vendorId:4068,productId:1},{vendorId:5455},{vendorId:1046},{vendorId:5380},{vendorId:8137},{classCode:7}];async function h(){if(!o.value)return n.value="Web USB is not supported in this browser. Use Chrome or Edge.",!1;try{n.value=null;const i=await navigator.usb.requestDevice({filters:a});return await i.open(),i.configuration===null&&await i.selectConfiguration(1),await i.claimInterface(0),r.value=i,e.value=!0,!0}catch(i){return i.name==="NotFoundError"?n.value="No printer selected.":n.value=i.message||"Failed to connect to printer.",e.value=!1,!1}}async function f(){if(!t.value)return n.value="Web Bluetooth is not supported in this browser. Use Chrome or Edge.",!1;try{n.value=null;const i=await navigator.bluetooth.requestDevice({filters:[{services:[6384]},{services:[4353]},{namePrefix:"Printer"},{namePrefix:"printer"},{namePrefix:"TM-"},{namePrefix:"XP-"},{namePrefix:"RPP"}],optionalServices:[6384,4353]}),p=await(await(await i.gatt.connect()).getPrimaryService(6384)).getCharacteristic(10993);return r.value=i,r.value._characteristic=p,e.value=!0,!0}catch(i){return i.name==="NotFoundError"?n.value="No printer selected.":n.value=i.message||"Failed to connect to Bluetooth printer.",e.value=!1,!1}}async function u(i){if(!e.value||!r.value)return n.value="Not connected to a printer.",!1;try{if("transferOut"in r.value){const g=r.value,N=g.configuration?.interfaces[0]?.alternates[0]?.endpoints.find(_=>_.direction==="out");return N?await g.transferOut(N.endpointNumber,i):await g.controlTransferOut({requestType:"class",recipient:"interface",index:0,value:0},i),!0}const m=r.value._characteristic;if(m){for(let p=0;p<i.length;p+=180){const N=i.slice(p,p+180);await m.writeValue(N),await new Promise(_=>setTimeout(_,20))}return!0}return n.value="Unknown printer type.",!1}catch(m){return n.value=m.message||"Failed to print.",!1}}async function w(i,m){const g=I(i,m);return u(g)}function E(i){const g=S(i,320),p=window.open("","_blank","width=360,height=600");if(!p){n.value="Pop-up blocked. Please allow pop-ups for this site.";return}p.document.write(g),p.document.close(),setTimeout(()=>{p.focus(),p.print()},250)}async function O(i,m){e.value&&r.value&&await w(i,m)||E(i)}async function P(){if(r.value)try{"usb"in navigator&&r.value instanceof USBDevice?await r.value.close():"gatt"in r.value&&await r.value.gatt.disconnect()}catch{}r.value=null,e.value=!1}return{connected:e,device:r,error:n,supportsWebUsb:o,supportsWebBluetooth:t,connectUsb:h,connectBluetooth:f,printRaw:u,printReceipt:w,printHtmlFallback:E,smartPrint:O,disconnect:P,buildEscPosReceipt:I}}function S(e,r){const n=e.currencySymbol||"$",o=u=>v(u,n),t=e.items.map(u=>`
    <tr>
      <td class="l">${d(u.name)}</td>
      <td class="c">${u.qty}</td>
      <td class="r">${o(u.price)}</td>
      <td class="r">${o(u.price*u.qty)}</td>
    </tr>`).join(""),a=[`<tr><td class="l">Receipt #</td><td class="r mono">${d(e.transactionNumber)}</td></tr>`,`<tr><td class="l">Date</td><td class="r">${d(e.Date)}</td></tr>`];e.cashierName&&a.push(`<tr><td class="l">Cashier</td><td class="r">${d(e.cashierName)}</td></tr>`),e.customerName&&e.customerName!=="Walk-in"&&a.push(`<tr><td class="l">Customer</td><td class="r">${d(e.customerName)}</td></tr>`),e.customerPhone&&a.push(`<tr><td class="l">Phone</td><td class="r">${d(e.customerPhone)}</td></tr>`);let h=`<tr><td class="l">Subtotal</td><td class="r">${o(e.subtotal)}</td></tr>`;e.discount>0&&(h+=`<tr><td class="l">Discount</td><td class="r">-${o(e.discount)}</td></tr>`),e.itemDiscounts&&e.itemDiscounts>0&&(h+=`<tr><td class="l">Item Discounts</td><td class="r">-${o(e.itemDiscounts)}</td></tr>`),e.tax>0&&(h+=`<tr><td class="l">Tax</td><td class="r">${o(e.tax)}</td></tr>`);let f=`<tr><td class="l">Payment Method</td><td class="r cap">${d(e.paymentMethod)}</td></tr>`;return e.tendered!=null&&(f+=`<tr><td class="l">Tendered</td><td class="r">${o(e.tendered)}</td></tr>`),e.change!=null&&e.change>0&&(f+=`<tr><td class="l">Change</td><td class="r">${o(e.change)}</td></tr>`),e.paymentReference&&(f+=`<tr><td class="l">Ref</td><td class="r mono">${d(e.paymentReference)}</td></tr>`),`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt ${e.transactionNumber}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'SF Mono', 'Courier New', monospace; margin: 0; padding: 20px; color: #000; background: #fff; }
  .receipt { max-width: ${r}px; margin: 0 auto; font-size: 12px; line-height: 1.5; }
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
    @page { margin: 0; size: ${r}px auto; }
  }
</style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h2>${d(e.businessName||"DomendraPOS")}</h2>
      ${e.branchName?`<p>${d(e.branchName)}</p>`:""}
      <p>${d(e.Date)}</p>
    </div>
    <hr class="sep">
    <table><tbody>${a.join("")}</tbody></table>
    <hr class="sep">
    <table>
      <thead><tr><th class="l">Item</th><th class="c">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead>
      <tbody>${t}</tbody>
    </table>
    <hr class="sep">
    <table><tbody>${h}</tbody></table>
    <table class="grand"><tbody><tr><td class="l">TOTAL</td><td class="r">${o(e.total)}</td></tr></tbody></table>
    <hr class="sep">
    <table><tbody>${f}</tbody></table>
    <hr class="sep">
    <div class="footer">
      <p class="bold">Thank you for shopping with us!</p>
      <p class="small">Returns accepted within 7 days with receipt.</p>
      <p class="small">Powered by DomendraPOS</p>
    </div>
  </div>
</body>
</html>`}function d(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}export{R as u};
