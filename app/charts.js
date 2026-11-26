/* charts.js — pembuat grafik SVG murni, tanpa pustaka luar.
   Semua grafik digambar dari data NUSA dan diskalakan ke viewBox 640x300
   (donat 300x300), sehingga tajam di desktop maupun ponsel. */
'use strict';

var Charts = (function () {
  var W = 640, H = 300, PAD = { l: 52, r: 14, t: 14, b: 30 };
  var TEAL = '#0e6b7a', AMBER = '#d97706', NAVY = '#0b3d4f', GRID = '#d9e2e5';
  var PALETTE = ['#0e6b7a', '#d97706', '#2f9e6e', '#7a5fb5', '#c2517a', '#4a90b8', '#8a6d3b', '#5b7c8a', '#a33d2e', '#6b8e23'];

  function fmt(n, dec) {
    if (dec === undefined) dec = 1;
    return n.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function axes(min, max, steps) {
    var out = '', i, v;
    for (i = 0; i <= steps; i++) {
      v = min + (max - min) * i / steps;
      var y = PAD.t + (H - PAD.t - PAD.b) * (1 - i / steps);
      out += '<line x1="' + PAD.l + '" y1="' + y + '" x2="' + (W - PAD.r) + '" y2="' + y + '" stroke="' + GRID + '"/>';
      out += '<text x="' + (PAD.l - 6) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#5a6b72">' + fmt(v, 0) + '</text>';
    }
    return out;
  }

  function xLabels(labels, highlightIdx) {
    var out = '', i, x;
    var n = labels.length;
    for (i = 0; i < n; i++) {
      x = PAD.l + (W - PAD.l - PAD.r) * (n === 1 ? 0.5 : i / (n - 1));
      var hi = highlightIdx === i;
      out += '<text x="' + x.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="' + (hi ? AMBER : '#5a6b72') + '" font-weight="' + (hi ? '700' : '400') + '">' + esc(labels[i]) + '</text>';
    }
    return out;
  }

  function lineChart(labels, values, opts) {
    opts = opts || {};
    var dec = opts.dec === undefined ? 1 : opts.dec;
    var min = opts.min !== undefined ? opts.min : Math.min.apply(null, values);
    var max = opts.max !== undefined ? opts.max : Math.max.apply(null, values);
    if (min === max) { min -= 1; max += 1; }
    var pad = (max - min) * 0.12; min -= pad; max += pad;
    var n = values.length;
    function X(i) { return PAD.l + (W - PAD.l - PAD.r) * (n === 1 ? 0.5 : i / (n - 1)); }
    function Y(v) { return PAD.t + (H - PAD.t - PAD.b) * (1 - (v - min) / (max - min)); }
    var pts = values.map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' ');
    var dots = values.map(function (v, i) {
      var hi = opts.highlight === i;
      return '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="' + (hi ? 6 : 3.5) + '" fill="' + (hi ? AMBER : '#fff') + '" stroke="' + TEAL + '" stroke-width="2"/>' +
        '<text x="' + X(i).toFixed(1) + '" y="' + (Y(v) - 10).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="600" fill="' + NAVY + '">' + fmt(v, dec) + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik garis">' +
      axes(min, max, 4) + '<polyline points="' + pts + '" fill="none" stroke="' + TEAL + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots + xLabels(labels, opts.highlight) + '</svg>';
  }

  function barChart(labels, values, opts) {
    opts = opts || {};
    var dec = opts.dec === undefined ? 1 : opts.dec;
    var color = opts.color || TEAL;
    var min = opts.min !== undefined ? opts.min : Math.min(0, Math.min.apply(null, values));
    var max = Math.max.apply(null, values);
    if (min === max) { min -= 1; max += 1; }
    var n = values.length;
    var slot = (W - PAD.l - PAD.r) / n;
    var bw = Math.min(46, slot * 0.62);
    function Y(v) { return PAD.t + (H - PAD.t - PAD.b) * (1 - (v - min) / (max - min)); }
    var zeroY = Y(0);
    var bars = values.map(function (v, i) {
      var x = PAD.l + slot * i + (slot - bw) / 2;
      var y = v >= 0 ? Y(v) : zeroY;
      var h = Math.abs(Y(v) - zeroY);
      var neg = v < 0;
      var hi = opts.highlight === i;
      return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(h, 2).toFixed(1) + '" rx="3" fill="' + (hi ? AMBER : (neg ? '#b3261e' : color)) + '"/>' +
        '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (v >= 0 ? y - 6 : y + h + 14).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="600" fill="' + NAVY + '">' + fmt(v, dec) + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik batang">' +
      axes(min, max, 4) + bars + xLabels(labels, opts.highlight) + '</svg>';
  }

  function hbarChart(rows, opts) {
    /* rows: [{label, value}] — batang horizontal dengan label. */
    opts = opts || {};
    var dec = opts.dec === undefined ? 1 : opts.dec;
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }));
    var rh = 30, top = 8, h = top + rows.length * rh + 8;
    var labelW = opts.labelW || 150, barX = labelW + 10, barW = W - barX - 70;
    var body = rows.map(function (r, i) {
      var y = top + i * rh;
      var w = Math.max(2, r.value / max * barW);
      var c = PALETTE[i % PALETTE.length];
      return '<text x="' + (labelW - 4) + '" y="' + (y + 14) + '" text-anchor="end" font-size="12" fill="' + NAVY + '">' + esc(r.label) + '</text>' +
        '<rect x="' + barX + '" y="' + (y + 4) + '" width="' + w.toFixed(1) + '" height="14" rx="3" fill="' + c + '"/>' +
        '<text x="' + (barX + w + 6) + '" y="' + (y + 16) + '" font-size="12" font-weight="700" fill="' + NAVY + '">' + fmt(r.value, dec) + (opts.suffix || '') + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + h + '" role="img" aria-label="Grafik batang horizontal">' + body + '</svg>';
  }

  function donutChart(rows, opts) {
    /* rows: [{label, value}] atau [{name, share}] — donat + legenda. */
    opts = opts || {};
    rows = rows.map(function (r) {
      return { label: r.label !== undefined ? r.label : r.name,
               value: r.value !== undefined ? r.value : r.share };
    });
    var dec = opts.dec === undefined ? 1 : opts.dec;
    var total = rows.reduce(function (a, r) { return a + r.value; }, 0);
    var cx = 150, cy = 150, r0 = 62, r1 = 118;
    var a0 = -Math.PI / 2, segs = '';
    rows.forEach(function (row, i) {
      var frac = row.value / total;
      var a1 = a0 + frac * Math.PI * 2;
      var large = frac > 0.5 ? 1 : 0;
      var x0 = cx + r1 * Math.cos(a0), y0 = cy + r1 * Math.sin(a0);
      var x1 = cx + r1 * Math.cos(a1), y1 = cy + r1 * Math.sin(a1);
      var x2 = cx + r0 * Math.cos(a1), y2 = cy + r0 * Math.sin(a1);
      var x3 = cx + r0 * Math.cos(a0), y3 = cy + r0 * Math.sin(a0);
      segs += '<path d="M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A ' + r1 + ' ' + r1 + ' 0 ' + large + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
        ' L ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' A ' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + x3.toFixed(1) + ' ' + y3.toFixed(1) + ' Z" fill="' + PALETTE[i % PALETTE.length] + '"/>';
      a0 = a1;
    });
    var legend = rows.map(function (row, i) {
      return '<div><i style="background:' + PALETTE[i % PALETTE.length] + '"></i>' + esc(row.label) + ' — <b>' + fmt(row.value, dec) + '%</b></div>';
    }).join('');
    return '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      '<svg viewBox="0 0 300 300" width="220" height="220" role="img" aria-label="Grafik donat" style="flex:0 0 auto">' + segs +
      '<text x="150" y="146" text-anchor="middle" font-size="26" font-weight="800" fill="' + NAVY + '">100%</text>' +
      '<text x="150" y="168" text-anchor="middle" font-size="12" fill="#5a6b72">pangsa PDB</text></svg>' +
      '<div class="legend" style="flex:1 1 220px;display:grid;grid-template-columns:1fr 1fr;gap:4px 12px">' + legend + '</div></div>';
  }

  return { fmt: fmt, esc: esc, lineChart: lineChart, barChart: barChart, hbarChart: hbarChart, donutChart: donutChart, PALETTE: PALETTE };
})();
