/* script.js */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ---------- HELPERS ----------
  function $(id) {
    return document.getElementById(id);
  }

  function parseNum(val) {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }

  function formatPct(val) {
    return parseNum(val).toFixed(2) + '%';
  }

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ---------- STATE ----------
  let deductionRows = [{ reason: 'Morning Assembly', minutes: 0 }];
  let timeLossRows = [{ from: '', to: '', reason: '', minutes: 0 }];
  let bikePlanRows = [{ model: '', color: '', planQty: 0, cycleTime: 0, requiredMinutes: 0, possibleBikes: 0, balance: 0 }];
  let completedBikeRows = [{ model: '', color: '', qty: 0 }];
  let reworkBikeRows = [{ model: '', color: '', qty: 0 }];
  let fgBikeRows = [{ model: '', color: '', qty: 0 }];

  // ---------- INIT DATE ----------
  $('reportDate').value = todayISO();

  // ==================== RENDER: DEDUCTIONS ====================
  function renderDeductions() {
    const tbody = $('deductionBody');
    tbody.innerHTML = '';
    deductionRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="text" class="deduction-reason" data-idx="' + idx + '" value="' + escapeHtml(row.reason) + '" placeholder="Reason"></td>' +
        '<td><input type="number" class="deduction-minutes" data-idx="' + idx + '" value="' + (row.minutes || 0) + '" min="0" step="1"></td>' +
        '<td><button type="button" class="btn-remove remove-deduction" data-idx="' + idx + '">✕</button></td>';
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.deduction-reason').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        deductionRows[i].reason = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.deduction-minutes').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        deductionRows[i].minutes = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-deduction').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const i = parseInt(this.dataset.idx, 10);
        deductionRows.splice(i, 1);
        renderDeductions();
        updateAll();
      });
    });
  }

  // ==================== RENDER: TIME LOSS ====================
  function renderTimeLoss() {
    const tbody = $('timeLossBody');
    tbody.innerHTML = '';
    timeLossRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="time" class="tl-from" data-idx="' + idx + '" value="' + (row.from || '') + '"></td>' +
        '<td><input type="time" class="tl-to" data-idx="' + idx + '" value="' + (row.to || '') + '"></td>' +
        '<td><input type="text" class="tl-reason" data-idx="' + idx + '" value="' + escapeHtml(row.reason) + '" placeholder="Reason"></td>' +
        '<td><input type="number" class="tl-minutes" data-idx="' + idx + '" value="' + (row.minutes || 0) + '" readonly></td>' +
        '<td><button type="button" class="btn-remove remove-tl" data-idx="' + idx + '">✕</button></td>';
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.tl-from').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        timeLossRows[i].from = this.value;
        recalcTimeLossRow(i);
        renderTimeLoss();
        updateAll();
      });
    });
    tbody.querySelectorAll('.tl-to').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        timeLossRows[i].to = this.value;
        recalcTimeLossRow(i);
        renderTimeLoss();
        updateAll();
      });
    });
    tbody.querySelectorAll('.tl-reason').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        timeLossRows[i].reason = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-tl').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const i = parseInt(this.dataset.idx, 10);
        timeLossRows.splice(i, 1);
        renderTimeLoss();
        updateAll();
      });
    });
  }

  function recalcTimeLossRow(idx) {
    const row = timeLossRows[idx];
    if (!row || !row.from || !row.to) {
      if (row) row.minutes = 0;
      return;
    }
    const fp = row.from.split(':');
    const tp = row.to.split(':');
    const fh = parseInt(fp[0], 10) || 0;
    const fm = parseInt(fp[1], 10) || 0;
    const th = parseInt(tp[0], 10) || 0;
    const tm = parseInt(tp[1], 10) || 0;
    let fromMin = fh * 60 + fm;
    let toMin = th * 60 + tm;
    if (toMin < fromMin) toMin += 24 * 60;
    row.minutes = toMin - fromMin;
  }

  // ==================== RENDER: BIKE PLAN ====================
  function renderBikePlan() {
    const tbody = $('bikePlanBody');
    tbody.innerHTML = '';
    bikePlanRows.forEach(function (row, idx) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="text" class="bp-model" data-idx="' + idx + '" value="' + escapeHtml(row.model) + '" placeholder="Model"></td>' +
        '<td><input type="text" class="bp-color" data-idx="' + idx + '" value="' + escapeHtml(row.color) + '" placeholder="Color"></td>' +
        '<td><input type="number" class="bp-plan" data-idx="' + idx + '" value="' + (row.planQty || 0) + '" min="0" step="1"></td>' +
        '<td><input type="number" class="bp-cycle" data-idx="' + idx + '" value="' + (row.cycleTime || 0) + '" min="0" step="0.1"></td>' +
        '<td><input type="number" class="bp-required" data-idx="' + idx + '" value="' + (row.requiredMinutes || 0) + '" readonly></td>' +
        '<td><input type="number" class="bp-possible" data-idx="' + idx + '" value="' + (row.possibleBikes || 0) + '" readonly></td>' +
        '<td><input type="number" class="bp-balance" data-idx="' + idx + '" value="' + (row.balance || 0) + '" readonly></td>' +
        '<td><button type="button" class="btn-remove remove-bp" data-idx="' + idx + '">✕</button></td>';
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.bp-model').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        bikePlanRows[i].model = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.bp-color').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        bikePlanRows[i].color = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.bp-plan').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        bikePlanRows[i].planQty = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.bp-cycle').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        bikePlanRows[i].cycleTime = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-bp').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const i = parseInt(this.dataset.idx, 10);
        bikePlanRows.splice(i, 1);
        renderBikePlan();
        updateAll();
      });
    });
  }

  // ==================== RENDER: COMPLETED BIKES ====================
  function renderCompletedBikes() {
    const tbody = $('completedBikesBody');
    tbody.innerHTML = '';
    completedBikeRows.forEach(function (row, idx) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="text" class="cb-model" data-idx="' + idx + '" value="' + escapeHtml(row.model) + '" placeholder="Model"></td>' +
        '<td><input type="text" class="cb-color" data-idx="' + idx + '" value="' + escapeHtml(row.color) + '" placeholder="Color"></td>' +
        '<td><input type="number" class="cb-qty" data-idx="' + idx + '" value="' + (row.qty || 0) + '" min="0" step="1"></td>' +
        '<td><button type="button" class="btn-remove remove-cb" data-idx="' + idx + '">✕</button></td>';
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.cb-model').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        completedBikeRows[i].model = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.cb-color').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        completedBikeRows[i].color = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.cb-qty').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        completedBikeRows[i].qty = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-cb').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const i = parseInt(this.dataset.idx, 10);
        completedBikeRows.splice(i, 1);
        renderCompletedBikes();
        updateAll();
      });
    });
  }

  // ==================== RENDER: REWORK BIKES ====================
  function renderReworkBikes() {
    const tbody = $('reworkBikesBody');
    tbody.innerHTML = '';
    reworkBikeRows.forEach(function (row, idx) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="text" class="rw-model" data-idx="' + idx + '" value="' + escapeHtml(row.model) + '" placeholder="Model"></td>' +
        '<td><input type="text" class="rw-color" data-idx="' + idx + '" value="' + escapeHtml(row.color) + '" placeholder="Color"></td>' +
        '<td><input type="number" class="rw-qty" data-idx="' + idx + '" value="' + (row.qty || 0) + '" min="0" step="1"></td>' +
        '<td><button type="button" class="btn-remove remove-rw" data-idx="' + idx + '">✕</button></td>';
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.rw-model').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        reworkBikeRows[i].model = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.rw-color').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        reworkBikeRows[i].color = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.rw-qty').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        reworkBikeRows[i].qty = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-rw').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const i = parseInt(this.dataset.idx, 10);
        reworkBikeRows.splice(i, 1);
        renderReworkBikes();
        updateAll();
      });
    });
  }

  // ==================== RENDER: FG BIKES ====================
  function renderFgBikes() {
    const tbody = $('fgBikesBody');
    tbody.innerHTML = '';
    fgBikeRows.forEach(function (row, idx) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td><input type="text" class="fg-model" data-idx="' + idx + '" value="' + escapeHtml(row.model) + '" placeholder="Model"></td>' +
        '<td><input type="text" class="fg-color" data-idx="' + idx + '" value="' + escapeHtml(row.color) + '" placeholder="Color"></td>' +
        '<td><input type="number" class="fg-qty" data-idx="' + idx + '" value="' + (row.qty || 0) + '" min="0" step="1"></td>' +
        '<td><button type="button" class="btn-remove remove-fg" data-idx="' + idx + '">✕</button></td>';
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.fg-model').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        fgBikeRows[i].model = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.fg-color').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        fgBikeRows[i].color = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.fg-qty').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(this.dataset.idx, 10);
        fgBikeRows[i].qty = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-fg').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const i = parseInt(this.dataset.idx, 10);
        fgBikeRows.splice(i, 1);
        renderFgBikes();
        updateAll();
      });
    });
  }

  // ==================== CALCULATIONS ====================
  function calcManpower() {
    const total = parseNum($('totalWorkers').value);
    const absent = parseNum($('absentWorkers').value);
    let present = total - absent;
    if (present < 0) present = 0;
    $('presentWorkers').value = present;
    const pct = total > 0 ? (present / total) * 100 : 0;
    $('presentWorkerPct').value = formatPct(pct);
    $('summaryTotalWorkers').textContent = total;
    $('summaryPresentWorkers').textContent = present;
    return { total: total, present: present };
  }

  function calcShiftTime() {
    const sh = parseNum($('shiftHours').value);
    const sm = parseNum($('shiftMinutes').value);
    const totalShift = sh * 60 + sm;

    let totalDeductions = 0;
    deductionRows.forEach(function (r) { totalDeductions += parseNum(r.minutes); });
    $('normalDeductionsTotal').value = totalDeductions;

    let totalTimeLoss = 0;
    timeLossRows.forEach(function (r) { totalTimeLoss += parseNum(r.minutes); });
    $('timeLossTotal').value = totalTimeLoss;

    let finalMin = totalShift - totalDeductions - totalTimeLoss;
    if (finalMin < 0) finalMin = 0;
    $('finalProductionMinutes').value = finalMin;
    $('summaryProductionMinutes').textContent = finalMin;
    return finalMin;
  }

  function calcBikePlan(availableMinutes) {
    let remaining = availableMinutes;
    let totalPlanned = 0;
    let totalRequired = 0;

    bikePlanRows.forEach(function (row) {
      const plan = parseNum(row.planQty);
      const cycle = parseNum(row.cycleTime);
      const required = plan * cycle;
      row.requiredMinutes = required;
      totalPlanned += plan;
      totalRequired += required;

      let possible = 0;
      if (cycle > 0) {
        possible = Math.floor(remaining / cycle);
        if (possible > plan) possible = plan;
        if (possible < 0) possible = 0;
      }
      row.possibleBikes = possible;
      row.balance = possible - plan;

      const used = possible * cycle;
      remaining -= used;
      if (remaining < 0) remaining = 0;
    });

    // Update readonly fields in DOM
    const tbody = $('bikePlanBody');
    tbody.querySelectorAll('.bp-required').forEach(function (inp) {
      const i = parseInt(inp.dataset.idx, 10);
      if (bikePlanRows[i]) inp.value = bikePlanRows[i].requiredMinutes || 0;
    });
    tbody.querySelectorAll('.bp-possible').forEach(function (inp) {
      const i = parseInt(inp.dataset.idx, 10);
      if (bikePlanRows[i]) inp.value = bikePlanRows[i].possibleBikes || 0;
    });
    tbody.querySelectorAll('.bp-balance').forEach(function (inp) {
      const i = parseInt(inp.dataset.idx, 10);
      if (bikePlanRows[i]) inp.value = bikePlanRows[i].balance || 0;
    });

    $('totalPlannedBikes').textContent = totalPlanned;
    $('totalRequiredMinutes').textContent = totalRequired;
    $('availableProductionMinutes').textContent = availableMinutes;
    $('remainingMinutes').textContent = remaining;

    const shortfall = totalPlanned - totalPlanned + (totalPlanned - (totalPlanned - (totalPlanned - (totalRequired > availableMinutes ? totalPlanned - Math.floor(availableMinutes / (bikePlanRows.length ? 1 : 1)) : 0))));
    // Simpler: compute total possible vs total planned
    let totalPossible = 0;
    bikePlanRows.forEach(function (r) { totalPossible += (r.possibleBikes || 0); });
    const statusEl = $('bikePlanStatus');
    if (totalPossible >= totalPlanned) {
      statusEl.textContent = 'CAN BE COMPLETED';
      statusEl.className = 'summary-item-value status-success';
    } else {
      const short = totalPlanned - totalPossible;
      statusEl.textContent = 'SHORT ' + short + ' BIKES';
      statusEl.className = 'summary-item-value status-fail';
    }

    return { totalPlanned: totalPlanned, totalRequired: totalRequired, remaining: remaining, totalPossible: totalPossible };
  }

  function calcCompletedBikes() {
    let total = 0;
    completedBikeRows.forEach(function (r) { total += parseNum(r.qty); });
    $('totalCompletedBikes').textContent = total;
    $('summaryCompletedBikes').textContent = total;
    return total;
  }

  function calcReworkBikes() {
    let total = 0;
    reworkBikeRows.forEach(function (r) { total += parseNum(r.qty); });
    $('totalReworkBikes').textContent = total;
    return total;
  }

  function calcFgBikes() {
    let total = 0;
    fgBikeRows.forEach(function (r) { total += parseNum(r.qty); });
    $('totalFgBikes').textContent = total;
    return total;
  }

  // ==================== MASTER UPDATE ====================
  function updateAll() {
    calcManpower();
    const finalMin = calcShiftTime();
    const planData = calcBikePlan(finalMin);
    calcCompletedBikes();
    calcReworkBikes();
    calcFgBikes();
    buildReport(planData);
  }

  // ==================== REPORT BUILDER ====================
  function buildReport(planData) {
    planData = planData || { totalPlanned: 0, totalRequired: 0, remaining: 0, totalPossible: 0 };

    const dateVal = $('reportDate').value || todayISO();
    const totalWorkers = parseNum($('totalWorkers').value);
    const absentWorkers = parseNum($('absentWorkers').value);
    const presentWorkers = parseNum($('presentWorkers').value);
    const presentPct = $('presentWorkerPct').value;

    const shiftH = parseNum($('shiftHours').value);
    const shiftM = parseNum($('shiftMinutes').value);
    const shiftTotal = shiftH * 60 + shiftM;
    const normalDed = parseNum($('normalDeductionsTotal').value);
    const timeLoss = parseNum($('timeLossTotal').value);
    const finalProd = parseNum($('finalProductionMinutes').value);

    let report = '';
    report += '========================================\n';
    report += '           EVEE DAILY REPORT\n';
    report += '========================================\n';
    report += 'Date: ' + dateVal + '\n\n';

    // MANPOWER
    report += '----------------------------------------\n';
    report += 'MANPOWER\n';
    report += '----------------------------------------\n';
    report += 'Total Workers      : ' + totalWorkers + '\n';
    report += 'Absent Workers     : ' + absentWorkers + '\n';
    report += 'Present Workers    : ' + presentWorkers + '\n';
    report += 'Present Worker %   : ' + presentPct + '\n\n';

    // SHIFT TIME
    report += '----------------------------------------\n';
    report += 'SHIFT TIME\n';
    report += '----------------------------------------\n';
    report += 'Shift Time               : ' + shiftH + 'h ' + shiftM + 'm (' + shiftTotal + ' min)\n';
    report += 'Normal Deductions        : ' + normalDed + ' min\n';
    report += 'Time Loss                : ' + timeLoss + ' min\n';
    report += 'Final Production Minutes : ' + finalProd + ' min\n\n';

    // BIKE PLAN
    report += '----------------------------------------\n';
    report += 'BIKE PLAN\n';
    report += '----------------------------------------\n';
    report += 'Model | Color | Plan Qty | Cycle Time | Required Minutes | Possible Bikes | Balance\n';
    bikePlanRows.forEach(function (r) {
      report += (r.model || '-') + ' | ' + (r.color || '-') + ' | ' + (r.planQty || 0) + ' | ' +
        (r.cycleTime || 0) + ' | ' + (r.requiredMinutes || 0) + ' | ' + (r.possibleBikes || 0) + ' | ' +
        (r.balance || 0) + '\n';
    });
    report += '\n';
    report += 'Total Planned Bikes     : ' + planData.totalPlanned + '\n';
    report += 'Total Required Minutes  : ' + planData.totalRequired + '\n';
    report += 'Available Production Min: ' + finalProd + '\n';
    report += 'Remaining Minutes       : ' + planData.remaining + '\n';
    report += 'Status                  : ' + $('bikePlanStatus').textContent + '\n\n';

    // COMPLETED BIKES
    report += '----------------------------------------\n';
    report += 'COMPLETED BIKES\n';
    report += '----------------------------------------\n';
    report += 'Model | Color | Quantity\n';
    completedBikeRows.forEach(function (r) {
      report += (r.model || '-') + ' | ' + (r.color || '-') + ' | ' + (r.qty || 0) + '\n';
    });
    report += 'Total Completed Bikes   : ' + parseNum($('totalCompletedBikes').textContent) + '\n\n';

    // QUALITY
    report += '----------------------------------------\n';
    report += 'QUALITY\n';
    report += '----------------------------------------\n';
    report += 'Assembly Line SPR     : ' + parseNum($('sprPercentage').value) + ' %\n';
    report += 'Quality FG Bikes      : ' + parseNum($('qualityFgBikes').value) + '\n\n';

    // REWORK
    report += '----------------------------------------\n';
    report += 'REWORK BIKES\n';
    report += '----------------------------------------\n';
    report += 'Model | Color | Quantity\n';
    reworkBikeRows.forEach(function (r) {
      report += (r.model || '-') + ' | ' + (r.color || '-') + ' | ' + (r.qty || 0) + '\n';
    });
    report += 'Total Rework Bikes    : ' + parseNum($('totalReworkBikes').textContent) + '\n\n';

    // FG
    report += '----------------------------------------\n';
    report += 'FG (FINISHED GOODS)\n';
    report += '----------------------------------------\n';
    report += 'Model | Color | Quantity\n';
    fgBikeRows.forEach(function (r) {
      report += (r.model || '-') + ' | ' + (r.color || '-') + ' | ' + (r.qty || 0) + '\n';
    });
    report += 'Total FG Bikes        : ' + parseNum($('totalFgBikes').textContent) + '\n\n';

    // SUMMARY
    report += '========================================\n';
    report += 'SUMMARY\n';
    report += '========================================\n';
    report += 'Total Planned Bikes   : ' + planData.totalPlanned + '\n';
    report += 'Total Completed Bikes : ' + parseNum($('totalCompletedBikes').textContent) + '\n';
    report += 'Total Rework Bikes    : ' + parseNum($('totalReworkBikes').textContent) + '\n';
    report += 'Total FG Bikes        : ' + parseNum($('totalFgBikes').textContent) + '\n';
    report += '========================================\n';

    $('reportPreview').textContent = report;
  }

  // ==================== EVENT BINDINGS ====================
  // Static inputs
  ['totalWorkers', 'absentWorkers', 'shiftHours', 'shiftMinutes', 'sprPercentage',
   'qualityFgBikes', 'reportDate'].forEach(function (id) {
    const el = $(id);
    if (el) el.addEventListener('input', updateAll);
    if (el) el.addEventListener('change', updateAll);
  });

  // Add deduction
  $('addDeductionBtn').addEventListener('click', function () {
    deductionRows.push({ reason: '', minutes: 0 });
    renderDeductions();
    updateAll();
  });

  // Add time loss
  $('addTimeLossBtn').addEventListener('click', function () {
    timeLossRows.push({ from: '', to: '', reason: '', minutes: 0 });
    renderTimeLoss();
    updateAll();
  });

  // Add bike plan
  $('addBikePlanBtn').addEventListener('click', function () {
    bikePlanRows.push({ model: '', color: '', planQty: 0, cycleTime: 0, requiredMinutes: 0, possibleBikes: 0, balance: 0 });
    renderBikePlan();
    updateAll();
  });

  // Add completed bike
  $('addCompletedBikeBtn').addEventListener('click', function () {
    completedBikeRows.push({ model: '', color: '', qty: 0 });
    renderCompletedBikes();
    updateAll();
  });

  // Add rework bike
  $('addReworkBikeBtn').addEventListener('click', function () {
    reworkBikeRows.push({ model: '', color: '', qty: 0 });
    renderReworkBikes();
    updateAll();
  });

  // Add FG bike
  $('addFgBikeBtn').addEventListener('click', function () {
    fgBikeRows.push({ model: '', color: '', qty: 0 });
    renderFgBikes();
    updateAll();
  });

  // Copy report
  $('copyReportBtn').addEventListener('click', function () {
    const text = $('reportPreview').textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showCopySuccess();
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showCopySuccess(); } catch (e) { alert('Copy failed.'); }
    document.body.removeChild(ta);
  }

  function showCopySuccess() {
    const msg = $('copySuccessMsg');
    msg.style.display = 'block';
    setTimeout(function () { msg.style.display = 'none'; }, 2200);
  }

  // Download PDF
  $('downloadPdfBtn').addEventListener('click', function () {
    generatePdf();
  });

  // ==================== PDF GENERATION ====================
  function generatePdf() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      alert('PDF library not loaded. Please check your internet connection.');
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;
    let y = margin;
    let pageNum = 1;

    const BLACK = [0, 0, 0];
    const GREEN = [114, 198, 83];
    const LIGHT_GREEN = [156, 227, 125];
    const GRAY = [245, 245, 245];
    const DARK_GRAY = [80, 80, 80];

    function addPageIfNeeded(needed) {
      if (y + needed > pageH - margin - 8) {
        addFooter();
        doc.addPage();
        pageNum++;
        y = margin;
        drawPageHeader();
      }
    }

    function drawPageHeader() {
      doc.setFillColor(BLACK[0], BLACK[1], BLACK[2]);
      doc.rect(0, 0, pageW, 12, 'F');
      doc.setTextColor(LIGHT_GREEN[0], LIGHT_GREEN[1], LIGHT_GREEN[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('EVEE Daily Report', margin, 8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const dateVal = $('reportDate').value || todayISO();
      doc.text('Date: ' + dateVal, pageW - margin, 8, { align: 'right' });
      y = 18;
    }

    function addFooter() {
      doc.setDrawColor(GREEN[0], GREEN[1], GREEN[2]);
      doc.setLineWidth(0.4);
      doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2]);
      doc.text('EVEE Daily Report', margin, pageH - 7);
      doc.text('Page ' + pageNum, pageW - margin, pageH - 7, { align: 'right' });
    }

    function sectionTitle(title) {
      addPageIfNeeded(12);
      doc.setFillColor(GREEN[0], GREEN[1], GREEN[2]);
      doc.rect(margin, y, contentW, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(title, margin + 3, y + 5);
      y += 10;
    }

    function textLine(label, value) {
      addPageIfNeeded(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
      doc.text(String(label), margin + 2, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), margin + 70, y);
      y += 5.5;
    }

    function tableHeader(cols, widths) {
      addPageIfNeeded(8);
      doc.setFillColor(GRAY[0], GRAY[1], GRAY[2]);
      doc.rect(margin, y - 4, contentW, 6.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
      let x = margin + 1.5;
      cols.forEach(function (c, i) {
        doc.text(c, x, y);
        x += widths[i];
      });
      y += 5;
    }

    function tableRow(cols, widths) {
      addPageIfNeeded(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
      let x = margin + 1.5;
      cols.forEach(function (c, i) {
        let text = String(c);
        // Basic truncation to avoid overflow
        const maxChars = Math.floor(widths[i] / 1.8);
        if (text.length > maxChars) text = text.substring(0, maxChars - 1) + '…';
        doc.text(text, x, y);
        x += widths[i];
      });
      y += 5;
    }

    // ---------- BUILD PDF ----------
    drawPageHeader();

    // Title block
    doc.setFillColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.rect(margin, y, contentW, 14, 'F');
    doc.setTextColor(LIGHT_GREEN[0], LIGHT_GREEN[1], LIGHT_GREEN[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('EVEE DAILY REPORT', pageW / 2, y + 9, { align: 'center' });
    y += 20;

    const dateVal = $('reportDate').value || todayISO();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text('Date: ' + dateVal, margin + 2, y);
    y += 8;

    // MANPOWER
    sectionTitle('MANPOWER');
    textLine('Total Workers', parseNum($('totalWorkers').value));
    textLine('Absent Workers', parseNum($('absentWorkers').value));
    textLine('Present Workers', parseNum($('presentWorkers').value));
    textLine('Present Worker %', $('presentWorkerPct').value);
    y += 3;

    // SHIFT TIME
    sectionTitle('SHIFT TIME');
    const shiftH = parseNum($('shiftHours').value);
    const shiftM = parseNum($('shiftMinutes').value);
    textLine('Shift Time', shiftH + 'h ' + shiftM + 'm (' + (shiftH * 60 + shiftM) + ' min)');
    textLine('Normal Deductions', parseNum($('normalDeductionsTotal').value) + ' min');
    textLine('Time Loss', parseNum($('timeLossTotal').value) + ' min');
    textLine('Final Production Minutes', parseNum($('finalProductionMinutes').value) + ' min');
    y += 3;

    // BIKE PLAN
    sectionTitle('BIKE PLAN');
    const bpWidths = [30, 22, 18, 20, 25, 25, 20];
    tableHeader(['Model', 'Color', 'Plan', 'Cycle', 'Required', 'Possible', 'Balance'], bpWidths);
    bikePlanRows.forEach(function (r) {
      tableRow([
        r.model || '-',
        r.color || '-',
        r.planQty || 0,
        r.cycleTime || 0,
        r.requiredMinutes || 0,
        r.possibleBikes || 0,
        r.balance || 0
      ], bpWidths);
    });
    y += 2;
    textLine('Total Planned Bikes', $('totalPlannedBikes').textContent);
    textLine('Total Required Minutes', $('totalRequiredMinutes').textContent);
    textLine('Available Production Minutes', $('availableProductionMinutes').textContent);
    textLine('Remaining Minutes', $('remainingMinutes').textContent);
    textLine('Status', $('bikePlanStatus').textContent);
    y += 4;

    // COMPLETED BIKES
    sectionTitle('COMPLETED BIKES');
    const cWidths = [60, 60, 40];
    tableHeader(['Model', 'Color', 'Quantity'], cWidths);
    completedBikeRows.forEach(function (r) {
      tableRow([r.model || '-', r.color || '-', r.qty || 0], cWidths);
    });
    y += 2;
    textLine('Total Completed Bikes', $('totalCompletedBikes').textContent);
    y += 4;

    // QUALITY
    sectionTitle('QUALITY');
    textLine('Assembly Line SPR', parseNum($('sprPercentage').value) + ' %');
    textLine('Quality FG Bikes', parseNum($('qualityFgBikes').value));
    y += 3;

    // REWORK
    sectionTitle('REWORK BIKES');
    tableHeader(['Model', 'Color', 'Quantity'], cWidths);
    reworkBikeRows.forEach(function (r) {
      tableRow([r.model || '-', r.color || '-', r.qty || 0], cWidths);
    });
    y += 2;
    textLine('Total Rework Bikes', $('totalReworkBikes').textContent);
    y += 4;

    // FG
    sectionTitle('FG (FINISHED GOODS)');
    tableHeader(['Model', 'Color', 'Quantity'], cWidths);
    fgBikeRows.forEach(function (r) {
      tableRow([r.model || '-', r.color || '-', r.qty || 0], cWidths);
    });
    y += 2;
    textLine('Total FG Bikes', $('totalFgBikes').textContent);
    y += 4;

    // SUMMARY
    sectionTitle('SUMMARY');
    textLine('Total Planned Bikes', $('totalPlannedBikes').textContent);
    textLine('Total Completed Bikes', $('totalCompletedBikes').textContent);
    textLine('Total Rework Bikes', $('totalReworkBikes').textContent);
    textLine('Total FG Bikes', $('totalFgBikes').textContent);

    addFooter();

    const filename = 'EVEE_Daily_Report_' + dateVal + '.pdf';
    doc.save(filename);
  }

  // ==================== INITIAL RENDER ====================
  renderDeductions();
  renderTimeLoss();
  renderBikePlan();
  renderCompletedBikes();
  renderReworkBikes();
  renderFgBikes();
  updateAll();
});
