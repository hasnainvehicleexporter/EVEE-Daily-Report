document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
  // BASIC HELPERS
  // =========================================================

  const $ = (id) => document.getElementById(id);


  function getNumber(id) {

    const element = $(id);

    if (!element) {
      return 0;
    }

    const value =
      parseFloat(element.value);

    return isNaN(value) ? 0 : value;
  }


  function formatNumber(number) {

    if (!isFinite(number)) {
      return "0";
    }

    if (Number.isInteger(number)) {
      return number.toString();
    }

    return number
      .toFixed(2)
      .replace(/\.00$/, "");
  }


  function createRemoveButton() {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "remove-btn";

    button.textContent =
      "Remove";


    button.addEventListener(
      "click",
      () => {

        const row =
          button.closest(
            ".dynamic-row"
          );

        if (row) {
          row.remove();
        }

        updateAll();

      }
    );


    return button;
  }


  // =========================================================
  // DATE
  // =========================================================

  function setToday() {

    const dateInput =
      $("reportDate");

    if (!dateInput) {
      return;
    }


    if (!dateInput.value) {

      const today =
        new Date();

      const year =
        today.getFullYear();

      const month =
        String(
          today.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          today.getDate()
        ).padStart(2, "0");


      dateInput.value =
        `${year}-${month}-${day}`;
    }

  }


  // =========================================================
  // NORMAL DEDUCTIONS
  // =========================================================

  function addDeductionRow(
    reason = "",
    minutes = ""
  ) {

    const container =
      $("deductionContainer");

    if (!container) {
      return;
    }


    const row =
      document.createElement("div");

    row.className =
      "dynamic-row deduction-row";


    row.innerHTML = `

      <div>

        <div class="row-label">
          Reason
        </div>

        <input
          type="text"
          class="deduction-reason"
          placeholder="Morning Assembly / Tea Break"
          value="${reason}"
        >

      </div>


      <div>

        <div class="row-label">
          Minutes
        </div>

        <input
          type="number"
          class="deduction-minutes"
          min="0"
          step="1"
          placeholder="Minutes"
          value="${minutes}"
        >

      </div>

    `;


    row.appendChild(
      createRemoveButton()
    );


    container.appendChild(row);


    row
      .querySelectorAll("input")
      .forEach(input => {

        input.addEventListener(
          "input",
          updateAll
        );

        input.addEventListener(
          "change",
          updateAll
        );

      });

  }


  function getDeductionData() {

    const rows =
      document.querySelectorAll(
        ".deduction-row"
      );


    let total = 0;

    const data = [];


    rows.forEach(row => {

      const reason =
        row.querySelector(
          ".deduction-reason"
        )?.value.trim() || "";


      const minutes =
        parseFloat(
          row.querySelector(
            ".deduction-minutes"
          )?.value
        ) || 0;


      if (
        reason ||
        minutes
      ) {

        data.push({
          reason,
          minutes
        });

      }


      total += minutes;

    });


    return {
      total,
      data
    };

  }


  // =========================================================
  // TIME LOSS
  // =========================================================

  function calculateTimeDifference(
    from,
    to
  ) {

    if (!from || !to) {
      return 0;
    }


    const fromParts =
      from.split(":").map(Number);

    const toParts =
      to.split(":").map(Number);


    let fromTotal =
      fromParts[0] * 60 +
      fromParts[1];


    let toTotal =
      toParts[0] * 60 +
      toParts[1];


    // Overnight support

    if (toTotal < fromTotal) {

      toTotal += 1440;

    }


    return (
      toTotal -
      fromTotal
    );

  }


  function addLossRow() {

    const container =
      $("lossContainer");

    if (!container) {
      return;
    }


    const row =
      document.createElement("div");

    row.className =
      "dynamic-row loss-row";


    row.innerHTML = `

      <div>

        <div class="row-label">
          From
        </div>

        <input
          type="time"
          class="loss-from"
        >

      </div>


      <div>

        <div class="row-label">
          To
        </div>

        <input
          type="time"
          class="loss-to"
        >

      </div>


      <div>

        <div class="row-label">
          Reason
        </div>

        <input
          type="text"
          class="loss-reason"
          placeholder="Machine breakdown / Material shortage"
        >

      </div>


      <div>

        <div class="row-label">
          Loss
        </div>

        <div class="calculated loss-minutes">
          0 min
        </div>

      </div>

    `;


    row.appendChild(
      createRemoveButton()
    );


    container.appendChild(row);


    row
      .querySelectorAll("input")
      .forEach(input => {

        input.addEventListener(
          "input",
          updateAll
        );

        input.addEventListener(
          "change",
          updateAll
        );

      });

  }


  function getTimeLossData() {

    const rows =
      document.querySelectorAll(
        ".loss-row"
      );


    let total = 0;

    const data = [];


    rows.forEach(row => {

      const from =
        row.querySelector(
          ".loss-from"
        )?.value || "";


      const to =
        row.querySelector(
          ".loss-to"
        )?.value || "";


      const reason =
        row.querySelector(
          ".loss-reason"
        )?.value.trim() || "";


      const minutes =
        calculateTimeDifference(
          from,
          to
        );


      const display =
        row.querySelector(
          ".loss-minutes"
        );


      if (display) {

        display.textContent =
          `${minutes} min`;

      }


      if (
        from ||
        to ||
        reason
      ) {

        data.push({
          from,
          to,
          reason,
          minutes
        });

      }


      total += minutes;

    });


    return {
      total,
      data
    };

  }


  // =========================================================
  // BIKE PLAN
  // =========================================================

  function addPlanRow() {

    const container =
      $("planContainer");

    if (!container) {
      return;
    }


    const row =
      document.createElement("div");

    row.className =
      "dynamic-row plan-row";


    row.innerHTML = `

      <!-- MODEL -->

      <div>

        <div class="row-label">
          Model
        </div>

        <input
          type="text"
          class="plan-model"
          placeholder="Model name"
        >

      </div>


      <!-- COLOR -->

      <div>

        <div class="row-label">
          Color
        </div>

        <input
          type="text"
          class="plan-color"
          placeholder="Color"
        >

      </div>


      <!-- PLAN QUANTITY -->

      <div>

        <div class="row-label">
          Plan Qty
        </div>

        <input
          type="number"
          class="plan-qty"
          min="0"
          step="1"
          placeholder="Qty"
        >

      </div>


      <!-- CYCLE TIME -->

      <div>

        <div class="row-label">
          Cycle Time
        </div>

        <input
          type="number"
          class="plan-cycle"
          min="0"
          step="0.01"
          placeholder="Min / bike"
        >

      </div>


      <!-- REQUIRED MINUTES -->

      <div>

        <div class="row-label">
          Required Min
        </div>

        <div class="calculated plan-required">
          0 min
        </div>

      </div>


      <!-- POSSIBLE BIKES -->

      <div>

        <div class="row-label">
          Possible Bikes
        </div>

        <div class="calculated plan-capacity">
          0 bikes
        </div>

      </div>


      <!-- BALANCE -->

      <div>

        <div class="row-label">
          Balance
        </div>

        <div class="calculated plan-balance">
          0
        </div>

      </div>

    `;


    row.appendChild(
      createRemoveButton()
    );


    container.appendChild(row);


    row
      .querySelectorAll("input")
      .forEach(input => {

        input.addEventListener(
          "input",
          updateAll
        );

        input.addEventListener(
          "change",
          updateAll
        );

      });

  }


  /*
   * IMPORTANT:
   *
   * The available production minutes are shared
   * between planned models.
   *
   * Example:
   *
   * Available = 240 min
   *
   * Model A:
   * Plan = 20
   * Cycle = 8
   * Required = 160 min
   * Possible = 20
   *
   * Remaining = 80 min
   *
   * Model B:
   * Cycle = 10
   * Possible = 8
   *
   * Remaining = 0
   *
   * This gives a realistic sequential production capacity.
   */

  function getPlanData(
    finalMinutes
  ) {

    const rows =
      document.querySelectorAll(
        ".plan-row"
      );


    let remainingMinutes =
      Math.max(
        finalMinutes,
        0
      );


    let totalQty = 0;

    let totalRequiredMinutes = 0;

    let totalPossibleBikes = 0;

    const data = [];


    rows.forEach(row => {

      const model =
        row.querySelector(
          ".plan-model"
        )?.value.trim() || "";


      const color =
        row.querySelector(
          ".plan-color"
        )?.value.trim() || "";


      const qty =
        parseFloat(
          row.querySelector(
            ".plan-qty"
          )?.value
        ) || 0;


      const cycle =
        parseFloat(
          row.querySelector(
            ".plan-cycle"
          )?.value
        ) || 0;


      // Required minutes for planned quantity

      const requiredMinutes =
        qty * cycle;


      // Calculate possible bikes
      // from the REMAINING minutes.

      let possibleBikes = 0;

      if (
        cycle > 0 &&
        remainingMinutes > 0
      ) {

        possibleBikes =
          Math.floor(
            remainingMinutes /
            cycle
          );

        /*
         * Do not allow capacity to exceed
         * the planned quantity.
         */

        possibleBikes =
          Math.min(
            possibleBikes,
            qty
          );
      }


      // Minutes actually allocated
      // to this planned model.

      const allocatedMinutes =
        possibleBikes * cycle;


      // Balance:
      // positive = extra capacity
      // negative = shortage

      const balance =
        possibleBikes - qty;


      // Remaining minutes after this model

      remainingMinutes =
        Math.max(
          remainingMinutes -
          allocatedMinutes,
          0
        );


      // Update displays

      const requiredDisplay =
        row.querySelector(
          ".plan-required"
        );


      const capacityDisplay =
        row.querySelector(
          ".plan-capacity"
        );


      const balanceDisplay =
        row.querySelector(
          ".plan-balance"
        );


      if (requiredDisplay) {

        requiredDisplay.textContent =
          `${formatNumber(
            requiredMinutes
          )} min`;
      }


      if (capacityDisplay) {

        capacityDisplay.textContent =
          `${formatNumber(
            possibleBikes
          )} bikes`;
      }


      if (balanceDisplay) {

        if (balance > 0) {

          balanceDisplay.textContent =
            `+${formatNumber(
              balance
            )}`;

        } else {

          balanceDisplay.textContent =
            formatNumber(
              balance
            );
        }

      }


      // Store row

      if (
        model ||
        color ||
        qty ||
        cycle
      ) {

        data.push({

          model,
          color,

          qty,

          cycle,

          requiredMinutes,

          possibleBikes,

          allocatedMinutes,

          balance

        });

      }


      totalQty += qty;

      totalRequiredMinutes +=
        requiredMinutes;

      totalPossibleBikes +=
        possibleBikes;

    });


    return {

      data,

      totalQty,

      totalRequiredMinutes,

      totalPossibleBikes,

      remainingMinutes

    };

  }


  // =========================================================
  // COMPLETED / REWORK / FG
  // =========================================================

  function addBikeRow(
    containerId,
    className
  ) {

    const container =
      $(containerId);

    if (!container) {
      return;
    }


    const row =
      document.createElement("div");

    row.className =
      `dynamic-row simple-bike-row ${className}`;


    row.innerHTML = `

      <div>

        <div class="row-label">
          Model
        </div>

        <input
          type="text"
          class="bike-model"
          placeholder="Model name"
        >

      </div>


      <div>

        <div class="row-label">
          Color
        </div>

        <input
          type="text"
          class="bike-color"
          placeholder="Color"
        >

      </div>


      <div>

        <div class="row-label">
          Qty
        </div>

        <input
          type="number"
          class="bike-qty"
          min="0"
          step="1"
          placeholder="Qty"
        >

      </div>

    `;


    row.appendChild(
      createRemoveButton()
    );


    container.appendChild(row);


    row
      .querySelectorAll("input")
      .forEach(input => {

        input.addEventListener(
          "input",
          updateAll
        );

        input.addEventListener(
          "change",
          updateAll
        );

      });

  }


  function getBikeData(
    containerId
  ) {

    const rows =
      document.querySelectorAll(
        `#${containerId} .simple-bike-row`
      );


    const data = [];

    let total = 0;


    rows.forEach(row => {

      const model =
        row.querySelector(
          ".bike-model"
        )?.value.trim() || "";


      const color =
        row.querySelector(
          ".bike-color"
        )?.value.trim() || "";


      const qty =
        parseFloat(
          row.querySelector(
            ".bike-qty"
          )?.value
        ) || 0;


      if (
        model ||
        color ||
        qty
      ) {

        data.push({
          model,
          color,
          qty
        });

      }


      total += qty;

    });


    return {
      data,
      total
    };

  }


  // =========================================================
  // QUALITY
  // =========================================================

  function updateQuality() {

    const spr =
      getNumber(
        "sprPercentage"
      );


    const fg =
      getNumber(
        "qualityFg"
      );


    if ($("sprDisplay")) {

      $("sprDisplay").textContent =
        `${formatNumber(
          spr
        )}%`;

    }


    if ($("qualityFgDisplay")) {

      $("qualityFgDisplay").textContent =
        formatNumber(
          fg
        );

    }

  }


  // =========================================================
  // MAIN CALCULATION
  // =========================================================

  function calculateData() {

    // =======================================================
    // MANPOWER
    // =======================================================

    const totalWorkers =
      getNumber(
        "totalWorkers"
      );


    const absentWorkers =
      getNumber(
        "absentWorkers"
      );


    const presentWorkers =
      Math.max(
        totalWorkers -
        absentWorkers,
        0
      );


    let presentPercentage = 0;


    if (
      totalWorkers > 0
    ) {

      presentPercentage =
        (
          presentWorkers /
          totalWorkers
        ) * 100;

    }


    if ($("presentWorkers")) {

      $("presentWorkers").textContent =
        formatNumber(
          presentWorkers
        );

    }


    if ($("presentPercentage")) {

      $("presentPercentage").textContent =
        `${formatNumber(
          presentPercentage
        )}%`;

    }


    // =======================================================
    // SHIFT
    // =======================================================

    const shiftHours =
      getNumber(
        "shiftHours"
      );


    const shiftMinutes =
      shiftHours * 60;


    if ($("shiftMinutes")) {

      $("shiftMinutes").textContent =
        formatNumber(
          shiftMinutes
        );

    }


    // =======================================================
    // DEDUCTIONS
    // =======================================================

    const deductions =
      getDeductionData();


    const normalDeductionMinutes =
      deductions.total;


    // =======================================================
    // TIME LOSS
    // =======================================================

    const loss =
      getTimeLossData();


    const totalLoss =
      loss.total;


    if ($("totalLossMinutes")) {

      $("totalLossMinutes").textContent =
        `${formatNumber(
          totalLoss
        )} min`;

    }


    // =======================================================
    // TOTAL DEDUCTIONS
    // =======================================================

    const totalDeductions =
      normalDeductionMinutes +
      totalLoss;


    if ($("totalDeductions")) {

      $("totalDeductions").textContent =
        formatNumber(
          totalDeductions
        );

    }


    // =======================================================
    // FINAL AVAILABLE MINUTES
    // =======================================================

    const finalMinutes =
      Math.max(
        shiftMinutes -
        totalDeductions,
        0
      );


    if ($("finalMinutes")) {

      $("finalMinutes").textContent =
        formatNumber(
          finalMinutes
        );

    }


    // =======================================================
    // BIKE PLAN
    // =======================================================

    const plan =
      getPlanData(
        finalMinutes
      );


    if ($("totalPlan")) {

      $("totalPlan").textContent =
        formatNumber(
          plan.totalQty
        );

    }


    if ($("totalPlanMinutes")) {

      $("totalPlanMinutes").textContent =
        formatNumber(
          plan.totalRequiredMinutes
        );

    }


    if ($("planAvailableMinutes")) {

      $("planAvailableMinutes").textContent =
        formatNumber(
          finalMinutes
        );

    }


    if ($("planRemainingMinutes")) {

      $("planRemainingMinutes").textContent =
        formatNumber(
          plan.remainingMinutes
        );

    }


    // =======================================================
    // PLAN STATUS
    // =======================================================

    const planStatus =
      $("planStatus");


    if (planStatus) {

      planStatus.className = "";


      if (
        plan.totalQty === 0
      ) {

        planStatus.textContent =
          "—";

      } else if (
        plan.totalPossibleBikes >=
        plan.totalQty
      ) {

        planStatus.textContent =
          "PLAN CAN BE COMPLETED";

        planStatus.classList.add(
          "status-ok"
        );

      } else {

        const shortage =
          plan.totalQty -
          plan.totalPossibleBikes;


        planStatus.textContent =
          `SHORT ${formatNumber(
            shortage
          )} BIKES`;

        planStatus.classList.add(
          "status-short"
        );

      }

    }


    // =======================================================
    // COMPLETED
    // =======================================================

    const completed =
      getBikeData(
        "completedContainer"
      );


    if ($("totalCompleted")) {

      $("totalCompleted").textContent =
        formatNumber(
          completed.total
        );

    }


    // =======================================================
    // REWORK
    // =======================================================

    const rework =
      getBikeData(
        "reworkContainer"
      );


    if ($("totalRework")) {

      $("totalRework").textContent =
        formatNumber(
          rework.total
        );

    }


    // =======================================================
    // FG
    // =======================================================

    const fg =
      getBikeData(
        "fgContainer"
      );


    if ($("totalFG")) {

      $("totalFG").textContent =
        formatNumber(
          fg.total
        );

    }


    // =======================================================
    // QUALITY
    // =======================================================

    updateQuality();


    // =======================================================
    // SUMMARY
    // =======================================================

    if ($("summaryWorkers")) {

      $("summaryWorkers").textContent =
        formatNumber(
          totalWorkers
        );

    }


    if ($("summaryPresent")) {

      $("summaryPresent").textContent =
        formatNumber(
          presentWorkers
        );

    }


    if ($("summaryMinutes")) {

      $("summaryMinutes").textContent =
        formatNumber(
          finalMinutes
        );

    }


    if ($("summaryCompleted")) {

      $("summaryCompleted").textContent =
        formatNumber(
          completed.total
        );

    }


    return {

      totalWorkers,
      absentWorkers,

      presentWorkers,
      presentPercentage,

      shiftHours,
      shiftMinutes,

      deductions,
      normalDeductionMinutes,

      loss,
      totalLoss,

      totalDeductions,
      finalMinutes,

      plan,

      completed,

      rework,

      fg,

      spr:
        getNumber(
          "sprPercentage"
        ),

      qualityFg:
        getNumber(
          "qualityFg"
        )

    };

  }


  // =========================================================
  // FORMAT BIKE LIST
  // =========================================================

  function formatBikeList(
    data
  ) {

    if (
      !data ||
      data.length === 0
    ) {

      return "None";

    }


    return data
      .map(item => {

        const model =
          item.model ||
          "N/A";


        const color =
          item.color ||
          "N/A";


        return (
          `${model} | ` +
          `${color} | ` +
          `Qty: ${formatNumber(
            item.qty
          )}`
        );

      })
      .join("\n");

  }


  // =========================================================
  // FORMAT PLAN LIST
  // =========================================================

  function formatPlanList(
    data
  ) {

    if (
      !data ||
      data.length === 0
    ) {

      return "None";

    }


    return data
      .map(item => {

        const model =
          item.model ||
          "N/A";


        const color =
          item.color ||
          "N/A";


        let balanceText;


        if (
          item.balance > 0
        ) {

          balanceText =
            `+${formatNumber(
              item.balance
            )}`;

        } else {

          balanceText =
            formatNumber(
              item.balance
            );

        }


        return (
          `${model} | ` +
          `${color} | ` +
          `Plan: ${formatNumber(
            item.qty
          )} | ` +
          `Cycle: ${formatNumber(
            item.cycle
          )} min/bike | ` +
          `Required: ${formatNumber(
            item.requiredMinutes
          )} min | ` +
          `Possible: ${formatNumber(
            item.possibleBikes
          )} bikes | ` +
          `Balance: ${balanceText}`
        );

      })
      .join("\n");

  }


  // =========================================================
  // GENERATE REPORT
  // =========================================================

  function generateReport() {

    const data =
      calculateData();


    const reportDate =
      $("reportDate")?.value ||
      "Not selected";


    if ($("reportDatePreview")) {

      $("reportDatePreview").textContent =
        reportDate;

    }


    // =======================================================
    // DEDUCTION LINES
    // =======================================================

    let deductionLines =
      "- None";


    if (
      data.deductions.data.length > 0
    ) {

      deductionLines =
        data.deductions.data
          .map(item => {

            return (
              `- ${item.reason || "Deduction"}: ` +
              `${formatNumber(
                item.minutes
              )} min`
            );

          })
          .join("\n");

    }


    // =======================================================
    // TIME LOSS LINES
    // =======================================================

    let lossLines =
      "- None";


    if (
      data.loss.data.length > 0
    ) {

      lossLines =
        data.loss.data
          .map(item => {

            return (
              `- ${item.from || "--"} to ` +
              `${item.to || "--"} | ` +
              `${item.reason || "No reason"} | ` +
              `${formatNumber(
                item.minutes
              )} min`
            );

          })
          .join("\n");

    }


    // =======================================================
    // OTHER DATA
    // =======================================================

    const completedLines =
      formatBikeList(
        data.completed.data
      );


    const planLines =
      formatPlanList(
        data.plan.data
      );


    const reworkLines =
      formatBikeList(
        data.rework.data
      );


    const fgLines =
      formatBikeList(
        data.fg.data
      );


    // =======================================================
    // PLAN BALANCE
    // =======================================================

    const totalPlan =
      data.plan.totalQty;


    const totalPossible =
      data.plan.totalPossibleBikes;


    const planShortage =
      Math.max(
        totalPlan -
        totalPossible,
        0
      );


    // =======================================================
    // COMPLETED VS PLAN
    // =======================================================

    const balanceVsPlan =
      data.completed.total -
      totalPlan;


    // =======================================================
    // REPORT
    // =======================================================

    let report = "";


    report +=
      "========================================\n";

    report +=
      "       EVEE DAILY PRODUCTION REPORT\n";

    report +=
      "========================================\n\n";


    report +=
      `DATE: ${reportDate}\n\n`;


    // =======================================================
    // MANPOWER
    // =======================================================

    report +=
      "---------------- MANPOWER ----------------\n";

    report +=
      `Total Workers       : ${formatNumber(
        data.totalWorkers
      )}\n`;

    report +=
      `Absent Workers      : ${formatNumber(
        data.absentWorkers
      )}\n`;

    report +=
      `Present Workers     : ${formatNumber(
        data.presentWorkers
      )}\n`;

    report +=
      `Present Worker %    : ${formatNumber(
        data.presentPercentage
      )}%\n\n`;


    // =======================================================
    // SHIFT TIME
    // =======================================================

    report +=
      "---------------- SHIFT TIME ----------------\n";

    report +=
      `Shift Hours         : ${formatNumber(
        data.shiftHours
      )} hours\n`;

    report +=
      `Shift Minutes       : ${formatNumber(
        data.shiftMinutes
      )} min\n`;

    report +=
      `Normal Deductions   : ${formatNumber(
        data.normalDeductionMinutes
      )} min\n`;

    report +=
      `Time Loss           : ${formatNumber(
        data.totalLoss
      )} min\n`;

    report +=
      `Total Deductions    : ${formatNumber(
        data.totalDeductions
      )} min\n`;

    report +=
      `Final Available     : ${formatNumber(
        data.finalMinutes
      )} min\n\n`;


    // =======================================================
    // NORMAL DEDUCTIONS
    // =======================================================

    report +=
      "----------- NORMAL DEDUCTIONS -----------\n";

    report +=
      `${deductionLines}\n\n`;


    // =======================================================
    // TIME LOSS
    // =======================================================

    report +=
      "--------------- TIME LOSS ---------------\n";

    report +=
      `${lossLines}\n`;

    report +=
      `Total Time Loss     : ${formatNumber(
        data.totalLoss
      )} min\n\n`;


    // =======================================================
    // BIKE PLAN
    // =======================================================

    report +=
      "---------------- BIKE PLAN ----------------\n";

    report +=
      `${planLines}\n\n`;

    report +=
      `Total Planned Bikes : ${formatNumber(
        totalPlan
      )}\n`;

    report +=
      `Possible Bikes      : ${formatNumber(
        totalPossible
      )}\n`;

    report +=
      `Required Minutes    : ${formatNumber(
        data.plan.totalRequiredMinutes
      )} min\n`;

    report +=
      `Available Minutes   : ${formatNumber(
        data.finalMinutes
      )} min\n`;

    report +=
      `Remaining Minutes   : ${formatNumber(
        data.plan.remainingMinutes
      )} min\n`;


    if (
      totalPlan === 0
    ) {

      report +=
        "Plan Status         : No plan entered\n";

    } else if (
      planShortage === 0
    ) {

      report +=
        "Plan Status         : CAN BE COMPLETED\n";

    } else {

      report +=
        `Plan Status         : SHORT ${formatNumber(
          planShortage
        )} BIKES\n`;

    }


    report += "\n";


    // =======================================================
    // COMPLETED BIKES
    // =======================================================

    report +=
      "------------ COMPLETED BIKES ------------\n";

    report +=
      `${completedLines}\n`;

    report +=
      `Total Completed     : ${formatNumber(
        data.completed.total
      )} bikes\n`;


    if (
      balanceVsPlan > 0
    ) {

      report +=
        `Balance vs Plan     : +${formatNumber(
          balanceVsPlan
        )} bikes\n`;

    } else {

      report +=
        `Balance vs Plan     : ${formatNumber(
          balanceVsPlan
        )} bikes\n`;

    }


    report += "\n";


    // =======================================================
    // QUALITY
    // =======================================================

    report +=
      "---------- QUALITY DEPARTMENT -----------\n";

    report +=
      `Assembly Line SPR   : ${formatNumber(
        data.spr
      )}%\n`;

    report +=
      `Quality FG Bikes    : ${formatNumber(
        data.qualityFg
      )} bikes\n\n`;


    // =======================================================
    // REWORK
    // =======================================================

    report +=
      "-------------- REWORK BIKES --------------\n";

    report +=
      `${reworkLines}\n`;

    report +=
      `Total Rework        : ${formatNumber(
        data.rework.total
      )} bikes\n\n`;


    // =======================================================
    // FG
    // =======================================================

    report +=
      "---------- FG - FINISHED GOODS ----------\n";

    report +=
      `${fgLines}\n`;

    report +=
      `Total FG            : ${formatNumber(
        data.fg.total
      )} bikes\n\n`;


    // =======================================================
    // END
    // =======================================================

    report +=
      "========================================\n";

    report +=
      "             END OF REPORT\n";

    report +=
      "========================================";


    if ($("finalReport")) {

      $("finalReport").value =
        report;

    }

  }


  // =========================================================
  // UPDATE
  // =========================================================

  function updateAll() {

    generateReport();

  }


  // =========================================================
  // ADD DEDUCTION
  // =========================================================

  if ($("addDeductionBtn")) {

    $("addDeductionBtn")
      .addEventListener(
        "click",
        () => {

          addDeductionRow();

          updateAll();

        }
      );

  }


  // =========================================================
  // ADD TIME LOSS
  // =========================================================

  if ($("addLossBtn")) {

    $("addLossBtn")
      .addEventListener(
        "click",
        () => {

          addLossRow();

          updateAll();

        }
      );

  }


  // =========================================================
  // ADD PLAN
  // =========================================================

  if ($("addPlanBtn")) {

    $("addPlanBtn")
      .addEventListener(
        "click",
        () => {

          addPlanRow();

          updateAll();

        }
      );

  }


  // =========================================================
  // ADD COMPLETED
  // =========================================================

  if ($("addCompletedBtn")) {

    $("addCompletedBtn")
      .addEventListener(
        "click",
        () => {

          addBikeRow(
            "completedContainer",
            "completed-row"
          );

          updateAll();

        }
      );

  }


  // =========================================================
  // ADD REWORK
  // =========================================================

  if ($("addReworkBtn")) {

    $("addReworkBtn")
      .addEventListener(
        "click",
        () => {

          addBikeRow(
            "reworkContainer",
            "rework-row"
          );

          updateAll();

        }
      );

  }


  // =========================================================
  // ADD FG
  // =========================================================

  if ($("addFgBtn")) {

    $("addFgBtn")
      .addEventListener(
        "click",
        () => {

          addBikeRow(
            "fgContainer",
            "fg-row"
          );

          updateAll();

        }
      );

  }


  // =========================================================
  // COPY REPORT
  // =========================================================

  if ($("copyReportBtn")) {

    $("copyReportBtn")
      .addEventListener(
        "click",
        async () => {

          const report =
            $("finalReport")?.value || "";


          if (!report.trim()) {

            alert(
              "There is no report to copy."
            );

            return;

          }


          const button =
            $("copyReportBtn");


          try {

            await navigator.clipboard
              .writeText(report);


            const oldText =
              button.textContent;


            button.textContent =
              "✓ REPORT COPIED";


            setTimeout(
              () => {

                button.textContent =
                  oldText;

              },
              2000
            );


          } catch (error) {

            // Clipboard fallback

            const textarea =
              $("finalReport");


            try {

              textarea
                .removeAttribute(
                  "readonly"
                );


              textarea.focus();

              textarea.select();


              document.execCommand(
                "copy"
              );


              textarea.setAttribute(
                "readonly",
                true
              );


              const oldText =
                button.textContent;


              button.textContent =
                "✓ REPORT COPIED";


              setTimeout(
                () => {

                  button.textContent =
                    oldText;

                },
                2000
              );


            } catch (fallbackError) {

              textarea.setAttribute(
                "readonly",
                true
              );


              alert(
                "Copy failed. Please select the report and copy it manually."
              );

            }

          }

        }
      );

  }


  // =========================================================
  // GLOBAL INPUT LISTENERS
  // =========================================================

  document
    .querySelectorAll("input")
    .forEach(input => {

      input.addEventListener(
        "input",
        updateAll
      );


      input.addEventListener(
        "change",
        updateAll
      );

    });


  // =========================================================
  // INITIAL DATA
  // =========================================================

  setToday();


  // Morning assembly
  addDeductionRow(
    "Morning Assembly",
    ""
  );


  // First time-loss row
  addLossRow();


  // First planned bike row
  addPlanRow();


  // First completed row
  addBikeRow(
    "completedContainer",
    "completed-row"
  );


  // First rework row
  addBikeRow(
    "reworkContainer",
    "rework-row"
  );


  // First FG row
  addBikeRow(
    "fgContainer",
    "fg-row"
  );


  // =========================================================
  // FIRST CALCULATION
  // =========================================================

  updateAll();

});
