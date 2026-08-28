import { defineComponent, computed, mergeProps, unref, useSSRContext, ref, withCtx, createTextVNode, toDisplayString, isRef, createVNode, openBlock, createBlock, Fragment, renderList, createCommentVNode, createSlots } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc, V as VContainer, a as VIcon, o as VChip, b as VSpacer, c as VBtn, C as VMenu, g as VCard, M as VList, N as VListItem, d as VAlert, ah as VChipGroup, v as VTextField, J as VSelect, h as VTabs, i as VTab, p as VProgressLinear, e as VRow, f as VCol, n as VDataTable, q as VDialog, ai as VToolbar, aj as VToolbarTitle, s as VCardText, X as VCheckbox, k as VDivider, w as VCardActions } from "../server.mjs";
import { a as useAuthStore, u as useApi } from "./useApi-D4YG8JPQ.js";
import { u as useFormat } from "./useFormat-BvVWDMYe.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import FileSaver from "file-saver";
import ExcelJS from "exceljs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/unctx/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/@nuxt/nitro-server/dist/runtime/h3-compat.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ufo/dist/index.mjs";
import "pinia";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/perfect-debounce/dist/index.mjs";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/klona/dist/index.mjs";
import "vue3-apexcharts";
import "D:/Projects/MY-APPS-2/DomendraPOS/frontend/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportsChart",
  __ssrInlineRender: true,
  props: {
    type: {},
    labels: {},
    datasets: {},
    segments: {},
    items: {},
    points: {},
    grid: {},
    weekdays: {},
    height: {},
    size: {},
    formatValue: { type: Function }
  },
  setup(__props) {
    const props = __props;
    const PALETTE = ["#1976D2", "#2E7D32", "#FF9800", "#9C27B0", "#F44336", "#00BCD4", "#795548", "#607D8B", "#8BC34A", "#CDDC39", "#FF5722", "#3F51B5"];
    function colorAt(i) {
      return PALETTE[i % PALETTE.length];
    }
    const fmt = computed(() => props.formatValue || ((v) => String(v)));
    const barMaxVal = computed(() => {
      const all = (props.datasets || []).flatMap((d) => d.data);
      return Math.max(...all, 1);
    });
    const donutTotal = computed(() => (props.segments || []).reduce((s, seg) => s + seg.value, 0) || 1);
    const donutSize = computed(() => props.size || 200);
    const donutPaths = computed(() => {
      const segs = props.segments || [];
      if (!segs.length) return [];
      const r = donutSize.value / 2 - 10;
      const cx = donutSize.value / 2;
      const cy = donutSize.value / 2;
      let cumulative = 0;
      return segs.map((seg, i) => {
        const startAngle = cumulative / donutTotal.value * 360 - 90;
        cumulative += seg.value;
        const endAngle = cumulative / donutTotal.value * 360 - 90;
        const startRad = startAngle * Math.PI / 180;
        const endRad = endAngle * Math.PI / 180;
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        return {
          d,
          color: seg.color || colorAt(i),
          label: seg.label,
          value: seg.value,
          pct: seg.value / donutTotal.value * 100
        };
      });
    });
    const hbarMax = computed(() => Math.max(...(props.items || []).map((i) => i.value), 1));
    const heatMax = computed(() => {
      let m = 0;
      for (const row of props.grid || []) for (const c of row) if (c > m) m = c;
      return m || 1;
    });
    function heatColor(val) {
      const intensity = val / heatMax.value;
      const r = Math.round(232 - intensity * 206);
      const g = Math.round(240 - intensity * 122);
      const b = Math.round(254 - intensity * 44);
      return `rgb(${r}, ${g}, ${b})`;
    }
    function heatOpacity(_val) {
      return 0.3 + Math.min(_val, heatMax.value) / heatMax.value * 0.7;
    }
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.type === "bar") {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "rpt-chart-wrap" }, _attrs))} data-v-0930ad11>`);
        if (__props.datasets) {
          _push(`<div class="d-flex align-center ga-3 mb-2 flex-wrap" data-v-0930ad11><!--[-->`);
          ssrRenderList(__props.datasets, (ds, i) => {
            _push(`<div class="d-flex align-center ga-1" data-v-0930ad11><div class="rpt-legend-dot" style="${ssrRenderStyle({ background: ds.color || colorAt(i) })}" data-v-0930ad11></div><span class="text-caption" data-v-0930ad11>${ssrInterpolate(ds.label)}</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="rpt-bar-chart" style="${ssrRenderStyle({ height: (__props.height || 240) + "px" })}" data-v-0930ad11><!--[-->`);
        ssrRenderList(__props.labels || [], (label, li) => {
          _push(`<div class="rpt-bar-col" data-v-0930ad11><div class="rpt-bar-stack" data-v-0930ad11><!--[-->`);
          ssrRenderList(__props.datasets || [], (ds, di) => {
            _push(`<div class="rpt-bar" style="${ssrRenderStyle({
              height: `${Math.max(2, (ds.data[li] || 0) / unref(barMaxVal) * 100)}%`,
              background: ds.color || colorAt(di)
            })}"${ssrRenderAttr("title", `${ds.label}: ${unref(fmt)(ds.data[li] || 0)}`)} data-v-0930ad11></div>`);
          });
          _push(`<!--]--></div><div class="rpt-bar-label" data-v-0930ad11>${ssrInterpolate(label)}</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else if (__props.type === "donut" && __props.segments) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "rpt-donut-wrap" }, _attrs))} data-v-0930ad11><svg${ssrRenderAttr("width", unref(donutSize))}${ssrRenderAttr("height", unref(donutSize))}${ssrRenderAttr("viewBox", `0 0 ${unref(donutSize)} ${unref(donutSize)}`)} class="rpt-donut-svg" data-v-0930ad11><!--[-->`);
        ssrRenderList(unref(donutPaths), (arc, i) => {
          _push(`<path${ssrRenderAttr("d", arc.d)}${ssrRenderAttr("fill", arc.color)} stroke="#fff"${ssrRenderAttr("stroke-width", 2)} class="rpt-donut-slice" data-v-0930ad11><title data-v-0930ad11>${ssrInterpolate(arc.label)}: ${ssrInterpolate(arc.pct.toFixed(1))}% (${ssrInterpolate(unref(fmt)(arc.value))})</title></path>`);
        });
        _push(`<!--]--><circle${ssrRenderAttr("cx", unref(donutSize) / 2)}${ssrRenderAttr("cy", unref(donutSize) / 2)}${ssrRenderAttr("r", unref(donutSize) / 2 - 22)} fill="var(--v-theme-surface)" data-v-0930ad11></circle><text${ssrRenderAttr("x", unref(donutSize) / 2)}${ssrRenderAttr("y", unref(donutSize) / 2 - 5)} text-anchor="middle" class="rpt-donut-center-val" data-v-0930ad11>${ssrInterpolate(unref(fmt)(unref(donutTotal)))}</text><text${ssrRenderAttr("x", unref(donutSize) / 2)}${ssrRenderAttr("y", unref(donutSize) / 2 + 12)} text-anchor="middle" class="rpt-donut-center-label" data-v-0930ad11>Total</text></svg><div class="rpt-donut-legend" data-v-0930ad11><!--[-->`);
        ssrRenderList(unref(donutPaths), (arc, i) => {
          _push(`<div class="rpt-donut-legend-item" data-v-0930ad11><div class="rpt-legend-dot" style="${ssrRenderStyle({ background: arc.color })}" data-v-0930ad11></div><span class="rpt-donut-legend-label" data-v-0930ad11>${ssrInterpolate(arc.label)}</span><span class="rpt-donut-legend-val" data-v-0930ad11>${ssrInterpolate(arc.pct.toFixed(1))}%</span></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else if (__props.type === "hbar" && __props.items) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "rpt-hbar-wrap" }, _attrs))} data-v-0930ad11><!--[-->`);
        ssrRenderList(__props.items, (item, i) => {
          _push(`<div class="rpt-hbar-row" data-v-0930ad11><div class="rpt-hbar-label"${ssrRenderAttr("title", item.label)} data-v-0930ad11>${ssrInterpolate(item.label)}</div><div class="rpt-hbar-track" data-v-0930ad11><div class="rpt-hbar-fill" style="${ssrRenderStyle({
            width: `${Math.max(2, item.value / unref(hbarMax) * 100)}%`,
            background: item.color || colorAt(i)
          })}" data-v-0930ad11><span class="rpt-hbar-val" data-v-0930ad11>${ssrInterpolate(unref(fmt)(item.value))}</span></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (__props.type === "heatmap" && __props.grid) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "rpt-heatmap-wrap" }, _attrs))} data-v-0930ad11><div class="rpt-heatmap-header" data-v-0930ad11><div class="rpt-heatmap-corner" data-v-0930ad11>Hr</div><!--[-->`);
        ssrRenderList(__props.weekdays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], (wd, i) => {
          _push(`<div class="rpt-heatmap-wd" data-v-0930ad11>${ssrInterpolate(wd)}</div>`);
        });
        _push(`<!--]--></div><!--[-->`);
        ssrRenderList(__props.grid, (row, h) => {
          _push(`<div class="rpt-heatmap-row" data-v-0930ad11><div class="rpt-heatmap-hour" data-v-0930ad11>${ssrInterpolate(h)}:00</div><!--[-->`);
          ssrRenderList(row, (val, wd) => {
            _push(`<div class="rpt-heatmap-cell" style="${ssrRenderStyle({ background: val > 0 ? heatColor(val) : "transparent", opacity: val > 0 ? heatOpacity(val) : 0.3 })}" data-v-0930ad11>`);
            if (val > 0) {
              _push(`<span class="rpt-heatmap-val" data-v-0930ad11>${ssrInterpolate(unref(fmt)(val))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReportsChart.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-0930ad11"]]), { __name: "ReportsChart" });
function useReportExport() {
  const auth = useAuthStore();
  const { currency: fmtCurrency, number: fmtNumber, date: fmtDate } = useFormat();
  const exporting = ref(false);
  const exportingGeneral = ref(false);
  const exportFormats = ref("pdf");
  const PRIMARY = [26, 35, 126];
  const ACCENT = [25, 118, 210];
  const LIGHT_BG = [232, 240, 254];
  const DARK_TEXT = [33, 33, 33];
  const MUTED = [97, 97, 97];
  function _bizName() {
    return auth.tenantName || "DomendraPOS";
  }
  function _bizEmail() {
    return auth.tenantEmail || "";
  }
  function _bizPhone() {
    return auth.tenantPhone || "";
  }
  function _bizAddress() {
    return auth.tenantAddress || "";
  }
  function _logoUrl() {
    return auth.tenantLogo || "";
  }
  function _formatCell(raw, fmt) {
    if (raw === null || raw === void 0) return "";
    if (fmt === "currency") return fmtCurrency(raw);
    if (fmt === "number") return fmtNumber(raw);
    if (fmt === "percent") return `${Number(raw).toFixed(1)}%`;
    if (fmt === "date") return fmtDate(raw);
    return String(raw);
  }
  function _dateLabel(from, to) {
    if (!from && !to) return "All Time";
    if (from && to && from === to) return fmtDate(from);
    if (from && to) return `${fmtDate(from)} — ${fmtDate(to)}`;
    return from ? fmtDate(from) : fmtDate(to || "");
  }
  function _fileName(reportLabel, ext) {
    const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    return `${reportLabel.replace(/\s+/g, "_")}_${date}.${ext}`;
  }
  function _exportCSV(params) {
    const { reportLabel, items, columns } = params;
    if (!items.length) return;
    const header = columns.map((c) => `"${c.label}"`).join(",");
    const rows = items.map(
      (row) => columns.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const meta = [
      `# ${_bizName()}`,
      `# Report: ${reportLabel}`,
      `# Date Range: ${_dateLabel(params.dateFrom, params.dateTo)}`
    ].filter(Boolean).join("\n");
    const full = `${meta}
${csv}`;
    const blob = new Blob(["\uFEFF" + full], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(blob, _fileName(reportLabel, "csv"));
  }
  async function _exportExcel(params) {
    const { reportId, reportLabel, items, columns, kpis, dateFrom, dateTo } = params;
    if (!items.length && !kpis?.length) return;
    const wb = new ExcelJS.Workbook();
    wb.creator = _bizName();
    wb.created = /* @__PURE__ */ new Date();
    const ws = wb.addWorksheet(reportLabel.slice(0, 28) || "Report", {
      views: [{ state: "frozen", ySplit: 6 }],
      properties: { defaultRowHeight: 20 }
    });
    ws.columns = columns.map((c) => ({
      header: c.label,
      key: c.key,
      width: _colWidth(c, items)
    }));
    const maxCol = Math.max(columns.length, 8);
    const lastCol = _colLetter(maxCol);
    ws.mergeCells(`A1:${lastCol}1`);
    const titleCell = ws.getCell("A1");
    titleCell.value = _bizName();
    titleCell.font = { size: 18, bold: true, color: { argb: "FF1A237E" } };
    titleCell.alignment = { horizontal: "left", vertical: "middle" };
    ws.getRow(1).height = 30;
    ws.mergeCells(`A2:${lastCol}2`);
    const subCell = ws.getCell("A2");
    const subParts = [reportLabel, `Date Range: ${_dateLabel(dateFrom, dateTo)}`, `Generated: ${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}`];
    subCell.value = subParts.join("  |  ");
    subCell.font = { size: 10, italic: true, color: { argb: "FF616161" } };
    subCell.alignment = { horizontal: "left" };
    ws.getRow(2).height = 18;
    const contactParts = [_bizEmail(), _bizPhone(), _bizAddress()].filter(Boolean);
    if (contactParts.length) {
      ws.mergeCells(`A3:${lastCol}3`);
      const cCell = ws.getCell("A3");
      cCell.value = contactParts.join("  •  ");
      cCell.font = { size: 9, color: { argb: "FF9E9E9E" } };
      cCell.alignment = { horizontal: "left" };
    }
    if (kpis && kpis.length) {
      ws.getRow(5).height = 30;
      kpis.forEach((kpi, i) => {
        const col = i + 1;
        const labelCell = ws.getCell(5, col);
        labelCell.value = kpi.label;
        labelCell.font = { size: 9, bold: true, color: { argb: "FF37474F" } };
        labelCell.fill = { type: "pattern", pattern: "solid", bgColor: { argb: "FFE3F2FD" } };
        labelCell.border = { bottom: { style: "medium", color: { argb: "FF1565C0" } } };
        labelCell.alignment = { horizontal: "center" };
        const valCell = ws.getCell(6, col);
        valCell.value = kpi.value;
        valCell.font = { size: 13, bold: true, color: { argb: "FF1565C0" } };
        valCell.fill = { type: "pattern", pattern: "solid", bgColor: { argb: "FFE3F2FD" } };
        valCell.alignment = { horizontal: "center" };
        ws.getColumn(col).width = Math.max(ws.getColumn(col).width || 18, 20);
      });
      ws.getRow(6).height = 28;
    }
    const headerRowNum = kpis && kpis.length ? 8 : 5;
    const hdrRow = ws.getRow(headerRowNum);
    columns.forEach((c, i) => {
      const cell = hdrRow.getCell(i + 1);
      cell.value = c.label;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A237E" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCCCCCC" } },
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
        left: { style: "thin", color: { argb: "FFCCCCCC" } },
        right: { style: "thin", color: { argb: "FFCCCCCC" } }
      };
    });
    hdrRow.height = 26;
    items.forEach((row, idx) => {
      const rowNum = headerRowNum + 1 + idx;
      const r = ws.getRow(rowNum);
      columns.forEach((c, ci) => {
        const cell = r.getCell(ci + 1);
        const raw = row[c.key];
        if (c.format === "currency") {
          cell.value = Number(raw) || 0;
          cell.numFmt = "#,##0.00";
        } else if (c.format === "number") {
          cell.value = Number(raw) || 0;
          cell.numFmt = "#,##0";
        } else if (c.format === "percent") {
          cell.value = Number(raw) || 0;
          cell.numFmt = '0.0"%"';
        } else if (c.format === "date") {
          cell.value = raw ? fmtDate(raw) : "";
        } else {
          cell.value = raw ?? "";
        }
        if (idx % 2 === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
        }
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } }
        };
        cell.alignment = { vertical: "middle" };
      });
      r.height = 20;
    });
    ws.pageSetup = {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    };
    ws.pageMargins = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
    ws.headerFooter = {
      oddHeader: `&L&B${_bizName()}&R${reportLabel}`,
      oddFooter: `&LGenerated: ${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}&RPage &P of &N`
    };
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    FileSaver.saveAs(blob, _fileName(reportLabel, "xlsx"));
  }
  function _colWidth(col, items) {
    const sample = items.slice(0, 50).map((row) => String(row[col.key] ?? ""));
    const maxLen = Math.max(col.label.length, ...sample.map((s) => s.length), 10);
    return Math.min(Math.max(maxLen + 3, 14), 45);
  }
  function _colLetter(n) {
    let result = "";
    while (n > 0) {
      const rem = (n - 1) % 26;
      result = String.fromCharCode(65 + rem) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result;
  }
  async function _exportPDF(params) {
    const { reportLabel, items, columns, kpis, chartData, dateFrom, dateTo } = params;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const logoUrl = _logoUrl();
    {
      doc.setFillColor(...PRIMARY);
      doc.roundedRect(margin, 11, 18, 18, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      const initials = _bizName().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
      doc.text(initials || "D", margin + 9, 22, { align: "center" });
    }
    const textX = !logoUrl ? margin + 22 : margin + 22;
    doc.setTextColor(...PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(_bizName(), textX, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const contactParts = [_bizEmail(), _bizPhone(), _bizAddress()].filter(Boolean);
    if (contactParts.length) {
      doc.text(contactParts.join("  •  "), textX, 24);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...DARK_TEXT);
    doc.text(reportLabel, pageW - margin, 16, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`Date Range: ${_dateLabel(dateFrom, dateTo)}`, pageW - margin, 21, { align: "right" });
    doc.text(`Generated: ${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}`, pageW - margin, 26, { align: "right" });
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.8);
    doc.line(margin, 30, pageW - margin, 30);
    doc.setLineWidth(0.2);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 30.5, pageW - margin, 30.5);
    let yPos = 36;
    if (kpis && kpis.length) {
      yPos = _drawKpiCards(doc, kpis, margin, yPos, pageW - 2 * margin);
    }
    const allCharts = [
      ...chartData ? [chartData] : [],
      ...params.charts || []
    ].filter((c) => c);
    for (const ch of allCharts) {
      if (ch.type === "donut" && ch.segments && ch.segments.length) {
        yPos = _drawDonutChart(doc, ch, margin, yPos);
      } else if (ch.type === "hbar" && ch.hbarItems && ch.hbarItems.length) {
        yPos = _drawHBarChart(doc, ch, margin, yPos, pageW - 2 * margin);
      } else if (ch.labels && ch.labels.length) {
        yPos = _drawChart(doc, ch, margin, yPos, pageW - 2 * margin);
      }
    }
    if (items.length) {
      autoTable(doc, {
        startY: yPos + 2,
        head: [columns.map((c) => c.label)],
        body: items.map((row) => columns.map((c) => _formatCell(row[c.key], c.format))),
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 2.5,
          textColor: DARK_TEXT,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: PRIMARY,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          halign: "center"
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: columns.reduce((acc, c, i) => {
          if (c.format === "currency" || c.format === "number" || c.format === "percent") {
            acc[i] = { halign: "right" };
          } else if (c.format === "date") {
            acc[i] = { halign: "center" };
          }
          return acc;
        }, {}),
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          _drawFooter(doc, pageW, pageH, margin);
        }
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...MUTED);
      doc.text("No data available for this report.", pageW / 2, yPos + 10, { align: "center" });
    }
    doc.save(_fileName(reportLabel, "pdf"));
  }
  function _drawKpiCards(doc, kpis, x, y, totalW) {
    const cardH = 18;
    const gap = 4;
    const cardW = (totalW - gap * (kpis.length - 1)) / kpis.length;
    kpis.forEach((kpi, i) => {
      const cx = x + i * (cardW + gap);
      doc.setFillColor(...LIGHT_BG);
      doc.roundedRect(cx, y, cardW, cardH, 2, 2, "F");
      const barColor = kpi.color ? _hexToRgb(kpi.color) : [25, 118, 210];
      doc.setFillColor(...barColor);
      doc.roundedRect(cx, y, cardW, 1.5, 0, 0, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text(kpi.label.toUpperCase(), cx + 3, y + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...barColor);
      doc.text(kpi.value, cx + 3, y + 13);
    });
    return y + cardH + 6;
  }
  function _drawChart(doc, chartData, x, y, totalW) {
    const chartH = 50;
    const labelArea = 14;
    const chartLeft = x + labelArea;
    const chartW = totalW - labelArea - 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...[33, 33, 33]);
    doc.text("Revenue Trend", x, y + 2);
    y += 4;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(chartLeft, y, chartW, chartH, 1, 1, "F");
    const labels = chartData.labels;
    if (!labels.length) return y + chartH + 6;
    const maxVal = Math.max(...chartData.datasets.flatMap((d) => d.data), 1);
    doc.setDrawColor(225, 225, 225);
    doc.setLineWidth(0.1);
    for (let i = 0; i <= 4; i++) {
      const ly = y + chartH - chartH * i / 4;
      doc.line(chartLeft, ly, chartLeft + chartW, ly);
    }
    const barCount = labels.length;
    const groupW = chartW / barCount;
    const barCountPerGroup = chartData.datasets.length;
    const barW = Math.min(groupW * 0.7 / barCountPerGroup, 8);
    const barGap = 1;
    labels.forEach((label, li) => {
      const groupStart = chartLeft + li * groupW + (groupW - barW * barCountPerGroup - barGap * (barCountPerGroup - 1)) / 2;
      chartData.datasets.forEach((ds, di) => {
        const val = ds.data[li] || 0;
        const barH = val / maxVal * (chartH - 6);
        const bx = groupStart + di * (barW + barGap);
        const by = y + chartH - barH;
        const color = ds.color || [
          di === 0 ? 25 : di === 1 ? 198 : 46,
          di === 0 ? 118 : di === 1 ? 40 : 125,
          di === 0 ? 210 : di === 1 ? 40 : 50
        ];
        doc.setFillColor(...color);
        if (barH > 0.5) {
          doc.rect(bx, by, barW, barH, "F");
        }
      });
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...[120, 120, 120]);
    const labelInterval = Math.ceil(barCount / 10);
    labels.forEach((label, li) => {
      if (li % labelInterval === 0 || li === barCount - 1) {
        const lx = chartLeft + li * groupW + groupW / 2;
        const shortLabel = label.length > 10 ? label.slice(5) : label;
        doc.text(shortLabel, lx, y + chartH + 3, { align: "center" });
      }
    });
    let legX = chartLeft + chartW - 60;
    chartData.datasets.forEach((ds, di) => {
      const color = ds.color || [
        di === 0 ? 25 : di === 1 ? 198 : 46,
        di === 0 ? 118 : di === 1 ? 40 : 125,
        di === 0 ? 210 : di === 1 ? 40 : 50
      ];
      doc.setFillColor(...color);
      doc.rect(legX, y - 2, 3, 3, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...[80, 80, 80]);
      doc.text(ds.label, legX + 5, y + 1);
      legX += 25;
    });
    return y + chartH + 8;
  }
  function _drawDonutChart(doc, ch, x, y, totalW) {
    const segments = ch.segments;
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const title = ch.title || "Distribution";
    const donutR = 35;
    const cx = x + donutR + 10;
    const cy = y + donutR + 6;
    const chartH = donutR * 2 + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK_TEXT);
    doc.text(title, x, y + 2);
    if (ch.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text(ch.subtitle, x, y + 5.5);
    }
    let cumPct = 0;
    const palette = ["#1976D2", "#2E7D32", "#FF9800", "#9C27B0", "#F44336", "#00BCD4", "#795548", "#607D8B", "#8BC34A", "#CDDC39"];
    segments.forEach((seg, i) => {
      const startAngle = cumPct / total * 360 - 90;
      cumPct += seg.value;
      const endAngle = cumPct / total * 360 - 90;
      const startRad = startAngle * Math.PI / 180;
      const endRad = endAngle * Math.PI / 180;
      const x1 = cx + donutR * Math.cos(startRad);
      const y1 = cy + donutR * Math.sin(startRad);
      const x2 = cx + donutR * Math.cos(endRad);
      const y2 = cy + donutR * Math.sin(endRad);
      const hex = seg.color || palette[i % palette.length];
      const rgb = _hexToRgb(hex);
      doc.setFillColor(...rgb);
      doc.triangle(cx, cy, x1, y1, x2, y2, "F");
      const steps = Math.max(4, Math.ceil((endAngle - startAngle) / 5));
      for (let s = 0; s < steps; s++) {
        const a1 = startAngle + (endAngle - startAngle) * s / steps;
        const a2 = startAngle + (endAngle - startAngle) * (s + 1) / steps;
        const ar1 = a1 * Math.PI / 180;
        const ar2 = a2 * Math.PI / 180;
        const px1 = cx + donutR * Math.cos(ar1);
        const py1 = cy + donutR * Math.sin(ar1);
        const px2 = cx + donutR * Math.cos(ar2);
        const py2 = cy + donutR * Math.sin(ar2);
        doc.triangle(cx, cy, px1, py1, px2, py2, "F");
      }
    });
    doc.setFillColor(255, 255, 255);
    doc.circle(cx, cy, donutR - 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK_TEXT);
    doc.text(fmtCurrency(total), cx, cy - 1, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...MUTED);
    doc.text("Total", cx, cy + 3, { align: "center" });
    const legX = cx + donutR + 14;
    let legY = y + 2;
    segments.forEach((seg, i) => {
      const hex = seg.color || palette[i % palette.length];
      const rgb = _hexToRgb(hex);
      doc.setFillColor(...rgb);
      doc.circle(legX, legY, 1.5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...DARK_TEXT);
      const pct = (seg.value / total * 100).toFixed(1);
      const label = seg.label.length > 24 ? seg.label.slice(0, 22) + "…" : seg.label;
      doc.text(`${label}: ${pct}%`, legX + 4, legY);
      legY += 5;
    });
    return y + Math.max(chartH, legY - y) + 6;
  }
  function _drawHBarChart(doc, ch, x, y, totalW) {
    const items = ch.hbarItems;
    const maxVal = Math.max(...items.map((i) => i.value), 1);
    const labelW = 70;
    const title = ch.title || "Top Items";
    const rowH = 5;
    const chartH = items.length * rowH + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK_TEXT);
    doc.text(title, x, y + 2);
    if (ch.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      doc.text(ch.subtitle, x, y + 5.5);
    }
    let cy = y + 8;
    const trackX = x + labelW;
    const trackW = totalW - labelW - 30;
    const palette = ["#1976D2", "#2E7D32", "#FF9800", "#9C27B0", "#F44336", "#00BCD4"];
    items.forEach((item, i) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...MUTED);
      const label = item.label.length > 20 ? item.label.slice(0, 18) + "…" : item.label;
      doc.text(label, x, cy + 3);
      doc.setFillColor(240, 242, 245);
      doc.roundedRect(trackX, cy, trackW, rowH - 1, 1, 1, "F");
      const fillW = Math.max(2, item.value / maxVal * trackW);
      const hex = item.color || palette[i % palette.length];
      doc.setFillColor(..._hexToRgb(hex));
      doc.roundedRect(trackX, cy, fillW, rowH - 1, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      const valText = fmtCurrency(item.value);
      if (fillW < 25) {
        doc.setTextColor(...DARK_TEXT);
        doc.text(valText, trackX + fillW + 2, cy + 3.5);
      } else {
        doc.text(valText, trackX + fillW - 2, cy + 3.5, { align: "right" });
      }
      cy += rowH;
    });
    return y + chartH + 6;
  }
  function _drawFooter(doc, pageW, pageH, margin) {
    const y = pageH - 10;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 2, pageW - margin, y - 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...[130, 130, 130]);
    const left = `© ${(/* @__PURE__ */ new Date()).getFullYear()} ${_bizName()} — DomendraPOS`;
    const right = `Page ${doc.getCurrentPageInfo().pageNumber}`;
    doc.text(left, margin, y);
    doc.text(right, pageW - margin, y, { align: "right" });
    doc.text("Confidential", pageW / 2, y, { align: "center" });
  }
  async function _addLogoToPdf(doc, url, x, y, w, h) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = (void 0).createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(false);
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          const fmt = url.match(/\.(jpg|jpeg)$/i) ? "JPEG" : "PNG";
          doc.addImage(dataUrl, fmt, x, y, w, h);
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
  function _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [25, 118, 210];
  }
  async function exportGeneralReport(sections, opts) {
    if (exportingGeneral.value || !sections.length) return;
    exportingGeneral.value = true;
    try {
      await _exportGeneralPDF(sections, opts);
    } catch (e) {
      console.error("General report export failed:", e);
    } finally {
      exportingGeneral.value = false;
    }
  }
  async function _exportGeneralPDF(sections, opts) {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const logoUrl = _logoUrl();
    if (logoUrl) {
      try {
        await _addLogoToPdf(doc, logoUrl, pageW / 2 - 15, 45, 30, 30);
      } catch {
      }
    }
    doc.setTextColor(...PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(_bizName(), pageW / 2, 90, { align: "center" });
    doc.setFontSize(14);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.text("Comprehensive Business Report", pageW / 2, 98, { align: "center" });
    doc.setFontSize(11);
    doc.text(`Date Range: ${_dateLabel(opts.dateFrom, opts.dateTo)}`, pageW / 2, 106, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Generated: ${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}`, pageW / 2, 112, { align: "center" });
    const contactParts = [_bizEmail(), _bizPhone(), _bizAddress()].filter(Boolean);
    if (contactParts.length) {
      doc.setFontSize(8);
      doc.text(contactParts.join("  •  "), pageW / 2, 118, { align: "center" });
    }
    _drawFooter(doc, pageW, pageH, margin);
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...PRIMARY);
    doc.text("Table of Contents", pageW / 2, 30, { align: "center" });
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.8);
    doc.line(margin, 36, pageW - margin, 36);
    doc.setLineWidth(0.2);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 36.5, pageW - margin, 36.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    let tocY = 46;
    sections.forEach((sec, i) => {
      const num = `${i + 1}.`;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...ACCENT);
      doc.setFontSize(10);
      doc.text(num, margin, tocY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DARK_TEXT);
      doc.text(sec.reportLabel, margin + 8, tocY);
      doc.setTextColor(...MUTED);
      doc.text(`Page ${i + 3}`, pageW - margin, tocY, { align: "right" });
      tocY += 6;
    });
    _drawFooter(doc, pageW, pageH, margin);
    for (const sec of sections) {
      doc.addPage();
      let yPos = 36;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...PRIMARY);
      doc.text(sec.reportLabel, margin, 18);
      doc.setDrawColor(...ACCENT);
      doc.setLineWidth(0.8);
      doc.line(margin, 30, pageW - margin, 30);
      doc.setLineWidth(0.2);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 30.5, pageW - margin, 30.5);
      if (sec.kpis && sec.kpis.length) {
        yPos = _drawKpiCards(doc, sec.kpis, margin, yPos, pageW - 2 * margin);
      }
      const allCharts = [
        ...sec.chartData ? [sec.chartData] : [],
        ...sec.charts || []
      ].filter((c) => c);
      for (const ch of allCharts) {
        if (ch.type === "donut" && ch.segments && ch.segments.length) {
          yPos = _drawDonutChart(doc, ch, margin, yPos);
        } else if (ch.type === "hbar" && ch.hbarItems && ch.hbarItems.length) {
          yPos = _drawHBarChart(doc, ch, margin, yPos, pageW - 2 * margin);
        } else if (ch.labels && ch.labels.length) {
          yPos = _drawChart(doc, ch, margin, yPos, pageW - 2 * margin);
        }
      }
      const maxRows = 20;
      const displayItems = sec.items.length > maxRows ? sec.items.slice(0, maxRows) : sec.items;
      if (displayItems.length) {
        autoTable(doc, {
          startY: yPos + 2,
          head: [sec.columns.map((c) => c.label)],
          body: displayItems.map((row) => sec.columns.map((c) => _formatCell(row[c.key], c.format))),
          theme: "grid",
          styles: {
            font: "helvetica",
            fontSize: 7.5,
            cellPadding: 2,
            textColor: DARK_TEXT,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          headStyles: {
            fillColor: PRIMARY,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 7.5,
            halign: "center"
          },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          columnStyles: sec.columns.reduce((acc, c, i) => {
            if (c.format === "currency" || c.format === "number" || c.format === "percent") {
              acc[i] = { halign: "right" };
            } else if (c.format === "date") {
              acc[i] = { halign: "center" };
            }
            return acc;
          }, {}),
          margin: { left: margin, right: margin },
          didDrawPage: () => {
            _drawFooter(doc, pageW, pageH, margin);
          }
        });
        if (sec.items.length > maxRows) {
          const finalY = doc.lastAutoTable?.finalY || yPos + 10;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7);
          doc.setTextColor(...MUTED);
          doc.text(
            `Showing ${maxRows} of ${sec.items.length} rows. Export this report individually for full data.`,
            margin,
            finalY + 5
          );
        }
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...MUTED);
        doc.text("No data available for this section.", pageW / 2, yPos + 10, { align: "center" });
        _drawFooter(doc, pageW, pageH, margin);
      }
    }
    doc.save(_fileName("General_Report", "pdf"));
  }
  async function exportReport(format, params) {
    if (exporting.value) return;
    exporting.value = true;
    try {
      if (format === "csv") {
        _exportCSV(params);
      } else if (format === "excel") {
        await _exportExcel(params);
      } else {
        await _exportPDF(params);
      }
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      exporting.value = false;
    }
  }
  return {
    exporting,
    exportingGeneral,
    exportFormats,
    exportReport,
    exportGeneralReport
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reports",
  __ssrInlineRender: true,
  setup(__props) {
    const api = useApi();
    const { currency: fmtCurrency, number: fmtNumber, date: fmtDate, percent: fmtPct } = useFormat();
    useAuthStore();
    const { exporting, exportingGeneral, exportReport, exportGeneralReport } = useReportExport();
    const COLORS = ["#1976D2", "#2E7D32", "#FF9800", "#9C27B0", "#F44336", "#00BCD4", "#795548", "#607D8B", "#8BC34A", "#CDDC39", "#FF5722", "#3F51B5"];
    function colorAt(i) {
      return COLORS[i % COLORS.length];
    }
    const presets = [
      { label: "Today", value: "today" },
      { label: "Yesterday", value: "yesterday" },
      { label: "Last 7 days", value: "7" },
      { label: "Last 30 days", value: "30" },
      { label: "This month", value: "month" },
      { label: "Last month", value: "lastmonth" },
      { label: "This year", value: "year" },
      { label: "Custom", value: "custom" }
    ];
    const preset = ref("month");
    const customFrom = ref("");
    const customTo = ref("");
    const branchFilter = ref(null);
    const branchOptions = ref([]);
    const reports2 = [
      // Sales group
      { id: "sales-summary", short: "Summary", icon: "mdi-chart-line", label: "Sales Summary", group: "Sales" },
      { id: "daily-revenue", short: "Daily Revenue", icon: "mdi-chart-bar", label: "Daily Revenue", group: "Sales" },
      { id: "sales-by-product", short: "Products", icon: "mdi-package-variant-closed", label: "Sales by Product", group: "Sales" },
      { id: "sales-by-category", short: "Categories", icon: "mdi-chart-pie", label: "Sales by Category", group: "Sales" },
      { id: "sales-by-branch", short: "Branches", icon: "mdi-store-outline", label: "Sales by Branch", group: "Sales" },
      { id: "sales-by-cashier", short: "Cashiers", icon: "mdi-account-tie", label: "Sales by Cashier", group: "Sales" },
      { id: "payment-methods", short: "Payments", icon: "mdi-credit-card-outline", label: "Payment Methods", group: "Sales" },
      { id: "profit-margin", short: "Profit Margin", icon: "mdi-chart-bell-curve", label: "Profit Margin", group: "Sales" },
      { id: "tax-collected", short: "Tax", icon: "mdi-calculator", label: "Tax Collected", group: "Sales" },
      // Customer group
      { id: "top-customers", short: "Top Customers", icon: "mdi-account-star-outline", label: "Top Customers", group: "Customers" },
      // Inventory group
      { id: "inventory-valuation", short: "Inventory", icon: "mdi-currency-usd", label: "Inventory Valuation", group: "Inventory" },
      { id: "low-stock", short: "Low Stock", icon: "mdi-alert-outline", label: "Low Stock Report", group: "Inventory" },
      { id: "stock-movement", short: "Stock Moves", icon: "mdi-swap-vertical", label: "Stock Movement", group: "Inventory" },
      // Analytics group
      { id: "hourly-sales", short: "Hourly", icon: "mdi-clock-outline", label: "Hourly Sales", group: "Analytics" },
      { id: "time-of-day", short: "Time of Day", icon: "mdi-theme-light-dark", label: "Time of Day Breakdown", group: "Analytics" },
      { id: "weekday-sales", short: "Weekday", icon: "mdi-calendar-blank-outline", label: "Weekday Sales", group: "Analytics" },
      { id: "peak-hours-heatmap", short: "Heatmap", icon: "mdi-grid", label: "Peak Hours Heatmap", group: "Analytics" },
      { id: "sales-growth", short: "Growth", icon: "mdi-chart-trending-up", label: "Sales Growth", group: "Analytics" },
      { id: "revenue-trend", short: "Revenue Trend", icon: "mdi-chart-areaspline", label: "Revenue Trend", group: "Analytics" },
      { id: "product-analytics", short: "Product Analytics", icon: "mdi-chart-scatter-plot", label: "Product Analytics", group: "Analytics" },
      { id: "category-analytics", short: "Category Analytics", icon: "mdi-chart-donut", label: "Category Analytics", group: "Analytics" }
    ];
    const activeReport = ref("sales-summary");
    const loading = ref(false);
    const error = ref(null);
    const reportData = ref(null);
    const groupedTabs = computed(() => {
      const groups = /* @__PURE__ */ new Map();
      for (const r of reports2) {
        if (!groups.has(r.group)) groups.set(r.group, []);
        groups.get(r.group).push(r);
      }
      return Array.from(groups.entries()).map(([group, tabs]) => ({ group, tabs }));
    });
    const COLUMN_MAP = {
      "sales-summary": [
        { key: "total_revenue", label: "Total Revenue", format: "currency" },
        { key: "total_cost", label: "Total Cost", format: "currency" },
        { key: "gross_profit", label: "Gross Profit", format: "currency" },
        { key: "gross_margin", label: "Gross Margin", format: "percent" },
        { key: "transaction_count", label: "Txns", format: "number" },
        { key: "items_sold", label: "Items Sold", format: "number" },
        { key: "average_sale", label: "Avg Sale", format: "currency" },
        { key: "total_tax", label: "Tax", format: "currency" },
        { key: "total_discounts", label: "Discounts", format: "currency" }
      ],
      "sales-by-product": [
        { key: "product", label: "Product" },
        { key: "sku", label: "SKU" },
        { key: "qty_sold", label: "Qty Sold", format: "number" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "cost", label: "Cost", format: "currency" },
        { key: "profit", label: "Profit", format: "currency" },
        { key: "margin", label: "Margin", format: "percent" }
      ],
      "sales-by-branch": [
        { key: "branch", label: "Branch" },
        { key: "code", label: "Code" },
        { key: "total_sales", label: "Total Sales", format: "currency" },
        { key: "total_cost", label: "Total Cost", format: "currency" },
        { key: "gross_profit", label: "Gross Profit", format: "currency" },
        { key: "transaction_count", label: "Txns", format: "number" },
        { key: "average_sale", label: "Avg Sale", format: "currency" }
      ],
      "sales-by-cashier": [
        { key: "cashier", label: "Cashier" },
        { key: "total_sales", label: "Total Sales", format: "currency" },
        { key: "transaction_count", label: "Txns", format: "number" },
        { key: "average_sale", label: "Avg Sale", format: "currency" },
        { key: "share_pct", label: "Share", format: "percent" }
      ],
      "daily-revenue": [
        { key: "date", label: "Date", format: "date" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "cost", label: "Cost", format: "currency" },
        { key: "profit", label: "Profit", format: "currency" },
        { key: "transactions", label: "Txns", format: "number" }
      ],
      "profit-margin": [
        { key: "product", label: "Product" },
        { key: "sku", label: "SKU" },
        { key: "qty_sold", label: "Qty Sold", format: "number" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "cost", label: "Cost", format: "currency" },
        { key: "profit", label: "Profit", format: "currency" },
        { key: "margin", label: "Margin", format: "percent" }
      ],
      "payment-methods": [
        { key: "method", label: "Method" },
        { key: "total", label: "Total", format: "currency" },
        { key: "count", label: "Count", format: "number" },
        { key: "percentage", label: "Share", format: "percent" }
      ],
      "inventory-valuation": [
        { key: "product", label: "Product" },
        { key: "sku", label: "SKU" },
        { key: "branch", label: "Branch" },
        { key: "qty_on_hand", label: "Qty on Hand", format: "number" },
        { key: "cost_value", label: "Cost Value", format: "currency" },
        { key: "retail_value", label: "Retail Value", format: "currency" },
        { key: "potential_profit", label: "Potential Profit", format: "currency" }
      ],
      "low-stock": [
        { key: "product", label: "Product" },
        { key: "sku", label: "SKU" },
        { key: "branch", label: "Branch" },
        { key: "on_hand", label: "On Hand", format: "number" },
        { key: "reorder_level", label: "Reorder Level", format: "number" },
        { key: "shortage", label: "Shortage", format: "number" }
      ],
      "top-customers": [
        { key: "customer", label: "Customer" },
        { key: "total_spent", label: "Total Spent", format: "currency" },
        { key: "visits", label: "Visits", format: "number" },
        { key: "average_spend", label: "Avg Spend", format: "currency" }
      ],
      "tax-collected": [
        { key: "total_tax_collected", label: "Tax Collected", format: "currency" },
        { key: "taxable_sales", label: "Taxable Sales", format: "currency" },
        { key: "effective_rate", label: "Rate", format: "percent" },
        { key: "transaction_count", label: "Txns", format: "number" }
      ],
      "stock-movement": [
        { key: "type", label: "Type" },
        { key: "product", label: "Product" },
        { key: "branch", label: "Branch" },
        { key: "quantity_change", label: "Qty Change", format: "number" },
        { key: "movement_count", label: "Moves", format: "number" }
      ],
      "sales-by-category": [
        { key: "category", label: "Category" },
        { key: "qty_sold", label: "Qty Sold", format: "number" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "cost", label: "Cost", format: "currency" },
        { key: "profit", label: "Profit", format: "currency" },
        { key: "margin", label: "Margin", format: "percent" }
      ],
      "hourly-sales": [
        { key: "hour", label: "Hour", format: "number" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "transactions", label: "Txns", format: "number" }
      ],
      "time-of-day": [
        { key: "label", label: "Time Range" },
        { key: "sub", label: "Hours" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "transactions", label: "Txns", format: "number" },
        { key: "revenue_pct", label: "Rev %", format: "percent" },
        { key: "share_pct", label: "Share %", format: "percent" }
      ],
      "revenue-trend": [
        { key: "date", label: "Date", format: "date" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "cost", label: "Cost", format: "currency" },
        { key: "profit", label: "Profit", format: "currency" }
      ],
      "weekday-sales": [
        { key: "name", label: "Weekday" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "transactions", label: "Txns", format: "number" },
        { key: "avg_revenue", label: "Avg Revenue", format: "currency" }
      ],
      "product-analytics": [
        { key: "product", label: "Product" },
        { key: "sku", label: "SKU" },
        { key: "category", label: "Category" },
        { key: "qty_sold", label: "Qty Sold", format: "number" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "profit", label: "Profit", format: "currency" },
        { key: "margin", label: "Margin", format: "percent" },
        { key: "abc_class", label: "ABC Class" },
        { key: "revenue_share", label: "Rev Share", format: "percent" }
      ],
      "category-analytics": [
        { key: "category", label: "Category" },
        { key: "qty_sold", label: "Qty Sold", format: "number" },
        { key: "revenue", label: "Revenue", format: "currency" },
        { key: "profit", label: "Profit", format: "currency" },
        { key: "margin", label: "Margin", format: "percent" },
        { key: "revenue_share", label: "Rev Share", format: "percent" },
        { key: "stock_value", label: "Stock Value", format: "currency" },
        { key: "sku_count", label: "SKUs", format: "number" }
      ]
    };
    function getColumns(reportId) {
      return COLUMN_MAP[reportId] || [];
    }
    const reportColumns = computed(() => getColumns(activeReport.value));
    const reportKpis = computed(() => {
      if (!reportData.value) return [];
      return getKpis(activeReport.value, reportData.value);
    });
    function getKpis(reportId, d) {
      if (!d) return [];
      switch (reportId) {
        case "sales-summary":
          return [
            { label: "Total Revenue", value: fmtCurrency(d.total_revenue), color: "#1976D2" },
            { label: "Gross Profit", value: fmtCurrency(d.gross_profit), color: "#2E7D32" },
            { label: "Avg Sale", value: fmtCurrency(d.average_sale), color: "#0288D1" },
            { label: "Txns", value: fmtNumber(d.transaction_count), color: "#7B1FA2" },
            { label: "Items Sold", value: fmtNumber(d.items_sold), color: "#E65100" },
            { label: "Discounts", value: fmtCurrency(d.total_discounts), color: "#F57F17" }
          ];
        case "sales-by-branch": {
          const items = Array.isArray(d) ? d : [];
          const totalSales = items.reduce((s, r) => s + Number(r.total_sales || 0), 0);
          const totalTxns = items.reduce((s, r) => s + Number(r.transaction_count || 0), 0);
          const totalProfit = items.reduce((s, r) => s + Number(r.gross_profit || 0), 0);
          return [
            { label: "Total Sales", value: fmtCurrency(totalSales), color: "#1976D2" },
            { label: "Gross Profit", value: fmtCurrency(totalProfit), color: "#2E7D32" },
            { label: "Txns", value: fmtNumber(totalTxns), color: "#7B1FA2" },
            { label: "Branches", value: fmtNumber(items.length), color: "#E65100" }
          ];
        }
        case "sales-by-cashier": {
          const items = Array.isArray(d) ? d : [];
          const totalSales = items.reduce((s, r) => s + Number(r.total_sales || 0), 0);
          const totalTxns = items.reduce((s, r) => s + Number(r.transaction_count || 0), 0);
          return [
            { label: "Total Sales", value: fmtCurrency(totalSales), color: "#1976D2" },
            { label: "Txns", value: fmtNumber(totalTxns), color: "#7B1FA2" },
            { label: "Cashiers", value: fmtNumber(items.length), color: "#E65100" }
          ];
        }
        case "sales-by-product": {
          const items = Array.isArray(d) ? d : [];
          const totalRev = items.reduce((s, r) => s + Number(r.revenue || 0), 0);
          const totalProfit = items.reduce((s, r) => s + Number(r.profit || 0), 0);
          const totalQty = items.reduce((s, r) => s + Number(r.qty_sold || 0), 0);
          return [
            { label: "Total Revenue", value: fmtCurrency(totalRev), color: "#1976D2" },
            { label: "Gross Profit", value: fmtCurrency(totalProfit), color: "#2E7D32" },
            { label: "Items Sold", value: fmtNumber(totalQty), color: "#E65100" },
            { label: "Products", value: fmtNumber(items.length), color: "#7B1FA2" }
          ];
        }
        case "sales-by-category": {
          const items = Array.isArray(d) ? d : [];
          const totalRev = items.reduce((s, r) => s + Number(r.revenue || 0), 0);
          const totalProfit = items.reduce((s, r) => s + Number(r.profit || 0), 0);
          const totalQty = items.reduce((s, r) => s + Number(r.qty_sold || 0), 0);
          return [
            { label: "Total Revenue", value: fmtCurrency(totalRev), color: "#1976D2" },
            { label: "Gross Profit", value: fmtCurrency(totalProfit), color: "#2E7D32" },
            { label: "Items Sold", value: fmtNumber(totalQty), color: "#E65100" },
            { label: "Categories", value: fmtNumber(items.length), color: "#7B1FA2" }
          ];
        }
        case "inventory-valuation": {
          const items = Array.isArray(d) ? d : [];
          const totalCost = items.reduce((s, r) => s + Number(r.cost_value || 0), 0);
          const totalRetail = items.reduce((s, r) => s + Number(r.retail_value || 0), 0);
          const totalQty = items.reduce((s, r) => s + Number(r.qty_on_hand || 0), 0);
          return [
            { label: "Total Cost Value", value: fmtCurrency(totalCost), color: "#1976D2" },
            { label: "Total Retail Value", value: fmtCurrency(totalRetail), color: "#2E7D32" },
            { label: "Items", value: fmtNumber(items.length), color: "#7B1FA2" },
            { label: "Total Qty", value: fmtNumber(totalQty), color: "#E65100" }
          ];
        }
        case "tax-collected":
          return [
            { label: "Tax Collected", value: fmtCurrency(d.total_tax_collected), color: "#1976D2" },
            { label: "Taxable Sales", value: fmtCurrency(d.taxable_sales), color: "#2E7D32" },
            { label: "Effective Rate", value: `${Number(d.effective_rate).toFixed(1)}%`, color: "#7B1FA2" },
            { label: "Txns", value: fmtNumber(d.transaction_count), color: "#E65100" }
          ];
        case "payment-methods": {
          const items = Array.isArray(d) ? d : [];
          const grand = items.reduce((s, r) => s + Number(r.total || 0), 0);
          return [
            { label: "Total Revenue", value: fmtCurrency(grand), color: "#1976D2" },
            { label: "Transactions", value: fmtNumber(items.reduce((s, r) => s + Number(r.count || 0), 0)), color: "#2E7D32" },
            { label: "Methods", value: fmtNumber(items.length), color: "#7B1FA2" }
          ];
        }
        case "top-customers": {
          const items = Array.isArray(d) ? d : [];
          const totalSpent = items.reduce((s, r) => s + Number(r.total_spent || 0), 0);
          const totalVisits = items.reduce((s, r) => s + Number(r.visits || 0), 0);
          return [
            { label: "Total Revenue", value: fmtCurrency(totalSpent), color: "#1976D2" },
            { label: "Total Visits", value: fmtNumber(totalVisits), color: "#2E7D32" },
            { label: "Customers", value: fmtNumber(items.length), color: "#7B1FA2" },
            { label: "Avg Spend", value: fmtCurrency(totalVisits ? totalSpent / totalVisits : 0), color: "#E65100" }
          ];
        }
        case "hourly-sales": {
          const items = Array.isArray(d) ? d : [];
          const peak = items.reduce((max, r) => Number(r.revenue) > Number(max.revenue) ? r : max, items[0] || { hour: 0, revenue: 0 });
          return [
            { label: "Total Revenue", value: fmtCurrency(items.reduce((s, r) => s + Number(r.revenue || 0), 0)), color: "#1976D2" },
            { label: "Peak Hour", value: peak.hour !== void 0 ? `${peak.hour}:00` : "-", color: "#2E7D32" },
            { label: "Peak Revenue", value: fmtCurrency(peak.revenue || 0), color: "#E65100" },
            { label: "Total Txns", value: fmtNumber(items.reduce((s, r) => s + Number(r.transactions || 0), 0)), color: "#7B1FA2" }
          ];
        }
        case "time-of-day": {
          const ranges = d.ranges || [];
          const busiest = ranges.reduce((max, r) => Number(r.revenue) > Number(max.revenue) ? r : max, ranges[0] || { label: "-", revenue: 0 });
          return [
            { label: "Total Revenue", value: fmtCurrency(d.kpis?.total_revenue || 0), color: "#1976D2" },
            { label: "Total Txns", value: fmtNumber(d.kpis?.total_transactions || 0), color: "#2E7D32" },
            { label: "Busiest Period", value: busiest.label || "-", color: "#FF9800" },
            { label: "Busiest Revenue", value: fmtCurrency(busiest.revenue || 0), color: "#7B1FA2" }
          ];
        }
        case "revenue-trend": {
          const trend = d.trend || [];
          const bestDay = trend.reduce((max, r) => Number(r.revenue) > Number(max.revenue) ? r : max, trend[0] || { date: "-", revenue: 0 });
          return [
            { label: "Total Revenue", value: fmtCurrency(d.kpis?.total_revenue || 0), color: "#1976D2" },
            { label: "Total Cost", value: fmtCurrency(d.kpis?.total_cost || 0), color: "#F44336" },
            { label: "Total Profit", value: fmtCurrency(d.kpis?.total_profit || 0), color: "#2E7D32" },
            { label: "Best Day", value: bestDay.date || "-", color: "#FF9800" }
          ];
        }
        case "weekday-sales": {
          const items = Array.isArray(d) ? d : [];
          const best = items.reduce((max, r) => Number(r.revenue) > Number(max.revenue) ? r : max, items[0] || { name: "-", revenue: 0 });
          return [
            { label: "Total Revenue", value: fmtCurrency(items.reduce((s, r) => s + Number(r.revenue || 0), 0)), color: "#1976D2" },
            { label: "Best Day", value: best.name || "-", color: "#2E7D32" },
            { label: "Best Day Rev", value: fmtCurrency(best.revenue || 0), color: "#E65100" },
            { label: "Total Txns", value: fmtNumber(items.reduce((s, r) => s + Number(r.transactions || 0), 0)), color: "#7B1FA2" }
          ];
        }
        case "sales-growth":
          return [
            { label: "Current Revenue", value: fmtCurrency(d.current_revenue), color: "#1976D2" },
            { label: "Previous Revenue", value: fmtCurrency(d.previous_revenue), color: "#607D8B" },
            { label: "Growth", value: `${Number(d.growth_pct >= 0 ? d.growth_pct : -d.growth_pct).toFixed(1)}%`, color: Number(d.growth_pct) >= 0 ? "#2E7D32" : "#F44336" }
          ];
        case "product-analytics":
          return [
            { label: "Total Products", value: fmtNumber(d.kpis?.total_products || 0), color: "#1976D2" },
            { label: "Products Sold", value: fmtNumber(d.kpis?.products_sold || 0), color: "#2E7D32" },
            { label: "Never Sold", value: fmtNumber(d.kpis?.products_never_sold || 0), color: "#F44336" },
            { label: "Total Revenue", value: fmtCurrency(d.kpis?.total_revenue || 0), color: "#FF9800" },
            { label: "Stock Value", value: fmtCurrency(d.kpis?.stock_value || 0), color: "#7B1FA2" }
          ];
        case "category-analytics":
          return [
            { label: "Total Revenue", value: fmtCurrency(d.kpis?.total_revenue || 0), color: "#1976D2" },
            { label: "Categories", value: fmtNumber(d.kpis?.total_categories || 0), color: "#2E7D32" },
            { label: "Top Category", value: d.kpis?.top_category || "-", color: "#FF9800" },
            { label: "Top Revenue", value: fmtCurrency(d.kpis?.top_category_revenue || 0), color: "#7B1FA2" }
          ];
        case "peak-hours-heatmap": {
          const grid = d.grid || [];
          let peakHour = 0, peakDay = 0, peakVal = 0, totalRev = 0;
          for (let h = 0; h < grid.length; h++) {
            for (let wd = 0; wd < (grid[h]?.length || 0); wd++) {
              const v = Number(grid[h][wd]) || 0;
              totalRev += v;
              if (v > peakVal) {
                peakVal = v;
                peakHour = h;
                peakDay = wd;
              }
            }
          }
          const dayNames = d.weekdays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          return [
            { label: "Total Revenue", value: fmtCurrency(totalRev), color: "#1976D2" },
            { label: "Peak Hour", value: `${peakHour}:00`, color: "#2E7D32" },
            { label: "Peak Day", value: dayNames[peakDay] || "-", color: "#FF9800" },
            { label: "Peak Revenue", value: fmtCurrency(peakVal), color: "#7B1FA2" }
          ];
        }
        case "stock-movement": {
          const items = Array.isArray(d) ? d : [];
          return [
            { label: "Total Movements", value: fmtNumber(items.reduce((s, r) => s + Number(r.movement_count || 0), 0)), color: "#1976D2" },
            { label: "Items Moved", value: fmtNumber(items.length), color: "#2E7D32" }
          ];
        }
        case "low-stock": {
          const items = Array.isArray(d) ? d : [];
          const totalShortage = items.reduce((s, r) => s + Number(r.shortage || 0), 0);
          return [
            { label: "Low Stock Items", value: fmtNumber(items.length), color: "#F44336" },
            { label: "Total Shortage", value: fmtNumber(totalShortage), color: "#FF9800" }
          ];
        }
        case "profit-margin": {
          const items = Array.isArray(d) ? d : [];
          const totalRev = items.reduce((s, r) => s + Number(r.revenue || 0), 0);
          const totalProfit = items.reduce((s, r) => s + Number(r.profit || 0), 0);
          const avgMargin = items.length ? items.reduce((s, r) => s + Number(r.margin || 0), 0) / items.length : 0;
          return [
            { label: "Total Revenue", value: fmtCurrency(totalRev), color: "#1976D2" },
            { label: "Total Profit", value: fmtCurrency(totalProfit), color: "#2E7D32" },
            { label: "Avg Margin", value: `${avgMargin.toFixed(1)}%`, color: "#FF9800" },
            { label: "Products", value: fmtNumber(items.length), color: "#7B1FA2" }
          ];
        }
        default:
          return [];
      }
    }
    function getChartData(reportId, d) {
      if (!d) return void 0;
      switch (reportId) {
        case "daily-revenue": {
          const rows = Array.isArray(d) ? d : [];
          if (!rows.length) return void 0;
          return {
            type: "bar",
            title: "Revenue Trend",
            labels: rows.map((r) => fmtDate(r.date)),
            datasets: [
              { label: "Revenue", data: rows.map((r) => Number(r.revenue) || 0), color: [25, 118, 210] },
              { label: "Cost", data: rows.map((r) => Number(r.cost) || 0), color: [198, 40, 40] },
              { label: "Profit", data: rows.map((r) => Number(r.profit) || 0), color: [46, 125, 50] }
            ]
          };
        }
        case "payment-methods": {
          const rows = Array.isArray(d) ? d : [];
          if (!rows.length) return void 0;
          return {
            type: "donut",
            title: "Payment Method Distribution",
            segments: rows.map((r, i) => ({
              label: r.method || "Unknown",
              value: Number(r.total) || 0,
              color: colorAt(i)
            }))
          };
        }
        case "sales-by-product": {
          const rows = (Array.isArray(d) ? d : []).slice(0, 10);
          if (!rows.length) return void 0;
          return {
            type: "hbar",
            title: "Top 10 Products by Revenue",
            hbarItems: rows.map((r, i) => ({
              label: r.product || "",
              value: Number(r.revenue) || 0,
              color: colorAt(i)
            }))
          };
        }
        case "sales-by-category": {
          const rows = Array.isArray(d) ? d : [];
          if (!rows.length) return void 0;
          return {
            type: "donut",
            title: "Revenue by Category",
            segments: rows.map((r, i) => ({
              label: r.category || "Uncategorized",
              value: Number(r.revenue) || 0,
              color: colorAt(i)
            }))
          };
        }
        case "sales-by-branch": {
          const rows = (Array.isArray(d) ? d : []).slice(0, 10);
          if (!rows.length) return void 0;
          return {
            type: "hbar",
            title: "Sales by Branch",
            hbarItems: rows.map((r, i) => ({
              label: r.branch || "",
              value: Number(r.total_sales) || 0,
              color: colorAt(i)
            }))
          };
        }
        case "sales-by-cashier": {
          const rows = (Array.isArray(d) ? d : []).slice(0, 10);
          if (!rows.length) return void 0;
          return {
            type: "hbar",
            title: "Sales by Cashier",
            hbarItems: rows.map((r, i) => ({
              label: r.cashier || "",
              value: Number(r.total_sales) || 0,
              color: colorAt(i)
            }))
          };
        }
        case "top-customers": {
          const rows = (Array.isArray(d) ? d : []).slice(0, 10);
          if (!rows.length) return void 0;
          return {
            type: "hbar",
            title: "Top 10 Customers",
            hbarItems: rows.map((r, i) => ({
              label: r.customer || "Walk-in",
              value: Number(r.total_spent) || 0,
              color: colorAt(i)
            }))
          };
        }
        case "hourly-sales": {
          const rows = Array.isArray(d) ? d : [];
          if (!rows.length) return void 0;
          return {
            type: "bar",
            title: "Hourly Sales Distribution",
            labels: rows.map((r) => `${r.hour}:00`),
            datasets: [
              { label: "Revenue", data: rows.map((r) => Number(r.revenue) || 0), color: [25, 118, 210] }
            ]
          };
        }
        case "time-of-day": {
          const rows = d.ranges || [];
          if (!rows.length) return void 0;
          return {
            type: "bar",
            title: "Revenue and Transactions by Time of Day",
            labels: rows.map((r) => r.label || ""),
            datasets: [
              { label: "Revenue", data: rows.map((r) => Number(r.revenue) || 0), color: [25, 118, 210] },
              { label: "Transactions", data: rows.map((r) => Number(r.transactions) || 0), color: [255, 167, 38] }
            ]
          };
        }
        case "revenue-trend": {
          const rows = d.trend || [];
          if (!rows.length) return void 0;
          return {
            type: "bar",
            title: "Daily Revenue vs Cost",
            labels: rows.map((r) => r.date || ""),
            datasets: [
              { label: "Revenue", data: rows.map((r) => Number(r.revenue) || 0), color: [25, 118, 210] },
              { label: "Cost", data: rows.map((r) => Number(r.cost) || 0), color: [244, 67, 54] }
            ]
          };
        }
        case "weekday-sales": {
          const rows = Array.isArray(d) ? d : [];
          if (!rows.length) return void 0;
          return {
            type: "bar",
            title: "Revenue by Weekday",
            labels: rows.map((r) => r.name || ""),
            datasets: [
              { label: "Revenue", data: rows.map((r) => Number(r.revenue) || 0), color: [25, 118, 210] },
              { label: "Avg Revenue", data: rows.map((r) => Number(r.avg_revenue) || 0), color: [255, 152, 0] }
            ]
          };
        }
        case "profit-margin": {
          const rows = (Array.isArray(d) ? d : []).slice(0, 10);
          if (!rows.length) return void 0;
          return {
            type: "hbar",
            title: "Top 10 Products by Margin",
            hbarItems: rows.map((r, i) => ({
              label: r.product || "",
              value: Number(r.margin) || 0,
              color: colorAt(i)
            })).sort((a, b) => b.value - a.value)
          };
        }
        case "category-analytics": {
          const rows = (d.categories || []).slice(0, 10);
          if (!rows.length) return void 0;
          return {
            type: "hbar",
            title: "Top Categories by Revenue",
            hbarItems: rows.map((r, i) => ({
              label: r.category || "",
              value: Number(r.revenue) || 0,
              color: colorAt(i)
            }))
          };
        }
        case "product-analytics": {
          const rows = (d.abc_analysis || d.top_products || []).slice(0, 10);
          if (!rows.length) return void 0;
          return {
            type: "hbar",
            title: "Top 10 Products by Revenue",
            hbarItems: rows.map((r, i) => ({
              label: r.product || "",
              value: Number(r.revenue) || 0,
              color: colorAt(i)
            }))
          };
        }
        default:
          return void 0;
      }
    }
    const reportChartData = computed(() => {
      if (!reportData.value) return void 0;
      return getChartData(activeReport.value, reportData.value);
    });
    function getSecondaryCharts(reportId, d) {
      if (!d) return [];
      const charts = [];
      switch (reportId) {
        case "product-analytics": {
          const abcRows = d.abc_analysis || [];
          const abcCounts = { A: 0, B: 0, C: 0 };
          for (const r of abcRows) {
            if (r.abc_class) abcCounts[r.abc_class] = (abcCounts[r.abc_class] || 0) + 1;
          }
          if (abcCounts.A || abcCounts.B || abcCounts.C) {
            charts.push({
              type: "donut",
              title: "ABC Classification",
              segments: [
                { label: `Class A (${abcCounts.A})`, value: abcCounts.A, color: "#2E7D32" },
                { label: `Class B (${abcCounts.B})`, value: abcCounts.B, color: "#FF9800" },
                { label: `Class C (${abcCounts.C})`, value: abcCounts.C, color: "#F44336" }
              ]
            });
          }
          break;
        }
        case "category-analytics": {
          const cats = (d.categories || []).slice(0, 8);
          if (cats.length) {
            charts.push({
              type: "donut",
              title: "Revenue Share by Category",
              segments: cats.map((r, i) => ({
                label: r.category || "",
                value: Number(r.revenue) || 0,
                color: colorAt(i)
              }))
            });
          }
          break;
        }
      }
      return charts;
    }
    const reportCharts = computed(() => {
      if (!reportData.value) return [];
      return getSecondaryCharts(activeReport.value, reportData.value);
    });
    function normalizeItems(reportId, d) {
      if (!d) return [];
      switch (reportId) {
        case "product-analytics":
          return d.abc_analysis || d.top_products || [];
        case "category-analytics":
          return d.categories || [];
        case "time-of-day":
          return d.ranges || [];
        case "revenue-trend":
          return d.trend || [];
        case "peak-hours-heatmap":
          return [];
        case "sales-growth":
          return [];
        default:
          return Array.isArray(d) ? d : [d];
      }
    }
    const tableItems = computed(() => normalizeItems(activeReport.value, reportData.value));
    const showTable = computed(() => {
      if (activeReport.value === "peak-hours-heatmap" || activeReport.value === "sales-growth") return false;
      return reportData.value && (!Array.isArray(tableItems.value) || tableItems.value.length > 0);
    });
    const showHeatmap = computed(() => activeReport.value === "peak-hours-heatmap" && reportData.value?.grid);
    const showGrowthCard = computed(() => activeReport.value === "sales-growth" && reportData.value);
    function dateRange() {
      const today = /* @__PURE__ */ new Date();
      const fmt = (d) => d.toISOString().split("T")[0];
      switch (preset.value) {
        case "today":
          return { date_from: fmt(today), date_to: fmt(today) };
        case "yesterday": {
          const y = new Date(today);
          y.setDate(y.getDate() - 1);
          return { date_from: fmt(y), date_to: fmt(y) };
        }
        case "7": {
          const start = new Date(today);
          start.setDate(start.getDate() - 6);
          return { date_from: fmt(start), date_to: fmt(today) };
        }
        case "30": {
          const start = new Date(today);
          start.setDate(start.getDate() - 29);
          return { date_from: fmt(start), date_to: fmt(today) };
        }
        case "month": {
          const start = new Date(today.getFullYear(), today.getMonth(), 1);
          return { date_from: fmt(start), date_to: fmt(today) };
        }
        case "lastmonth": {
          const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const end = new Date(today.getFullYear(), today.getMonth(), 0);
          return { date_from: fmt(start), date_to: fmt(end) };
        }
        case "year": {
          const start = new Date(today.getFullYear(), 0, 1);
          return { date_from: fmt(start), date_to: fmt(today) };
        }
        case "custom":
          return { date_from: customFrom.value, date_to: customTo.value };
        default:
          return { date_from: "", date_to: "" };
      }
    }
    function onPresetChange() {
      if (preset.value === "custom") return;
      loadActive();
    }
    const maxRevenue = computed(() => {
      if (!Array.isArray(reportData.value)) return 0;
      const max = reportData.value.reduce((m, d) => Math.max(m, Math.max(
        Number(d.revenue) || 0,
        Number(d.cost) || 0,
        Number(d.profit) || 0
      )), 0);
      return max || 1;
    });
    function barHeight(val, max) {
      const v = Number(String(val)) || 0;
      const pct = max > 0 ? Math.max(2, v / max * 100) : 0;
      return `${pct}%`;
    }
    function fmtDateShort(d) {
      if (!d) return "";
      const dt = new Date(d);
      return dt.toLocaleDateString("en", { day: "2-digit", month: "short" });
    }
    const exportMenu = ref(false);
    async function doExport(format) {
      exportMenu.value = false;
      const { date_from, date_to } = dateRange();
      const reportLabel = reports2.find((r) => r.id === activeReport.value)?.label || "Report";
      await exportReport(format, {
        reportId: activeReport.value,
        reportLabel,
        items: tableItems.value,
        columns: reportColumns.value,
        kpis: reportKpis.value.length ? reportKpis.value : void 0,
        chartData: reportChartData.value,
        charts: reportCharts.value.length ? reportCharts.value : void 0,
        dateFrom: date_from,
        dateTo: date_to
      });
    }
    const generalDialog = ref(false);
    const generalReportIds = ref(reports2.map((r) => r.id));
    const generalLoading = ref(false);
    const generalError = ref(null);
    computed(() => {
      return reports2.filter((r) => r.id !== "sales-summary" && r.id !== "peak-hours-heatmap" && r.id !== "sales-growth" && r.id !== "time-of-day" && r.id !== "revenue-trend");
    });
    computed(() => {
      return reports2.filter((r) => r.id !== "peak-hours-heatmap" && r.id !== "sales-growth" && r.id !== "sales-summary" && r.id !== "tax-collected" && r.id !== "time-of-day" && r.id !== "revenue-trend");
    });
    function selectAllReports() {
      generalReportIds.value = reports2.map((r) => r.id);
    }
    function deselectAllReports() {
      generalReportIds.value = [];
    }
    function toggleReport(id) {
      const idx = generalReportIds.value.indexOf(id);
      if (idx >= 0) generalReportIds.value.splice(idx, 1);
      else generalReportIds.value.push(id);
    }
    function isReportSelected(id) {
      return generalReportIds.value.includes(id);
    }
    async function generateGeneralReport() {
      if (!generalReportIds.value.length) {
        generalError.value = "Select at least one report section.";
        return;
      }
      generalError.value = null;
      generalLoading.value = true;
      const { date_from, date_to } = dateRange();
      const params = {};
      if (date_from) params.date_from = date_from;
      if (date_to) params.date_to = date_to;
      if (branchFilter.value) params.branch = branchFilter.value;
      const query = new URLSearchParams(params).toString();
      const sections = [];
      for (const rptId of generalReportIds.value) {
        try {
          const url = `/reports/${rptId}/${query ? `?${query}` : ""}`;
          const data = await api(url);
          const label = reports2.find((r) => r.id === rptId)?.label || rptId;
          const items = normalizeItems(rptId, data);
          const columns = getColumns(rptId);
          const kpis = getKpis(rptId, data);
          const chartData = getChartData(rptId, data);
          const charts = getSecondaryCharts(rptId, data);
          sections.push({
            reportId: rptId,
            reportLabel: label,
            items,
            columns,
            kpis: kpis.length ? kpis : void 0,
            chartData,
            charts: charts.length ? charts : void 0
          });
        } catch (e) {
          console.warn(`Failed to load ${rptId} for general report:`, e);
        }
      }
      generalLoading.value = false;
      if (!sections.length) {
        generalError.value = "No data could be loaded for the selected reports.";
        return;
      }
      generalDialog.value = false;
      await exportGeneralReport(sections, { dateFrom: date_from, dateTo: date_to });
    }
    async function loadActive() {
      loading.value = true;
      error.value = null;
      reportData.value = null;
      try {
        const { date_from, date_to } = dateRange();
        const params = {};
        if (date_from) params.date_from = date_from;
        if (date_to) params.date_to = date_to;
        if (branchFilter.value) params.branch = branchFilter.value;
        const query = new URLSearchParams(params).toString();
        const url = `/reports/${activeReport.value}/${query ? `?${query}` : ""}`;
        reportData.value = await api(url);
      } catch (e) {
        error.value = e?.data?.detail || e.message || "Failed to load report.";
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReportsChart = __nuxt_component_0;
      _push(ssrRenderComponent(VContainer, mergeProps({
        fluid: "",
        class: "pa-4 pa-md-6",
        style: { "max-width": "1600px" }
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="d-flex align-center mb-4 flex-wrap ga-2" data-v-1bb0b6d4${_scopeId}>`);
            _push2(ssrRenderComponent(VIcon, {
              class: "mr-1",
              color: "primary"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`mdi-chart-box-outline`);
                } else {
                  return [
                    createTextVNode("mdi-chart-box-outline")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<h1 class="text-h5 font-weight-bold" data-v-1bb0b6d4${_scopeId}>Reports</h1>`);
            _push2(ssrRenderComponent(VChip, {
              size: "small",
              variant: "tonal",
              color: "primary",
              class: "ml-1"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(reports2.find((r) => r.id === unref(activeReport))?.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(reports2.find((r) => r.id === unref(activeReport))?.label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VSpacer, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              variant: "tonal",
              color: "primary",
              "prepend-icon": "mdi-file-document-multiple-outline",
              onClick: ($event) => generalDialog.value = true
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` General Report `);
                } else {
                  return [
                    createTextVNode(" General Report ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VMenu, {
              modelValue: unref(exportMenu),
              "onUpdate:modelValue": ($event) => isRef(exportMenu) ? exportMenu.value = $event : null,
              "close-on-content-click": false,
              location: "bottom end"
            }, {
              activator: withCtx(({ props: menuProps }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VBtn, mergeProps(menuProps, {
                    variant: "flat",
                    color: "primary",
                    "prepend-icon": "mdi-download",
                    disabled: !unref(reportData) || unref(exporting),
                    loading: unref(exporting)
                  }), {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Export `);
                        _push4(ssrRenderComponent(VIcon, { end: "" }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`mdi-chevron-down`);
                            } else {
                              return [
                                createTextVNode("mdi-chevron-down")
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createTextVNode(" Export "),
                          createVNode(VIcon, { end: "" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-chevron-down")
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VBtn, mergeProps(menuProps, {
                      variant: "flat",
                      color: "primary",
                      "prepend-icon": "mdi-download",
                      disabled: !unref(reportData) || unref(exporting),
                      loading: unref(exporting)
                    }), {
                      default: withCtx(() => [
                        createTextVNode(" Export "),
                        createVNode(VIcon, { end: "" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-chevron-down")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 16, ["disabled", "loading"])
                  ];
                }
              }),
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCard, {
                    "min-width": "240",
                    rounded: "lg"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VList, { density: "comfortable" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VListItem, {
                                "prepend-icon": "mdi-file-pdf-box",
                                title: "PDF Report",
                                subtitle: "Designed with header and charts",
                                onClick: ($event) => doExport("pdf")
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VListItem, {
                                "prepend-icon": "mdi-file-excel",
                                title: "Excel Spreadsheet",
                                subtitle: "Styled .xlsx workbook",
                                onClick: ($event) => doExport("excel")
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VListItem, {
                                "prepend-icon": "mdi-file-delimited",
                                title: "CSV File",
                                subtitle: "Plain text data",
                                onClick: ($event) => doExport("csv")
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VListItem, {
                                  "prepend-icon": "mdi-file-pdf-box",
                                  title: "PDF Report",
                                  subtitle: "Designed with header and charts",
                                  onClick: ($event) => doExport("pdf")
                                }, null, 8, ["onClick"]),
                                createVNode(VListItem, {
                                  "prepend-icon": "mdi-file-excel",
                                  title: "Excel Spreadsheet",
                                  subtitle: "Styled .xlsx workbook",
                                  onClick: ($event) => doExport("excel")
                                }, null, 8, ["onClick"]),
                                createVNode(VListItem, {
                                  "prepend-icon": "mdi-file-delimited",
                                  title: "CSV File",
                                  subtitle: "Plain text data",
                                  onClick: ($event) => doExport("csv")
                                }, null, 8, ["onClick"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VList, { density: "comfortable" }, {
                            default: withCtx(() => [
                              createVNode(VListItem, {
                                "prepend-icon": "mdi-file-pdf-box",
                                title: "PDF Report",
                                subtitle: "Designed with header and charts",
                                onClick: ($event) => doExport("pdf")
                              }, null, 8, ["onClick"]),
                              createVNode(VListItem, {
                                "prepend-icon": "mdi-file-excel",
                                title: "Excel Spreadsheet",
                                subtitle: "Styled .xlsx workbook",
                                onClick: ($event) => doExport("excel")
                              }, null, 8, ["onClick"]),
                              createVNode(VListItem, {
                                "prepend-icon": "mdi-file-delimited",
                                title: "CSV File",
                                subtitle: "Plain text data",
                                onClick: ($event) => doExport("csv")
                              }, null, 8, ["onClick"])
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCard, {
                      "min-width": "240",
                      rounded: "lg"
                    }, {
                      default: withCtx(() => [
                        createVNode(VList, { density: "comfortable" }, {
                          default: withCtx(() => [
                            createVNode(VListItem, {
                              "prepend-icon": "mdi-file-pdf-box",
                              title: "PDF Report",
                              subtitle: "Designed with header and charts",
                              onClick: ($event) => doExport("pdf")
                            }, null, 8, ["onClick"]),
                            createVNode(VListItem, {
                              "prepend-icon": "mdi-file-excel",
                              title: "Excel Spreadsheet",
                              subtitle: "Styled .xlsx workbook",
                              onClick: ($event) => doExport("excel")
                            }, null, 8, ["onClick"]),
                            createVNode(VListItem, {
                              "prepend-icon": "mdi-file-delimited",
                              title: "CSV File",
                              subtitle: "Plain text data",
                              onClick: ($event) => doExport("csv")
                            }, null, 8, ["onClick"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VBtn, {
              variant: "tonal",
              "prepend-icon": "mdi-refresh",
              loading: unref(loading),
              onClick: loadActive
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Refresh`);
                } else {
                  return [
                    createTextVNode("Refresh")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (unref(error)) {
              _push2(ssrRenderComponent(VAlert, {
                type: "error",
                variant: "tonal",
                class: "mb-4",
                closable: "",
                "onClick:close": ($event) => error.value = null
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(error))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(error)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(VCard, {
              rounded: "lg",
              class: "pa-3 mb-4"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="d-flex flex-wrap align-center ga-3" data-v-1bb0b6d4${_scopeId2}>`);
                  _push3(ssrRenderComponent(VIcon, { class: "mr-1" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`mdi-filter-variant`);
                      } else {
                        return [
                          createTextVNode("mdi-filter-variant")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<span class="text-subtitle-2" data-v-1bb0b6d4${_scopeId2}>Filters:</span>`);
                  _push3(ssrRenderComponent(VChipGroup, {
                    modelValue: unref(preset),
                    "onUpdate:modelValue": [($event) => isRef(preset) ? preset.value = $event : null, onPresetChange],
                    "selected-class": "text-primary"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<!--[-->`);
                        ssrRenderList(presets, (p) => {
                          _push4(ssrRenderComponent(VChip, {
                            key: p.value,
                            value: p.value,
                            size: "small",
                            variant: "tonal"
                          }, {
                            default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`${ssrInterpolate(p.label)}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(p.label), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        });
                        _push4(`<!--]-->`);
                      } else {
                        return [
                          (openBlock(), createBlock(Fragment, null, renderList(presets, (p) => {
                            return createVNode(VChip, {
                              key: p.value,
                              value: p.value,
                              size: "small",
                              variant: "tonal"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(p.label), 1)
                              ]),
                              _: 2
                            }, 1032, ["value"]);
                          }), 64))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (unref(preset) === "custom") {
                    _push3(`<!--[-->`);
                    _push3(ssrRenderComponent(VTextField, {
                      modelValue: unref(customFrom),
                      "onUpdate:modelValue": [($event) => isRef(customFrom) ? customFrom.value = $event : null, loadActive],
                      label: "From",
                      type: "date",
                      density: "compact",
                      variant: "outlined",
                      "hide-details": "",
                      style: { "max-width": "170px" },
                      class: "mr-2"
                    }, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(VTextField, {
                      modelValue: unref(customTo),
                      "onUpdate:modelValue": [($event) => isRef(customTo) ? customTo.value = $event : null, loadActive],
                      label: "To",
                      type: "date",
                      density: "compact",
                      variant: "outlined",
                      "hide-details": "",
                      style: { "max-width": "170px" },
                      class: "mr-2"
                    }, null, _parent3, _scopeId2));
                    _push3(`<!--]-->`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(VSpacer, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(VSelect, {
                    modelValue: unref(branchFilter),
                    "onUpdate:modelValue": [($event) => isRef(branchFilter) ? branchFilter.value = $event : null, loadActive],
                    items: unref(branchOptions),
                    "item-title": "name",
                    "item-value": "id",
                    label: "Branch",
                    density: "compact",
                    variant: "outlined",
                    "hide-details": "",
                    clearable: "",
                    style: { "max-width": "200px" }
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "d-flex flex-wrap align-center ga-3" }, [
                      createVNode(VIcon, { class: "mr-1" }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-filter-variant")
                        ]),
                        _: 1
                      }),
                      createVNode("span", { class: "text-subtitle-2" }, "Filters:"),
                      createVNode(VChipGroup, {
                        modelValue: unref(preset),
                        "onUpdate:modelValue": [($event) => isRef(preset) ? preset.value = $event : null, onPresetChange],
                        "selected-class": "text-primary"
                      }, {
                        default: withCtx(() => [
                          (openBlock(), createBlock(Fragment, null, renderList(presets, (p) => {
                            return createVNode(VChip, {
                              key: p.value,
                              value: p.value,
                              size: "small",
                              variant: "tonal"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(p.label), 1)
                              ]),
                              _: 2
                            }, 1032, ["value"]);
                          }), 64))
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"]),
                      unref(preset) === "custom" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createVNode(VTextField, {
                          modelValue: unref(customFrom),
                          "onUpdate:modelValue": [($event) => isRef(customFrom) ? customFrom.value = $event : null, loadActive],
                          label: "From",
                          type: "date",
                          density: "compact",
                          variant: "outlined",
                          "hide-details": "",
                          style: { "max-width": "170px" },
                          class: "mr-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                        createVNode(VTextField, {
                          modelValue: unref(customTo),
                          "onUpdate:modelValue": [($event) => isRef(customTo) ? customTo.value = $event : null, loadActive],
                          label: "To",
                          type: "date",
                          density: "compact",
                          variant: "outlined",
                          "hide-details": "",
                          style: { "max-width": "170px" },
                          class: "mr-2"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ], 64)) : createCommentVNode("", true),
                      createVNode(VSpacer),
                      createVNode(VSelect, {
                        modelValue: unref(branchFilter),
                        "onUpdate:modelValue": [($event) => isRef(branchFilter) ? branchFilter.value = $event : null, loadActive],
                        items: unref(branchOptions),
                        "item-title": "name",
                        "item-value": "id",
                        label: "Branch",
                        density: "compact",
                        variant: "outlined",
                        "hide-details": "",
                        clearable: "",
                        style: { "max-width": "200px" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VCard, {
              rounded: "lg",
              class: "mb-4 overflow-hidden"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VTabs, {
                    modelValue: unref(activeReport),
                    "onUpdate:modelValue": [($event) => isRef(activeReport) ? activeReport.value = $event : null, loadActive],
                    "show-arrows": ""
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<!--[-->`);
                        ssrRenderList(unref(groupedTabs), (grp) => {
                          _push4(`<!--[--><!--[-->`);
                          ssrRenderList(grp.tabs, (r) => {
                            _push4(ssrRenderComponent(VTab, {
                              key: r.id,
                              value: r.id,
                              "prepend-icon": r.icon,
                              slim: false
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`${ssrInterpolate(r.short)}`);
                                } else {
                                  return [
                                    createTextVNode(toDisplayString(r.short), 1)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          });
                          _push4(`<!--]--><!--]-->`);
                        });
                        _push4(`<!--]-->`);
                      } else {
                        return [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(groupedTabs), (grp) => {
                            return openBlock(), createBlock(Fragment, {
                              key: grp.group
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(grp.tabs, (r) => {
                                return openBlock(), createBlock(VTab, {
                                  key: r.id,
                                  value: r.id,
                                  "prepend-icon": r.icon,
                                  slim: false
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(r.short), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["value", "prepend-icon"]);
                              }), 128))
                            ], 64);
                          }), 128))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VTabs, {
                      modelValue: unref(activeReport),
                      "onUpdate:modelValue": [($event) => isRef(activeReport) ? activeReport.value = $event : null, loadActive],
                      "show-arrows": ""
                    }, {
                      default: withCtx(() => [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(groupedTabs), (grp) => {
                          return openBlock(), createBlock(Fragment, {
                            key: grp.group
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(grp.tabs, (r) => {
                              return openBlock(), createBlock(VTab, {
                                key: r.id,
                                value: r.id,
                                "prepend-icon": r.icon,
                                slim: false
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(r.short), 1)
                                ]),
                                _: 2
                              }, 1032, ["value", "prepend-icon"]);
                            }), 128))
                          ], 64);
                        }), 128))
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (unref(loading)) {
              _push2(ssrRenderComponent(VProgressLinear, {
                indeterminate: "",
                color: "primary",
                class: "mb-4"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (unref(reportKpis).length && unref(reportData)) {
              _push2(`<div class="mb-4" data-v-1bb0b6d4${_scopeId}>`);
              _push2(ssrRenderComponent(VRow, { density: "comfortable" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<!--[-->`);
                    ssrRenderList(unref(reportKpis), (kpi, i) => {
                      _push3(ssrRenderComponent(VCol, {
                        key: i,
                        cols: "12",
                        sm: "6",
                        md: "3",
                        lg: "2"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(VCard, {
                              rounded: "lg",
                              class: "pa-4 h-100 kpi-card"
                            }, {
                              default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  _push5(`<div class="d-flex align-center justify-space-between mb-1" data-v-1bb0b6d4${_scopeId4}><div class="text-caption text-medium-emphasis" data-v-1bb0b6d4${_scopeId4}>${ssrInterpolate(kpi.label)}</div><div class="kpi-card__dot" style="${ssrRenderStyle({ background: kpi.color || "#1976D2" })}" data-v-1bb0b6d4${_scopeId4}></div></div><div class="text-h5 font-weight-bold" style="${ssrRenderStyle({ color: kpi.color })}" data-v-1bb0b6d4${_scopeId4}>${ssrInterpolate(kpi.value)}</div>`);
                                } else {
                                  return [
                                    createVNode("div", { class: "d-flex align-center justify-space-between mb-1" }, [
                                      createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(kpi.label), 1),
                                      createVNode("div", {
                                        class: "kpi-card__dot",
                                        style: { background: kpi.color || "#1976D2" }
                                      }, null, 4)
                                    ]),
                                    createVNode("div", {
                                      class: "text-h5 font-weight-bold",
                                      style: { color: kpi.color }
                                    }, toDisplayString(kpi.value), 5)
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(VCard, {
                                rounded: "lg",
                                class: "pa-4 h-100 kpi-card"
                              }, {
                                default: withCtx(() => [
                                  createVNode("div", { class: "d-flex align-center justify-space-between mb-1" }, [
                                    createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(kpi.label), 1),
                                    createVNode("div", {
                                      class: "kpi-card__dot",
                                      style: { background: kpi.color || "#1976D2" }
                                    }, null, 4)
                                  ]),
                                  createVNode("div", {
                                    class: "text-h5 font-weight-bold",
                                    style: { color: kpi.color }
                                  }, toDisplayString(kpi.value), 5)
                                ]),
                                _: 2
                              }, 1024)
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    });
                    _push3(`<!--]-->`);
                  } else {
                    return [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(reportKpis), (kpi, i) => {
                        return openBlock(), createBlock(VCol, {
                          key: i,
                          cols: "12",
                          sm: "6",
                          md: "3",
                          lg: "2"
                        }, {
                          default: withCtx(() => [
                            createVNode(VCard, {
                              rounded: "lg",
                              class: "pa-4 h-100 kpi-card"
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "d-flex align-center justify-space-between mb-1" }, [
                                  createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(kpi.label), 1),
                                  createVNode("div", {
                                    class: "kpi-card__dot",
                                    style: { background: kpi.color || "#1976D2" }
                                  }, null, 4)
                                ]),
                                createVNode("div", {
                                  class: "text-h5 font-weight-bold",
                                  style: { color: kpi.color }
                                }, toDisplayString(kpi.value), 5)
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          _: 2
                        }, 1024);
                      }), 128))
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(showGrowthCard)) {
              _push2(ssrRenderComponent(VCard, {
                rounded: "lg",
                class: "mb-4 pa-6"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="d-flex align-center justify-space-between flex-wrap ga-4" data-v-1bb0b6d4${_scopeId2}><div data-v-1bb0b6d4${_scopeId2}><div class="text-caption text-medium-emphasis mb-1" data-v-1bb0b6d4${_scopeId2}>Sales Growth</div><div class="d-flex align-baseline ga-3" data-v-1bb0b6d4${_scopeId2}><span class="text-h3 font-weight-black" style="${ssrRenderStyle({ color: Number(unref(reportData).growth_pct) >= 0 ? "#2E7D32" : "#F44336" })}" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(Number(unref(reportData).growth_pct) >= 0 ? "+" : "")}${ssrInterpolate(Number(unref(reportData).growth_pct).toFixed(1))}% </span>`);
                    _push3(ssrRenderComponent(VIcon, {
                      color: Number(unref(reportData).growth_pct) >= 0 ? "success" : "error",
                      size: "32"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(Number(unref(reportData).growth_pct) >= 0 ? "mdi-trending-up" : "mdi-trending-down")}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(Number(unref(reportData).growth_pct) >= 0 ? "mdi-trending-up" : "mdi-trending-down"), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`</div><div class="text-body-2 text-medium-emphasis mt-2" data-v-1bb0b6d4${_scopeId2}> Current: <strong data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(unref(fmtCurrency)(unref(reportData).current_revenue))}</strong>  •  Previous: <strong data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(unref(fmtCurrency)(unref(reportData).previous_revenue))}</strong></div></div><div class="d-flex ga-4" data-v-1bb0b6d4${_scopeId2}><div class="text-center" data-v-1bb0b6d4${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, {
                      size: "40",
                      color: "primary"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-chart-line`);
                        } else {
                          return [
                            createTextVNode("mdi-chart-line")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<div class="text-h5 font-weight-bold mt-1" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(unref(fmtCurrency)(unref(reportData).current_revenue))}</div><div class="text-caption text-medium-emphasis" data-v-1bb0b6d4${_scopeId2}>Current Period</div></div><div class="text-center" data-v-1bb0b6d4${_scopeId2}>`);
                    _push3(ssrRenderComponent(VIcon, {
                      size: "40",
                      color: "grey-lighten-1"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-chart-line-variant`);
                        } else {
                          return [
                            createTextVNode("mdi-chart-line-variant")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<div class="text-h5 font-weight-bold mt-1" style="${ssrRenderStyle({ "color": "#607D8B" })}" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(unref(fmtCurrency)(unref(reportData).previous_revenue))}</div><div class="text-caption text-medium-emphasis" data-v-1bb0b6d4${_scopeId2}>Previous Period</div></div></div></div>`);
                  } else {
                    return [
                      createVNode("div", { class: "d-flex align-center justify-space-between flex-wrap ga-4" }, [
                        createVNode("div", null, [
                          createVNode("div", { class: "text-caption text-medium-emphasis mb-1" }, "Sales Growth"),
                          createVNode("div", { class: "d-flex align-baseline ga-3" }, [
                            createVNode("span", {
                              class: "text-h3 font-weight-black",
                              style: { color: Number(unref(reportData).growth_pct) >= 0 ? "#2E7D32" : "#F44336" }
                            }, toDisplayString(Number(unref(reportData).growth_pct) >= 0 ? "+" : "") + toDisplayString(Number(unref(reportData).growth_pct).toFixed(1)) + "% ", 5),
                            createVNode(VIcon, {
                              color: Number(unref(reportData).growth_pct) >= 0 ? "success" : "error",
                              size: "32"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(Number(unref(reportData).growth_pct) >= 0 ? "mdi-trending-up" : "mdi-trending-down"), 1)
                              ]),
                              _: 1
                            }, 8, ["color"])
                          ]),
                          createVNode("div", { class: "text-body-2 text-medium-emphasis mt-2" }, [
                            createTextVNode(" Current: "),
                            createVNode("strong", null, toDisplayString(unref(fmtCurrency)(unref(reportData).current_revenue)), 1),
                            createTextVNode("  •  Previous: "),
                            createVNode("strong", null, toDisplayString(unref(fmtCurrency)(unref(reportData).previous_revenue)), 1)
                          ])
                        ]),
                        createVNode("div", { class: "d-flex ga-4" }, [
                          createVNode("div", { class: "text-center" }, [
                            createVNode(VIcon, {
                              size: "40",
                              color: "primary"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-chart-line")
                              ]),
                              _: 1
                            }),
                            createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(unref(reportData).current_revenue)), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis" }, "Current Period")
                          ]),
                          createVNode("div", { class: "text-center" }, [
                            createVNode(VIcon, {
                              size: "40",
                              color: "grey-lighten-1"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-chart-line-variant")
                              ]),
                              _: 1
                            }),
                            createVNode("div", {
                              class: "text-h5 font-weight-bold mt-1",
                              style: { "color": "#607D8B" }
                            }, toDisplayString(unref(fmtCurrency)(unref(reportData).previous_revenue)), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis" }, "Previous Period")
                          ])
                        ])
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (unref(showHeatmap)) {
              _push2(ssrRenderComponent(VCard, {
                rounded: "lg",
                class: "mb-4 overflow-hidden"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="pa-4 pb-0" data-v-1bb0b6d4${_scopeId2}><div class="text-subtitle-2 font-weight-bold" data-v-1bb0b6d4${_scopeId2}>Peak Hours Heatmap</div><div class="text-caption text-medium-emphasis" data-v-1bb0b6d4${_scopeId2}>Revenue distribution by hour and day of week (blue = low, indigo = high)</div></div><div class="pa-4" data-v-1bb0b6d4${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_ReportsChart, {
                      type: "heatmap",
                      grid: unref(reportData).grid,
                      weekdays: unref(reportData).weekdays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                      "format-value": (v) => unref(fmtCurrency)(v)
                    }, null, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", { class: "pa-4 pb-0" }, [
                        createVNode("div", { class: "text-subtitle-2 font-weight-bold" }, "Peak Hours Heatmap"),
                        createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue distribution by hour and day of week (blue = low, indigo = high)")
                      ]),
                      createVNode("div", { class: "pa-4" }, [
                        createVNode(_component_ReportsChart, {
                          type: "heatmap",
                          grid: unref(reportData).grid,
                          weekdays: unref(reportData).weekdays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                          "format-value": (v) => unref(fmtCurrency)(v)
                        }, null, 8, ["grid", "weekdays", "format-value"])
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (unref(reportChartData) && unref(activeReport) === "daily-revenue" && unref(reportData) && Array.isArray(unref(reportData)) && unref(reportData).length) {
              _push2(ssrRenderComponent(VCard, {
                rounded: "lg",
                class: "mb-4 overflow-hidden"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="pa-4 pb-0" data-v-1bb0b6d4${_scopeId2}><div class="d-flex align-center justify-space-between flex-wrap ga-2" data-v-1bb0b6d4${_scopeId2}><div data-v-1bb0b6d4${_scopeId2}><div class="text-subtitle-2 font-weight-bold" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(unref(reportChartData).title || "Revenue Trend")}</div><div class="text-caption text-medium-emphasis" data-v-1bb0b6d4${_scopeId2}>Daily revenue, cost and profit over the selected period</div></div><div class="d-flex align-center ga-3" data-v-1bb0b6d4${_scopeId2}><div class="d-flex align-center ga-1" data-v-1bb0b6d4${_scopeId2}><div class="chart-legend-dot" style="${ssrRenderStyle({ "background": "#1976D2" })}" data-v-1bb0b6d4${_scopeId2}></div>Revenue</div><div class="d-flex align-center ga-1" data-v-1bb0b6d4${_scopeId2}><div class="chart-legend-dot" style="${ssrRenderStyle({ "background": "#C62828" })}" data-v-1bb0b6d4${_scopeId2}></div>Cost</div><div class="d-flex align-center ga-1" data-v-1bb0b6d4${_scopeId2}><div class="chart-legend-dot" style="${ssrRenderStyle({ "background": "#2E7D32" })}" data-v-1bb0b6d4${_scopeId2}></div>Profit</div></div></div></div><div class="chart-bars pa-4" data-v-1bb0b6d4${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(reportData), (d, i) => {
                      _push3(`<div class="chart-bar-col" data-v-1bb0b6d4${_scopeId2}><div class="chart-bar-stack" data-v-1bb0b6d4${_scopeId2}><div class="chart-bar chart-bar--revenue" style="${ssrRenderStyle({ height: barHeight(d.revenue, unref(maxRevenue)) })}"${ssrRenderAttr("title", `Revenue: ${unref(fmtCurrency)(d.revenue)}`)} data-v-1bb0b6d4${_scopeId2}></div><div class="chart-bar chart-bar--cost" style="${ssrRenderStyle({ height: barHeight(d.cost, unref(maxRevenue)) })}"${ssrRenderAttr("title", `Cost: ${unref(fmtCurrency)(d.cost)}`)} data-v-1bb0b6d4${_scopeId2}></div><div class="chart-bar chart-bar--profit" style="${ssrRenderStyle({ height: barHeight(d.profit, unref(maxRevenue)) })}"${ssrRenderAttr("title", `Profit: ${unref(fmtCurrency)(d.profit)}`)} data-v-1bb0b6d4${_scopeId2}></div></div><div class="chart-bar-label" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(fmtDateShort(d.date))}</div><div class="chart-bar-value" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(unref(fmtCurrency)(d.revenue))}</div></div>`);
                    });
                    _push3(`<!--]--></div>`);
                  } else {
                    return [
                      createVNode("div", { class: "pa-4 pb-0" }, [
                        createVNode("div", { class: "d-flex align-center justify-space-between flex-wrap ga-2" }, [
                          createVNode("div", null, [
                            createVNode("div", { class: "text-subtitle-2 font-weight-bold" }, toDisplayString(unref(reportChartData).title || "Revenue Trend"), 1),
                            createVNode("div", { class: "text-caption text-medium-emphasis" }, "Daily revenue, cost and profit over the selected period")
                          ]),
                          createVNode("div", { class: "d-flex align-center ga-3" }, [
                            createVNode("div", { class: "d-flex align-center ga-1" }, [
                              createVNode("div", {
                                class: "chart-legend-dot",
                                style: { "background": "#1976D2" }
                              }),
                              createTextVNode("Revenue")
                            ]),
                            createVNode("div", { class: "d-flex align-center ga-1" }, [
                              createVNode("div", {
                                class: "chart-legend-dot",
                                style: { "background": "#C62828" }
                              }),
                              createTextVNode("Cost")
                            ]),
                            createVNode("div", { class: "d-flex align-center ga-1" }, [
                              createVNode("div", {
                                class: "chart-legend-dot",
                                style: { "background": "#2E7D32" }
                              }),
                              createTextVNode("Profit")
                            ])
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "chart-bars pa-4" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(reportData), (d, i) => {
                          return openBlock(), createBlock("div", {
                            key: i,
                            class: "chart-bar-col"
                          }, [
                            createVNode("div", { class: "chart-bar-stack" }, [
                              createVNode("div", {
                                class: "chart-bar chart-bar--revenue",
                                style: { height: barHeight(d.revenue, unref(maxRevenue)) },
                                title: `Revenue: ${unref(fmtCurrency)(d.revenue)}`
                              }, null, 12, ["title"]),
                              createVNode("div", {
                                class: "chart-bar chart-bar--cost",
                                style: { height: barHeight(d.cost, unref(maxRevenue)) },
                                title: `Cost: ${unref(fmtCurrency)(d.cost)}`
                              }, null, 12, ["title"]),
                              createVNode("div", {
                                class: "chart-bar chart-bar--profit",
                                style: { height: barHeight(d.profit, unref(maxRevenue)) },
                                title: `Profit: ${unref(fmtCurrency)(d.profit)}`
                              }, null, 12, ["title"])
                            ]),
                            createVNode("div", { class: "chart-bar-label" }, toDisplayString(fmtDateShort(d.date)), 1),
                            createVNode("div", { class: "chart-bar-value" }, toDisplayString(unref(fmtCurrency)(d.revenue)), 1)
                          ]);
                        }), 128))
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (unref(reportChartData) && unref(activeReport) !== "daily-revenue" && unref(activeReport) !== "peak-hours-heatmap") {
              _push2(ssrRenderComponent(VCard, {
                rounded: "lg",
                class: "mb-4 overflow-hidden"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="pa-4 pb-0" data-v-1bb0b6d4${_scopeId2}><div class="text-subtitle-2 font-weight-bold" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(unref(reportChartData).title)}</div>`);
                    if (unref(reportChartData).subtitle) {
                      _push3(`<div class="text-caption text-medium-emphasis" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(unref(reportChartData).subtitle)}</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div><div class="pa-4" data-v-1bb0b6d4${_scopeId2}>`);
                    if (unref(reportChartData).type === "donut" && unref(reportChartData).segments) {
                      _push3(ssrRenderComponent(_component_ReportsChart, {
                        type: "donut",
                        segments: unref(reportChartData).segments,
                        "format-value": (v) => unref(fmtCurrency)(v)
                      }, null, _parent3, _scopeId2));
                    } else if (unref(reportChartData).type === "hbar" && unref(reportChartData).hbarItems) {
                      _push3(ssrRenderComponent(_component_ReportsChart, {
                        type: "hbar",
                        items: unref(reportChartData).hbarItems,
                        "format-value": (v) => unref(fmtCurrency)(v)
                      }, null, _parent3, _scopeId2));
                    } else if (unref(reportChartData).type === "bar" && unref(reportChartData).labels) {
                      _push3(ssrRenderComponent(_component_ReportsChart, {
                        type: "bar",
                        labels: unref(reportChartData).labels,
                        datasets: unref(reportChartData).datasets || [],
                        "format-value": (v) => unref(fmtCurrency)(v),
                        height: 240
                      }, null, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", { class: "pa-4 pb-0" }, [
                        createVNode("div", { class: "text-subtitle-2 font-weight-bold" }, toDisplayString(unref(reportChartData).title), 1),
                        unref(reportChartData).subtitle ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "text-caption text-medium-emphasis"
                        }, toDisplayString(unref(reportChartData).subtitle), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "pa-4" }, [
                        unref(reportChartData).type === "donut" && unref(reportChartData).segments ? (openBlock(), createBlock(_component_ReportsChart, {
                          key: 0,
                          type: "donut",
                          segments: unref(reportChartData).segments,
                          "format-value": (v) => unref(fmtCurrency)(v)
                        }, null, 8, ["segments", "format-value"])) : unref(reportChartData).type === "hbar" && unref(reportChartData).hbarItems ? (openBlock(), createBlock(_component_ReportsChart, {
                          key: 1,
                          type: "hbar",
                          items: unref(reportChartData).hbarItems,
                          "format-value": (v) => unref(fmtCurrency)(v)
                        }, null, 8, ["items", "format-value"])) : unref(reportChartData).type === "bar" && unref(reportChartData).labels ? (openBlock(), createBlock(_component_ReportsChart, {
                          key: 2,
                          type: "bar",
                          labels: unref(reportChartData).labels,
                          datasets: unref(reportChartData).datasets || [],
                          "format-value": (v) => unref(fmtCurrency)(v),
                          height: 240
                        }, null, 8, ["labels", "datasets", "format-value"])) : createCommentVNode("", true)
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--[-->`);
            ssrRenderList(unref(reportCharts), (ch, idx) => {
              _push2(ssrRenderComponent(VCard, {
                key: "sec-" + idx,
                rounded: "lg",
                class: "mb-4 overflow-hidden"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="pa-4 pb-0" data-v-1bb0b6d4${_scopeId2}><div class="text-subtitle-2 font-weight-bold" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(ch.title)}</div>`);
                    if (ch.subtitle) {
                      _push3(`<div class="text-caption text-medium-emphasis" data-v-1bb0b6d4${_scopeId2}>${ssrInterpolate(ch.subtitle)}</div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div><div class="pa-4" data-v-1bb0b6d4${_scopeId2}>`);
                    if (ch.type === "donut" && ch.segments) {
                      _push3(ssrRenderComponent(_component_ReportsChart, {
                        type: "donut",
                        segments: ch.segments,
                        "format-value": (v) => unref(fmtCurrency)(v)
                      }, null, _parent3, _scopeId2));
                    } else if (ch.type === "hbar" && ch.hbarItems) {
                      _push3(ssrRenderComponent(_component_ReportsChart, {
                        type: "hbar",
                        items: ch.hbarItems,
                        "format-value": (v) => unref(fmtCurrency)(v)
                      }, null, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", { class: "pa-4 pb-0" }, [
                        createVNode("div", { class: "text-subtitle-2 font-weight-bold" }, toDisplayString(ch.title), 1),
                        ch.subtitle ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "text-caption text-medium-emphasis"
                        }, toDisplayString(ch.subtitle), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "pa-4" }, [
                        ch.type === "donut" && ch.segments ? (openBlock(), createBlock(_component_ReportsChart, {
                          key: 0,
                          type: "donut",
                          segments: ch.segments,
                          "format-value": (v) => unref(fmtCurrency)(v)
                        }, null, 8, ["segments", "format-value"])) : ch.type === "hbar" && ch.hbarItems ? (openBlock(), createBlock(_component_ReportsChart, {
                          key: 1,
                          type: "hbar",
                          items: ch.hbarItems,
                          "format-value": (v) => unref(fmtCurrency)(v)
                        }, null, 8, ["items", "format-value"])) : createCommentVNode("", true)
                      ])
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]-->`);
            if (unref(showTable)) {
              _push2(ssrRenderComponent(VCard, { rounded: "lg" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VDataTable, {
                      items: unref(tableItems),
                      headers: unref(reportColumns).map((c) => ({ title: c.label, key: c.key, sortable: true })),
                      density: "comfortable",
                      hover: "",
                      "items-per-page": 15,
                      class: "elevation-1"
                    }, createSlots({ _: 2 }, [
                      renderList(unref(reportColumns).filter((c) => c.format === "currency"), (c) => {
                        return {
                          name: `item.${c.key}`,
                          fn: withCtx(({ item }, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`${ssrInterpolate(unref(fmtCurrency)(item[c.key]))}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(fmtCurrency)(item[c.key])), 1)
                              ];
                            }
                          })
                        };
                      }),
                      renderList(unref(reportColumns).filter((c) => c.format === "percent"), (c) => {
                        return {
                          name: `item.${c.key}`,
                          fn: withCtx(({ item }, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`${ssrInterpolate(unref(fmtPct)(item[c.key]))}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(fmtPct)(item[c.key])), 1)
                              ];
                            }
                          })
                        };
                      }),
                      renderList(unref(reportColumns).filter((c) => c.format === "number"), (c) => {
                        return {
                          name: `item.${c.key}`,
                          fn: withCtx(({ item }, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`${ssrInterpolate(unref(fmtNumber)(item[c.key]))}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(fmtNumber)(item[c.key])), 1)
                              ];
                            }
                          })
                        };
                      }),
                      renderList(unref(reportColumns).filter((c) => c.format === "date"), (c) => {
                        return {
                          name: `item.${c.key}`,
                          fn: withCtx(({ item }, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(`${ssrInterpolate(unref(fmtDate)(item[c.key]))}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(fmtDate)(item[c.key])), 1)
                              ];
                            }
                          })
                        };
                      })
                    ]), _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(VDataTable, {
                        items: unref(tableItems),
                        headers: unref(reportColumns).map((c) => ({ title: c.label, key: c.key, sortable: true })),
                        density: "comfortable",
                        hover: "",
                        "items-per-page": 15,
                        class: "elevation-1"
                      }, createSlots({ _: 2 }, [
                        renderList(unref(reportColumns).filter((c) => c.format === "currency"), (c) => {
                          return {
                            name: `item.${c.key}`,
                            fn: withCtx(({ item }) => [
                              createTextVNode(toDisplayString(unref(fmtCurrency)(item[c.key])), 1)
                            ])
                          };
                        }),
                        renderList(unref(reportColumns).filter((c) => c.format === "percent"), (c) => {
                          return {
                            name: `item.${c.key}`,
                            fn: withCtx(({ item }) => [
                              createTextVNode(toDisplayString(unref(fmtPct)(item[c.key])), 1)
                            ])
                          };
                        }),
                        renderList(unref(reportColumns).filter((c) => c.format === "number"), (c) => {
                          return {
                            name: `item.${c.key}`,
                            fn: withCtx(({ item }) => [
                              createTextVNode(toDisplayString(unref(fmtNumber)(item[c.key])), 1)
                            ])
                          };
                        }),
                        renderList(unref(reportColumns).filter((c) => c.format === "date"), (c) => {
                          return {
                            name: `item.${c.key}`,
                            fn: withCtx(({ item }) => [
                              createTextVNode(toDisplayString(unref(fmtDate)(item[c.key])), 1)
                            ])
                          };
                        })
                      ]), 1032, ["items", "headers"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (unref(reportData) && Array.isArray(unref(tableItems)) && unref(tableItems).length === 0 && !unref(loading) && !unref(showHeatmap) && !unref(showGrowthCard)) {
              _push2(ssrRenderComponent(VCard, {
                rounded: "lg",
                class: "text-center py-12"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(VIcon, {
                      size: "56",
                      color: "medium-emphasis",
                      class: "mb-3"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`mdi-file-document-outline`);
                        } else {
                          return [
                            createTextVNode("mdi-file-document-outline")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<div class="text-h6 font-weight-bold mb-1" data-v-1bb0b6d4${_scopeId2}>No data for this report</div><div class="text-body-2 text-medium-emphasis" data-v-1bb0b6d4${_scopeId2}>Try adjusting the date range or branch filter.</div>`);
                  } else {
                    return [
                      createVNode(VIcon, {
                        size: "56",
                        color: "medium-emphasis",
                        class: "mb-3"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("mdi-file-document-outline")
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "No data for this report"),
                      createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Try adjusting the date range or branch filter.")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(VDialog, {
              modelValue: unref(generalDialog),
              "onUpdate:modelValue": ($event) => isRef(generalDialog) ? generalDialog.value = $event : null,
              "max-width": "680",
              scrollable: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(VCard, { rounded: "lg" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(VToolbar, {
                          flat: "",
                          color: "primary",
                          density: "comfortable"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VIcon, { start: "" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`mdi-file-document-multiple-outline`);
                                  } else {
                                    return [
                                      createTextVNode("mdi-file-document-multiple-outline")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VToolbarTitle, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`Generate General Report`);
                                  } else {
                                    return [
                                      createTextVNode("Generate General Report")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VSpacer, null, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VBtn, {
                                icon: "mdi-close",
                                variant: "text",
                                onClick: ($event) => generalDialog.value = false
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VIcon, { start: "" }, {
                                  default: withCtx(() => [
                                    createTextVNode("mdi-file-document-multiple-outline")
                                  ]),
                                  _: 1
                                }),
                                createVNode(VToolbarTitle, null, {
                                  default: withCtx(() => [
                                    createTextVNode("Generate General Report")
                                  ]),
                                  _: 1
                                }),
                                createVNode(VSpacer),
                                createVNode(VBtn, {
                                  icon: "mdi-close",
                                  variant: "text",
                                  onClick: ($event) => generalDialog.value = false
                                }, null, 8, ["onClick"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCardText, { class: "pt-4" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              if (unref(generalError)) {
                                _push5(ssrRenderComponent(VAlert, {
                                  type: "error",
                                  variant: "tonal",
                                  class: "mb-4",
                                  closable: "",
                                  "onClick:close": ($event) => generalError.value = null
                                }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`${ssrInterpolate(unref(generalError))}`);
                                    } else {
                                      return [
                                        createTextVNode(toDisplayString(unref(generalError)), 1)
                                      ];
                                    }
                                  }),
                                  _: 1
                                }, _parent5, _scopeId4));
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`<div class="text-body-2 text-medium-emphasis mb-3" data-v-1bb0b6d4${_scopeId4}> Select which report sections to include in your general PDF. The report will use the current date range and branch filter. </div><div class="d-flex align-center mb-3 ga-2" data-v-1bb0b6d4${_scopeId4}>`);
                              _push5(ssrRenderComponent(VChip, {
                                size: "small",
                                variant: "tonal",
                                color: "primary",
                                "prepend-icon": "mdi-check-all",
                                onClick: selectAllReports
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(` Select All `);
                                  } else {
                                    return [
                                      createTextVNode(" Select All ")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VChip, {
                                size: "small",
                                variant: "tonal",
                                "prepend-icon": "mdi-close",
                                onClick: deselectAllReports
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(` Clear `);
                                  } else {
                                    return [
                                      createTextVNode(" Clear ")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VSpacer, null, null, _parent5, _scopeId4));
                              _push5(`<span class="text-caption text-medium-emphasis" data-v-1bb0b6d4${_scopeId4}>${ssrInterpolate(unref(generalReportIds).length)} of ${ssrInterpolate(reports2.length)} selected </span></div><!--[-->`);
                              ssrRenderList(unref(groupedTabs), (grp) => {
                                _push5(`<div class="mb-3" data-v-1bb0b6d4${_scopeId4}><div class="text-subtitle-2 font-weight-bold mb-1" data-v-1bb0b6d4${_scopeId4}>${ssrInterpolate(grp.group)}</div>`);
                                _push5(ssrRenderComponent(VRow, { density: "compact" }, {
                                  default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                    if (_push6) {
                                      _push6(`<!--[-->`);
                                      ssrRenderList(grp.tabs, (rpt) => {
                                        _push6(ssrRenderComponent(VCol, {
                                          key: rpt.id,
                                          cols: "12",
                                          sm: "6",
                                          md: "4"
                                        }, {
                                          default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                            if (_push7) {
                                              _push7(ssrRenderComponent(VCheckbox, {
                                                "model-value": isReportSelected(rpt.id),
                                                label: rpt.label,
                                                density: "compact",
                                                "hide-details": "",
                                                color: "primary",
                                                "onUpdate:modelValue": ($event) => toggleReport(rpt.id)
                                              }, null, _parent7, _scopeId6));
                                            } else {
                                              return [
                                                createVNode(VCheckbox, {
                                                  "model-value": isReportSelected(rpt.id),
                                                  label: rpt.label,
                                                  density: "compact",
                                                  "hide-details": "",
                                                  color: "primary",
                                                  "onUpdate:modelValue": ($event) => toggleReport(rpt.id)
                                                }, null, 8, ["model-value", "label", "onUpdate:modelValue"])
                                              ];
                                            }
                                          }),
                                          _: 2
                                        }, _parent6, _scopeId5));
                                      });
                                      _push6(`<!--]-->`);
                                    } else {
                                      return [
                                        (openBlock(true), createBlock(Fragment, null, renderList(grp.tabs, (rpt) => {
                                          return openBlock(), createBlock(VCol, {
                                            key: rpt.id,
                                            cols: "12",
                                            sm: "6",
                                            md: "4"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(VCheckbox, {
                                                "model-value": isReportSelected(rpt.id),
                                                label: rpt.label,
                                                density: "compact",
                                                "hide-details": "",
                                                color: "primary",
                                                "onUpdate:modelValue": ($event) => toggleReport(rpt.id)
                                              }, null, 8, ["model-value", "label", "onUpdate:modelValue"])
                                            ]),
                                            _: 2
                                          }, 1024);
                                        }), 128))
                                      ];
                                    }
                                  }),
                                  _: 2
                                }, _parent5, _scopeId4));
                                _push5(`</div>`);
                              });
                              _push5(`<!--]-->`);
                            } else {
                              return [
                                unref(generalError) ? (openBlock(), createBlock(VAlert, {
                                  key: 0,
                                  type: "error",
                                  variant: "tonal",
                                  class: "mb-4",
                                  closable: "",
                                  "onClick:close": ($event) => generalError.value = null
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(generalError)), 1)
                                  ]),
                                  _: 1
                                }, 8, ["onClick:close"])) : createCommentVNode("", true),
                                createVNode("div", { class: "text-body-2 text-medium-emphasis mb-3" }, " Select which report sections to include in your general PDF. The report will use the current date range and branch filter. "),
                                createVNode("div", { class: "d-flex align-center mb-3 ga-2" }, [
                                  createVNode(VChip, {
                                    size: "small",
                                    variant: "tonal",
                                    color: "primary",
                                    "prepend-icon": "mdi-check-all",
                                    onClick: selectAllReports
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Select All ")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VChip, {
                                    size: "small",
                                    variant: "tonal",
                                    "prepend-icon": "mdi-close",
                                    onClick: deselectAllReports
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(" Clear ")
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(VSpacer),
                                  createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(generalReportIds).length) + " of " + toDisplayString(reports2.length) + " selected ", 1)
                                ]),
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(groupedTabs), (grp) => {
                                  return openBlock(), createBlock("div", {
                                    key: grp.group,
                                    class: "mb-3"
                                  }, [
                                    createVNode("div", { class: "text-subtitle-2 font-weight-bold mb-1" }, toDisplayString(grp.group), 1),
                                    createVNode(VRow, { density: "compact" }, {
                                      default: withCtx(() => [
                                        (openBlock(true), createBlock(Fragment, null, renderList(grp.tabs, (rpt) => {
                                          return openBlock(), createBlock(VCol, {
                                            key: rpt.id,
                                            cols: "12",
                                            sm: "6",
                                            md: "4"
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(VCheckbox, {
                                                "model-value": isReportSelected(rpt.id),
                                                label: rpt.label,
                                                density: "compact",
                                                "hide-details": "",
                                                color: "primary",
                                                "onUpdate:modelValue": ($event) => toggleReport(rpt.id)
                                              }, null, 8, ["model-value", "label", "onUpdate:modelValue"])
                                            ]),
                                            _: 2
                                          }, 1024);
                                        }), 128))
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]);
                                }), 128))
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VDivider, null, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(VCardActions, { class: "pa-4" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(VSpacer, null, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VBtn, {
                                variant: "text",
                                onClick: ($event) => generalDialog.value = false
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`Cancel`);
                                  } else {
                                    return [
                                      createTextVNode("Cancel")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(VBtn, {
                                variant: "flat",
                                color: "primary",
                                "prepend-icon": "mdi-file-pdf-box",
                                loading: unref(generalLoading) || unref(exportingGeneral),
                                disabled: !unref(generalReportIds).length,
                                onClick: generateGeneralReport
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(` Generate PDF `);
                                  } else {
                                    return [
                                      createTextVNode(" Generate PDF ")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(VSpacer),
                                createVNode(VBtn, {
                                  variant: "text",
                                  onClick: ($event) => generalDialog.value = false
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Cancel")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"]),
                                createVNode(VBtn, {
                                  variant: "flat",
                                  color: "primary",
                                  "prepend-icon": "mdi-file-pdf-box",
                                  loading: unref(generalLoading) || unref(exportingGeneral),
                                  disabled: !unref(generalReportIds).length,
                                  onClick: generateGeneralReport
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Generate PDF ")
                                  ]),
                                  _: 1
                                }, 8, ["loading", "disabled"])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(VToolbar, {
                            flat: "",
                            color: "primary",
                            density: "comfortable"
                          }, {
                            default: withCtx(() => [
                              createVNode(VIcon, { start: "" }, {
                                default: withCtx(() => [
                                  createTextVNode("mdi-file-document-multiple-outline")
                                ]),
                                _: 1
                              }),
                              createVNode(VToolbarTitle, null, {
                                default: withCtx(() => [
                                  createTextVNode("Generate General Report")
                                ]),
                                _: 1
                              }),
                              createVNode(VSpacer),
                              createVNode(VBtn, {
                                icon: "mdi-close",
                                variant: "text",
                                onClick: ($event) => generalDialog.value = false
                              }, null, 8, ["onClick"])
                            ]),
                            _: 1
                          }),
                          createVNode(VCardText, { class: "pt-4" }, {
                            default: withCtx(() => [
                              unref(generalError) ? (openBlock(), createBlock(VAlert, {
                                key: 0,
                                type: "error",
                                variant: "tonal",
                                class: "mb-4",
                                closable: "",
                                "onClick:close": ($event) => generalError.value = null
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(generalError)), 1)
                                ]),
                                _: 1
                              }, 8, ["onClick:close"])) : createCommentVNode("", true),
                              createVNode("div", { class: "text-body-2 text-medium-emphasis mb-3" }, " Select which report sections to include in your general PDF. The report will use the current date range and branch filter. "),
                              createVNode("div", { class: "d-flex align-center mb-3 ga-2" }, [
                                createVNode(VChip, {
                                  size: "small",
                                  variant: "tonal",
                                  color: "primary",
                                  "prepend-icon": "mdi-check-all",
                                  onClick: selectAllReports
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Select All ")
                                  ]),
                                  _: 1
                                }),
                                createVNode(VChip, {
                                  size: "small",
                                  variant: "tonal",
                                  "prepend-icon": "mdi-close",
                                  onClick: deselectAllReports
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" Clear ")
                                  ]),
                                  _: 1
                                }),
                                createVNode(VSpacer),
                                createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(generalReportIds).length) + " of " + toDisplayString(reports2.length) + " selected ", 1)
                              ]),
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(groupedTabs), (grp) => {
                                return openBlock(), createBlock("div", {
                                  key: grp.group,
                                  class: "mb-3"
                                }, [
                                  createVNode("div", { class: "text-subtitle-2 font-weight-bold mb-1" }, toDisplayString(grp.group), 1),
                                  createVNode(VRow, { density: "compact" }, {
                                    default: withCtx(() => [
                                      (openBlock(true), createBlock(Fragment, null, renderList(grp.tabs, (rpt) => {
                                        return openBlock(), createBlock(VCol, {
                                          key: rpt.id,
                                          cols: "12",
                                          sm: "6",
                                          md: "4"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(VCheckbox, {
                                              "model-value": isReportSelected(rpt.id),
                                              label: rpt.label,
                                              density: "compact",
                                              "hide-details": "",
                                              color: "primary",
                                              "onUpdate:modelValue": ($event) => toggleReport(rpt.id)
                                            }, null, 8, ["model-value", "label", "onUpdate:modelValue"])
                                          ]),
                                          _: 2
                                        }, 1024);
                                      }), 128))
                                    ]),
                                    _: 2
                                  }, 1024)
                                ]);
                              }), 128))
                            ]),
                            _: 1
                          }),
                          createVNode(VDivider),
                          createVNode(VCardActions, { class: "pa-4" }, {
                            default: withCtx(() => [
                              createVNode(VSpacer),
                              createVNode(VBtn, {
                                variant: "text",
                                onClick: ($event) => generalDialog.value = false
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("Cancel")
                                ]),
                                _: 1
                              }, 8, ["onClick"]),
                              createVNode(VBtn, {
                                variant: "flat",
                                color: "primary",
                                "prepend-icon": "mdi-file-pdf-box",
                                loading: unref(generalLoading) || unref(exportingGeneral),
                                disabled: !unref(generalReportIds).length,
                                onClick: generateGeneralReport
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Generate PDF ")
                                ]),
                                _: 1
                              }, 8, ["loading", "disabled"])
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(VCard, { rounded: "lg" }, {
                      default: withCtx(() => [
                        createVNode(VToolbar, {
                          flat: "",
                          color: "primary",
                          density: "comfortable"
                        }, {
                          default: withCtx(() => [
                            createVNode(VIcon, { start: "" }, {
                              default: withCtx(() => [
                                createTextVNode("mdi-file-document-multiple-outline")
                              ]),
                              _: 1
                            }),
                            createVNode(VToolbarTitle, null, {
                              default: withCtx(() => [
                                createTextVNode("Generate General Report")
                              ]),
                              _: 1
                            }),
                            createVNode(VSpacer),
                            createVNode(VBtn, {
                              icon: "mdi-close",
                              variant: "text",
                              onClick: ($event) => generalDialog.value = false
                            }, null, 8, ["onClick"])
                          ]),
                          _: 1
                        }),
                        createVNode(VCardText, { class: "pt-4" }, {
                          default: withCtx(() => [
                            unref(generalError) ? (openBlock(), createBlock(VAlert, {
                              key: 0,
                              type: "error",
                              variant: "tonal",
                              class: "mb-4",
                              closable: "",
                              "onClick:close": ($event) => generalError.value = null
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(generalError)), 1)
                              ]),
                              _: 1
                            }, 8, ["onClick:close"])) : createCommentVNode("", true),
                            createVNode("div", { class: "text-body-2 text-medium-emphasis mb-3" }, " Select which report sections to include in your general PDF. The report will use the current date range and branch filter. "),
                            createVNode("div", { class: "d-flex align-center mb-3 ga-2" }, [
                              createVNode(VChip, {
                                size: "small",
                                variant: "tonal",
                                color: "primary",
                                "prepend-icon": "mdi-check-all",
                                onClick: selectAllReports
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Select All ")
                                ]),
                                _: 1
                              }),
                              createVNode(VChip, {
                                size: "small",
                                variant: "tonal",
                                "prepend-icon": "mdi-close",
                                onClick: deselectAllReports
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" Clear ")
                                ]),
                                _: 1
                              }),
                              createVNode(VSpacer),
                              createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(generalReportIds).length) + " of " + toDisplayString(reports2.length) + " selected ", 1)
                            ]),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(groupedTabs), (grp) => {
                              return openBlock(), createBlock("div", {
                                key: grp.group,
                                class: "mb-3"
                              }, [
                                createVNode("div", { class: "text-subtitle-2 font-weight-bold mb-1" }, toDisplayString(grp.group), 1),
                                createVNode(VRow, { density: "compact" }, {
                                  default: withCtx(() => [
                                    (openBlock(true), createBlock(Fragment, null, renderList(grp.tabs, (rpt) => {
                                      return openBlock(), createBlock(VCol, {
                                        key: rpt.id,
                                        cols: "12",
                                        sm: "6",
                                        md: "4"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(VCheckbox, {
                                            "model-value": isReportSelected(rpt.id),
                                            label: rpt.label,
                                            density: "compact",
                                            "hide-details": "",
                                            color: "primary",
                                            "onUpdate:modelValue": ($event) => toggleReport(rpt.id)
                                          }, null, 8, ["model-value", "label", "onUpdate:modelValue"])
                                        ]),
                                        _: 2
                                      }, 1024);
                                    }), 128))
                                  ]),
                                  _: 2
                                }, 1024)
                              ]);
                            }), 128))
                          ]),
                          _: 1
                        }),
                        createVNode(VDivider),
                        createVNode(VCardActions, { class: "pa-4" }, {
                          default: withCtx(() => [
                            createVNode(VSpacer),
                            createVNode(VBtn, {
                              variant: "text",
                              onClick: ($event) => generalDialog.value = false
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Cancel")
                              ]),
                              _: 1
                            }, 8, ["onClick"]),
                            createVNode(VBtn, {
                              variant: "flat",
                              color: "primary",
                              "prepend-icon": "mdi-file-pdf-box",
                              loading: unref(generalLoading) || unref(exportingGeneral),
                              disabled: !unref(generalReportIds).length,
                              onClick: generateGeneralReport
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Generate PDF ")
                              ]),
                              _: 1
                            }, 8, ["loading", "disabled"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("div", { class: "d-flex align-center mb-4 flex-wrap ga-2" }, [
                createVNode(VIcon, {
                  class: "mr-1",
                  color: "primary"
                }, {
                  default: withCtx(() => [
                    createTextVNode("mdi-chart-box-outline")
                  ]),
                  _: 1
                }),
                createVNode("h1", { class: "text-h5 font-weight-bold" }, "Reports"),
                createVNode(VChip, {
                  size: "small",
                  variant: "tonal",
                  color: "primary",
                  class: "ml-1"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(reports2.find((r) => r.id === unref(activeReport))?.label), 1)
                  ]),
                  _: 1
                }),
                createVNode(VSpacer),
                createVNode(VBtn, {
                  variant: "tonal",
                  color: "primary",
                  "prepend-icon": "mdi-file-document-multiple-outline",
                  onClick: ($event) => generalDialog.value = true
                }, {
                  default: withCtx(() => [
                    createTextVNode(" General Report ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(VMenu, {
                  modelValue: unref(exportMenu),
                  "onUpdate:modelValue": ($event) => isRef(exportMenu) ? exportMenu.value = $event : null,
                  "close-on-content-click": false,
                  location: "bottom end"
                }, {
                  activator: withCtx(({ props: menuProps }) => [
                    createVNode(VBtn, mergeProps(menuProps, {
                      variant: "flat",
                      color: "primary",
                      "prepend-icon": "mdi-download",
                      disabled: !unref(reportData) || unref(exporting),
                      loading: unref(exporting)
                    }), {
                      default: withCtx(() => [
                        createTextVNode(" Export "),
                        createVNode(VIcon, { end: "" }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-chevron-down")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 16, ["disabled", "loading"])
                  ]),
                  default: withCtx(() => [
                    createVNode(VCard, {
                      "min-width": "240",
                      rounded: "lg"
                    }, {
                      default: withCtx(() => [
                        createVNode(VList, { density: "comfortable" }, {
                          default: withCtx(() => [
                            createVNode(VListItem, {
                              "prepend-icon": "mdi-file-pdf-box",
                              title: "PDF Report",
                              subtitle: "Designed with header and charts",
                              onClick: ($event) => doExport("pdf")
                            }, null, 8, ["onClick"]),
                            createVNode(VListItem, {
                              "prepend-icon": "mdi-file-excel",
                              title: "Excel Spreadsheet",
                              subtitle: "Styled .xlsx workbook",
                              onClick: ($event) => doExport("excel")
                            }, null, 8, ["onClick"]),
                            createVNode(VListItem, {
                              "prepend-icon": "mdi-file-delimited",
                              title: "CSV File",
                              subtitle: "Plain text data",
                              onClick: ($event) => doExport("csv")
                            }, null, 8, ["onClick"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode(VBtn, {
                  variant: "tonal",
                  "prepend-icon": "mdi-refresh",
                  loading: unref(loading),
                  onClick: loadActive
                }, {
                  default: withCtx(() => [
                    createTextVNode("Refresh")
                  ]),
                  _: 1
                }, 8, ["loading"])
              ]),
              unref(error) ? (openBlock(), createBlock(VAlert, {
                key: 0,
                type: "error",
                variant: "tonal",
                class: "mb-4",
                closable: "",
                "onClick:close": ($event) => error.value = null
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(error)), 1)
                ]),
                _: 1
              }, 8, ["onClick:close"])) : createCommentVNode("", true),
              createVNode(VCard, {
                rounded: "lg",
                class: "pa-3 mb-4"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "d-flex flex-wrap align-center ga-3" }, [
                    createVNode(VIcon, { class: "mr-1" }, {
                      default: withCtx(() => [
                        createTextVNode("mdi-filter-variant")
                      ]),
                      _: 1
                    }),
                    createVNode("span", { class: "text-subtitle-2" }, "Filters:"),
                    createVNode(VChipGroup, {
                      modelValue: unref(preset),
                      "onUpdate:modelValue": [($event) => isRef(preset) ? preset.value = $event : null, onPresetChange],
                      "selected-class": "text-primary"
                    }, {
                      default: withCtx(() => [
                        (openBlock(), createBlock(Fragment, null, renderList(presets, (p) => {
                          return createVNode(VChip, {
                            key: p.value,
                            value: p.value,
                            size: "small",
                            variant: "tonal"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(p.label), 1)
                            ]),
                            _: 2
                          }, 1032, ["value"]);
                        }), 64))
                      ]),
                      _: 1
                    }, 8, ["modelValue", "onUpdate:modelValue"]),
                    unref(preset) === "custom" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                      createVNode(VTextField, {
                        modelValue: unref(customFrom),
                        "onUpdate:modelValue": [($event) => isRef(customFrom) ? customFrom.value = $event : null, loadActive],
                        label: "From",
                        type: "date",
                        density: "compact",
                        variant: "outlined",
                        "hide-details": "",
                        style: { "max-width": "170px" },
                        class: "mr-2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(VTextField, {
                        modelValue: unref(customTo),
                        "onUpdate:modelValue": [($event) => isRef(customTo) ? customTo.value = $event : null, loadActive],
                        label: "To",
                        type: "date",
                        density: "compact",
                        variant: "outlined",
                        "hide-details": "",
                        style: { "max-width": "170px" },
                        class: "mr-2"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ], 64)) : createCommentVNode("", true),
                    createVNode(VSpacer),
                    createVNode(VSelect, {
                      modelValue: unref(branchFilter),
                      "onUpdate:modelValue": [($event) => isRef(branchFilter) ? branchFilter.value = $event : null, loadActive],
                      items: unref(branchOptions),
                      "item-title": "name",
                      "item-value": "id",
                      label: "Branch",
                      density: "compact",
                      variant: "outlined",
                      "hide-details": "",
                      clearable: "",
                      style: { "max-width": "200px" }
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                  ])
                ]),
                _: 1
              }),
              createVNode(VCard, {
                rounded: "lg",
                class: "mb-4 overflow-hidden"
              }, {
                default: withCtx(() => [
                  createVNode(VTabs, {
                    modelValue: unref(activeReport),
                    "onUpdate:modelValue": [($event) => isRef(activeReport) ? activeReport.value = $event : null, loadActive],
                    "show-arrows": ""
                  }, {
                    default: withCtx(() => [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(groupedTabs), (grp) => {
                        return openBlock(), createBlock(Fragment, {
                          key: grp.group
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(grp.tabs, (r) => {
                            return openBlock(), createBlock(VTab, {
                              key: r.id,
                              value: r.id,
                              "prepend-icon": r.icon,
                              slim: false
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(r.short), 1)
                              ]),
                              _: 2
                            }, 1032, ["value", "prepend-icon"]);
                          }), 128))
                        ], 64);
                      }), 128))
                    ]),
                    _: 1
                  }, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                _: 1
              }),
              unref(loading) ? (openBlock(), createBlock(VProgressLinear, {
                key: 1,
                indeterminate: "",
                color: "primary",
                class: "mb-4"
              })) : createCommentVNode("", true),
              unref(reportKpis).length && unref(reportData) ? (openBlock(), createBlock("div", {
                key: 2,
                class: "mb-4"
              }, [
                createVNode(VRow, { density: "comfortable" }, {
                  default: withCtx(() => [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(reportKpis), (kpi, i) => {
                      return openBlock(), createBlock(VCol, {
                        key: i,
                        cols: "12",
                        sm: "6",
                        md: "3",
                        lg: "2"
                      }, {
                        default: withCtx(() => [
                          createVNode(VCard, {
                            rounded: "lg",
                            class: "pa-4 h-100 kpi-card"
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "d-flex align-center justify-space-between mb-1" }, [
                                createVNode("div", { class: "text-caption text-medium-emphasis" }, toDisplayString(kpi.label), 1),
                                createVNode("div", {
                                  class: "kpi-card__dot",
                                  style: { background: kpi.color || "#1976D2" }
                                }, null, 4)
                              ]),
                              createVNode("div", {
                                class: "text-h5 font-weight-bold",
                                style: { color: kpi.color }
                              }, toDisplayString(kpi.value), 5)
                            ]),
                            _: 2
                          }, 1024)
                        ]),
                        _: 2
                      }, 1024);
                    }), 128))
                  ]),
                  _: 1
                })
              ])) : createCommentVNode("", true),
              unref(showGrowthCard) ? (openBlock(), createBlock(VCard, {
                key: 3,
                rounded: "lg",
                class: "mb-4 pa-6"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "d-flex align-center justify-space-between flex-wrap ga-4" }, [
                    createVNode("div", null, [
                      createVNode("div", { class: "text-caption text-medium-emphasis mb-1" }, "Sales Growth"),
                      createVNode("div", { class: "d-flex align-baseline ga-3" }, [
                        createVNode("span", {
                          class: "text-h3 font-weight-black",
                          style: { color: Number(unref(reportData).growth_pct) >= 0 ? "#2E7D32" : "#F44336" }
                        }, toDisplayString(Number(unref(reportData).growth_pct) >= 0 ? "+" : "") + toDisplayString(Number(unref(reportData).growth_pct).toFixed(1)) + "% ", 5),
                        createVNode(VIcon, {
                          color: Number(unref(reportData).growth_pct) >= 0 ? "success" : "error",
                          size: "32"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(Number(unref(reportData).growth_pct) >= 0 ? "mdi-trending-up" : "mdi-trending-down"), 1)
                          ]),
                          _: 1
                        }, 8, ["color"])
                      ]),
                      createVNode("div", { class: "text-body-2 text-medium-emphasis mt-2" }, [
                        createTextVNode(" Current: "),
                        createVNode("strong", null, toDisplayString(unref(fmtCurrency)(unref(reportData).current_revenue)), 1),
                        createTextVNode("  •  Previous: "),
                        createVNode("strong", null, toDisplayString(unref(fmtCurrency)(unref(reportData).previous_revenue)), 1)
                      ])
                    ]),
                    createVNode("div", { class: "d-flex ga-4" }, [
                      createVNode("div", { class: "text-center" }, [
                        createVNode(VIcon, {
                          size: "40",
                          color: "primary"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-chart-line")
                          ]),
                          _: 1
                        }),
                        createVNode("div", { class: "text-h5 font-weight-bold mt-1" }, toDisplayString(unref(fmtCurrency)(unref(reportData).current_revenue)), 1),
                        createVNode("div", { class: "text-caption text-medium-emphasis" }, "Current Period")
                      ]),
                      createVNode("div", { class: "text-center" }, [
                        createVNode(VIcon, {
                          size: "40",
                          color: "grey-lighten-1"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("mdi-chart-line-variant")
                          ]),
                          _: 1
                        }),
                        createVNode("div", {
                          class: "text-h5 font-weight-bold mt-1",
                          style: { "color": "#607D8B" }
                        }, toDisplayString(unref(fmtCurrency)(unref(reportData).previous_revenue)), 1),
                        createVNode("div", { class: "text-caption text-medium-emphasis" }, "Previous Period")
                      ])
                    ])
                  ])
                ]),
                _: 1
              })) : createCommentVNode("", true),
              unref(showHeatmap) ? (openBlock(), createBlock(VCard, {
                key: 4,
                rounded: "lg",
                class: "mb-4 overflow-hidden"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "pa-4 pb-0" }, [
                    createVNode("div", { class: "text-subtitle-2 font-weight-bold" }, "Peak Hours Heatmap"),
                    createVNode("div", { class: "text-caption text-medium-emphasis" }, "Revenue distribution by hour and day of week (blue = low, indigo = high)")
                  ]),
                  createVNode("div", { class: "pa-4" }, [
                    createVNode(_component_ReportsChart, {
                      type: "heatmap",
                      grid: unref(reportData).grid,
                      weekdays: unref(reportData).weekdays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                      "format-value": (v) => unref(fmtCurrency)(v)
                    }, null, 8, ["grid", "weekdays", "format-value"])
                  ])
                ]),
                _: 1
              })) : createCommentVNode("", true),
              unref(reportChartData) && unref(activeReport) === "daily-revenue" && unref(reportData) && Array.isArray(unref(reportData)) && unref(reportData).length ? (openBlock(), createBlock(VCard, {
                key: 5,
                rounded: "lg",
                class: "mb-4 overflow-hidden"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "pa-4 pb-0" }, [
                    createVNode("div", { class: "d-flex align-center justify-space-between flex-wrap ga-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-subtitle-2 font-weight-bold" }, toDisplayString(unref(reportChartData).title || "Revenue Trend"), 1),
                        createVNode("div", { class: "text-caption text-medium-emphasis" }, "Daily revenue, cost and profit over the selected period")
                      ]),
                      createVNode("div", { class: "d-flex align-center ga-3" }, [
                        createVNode("div", { class: "d-flex align-center ga-1" }, [
                          createVNode("div", {
                            class: "chart-legend-dot",
                            style: { "background": "#1976D2" }
                          }),
                          createTextVNode("Revenue")
                        ]),
                        createVNode("div", { class: "d-flex align-center ga-1" }, [
                          createVNode("div", {
                            class: "chart-legend-dot",
                            style: { "background": "#C62828" }
                          }),
                          createTextVNode("Cost")
                        ]),
                        createVNode("div", { class: "d-flex align-center ga-1" }, [
                          createVNode("div", {
                            class: "chart-legend-dot",
                            style: { "background": "#2E7D32" }
                          }),
                          createTextVNode("Profit")
                        ])
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "chart-bars pa-4" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(reportData), (d, i) => {
                      return openBlock(), createBlock("div", {
                        key: i,
                        class: "chart-bar-col"
                      }, [
                        createVNode("div", { class: "chart-bar-stack" }, [
                          createVNode("div", {
                            class: "chart-bar chart-bar--revenue",
                            style: { height: barHeight(d.revenue, unref(maxRevenue)) },
                            title: `Revenue: ${unref(fmtCurrency)(d.revenue)}`
                          }, null, 12, ["title"]),
                          createVNode("div", {
                            class: "chart-bar chart-bar--cost",
                            style: { height: barHeight(d.cost, unref(maxRevenue)) },
                            title: `Cost: ${unref(fmtCurrency)(d.cost)}`
                          }, null, 12, ["title"]),
                          createVNode("div", {
                            class: "chart-bar chart-bar--profit",
                            style: { height: barHeight(d.profit, unref(maxRevenue)) },
                            title: `Profit: ${unref(fmtCurrency)(d.profit)}`
                          }, null, 12, ["title"])
                        ]),
                        createVNode("div", { class: "chart-bar-label" }, toDisplayString(fmtDateShort(d.date)), 1),
                        createVNode("div", { class: "chart-bar-value" }, toDisplayString(unref(fmtCurrency)(d.revenue)), 1)
                      ]);
                    }), 128))
                  ])
                ]),
                _: 1
              })) : createCommentVNode("", true),
              unref(reportChartData) && unref(activeReport) !== "daily-revenue" && unref(activeReport) !== "peak-hours-heatmap" ? (openBlock(), createBlock(VCard, {
                key: 6,
                rounded: "lg",
                class: "mb-4 overflow-hidden"
              }, {
                default: withCtx(() => [
                  createVNode("div", { class: "pa-4 pb-0" }, [
                    createVNode("div", { class: "text-subtitle-2 font-weight-bold" }, toDisplayString(unref(reportChartData).title), 1),
                    unref(reportChartData).subtitle ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "text-caption text-medium-emphasis"
                    }, toDisplayString(unref(reportChartData).subtitle), 1)) : createCommentVNode("", true)
                  ]),
                  createVNode("div", { class: "pa-4" }, [
                    unref(reportChartData).type === "donut" && unref(reportChartData).segments ? (openBlock(), createBlock(_component_ReportsChart, {
                      key: 0,
                      type: "donut",
                      segments: unref(reportChartData).segments,
                      "format-value": (v) => unref(fmtCurrency)(v)
                    }, null, 8, ["segments", "format-value"])) : unref(reportChartData).type === "hbar" && unref(reportChartData).hbarItems ? (openBlock(), createBlock(_component_ReportsChart, {
                      key: 1,
                      type: "hbar",
                      items: unref(reportChartData).hbarItems,
                      "format-value": (v) => unref(fmtCurrency)(v)
                    }, null, 8, ["items", "format-value"])) : unref(reportChartData).type === "bar" && unref(reportChartData).labels ? (openBlock(), createBlock(_component_ReportsChart, {
                      key: 2,
                      type: "bar",
                      labels: unref(reportChartData).labels,
                      datasets: unref(reportChartData).datasets || [],
                      "format-value": (v) => unref(fmtCurrency)(v),
                      height: 240
                    }, null, 8, ["labels", "datasets", "format-value"])) : createCommentVNode("", true)
                  ])
                ]),
                _: 1
              })) : createCommentVNode("", true),
              (openBlock(true), createBlock(Fragment, null, renderList(unref(reportCharts), (ch, idx) => {
                return openBlock(), createBlock(VCard, {
                  key: "sec-" + idx,
                  rounded: "lg",
                  class: "mb-4 overflow-hidden"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "pa-4 pb-0" }, [
                      createVNode("div", { class: "text-subtitle-2 font-weight-bold" }, toDisplayString(ch.title), 1),
                      ch.subtitle ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "text-caption text-medium-emphasis"
                      }, toDisplayString(ch.subtitle), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "pa-4" }, [
                      ch.type === "donut" && ch.segments ? (openBlock(), createBlock(_component_ReportsChart, {
                        key: 0,
                        type: "donut",
                        segments: ch.segments,
                        "format-value": (v) => unref(fmtCurrency)(v)
                      }, null, 8, ["segments", "format-value"])) : ch.type === "hbar" && ch.hbarItems ? (openBlock(), createBlock(_component_ReportsChart, {
                        key: 1,
                        type: "hbar",
                        items: ch.hbarItems,
                        "format-value": (v) => unref(fmtCurrency)(v)
                      }, null, 8, ["items", "format-value"])) : createCommentVNode("", true)
                    ])
                  ]),
                  _: 2
                }, 1024);
              }), 128)),
              unref(showTable) ? (openBlock(), createBlock(VCard, {
                key: 7,
                rounded: "lg"
              }, {
                default: withCtx(() => [
                  createVNode(VDataTable, {
                    items: unref(tableItems),
                    headers: unref(reportColumns).map((c) => ({ title: c.label, key: c.key, sortable: true })),
                    density: "comfortable",
                    hover: "",
                    "items-per-page": 15,
                    class: "elevation-1"
                  }, createSlots({ _: 2 }, [
                    renderList(unref(reportColumns).filter((c) => c.format === "currency"), (c) => {
                      return {
                        name: `item.${c.key}`,
                        fn: withCtx(({ item }) => [
                          createTextVNode(toDisplayString(unref(fmtCurrency)(item[c.key])), 1)
                        ])
                      };
                    }),
                    renderList(unref(reportColumns).filter((c) => c.format === "percent"), (c) => {
                      return {
                        name: `item.${c.key}`,
                        fn: withCtx(({ item }) => [
                          createTextVNode(toDisplayString(unref(fmtPct)(item[c.key])), 1)
                        ])
                      };
                    }),
                    renderList(unref(reportColumns).filter((c) => c.format === "number"), (c) => {
                      return {
                        name: `item.${c.key}`,
                        fn: withCtx(({ item }) => [
                          createTextVNode(toDisplayString(unref(fmtNumber)(item[c.key])), 1)
                        ])
                      };
                    }),
                    renderList(unref(reportColumns).filter((c) => c.format === "date"), (c) => {
                      return {
                        name: `item.${c.key}`,
                        fn: withCtx(({ item }) => [
                          createTextVNode(toDisplayString(unref(fmtDate)(item[c.key])), 1)
                        ])
                      };
                    })
                  ]), 1032, ["items", "headers"])
                ]),
                _: 1
              })) : createCommentVNode("", true),
              unref(reportData) && Array.isArray(unref(tableItems)) && unref(tableItems).length === 0 && !unref(loading) && !unref(showHeatmap) && !unref(showGrowthCard) ? (openBlock(), createBlock(VCard, {
                key: 8,
                rounded: "lg",
                class: "text-center py-12"
              }, {
                default: withCtx(() => [
                  createVNode(VIcon, {
                    size: "56",
                    color: "medium-emphasis",
                    class: "mb-3"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("mdi-file-document-outline")
                    ]),
                    _: 1
                  }),
                  createVNode("div", { class: "text-h6 font-weight-bold mb-1" }, "No data for this report"),
                  createVNode("div", { class: "text-body-2 text-medium-emphasis" }, "Try adjusting the date range or branch filter.")
                ]),
                _: 1
              })) : createCommentVNode("", true),
              createVNode(VDialog, {
                modelValue: unref(generalDialog),
                "onUpdate:modelValue": ($event) => isRef(generalDialog) ? generalDialog.value = $event : null,
                "max-width": "680",
                scrollable: ""
              }, {
                default: withCtx(() => [
                  createVNode(VCard, { rounded: "lg" }, {
                    default: withCtx(() => [
                      createVNode(VToolbar, {
                        flat: "",
                        color: "primary",
                        density: "comfortable"
                      }, {
                        default: withCtx(() => [
                          createVNode(VIcon, { start: "" }, {
                            default: withCtx(() => [
                              createTextVNode("mdi-file-document-multiple-outline")
                            ]),
                            _: 1
                          }),
                          createVNode(VToolbarTitle, null, {
                            default: withCtx(() => [
                              createTextVNode("Generate General Report")
                            ]),
                            _: 1
                          }),
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            icon: "mdi-close",
                            variant: "text",
                            onClick: ($event) => generalDialog.value = false
                          }, null, 8, ["onClick"])
                        ]),
                        _: 1
                      }),
                      createVNode(VCardText, { class: "pt-4" }, {
                        default: withCtx(() => [
                          unref(generalError) ? (openBlock(), createBlock(VAlert, {
                            key: 0,
                            type: "error",
                            variant: "tonal",
                            class: "mb-4",
                            closable: "",
                            "onClick:close": ($event) => generalError.value = null
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(generalError)), 1)
                            ]),
                            _: 1
                          }, 8, ["onClick:close"])) : createCommentVNode("", true),
                          createVNode("div", { class: "text-body-2 text-medium-emphasis mb-3" }, " Select which report sections to include in your general PDF. The report will use the current date range and branch filter. "),
                          createVNode("div", { class: "d-flex align-center mb-3 ga-2" }, [
                            createVNode(VChip, {
                              size: "small",
                              variant: "tonal",
                              color: "primary",
                              "prepend-icon": "mdi-check-all",
                              onClick: selectAllReports
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Select All ")
                              ]),
                              _: 1
                            }),
                            createVNode(VChip, {
                              size: "small",
                              variant: "tonal",
                              "prepend-icon": "mdi-close",
                              onClick: deselectAllReports
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Clear ")
                              ]),
                              _: 1
                            }),
                            createVNode(VSpacer),
                            createVNode("span", { class: "text-caption text-medium-emphasis" }, toDisplayString(unref(generalReportIds).length) + " of " + toDisplayString(reports2.length) + " selected ", 1)
                          ]),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(groupedTabs), (grp) => {
                            return openBlock(), createBlock("div", {
                              key: grp.group,
                              class: "mb-3"
                            }, [
                              createVNode("div", { class: "text-subtitle-2 font-weight-bold mb-1" }, toDisplayString(grp.group), 1),
                              createVNode(VRow, { density: "compact" }, {
                                default: withCtx(() => [
                                  (openBlock(true), createBlock(Fragment, null, renderList(grp.tabs, (rpt) => {
                                    return openBlock(), createBlock(VCol, {
                                      key: rpt.id,
                                      cols: "12",
                                      sm: "6",
                                      md: "4"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(VCheckbox, {
                                          "model-value": isReportSelected(rpt.id),
                                          label: rpt.label,
                                          density: "compact",
                                          "hide-details": "",
                                          color: "primary",
                                          "onUpdate:modelValue": ($event) => toggleReport(rpt.id)
                                        }, null, 8, ["model-value", "label", "onUpdate:modelValue"])
                                      ]),
                                      _: 2
                                    }, 1024);
                                  }), 128))
                                ]),
                                _: 2
                              }, 1024)
                            ]);
                          }), 128))
                        ]),
                        _: 1
                      }),
                      createVNode(VDivider),
                      createVNode(VCardActions, { class: "pa-4" }, {
                        default: withCtx(() => [
                          createVNode(VSpacer),
                          createVNode(VBtn, {
                            variant: "text",
                            onClick: ($event) => generalDialog.value = false
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Cancel")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(VBtn, {
                            variant: "flat",
                            color: "primary",
                            "prepend-icon": "mdi-file-pdf-box",
                            loading: unref(generalLoading) || unref(exportingGeneral),
                            disabled: !unref(generalReportIds).length,
                            onClick: generateGeneralReport
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Generate PDF ")
                            ]),
                            _: 1
                          }, 8, ["loading", "disabled"])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reports.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const reports = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1bb0b6d4"]]);
export {
  reports as default
};
//# sourceMappingURL=reports-d4Fhgc20.js.map
