/* script.js */
document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ---------- HELPERS ----------
  function $(id) {
    return document.getElementById(id);
  }

  function parseNum(val) {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }

  function floorNum(val) {
    return Math.floor(parseNum(val));
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

  // ---------- STATE ----------
  let deductionRows = [];
  let timeLossRows = [];
  let bikePlanRows = [];
  let completedBikeRows = [];
  let reworkBikeRows = [];
  let fgBikeRows = [];

  // ---------- INITIAL DATE ----------
  $('reportDate').value = todayISO();

  // ---------- RENDER DEDUCTIONS ----------
  function renderDeductions() {
    const tbody = $('deductionBody');
    tbody.innerHTML = '';
    deductionRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="deduction-reason" data-idx="${idx}" value="${row.reason || ''}" placeholder="Reason"></td>
        <td><input type="number" class="deduction-minutes" data-idx="${idx}" value="${row.minutes || 0}" min="0" step="1"></td>
        <td><button class="btn-remove remove-deduction" data-idx="${idx}">✕</button></td>
      `;
      tbody.appendChild(tr);
    });
    // Attach events
    tbody.querySelectorAll('.deduction-reason').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        deductionRows[i].reason = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.deduction-minutes').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        deductionRows[i].minutes = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-deduction').forEach(btn => {
      btn.addEventListener('click', function() {
        const i = parseInt(this.dataset.idx);
        deductionRows.splice(i, 1);
        renderDeductions();
        updateAll();
      });
    });
  }

  // ---------- RENDER TIME LOSS ----------
  function renderTimeLoss() {
    const tbody = $('timeLossBody');
    tbody.innerHTML = '';
    timeLossRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="time" class="tl-from" data-idx="${idx}" value="${row.from || ''}"></td>
        <td><input type="time" class="tl-to" data-idx="${idx}" value="${row.to || ''}"></td>
        <td><input type="text" class="tl-reason" data-idx="${idx}" value="${row.reason || ''}" placeholder="Reason"></td>
        <td><input type="number" class="tl-minutes" data-idx="${idx}" value="${row.minutes || 0}" readonly></td>
        <td><button class="btn-remove remove-tl" data-idx="${idx}">✕</button></td>
      `;
      tbody.appendChild(tr);
    });
    // Attach events
    tbody.querySelectorAll('.tl-from').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        timeLossRows[i].from = this.value;
        recalcTimeLossRow(i);
        updateAll();
      });
    });
    tbody.querySelectorAll('.tl-to').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        timeLossRows[i].to = this.value;
        recalcTimeLossRow(i);
        updateAll();
      });
    });
    tbody.querySelectorAll('.tl-reason').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        timeLossRows[i].reason = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-tl').forEach(btn => {
      btn.addEventListener('click', function() {
        const i = parseInt(this.dataset.idx);
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
    const [fh, fm] = row.from.split(':').map(Number);
    const [th, tm] = row.to.split(':').map(Number);
    let fromMin = fh * 60 + fm;
    let toMin = th * 60 + tm;
    if (toMin < fromMin) toMin += 24 * 60; // crossed midnight
    row.minutes = toMin - fromMin;
  }

  // ---------- RENDER BIKE PLAN ----------
  function renderBikePlan() {
    const tbody = $('bikePlanBody');
    tbody.innerHTML = '';
    bikePlanRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="bp-model" data-idx="${idx}" value="${row.model || ''}" placeholder="Model"></td>
        <td><input type="text" class="bp-color" data-idx="${idx}" value="${row.color || ''}" placeholder="Color"></td>
        <td><input type="number" class="bp-plan" data-idx="${idx}" value="${row.planQty || 0}" min="0" step="1"></td>
        <td><input type="number" class="bp-cycle" data-idx="${idx}" value="${row.cycleTime || 0}" min="0" step="0.1"></td>
        <td><input type="number" class="bp-required" data-idx="${idx}" value="${row.requiredMinutes || 0}" readonly></td>
        <td><input type="number" class="bp-possible" data-idx="${idx}" value="${row.possibleBikes || 0}" readonly></td>
        <td><input type="number" class="bp-balance" data-idx="${idx}" value="${row.balance || 0}" readonly></td>
        <td><button class="btn-remove remove-bp" data-idx="${idx}">✕</button></td>
      `;
      tbody.appendChild(tr);
    });
    // Attach events
    tbody.querySelectorAll('.bp-model').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        bikePlanRows[i].model = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.bp-color').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        bikePlanRows[i].color = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.bp-plan').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        bikePlanRows[i].planQty = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.bp-cycle').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        bikePlanRows[i].cycleTime = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-bp').forEach(btn => {
      btn.addEventListener('click', function() {
        const i = parseInt(this.dataset.idx);
        bikePlanRows.splice(i, 1);
        renderBikePlan();
        updateAll();
      });
    });
  }

  // ---------- RENDER COMPLETED BIKES ----------
  function renderCompletedBikes() {
    const tbody = $('completedBikesBody');
    tbody.innerHTML = '';
    completedBikeRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="cb-model" data-idx="${idx}" value="${row.model || ''}" placeholder="Model"></td>
        <td><input type="text" class="cb-color" data-idx="${idx}" value="${row.color || ''}" placeholder="Color"></td>
        <td><input type="number" class="cb-qty" data-idx="${idx}" value="${row.qty || 0}" min="0" step="1"></td>
        <td><button class="btn-remove remove-cb" data-idx="${idx}">✕</button></td>
      `;
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.cb-model').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        completedBikeRows[i].model = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.cb-color').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        completedBikeRows[i].color = this.value;
        updateAll();
      });
    });
    tbody.querySelectorAll('.cb-qty').forEach(inp => {
      inp.addEventListener('input', function() {
        const i = parseInt(this.dataset.idx);
        completedBikeRows[i].qty = parseNum(this.value);
        updateAll();
      });
    });
    tbody.querySelectorAll('.remove-cb').forEach(btn => {
      btn.addEventListener('click', function() {
        const i = parseInt(this.dataset.idx);
        completedBikeRows.splice(i, 1);
        renderCompletedBikes();
        updateAll();
      });
    });
  }

  // ---------- RENDER REWORK BIKES ----------
  function renderReworkBikes() {
    const tbody = $('reworkBikesBody');
    tbody.innerHTML = '';
    reworkBikeRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="rw-model" data-idx="${idx}" value="${row.model || ''}" placeholder="Model"></td>
        <td><input type="text" class="rw-color" data-idx="${idx}" value="${row.color || ''}" placeholder="Color"></td>
        <td><input type="number" class="rw-qty" data-idx="${idx}" value="${row.qty || 0}" min="0" step="1"></td>
        <td><button class="btn-remove remove-rw" data-idx="${idx}">
