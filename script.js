document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ============ HELPERS ============
  function $(id) { return document.getElementById(id); }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function int(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ============ STATE ============
  var deductions = [{ reason: 'Morning Assembly', minutes: 0 }];
  var timeLosses = [{ from: '', to: '', reason: '', minutes: 0 }];
  var bikePlans = [{ model: '', color: '', plan: 0, cycle: 0, required: 0, possible: 0, balance: 0 }];
  var completed = [{ model: '', color: '', qty: 0 }];
  var rework = [{ model: '', color: '', qty: 0 }];
  var fg = [{ model: '', color: '', qty: 0 }];

  // ============ INIT ============
  var dateEl = $('reportDate');
  if (dateEl) dateEl.value = todayISO();

  // ============ RENDER: DEDUCTIONS ============
  function renderDeductions() {
    var body = $('deductionBody');
    if (!body) return;
    body.innerHTML = '';
    deductions.forEach(function (r, i) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="text" data-i="' + i + '" data-k="reason" value="' + esc(r.reason) + '" placeholder="Reason"></td>' +
        '<td><input type="number" data-i="' + i + '" data-k="minutes" value="' + num(r.minutes) + '" min="0"></td>' +
        '<td><button type="button" class="btn-remove" data-del="ded">✕</button></td>';
      body.appendChild(tr);
    });
    body.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var i = int(this.dataset.i);
        var k = this.dataset.k;
        deductions[i][k] = (k === 'minutes') ? num(this.value) : this.value;
        updateAll();
      });
    });
    body.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Array.from(body.children).indexOf(this.closest('tr'));
        deductions.splice(idx, 1);
        renderDeductions();
        updateAll();
      });
    });
  }

  // ============ RENDER: TIME LOSS ============
  function renderTimeLosses() {
    var body = $('timeLossBody');
    if (!body) return;
    body.innerHTML = '';
    timeLosses.forEach(function (r, i) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="time" data-i="' + i + '" data-k="from" value="' + esc(r.from) + '"></td>' +
        '<td><input type="time" data-i="' + i + '" data-k="to" value="' + esc(r.to) + '"></td>' +
        '<td><input type="text" data-i="' + i + '" data-k="reason" value="' + esc(r.reason) + '" placeholder="Reason"></td>' +
        '<td><input type="number" class="tl-minutes" value="' + num(r.minutes) + '" readonly></td>' +
        '<td><button type="button" class="btn-remove" data-del="tl">✕</button></td>';
      body.appendChild(tr);
    });
    body.querySelectorAll('input:not([readonly])').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var i = int(this.dataset.i);
        var k = this.dataset.k;
        timeLosses[i][k] = this.value;
        timeLosses[i].minutes = calcTL(timeLosses[i]);
        var row = this.closest('tr');
        var minsInp = row.querySelector('.tl-minutes');
        if (minsInp) minsInp.value = num(timeLosses[i].minutes);
        updateAll();
      });
    });
    body.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Array.from(body.children).indexOf(this.closest('tr'));
        timeLosses.splice(idx, 1);
        renderTimeLosses();
        updateAll();
      });
    });
  }

  function calcTL(r) {
    if (!r.from || !r.to) return 0;
    var f = r.from.split(':'), t = r.to.split(':');
    var fm = int(f[0]) * 60 + int(f[1]);
    var tm = int(t[0]) * 60 + int(t[1]);
    if (tm < fm) tm += 1440;
    return tm - fm;
  }

  // ============ RENDER: BIKE PLAN ============
  function renderBikePlans() {
    var body = $('bikePlanBody');
    if (!body) return;
    body.innerHTML = '';
    bikePlans.forEach(function (r, i) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="text" data-i="' + i + '" data-k="model" value="' + esc(r.model) + '" placeholder="Model"></td>' +
        '<td><input type="text" data-i="' + i + '" data-k="color" value="' + esc(r.color) + '" placeholder="Color"></td>' +
        '<td><input type="number" data-i="' + i + '" data-k="plan" value="' + num(r.plan) + '" min="0"></td>' +
        '<td><input type="number" data-i="' + i + '" data-k="cycle" value="' + num(r.cycle) + '" min="0" step="0.1"></td>' +
        '<td><input type="number" class="bp-required" value="' + num(r.required) + '" readonly></td>' +
        '<td><input type="number" class="bp-possible" value="' + num(r.possible) + '" readonly></td>' +
        '<td><input type="number" class="bp-balance" value="' + num(r.balance) + '" readonly></td>' +
        '<td><button type="button" class="btn-remove" data-del="bp">✕</button></td>';
      body.appendChild(tr);
    });

    body.querySelectorAll('input[data-k]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var i = int(this.dataset.i);
        var k = this.dataset.k;
        if (k === 'model' || k === 'color') bikePlans[i][k] = this.value;
        else bikePlans[i][k] = num(this.value);
        updateAll();
      });
    });

    body.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Array.from(body.children).indexOf(this.closest('tr'));
        bikePlans.splice(idx, 1);
        renderBikePlans();
        updateAll();
      });
    });
  }

  function updateBikePlanReadonlyCells() {
    var body = $('bikePlanBody');
    if (!body) return;
    Array.from(body.children).forEach(function (tr, i) {
      var r = bikePlans[i];
      if (!r) return;
      var reqInp = tr.querySelector('.bp-required');
      var posInp = tr.querySelector('.bp-possible');
      var balInp = tr.querySelector('.bp-balance');
      if (reqInp) reqInp.value = num(r.required);
      if (posInp) posInp.value = num(r.possible);
      if (balInp) balInp.value = num(r.balance);
    });
  }

  // ============ RENDER SIMPLE TABLES ============
  function renderSimpleTable(bodyId, dataArr, renderFnName) {
    var body = $(bodyId);
    if (!body) return;
    body.innerHTML = '';
    dataArr.forEach(function (r, i) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="text" data-i="' + i + '" data-k="model" value="' + esc(r.model) + '" placeholder="Model"></td>' +
        '<td><input type="text" data-i="' + i + '" data-k="color" value="' + esc(r.color) + '" placeholder="Color"></td>' +
        '<td><input type="number" data-i="' + i + '" data-k="qty" value="' + num(r.qty) + '" min="0"></td>' +
        '<td><button type="button" class="btn-remove" data-del="x">✕</button></td>';
      body.appendChild(tr);
    });
    body.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var i = int(this.dataset.i);
        var k = this.dataset.k;
        if (k === 'qty') dataArr[i][k] = num(this.value);
        else dataArr[i][k] = this.value;
        updateAll();
      });
    });
    body.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Array.from(body.children).indexOf(this.closest('tr'));
        dataArr.splice(idx, 1);
        window[renderFnName]();
        updateAll();
      });
    });
  }

  function renderCompleted() { renderSimpleTable('completedBody', completed, 'renderCompleted'); }
  function renderRework()    { renderSimpleTable('reworkBody', rework, 'renderRework'); }
  function renderFg()        { renderSimpleTable('fgBody', fg, 'renderFg'); }

  // ============ CALCULATIONS ============
  function calcManpower() {
    var totalEl = $('totalWorkers');
    var absentEl = $('absentWorkers');
    var presentEl = $('presentWorkers');
    var pctEl = $('presentWorkerPct');
    var sTotal = $('sumTotalWorkers');
    var sPresent = $('sumPresentWorkers');
    if (!totalEl || !absentEl) return;

    var total = num(totalEl.value);
    var absent = num(absentEl.value);
    var present = total - absent;
    if (present < 0) present = 0;

    if (presentEl) presentEl.value = present;
    var pct = total > 0 ? (present / total) * 100 : 0;
    if (pctEl) pctEl.value = pct.toFixed(2) + '%';
    if (sTotal) sTotal.textContent = total;
    if (sPresent) sPresent.textContent = present;
  }

  function calcShift() {
    var shEl = $('shiftHours');
    var smEl = $('shiftMinutes');
    var dedTotEl = $('normalDeductionsTotal');
    var finalEl = $('finalProductionMinutes');
    var sumProdEl = $('sumProductionMinutes');
    if (!shEl || !smEl) return 0;

    var sh = num(shEl.value);
    var sm = num(smEl.value);
    var totalShift = sh * 60 + sm;

    var dedSum = 0;
    deductions.forEach(function (r) { dedSum += num(r.minutes); });
    if (dedTotEl) dedTotEl.value = dedSum;

    var tlSum = 0;
    timeLosses.forEach(function (r) { tlSum += num(r.minutes); });
    var tlLineEl = $('totalTimeLoss');
    if (tlLineEl) tlLineEl.textContent = tlSum;

    var finalMin = totalShift - dedSum;
    if (finalMin < 0) finalMin = 0;
    if (finalEl) finalEl.value = finalMin;
    if (sumProdEl) sumProdEl.textContent = finalMin;
    return finalMin;
  }

  function calcBikePlans(available) {
    var remaining = available;
    var totalPlanned = 0;
    var totalRequired = 0;
    var totalPossible = 0;

    bikePlans.forEach(function (r) {
      var plan = num(r.plan);
      var cycle = num(r.cycle);
      var required = plan * cycle;
      r.required = required;
      totalPlanned += plan;
      totalRequired += required;

      var possible = 0;
      if (cycle > 0) {
        possible = Math.floor(remaining / cycle);
        if (possible > plan) possible = plan;
        if (possible < 0) possible = 0;
      }
      r.possible = possible;
      r.balance = possible - plan;
      totalPossible += possible;

      remaining -= (possible * cycle);
      if (remaining < 0) remaining = 0;
    });

    updateBikePlanReadonlyCells();

    var tpEl = $('planTotalPlanned');
    var trEl = $('planTotalRequired');
    var avEl = $('planAvailable');
    var remEl = $('planRemaining');
    var stEl = $('planStatus');
    if (tpEl) tpEl.textContent = totalPlanned;
    if (trEl) trEl.textContent = totalRequired;
    if (avEl) avEl.textContent = available;
    if (remEl) remEl.textContent = remaining;

    if (stEl) {
      if (totalPlanned === 0) {
        stEl.textContent = '—';
        stEl.className = '';
      } else if (totalPossible >= totalPlanned) {
        stEl.textContent = 'CAN BE COMPLETED';
        stEl.className = 'status-ok';
      } else {
        var short = totalPlanned - totalPossible;
        stEl.textContent = 'SHORT ' + short + ' BIKES';
        stEl.className = 'status-fail';
      }
    }

    return {
      totalPlanned: totalPlanned,
      totalRequired: totalRequired,
      remaining: remaining,
      totalPossible: totalPossible
    };
  }

  function calcTotals() {
    var c = 0, r = 0, f = 0;
    completed.forEach(function (x) { c += num(x.qty); });
    rework.forEach(function (x) { r += num(x.qty); });
    fg.forEach(function (x) { f += num(x.qty); });
    var tcEl = $('totalCompleted');
    var trEl = $('totalRework');
    var tfEl = $('totalFg');
    var scEl = $('sumCompletedBikes');
    if (tcEl) tcEl.textContent = c;
    if (trEl) trEl.textContent = r;
    if (tfEl) tfEl.textContent = f;
    if (scEl) scEl.textContent = c;
    return { c: c, r: r, f: f };
  }

  // ============ MASTER UPDATE ============
  function updateAll() {
    try {
      calcManpower();
      var finalMin = calcShift();
      var planData = calcBikePlans(finalMin);
      var totals = calcTotals();
      buildReport(planData, totals);
    } catch (e) {
      console.error('Update error:', e);
    }
  }

  // ============ REPORT ============
  function buildReport(planData, totals) {
    if (!planData) planData = { totalPlanned: 0, totalRequired: 0, remaining: 0, totalPossible: 0 };
    if (!totals) totals = { c: 0, r: 0, f: 0 };

    var dateVal = ($('reportDate') && $('reportDate').value) || todayISO();
    var r = '';
    r += '========================================\n';
    r += '           EVEE DAILY REPORT\n';
    r += '========================================\n';
    r += 'Date: ' + dateVal + '\n\n';

    r += '--- MANPOWER ---\n';
    r += 'Total Workers    : ' + num($('totalWorkers').value) + '\n';
    r += 'Absent Workers   : ' + num($('absentWorkers').value) + '\n';
    r += 'Present Workers  : ' + num($('presentWorkers').value) + '\n';
    r += 'Present Worker % : ' + $('presentWorkerPct').value + '\n\n';

    r += '--- SHIFT TIME ---\n';
    var shV = num($('shiftHours').value);
    var smV = num($('shiftMinutes').value);
    r += 'Shift Time               : ' + shV + 'h ' + smV + 'm (' + (shV * 60 + smV) + ' min)\n';
    r += 'Normal Deductions        : ' + num($('normalDeductionsTotal').value) + ' min\n';
    r += 'Final Production Minutes : ' + num($('finalProductionMinutes').value) + ' min\n\n';

    r += '--- TIME LOSS (Informational) ---\n';
    r += 'From | To | Reason | Minutes\n';
    timeLosses.forEach(function (t) {
      r += (t.from || '-') + ' | ' + (t.to || '-') + ' | ' + (t.reason || '-') + ' | ' + num(t.minutes) + '\n';
    });
    var tlSum = 0;
    timeLosses.forEach(function (t) { tlSum += num(t.minutes); });
    r += 'Total Time Loss (info only) : ' + tlSum + ' min\n\n';

    r += '--- BIKE PLAN ---\n';
    r += 'Model | Color | Plan Qty | C.T | Required Time | Possible Bikes | Balance\n';
    bikePlans.forEach(function (b) {
      r += (b.model || '-') + ' | ' + (b.color || '-') + ' | ' + num(b.plan) + ' | ' + num(b.cycle) + ' | ' + num(b.required) + ' | ' + num(b.possible) + ' | ' + num(b.balance) + '\n';
    });
    r += '\nTotal Planned Bikes    : ' + planData.totalPlanned + '\n';
    r += 'Total Required Time    : ' + planData.totalRequired + '\n';
    r += 'Available Production   : ' + num($('finalProductionMinutes').value) + ' min\n';
    r += 'Remaining Minutes      : ' + planData.remaining + '\n';
    r += 'Status                 : ' + $('planStatus').textContent + '\n\n';

    r += '--- COMPLETED BIKES ---\n';
    r += 'Model | Color | Quantity\n';
    completed.forEach(function (b) { r += (b.model || '-') + ' | ' + (b.color || '-') + ' | ' + num(b.qty) + '\n'; });
    r += 'Total Completed Bikes : ' + totals.c + '\n\n';

    r += '--- QUALITY ---\n';
    r += 'Assembly Line SPR : ' + num($('sprPercent').value).toFixed(2) + ' %\n';
    r += 'Quality FG Bikes  : ' + num($('qualityFg').value) + '\n\n';

    r += '--- REWORK BIKES ---\n';
    r += 'Model | Color | Quantity\n';
    rework.forEach(function (b) { r += (b.model || '-') + ' | ' + (b.color || '-') + ' | ' + num(b.qty) + '\n'; });
    r += 'Total Rework Bikes : ' + totals.r + '\n\n';

    r += '--- FG (FINISHED GOODS) ---\n';
    r += 'Model | Color | Quantity\n';
    fg.forEach(function (b) { r += (b.model || '-') + ' | ' + (b.color || '-') + ' | ' + num(b.qty) + '\n'; });
    r += 'Total FG Bikes : ' + totals.f + '\n\n';

    r += '========================================\n';
    r += 'SUMMARY\n';
    r += '========================================\n';
    r += 'Total Planned Bikes   : ' + planData.totalPlanned + '\n';
    r += 'Total Completed Bikes : ' + totals.c + '\n';
    r += 'Total Rework Bikes    : ' + totals.r + '\n';
    r += 'Total FG Bikes        : ' + totals.f + '\n';

    var previewEl = $('reportPreview');
    if (previewEl) previewEl.textContent = r;
  }

  // ============ EVENT BINDINGS ============
  ['totalWorkers', 'absentWorkers', 'shiftHours', 'shiftMinutes', 'sprPercent', 'qualityFg', 'reportDate'].forEach(function (id) {
    var el = $(id);
    if (el) {
      el.addEventListener('input', updateAll);
      el.addEventListener('change', updateAll);
    }
  });

  var addDed = $('addDeductionBtn');
  if (addDed) addDed.addEventListener('click', function () {
    deductions.push({ reason: '', minutes: 0 });
    renderDeductions();
    updateAll();
  });

  var addTL = $('addTimeLossBtn');
  if (addTL) addTL.addEventListener('click', function () {
    timeLosses.push({ from: '', to: '', reason: '', minutes: 0 });
    renderTimeLosses();
    updateAll();
  });

  var addBP = $('addBikePlanBtn');
  if (addBP) addBP.addEventListener('click', function () {
    bikePlans.push({ model: '', color: '', plan: 0, cycle: 0, required: 0, possible: 0, balance: 0 });
    renderBikePlans();
    updateAll();
  });

  var addCB = $('addCompletedBtn');
  if (addCB) addCB.addEventListener('click', function () {
    completed.push({ model: '', color: '', qty: 0 });
    renderCompleted();
    updateAll();
  });

  var addRW = $('addReworkBtn');
  if (addRW) addRW.addEventListener('click', function () {
    rework.push({ model: '', color: '', qty: 0 });
    renderRework();
    updateAll();
  });

  var addFG = $('addFgBtn');
  if (addFG) addFG.addEventListener('click', function () {
    fg.push({ model: '', color: '', qty: 0 });
    renderFg();
    updateAll();
  });

  // COPY
  var copyBtnEl = $('copyBtn');
  if (copyBtnEl) copyBtnEl.addEventListener('click', function () {
    var previewEl = $('reportPreview');
    if (!previewEl) return;
    var text = previewEl.textContent;
    function showOk() {
      var m = $('copyMsg');
      if (!m) return;
      m.style.display = 'block';
      setTimeout(function () { m.style.display = 'none'; }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showOk).catch(function () { fallbackCopy(text, showOk); });
    } else {
      fallbackCopy(text, showOk);
    }
  });

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); }
    catch (e) { alert('Copy failed'); }
    document.body.removeChild(ta);
  }

  // PDF
  var pdfBtnEl = $('pdfBtn');
  if (pdfBtnEl) pdfBtnEl.addEventListener('click', function () {
    var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) { alert('PDF library not loaded'); return; }

    var doc = new jsPDFCtor({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    var pw = doc.internal.pageSize.getWidth();
    var ph = doc.internal.pageSize.getHeight();
    var m = 14;
    var cw = pw - m * 2;
    var y = 0;
    var pageNum = 1;
    var dateVal = ($('reportDate') && $('reportDate').value) || todayISO();

    function newPage() {
      addFooter();
      doc.addPage();
      pageNum++;
      drawHeader();
      y = 20;
    }
    function check(need) { if (y + need > ph - m - 6) newPage(); }

    function drawHeader() {
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pw, 12, 'F');
      doc.setTextColor(156, 227, 125);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('EVEE Daily Report', m, 8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Date: ' + dateVal, pw - m, 8, { align: 'right' });
    }

    function addFooter() {
      doc.setDrawColor(114, 198, 83);
      doc.setLineWidth(0.4);
      doc.line(m, ph - 12, pw - m, ph - 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);
      doc.text('EVEE Daily Report', m, ph - 7);
      doc.text('Page ' + pageNum, pw - m, ph - 7, { align: 'right' });
    }

    function section(t) {
      check(12);
      doc.setFillColor(114, 198, 83);
      doc.rect(m, y, cw, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(t, m + 3, y + 5);
      y += 11;
    }

    function line(label, value) {
      check(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(String(label), m + 2, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), m + 75, y);
      y += 5.5;
    }

    function tableHead(cols, widths) {
      check(8);
      doc.setFillColor(240, 240, 240);
      doc.rect(m, y - 4, cw, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      var x = m + 2;
      cols.forEach(function (c, i) { doc.text(c, x, y); x += widths[i]; });
      y += 5.5;
    }

    function tableRow(cols, widths) {
      check(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      var x = m + 2;
      cols.forEach(function (c, i) {
        var t = String(c);
        var maxC = Math.floor(widths[i] / 1.8);
        if (t.length > maxC) t = t.substring(0, maxC - 1) + '…';
        doc.text(t, x, y);
        x += widths[i];
      });
      y += 5;
    }

    drawHeader();
    y = 20;

    doc.setFillColor(0, 0, 0);
    doc.rect(m, y, cw, 14, 'F');
    doc.setTextColor(156, 227, 125);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('EVEE DAILY REPORT', pw / 2, y + 9, { align: 'center' });
    y += 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('Date: ' + dateVal, m + 2, y);
    y += 8;

    section('MANPOWER');
    line('Total Workers', num($('totalWorkers').value));
    line('Absent Workers', num($('absentWorkers').value));
    line('Present Workers', num($('presentWorkers').value));
    line('Present Worker %', $('presentWorkerPct').value);
    y += 3;

    section('SHIFT TIME');
    line('Shift Time', num($('shiftHours').value) + 'h ' + num($('shiftMinutes').value) + 'm');
    line('Normal Deductions', num($('normalDeductionsTotal').value) + ' min');
    line('Final Production Minutes', num($('finalProductionMinutes').value) + ' min');
    y += 3;

    section('TIME LOSS (Informational)');
    var tlW = [22, 22, 68, 22];
    tableHead(['From', 'To', 'Reason', 'Minutes'], tlW);
    var tlSumPdf = 0;
    timeLosses.forEach(function (t) {
      tlSumPdf += num(t.minutes);
      tableRow([t.from || '-', t.to || '-', t.reason || '-', num(t.minutes)], tlW);
    });
    y += 2;
    line('Total Time Loss (info only)', tlSumPdf + ' min');
    y += 3;

    section('BIKE PLAN');
    var bpW = [26, 20, 16, 14, 24, 22, 18];
    tableHead(['Model', 'Color', 'Plan Qty', 'C.T', 'Required Time', 'Possible', 'Balance'], bpW);
    bikePlans.forEach(function (b) {
      tableRow([b.model || '-', b.color || '-', num(b.plan), num(b.cycle), num(b.required), num(b.possible), num(b.balance)], bpW);
    });
    y += 2;
    line('Total Planned Bikes', $('planTotalPlanned').textContent);
    line('Total Required Time', $('planTotalRequired').textContent);
    line('Available Production Minutes', $('planAvailable').textContent);
    line('Remaining Minutes', $('planRemaining').textContent);
    line('Status', $('planStatus').textContent);
    y += 3;

    section('COMPLETED BIKES');
    var cW = [60, 60, 40];
    tableHead(['Model', 'Color', 'Quantity'], cW);
    completed.forEach(function (b) { tableRow([b.model || '-', b.color || '-', num(b.qty)], cW); });
    y += 2;
    line('Total Completed Bikes', $('totalCompleted').textContent);
    y += 3;

    section('QUALITY');
    line('Assembly Line SPR', num($('sprPercent').value).toFixed(2) + ' %');
    line('Quality FG Bikes', num($('qualityFg').value));
    y += 3;

    section('REWORK BIKES');
    tableHead(['Model', 'Color', 'Quantity'], cW);
    rework.forEach(function (b) { tableRow([b.model || '-', b.color || '-', num(b.qty)], cW); });
    y += 2;
    line('Total Rework Bikes', $('totalRework').textContent);
    y += 3;

    section('FG (FINISHED GOODS)');
    tableHead(['Model', 'Color', 'Quantity'], cW);
    fg.forEach(function (b) { tableRow([b.model || '-', b.color || '-', num(b.qty)], cW); });
    y += 2;
    line('Total FG Bikes', $('totalFg').textContent);
    y += 3;

    section('SUMMARY');
    line('Total Planned Bikes', $('planTotalPlanned').textContent);
    line('Total Completed Bikes', $('totalCompleted').textContent);
    line('Total Rework Bikes', $('totalRework').textContent);
    line('Total FG Bikes', $('totalFg').textContent);

    addFooter();
    doc.save('EVEE_Daily_Report_' + dateVal + '.pdf');
  });

  // ============ INITIAL RENDER ============
  renderDeductions();
  renderTimeLosses();
  renderBikePlans();
  renderCompleted();
  renderRework();
  renderFg();
  updateAll();
});
