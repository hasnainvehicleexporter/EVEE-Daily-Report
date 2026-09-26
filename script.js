document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       BASIC ELEMENTS
    ========================= */

    const dateInput = document.getElementById("reportDate");

    const totalWorkersInput =
        document.getElementById("totalWorkers");

    const absentWorkersInput =
        document.getElementById("absentWorkers");

    const shiftHoursInput =
        document.getElementById("shiftHours");


    /* =========================
       DEFAULT DATE
    ========================= */

    const today = new Date();

    const localDate =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

    dateInput.value = localDate;


    /* =========================
       HELPER FUNCTIONS
    ========================= */

    function numberValue(element) {

        const value = parseFloat(element.value);

        if (isNaN(value) || value < 0) {
            return 0;
        }

        return value;
    }


    function calculateTimeDifference(from, to) {

        if (!from || !to) {
            return 0;
        }

        const fromParts = from.split(":");
        const toParts = to.split(":");

        let fromMinutes =
            parseInt(fromParts[0]) * 60 +
            parseInt(fromParts[1]);

        let toMinutes =
            parseInt(toParts[0]) * 60 +
            parseInt(toParts[1]);


        /*
         If To time is earlier than From time,
         assume the loss crossed midnight.
        */

        if (toMinutes < fromMinutes) {
            toMinutes += 24 * 60;
        }

        return toMinutes - fromMinutes;
    }


    function createButton() {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "btn remove";

        button.textContent = "Remove";

        return button;
    }


    /* =========================
       NORMAL DEDUCTIONS
    ========================= */

    const deductionContainer =
        document.getElementById("deductionContainer");

    document
        .getElementById("addDeductionBtn")
        .addEventListener("click", addDeduction);


    function addDeduction() {

        const row =
            document.createElement("div");

        row.className = "dynamic-row";

        row.innerHTML = `

            <div class="input-group">

                <label>Reason</label>

                <input
                    type="text"
                    class="deduction-reason"
                    placeholder="Morning Assembly"
                >

            </div>


            <div class="input-group">

                <label>Minutes</label>

                <input
                    type="number"
                    min="0"
                    class="deduction-minutes"
                    placeholder="15"
                >

            </div>

        `;

        const removeButton = createButton();

        row.appendChild(removeButton);

        deductionContainer.appendChild(row);


        row.querySelectorAll("input")
            .forEach(input => {
                input.addEventListener("input", updateAll);
            });


        removeButton.addEventListener("click", function () {

            row.remove();

            updateAll();

        });


        updateAll();
    }


    /* =========================
       TIME LOSS
    ========================= */

    const lossContainer =
        document.getElementById("lossContainer");


    document
        .getElementById("addLossBtn")
        .addEventListener("click", addTimeLoss);


    function addTimeLoss() {

        const row =
            document.createElement("div");

        row.className = "loss-row";

        row.innerHTML = `

            <div class="input-group">

                <label>From Time</label>

                <input
                    type="time"
                    class="loss-from"
                >

            </div>


            <div class="input-group">

                <label>To Time</label>

                <input
                    type="time"
                    class="loss-to"
                >

            </div>


            <div class="input-group loss-reason">

                <label>Reason</label>

                <input
                    type="text"
                    class="loss-reason-input"
                    placeholder="Machine breakdown"
                >

            </div>


            <div>

                <label class="input-group">
                    <span>Loss</span>

                    <span class="loss-result">
                        0 min
                    </span>

                </label>

            </div>

        `;


        const removeButton = createButton();

        row.appendChild(removeButton);

        lossContainer.appendChild(row);


        const from =
            row.querySelector(".loss-from");

        const to =
            row.querySelector(".loss-to");


        from.addEventListener(
            "input",
            updateAll
        );

        to.addEventListener(
            "input",
            updateAll
        );


        row.querySelector(
            ".loss-reason-input"
        ).addEventListener(
            "input",
            updateAll
        );


        removeButton.addEventListener(
            "click",
            function () {

                row.remove();

                updateAll();

            }
        );


        updateAll();
    }


    function getTimeLossData() {

        const rows =
            document.querySelectorAll(
                ".loss-row"
            );

        const data = [];

        rows.forEach(row => {

            const from =
                row.querySelector(
                    ".loss-from"
                ).value;

            const to =
                row.querySelector(
                    ".loss-to"
                ).value;

            const reason =
                row.querySelector(
                    ".loss-reason-input"
                ).value.trim();

            const minutes =
                calculateTimeDifference(
                    from,
                    to
                );


            row.querySelector(
                ".loss-result"
            ).textContent =
                minutes + " min";


            if (
                from ||
                to ||
                reason ||
                minutes
            ) {

                data.push({
                    from,
                    to,
                    reason,
                    minutes
                });

            }

        });

        return data;
    }


    /* =========================
       BIKE ROWS
    ========================= */

    function addBikeRow(containerId) {

        const container =
            document.getElementById(
                containerId
            );

        const row =
            document.createElement("div");

        row.className =
            "dynamic-row";

        row.innerHTML = `

            <div class="input-group">

                <label>Model</label>

                <input
                    type="text"
                    class="bike-model"
                    placeholder="Model"
                >

            </div>


            <div class="input-group">

                <label>Color</label>

                <input
                    type="text"
                    class="bike-color"
                    placeholder="Color"
                >

            </div>


            <div class="input-group">

                <label>Quantity</label>

                <input
                    type="number"
                    min="0"
                    class="bike-qty"
                    placeholder="Qty"
                >

            </div>

        `;


        const removeButton =
            createButton();

        row.appendChild(removeButton);

        container.appendChild(row);


        row.querySelectorAll("input")
            .forEach(input => {

                input.addEventListener(
                    "input",
                    updateAll
                );

            });


        removeButton.addEventListener(
            "click",
            function () {

                row.remove();

                updateAll();

            }
        );


        updateAll();
    }


    /* =========================
       BIKE DATA
    ========================= */

    function getBikeData(containerId) {

        const rows =
            document.querySelectorAll(
                "#" + containerId + " .dynamic-row"
            );

        const data = [];

        rows.forEach(row => {

            const model =
                row.querySelector(
                    ".bike-model"
                ).value.trim();

            const color =
                row.querySelector(
                    ".bike-color"
                ).value.trim();

            const qty =
                parseInt(
                    row.querySelector(
                        ".bike-qty"
                    ).value
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

        });

        return data;
    }


    function totalBikeQuantity(data) {

        return data.reduce(
            (total, item) =>
                total + item.qty,
            0
        );
    }


    /* =========================
       PLAN / COMPLETED
    ========================= */

    document
        .getElementById("addPlanBtn")
        .addEventListener(
            "click",
            function () {

                addBikeRow(
                    "planContainer"
                );

            }
        );


    document
        .getElementById("addCompletedBtn")
        .addEventListener(
            "click",
            function () {

                addBikeRow(
                    "completedContainer"
                );

            }
        );


    document
        .getElementById("addReworkBtn")
        .addEventListener(
            "click",
            function () {

                addBikeRow(
                    "reworkContainer"
                );

            }
        );


    document
        .getElementById("addFgBtn")
        .addEventListener(
            "click",
            function () {

                addBikeRow(
                    "fgContainer"
                );

            }
        );


    /* =========================
       CYCLE TIME
    ========================= */

    const cycleInputs = [
        "cycleTime1",
        "cycleTime2",
        "cycleTime3",
        "modelName1",
        "modelName2",
        "modelName3"
    ];


    cycleInputs.forEach(id => {

        document
            .getElementById(id)
            .addEventListener(
                "input",
                updateAll
            );

    });


    /* =========================
       MAIN CALCULATION
    ========================= */

    function calculateMainData() {

        const totalWorkers =
            numberValue(
                totalWorkersInput
            );

        const absentWorkers =
            numberValue(
                absentWorkersInput
            );

        const presentWorkers =
            Math.max(
                totalWorkers -
                absentWorkers,
                0
            );


        let presentPercentage = 0;

        if (totalWorkers > 0) {

            presentPercentage =
                (
                    presentWorkers /
                    totalWorkers
                ) * 100;

        }


        const shiftHours =
            numberValue(
                shiftHoursInput
            );


        const shiftMinutes =
            shiftHours * 60;


        /* Normal deductions */

        const deductionRows =
            document.querySelectorAll(
                "#deductionContainer .dynamic-row"
            );

        let normalDeductionMinutes = 0;

        deductionRows.forEach(row => {

            normalDeductionMinutes +=
                parseFloat(
                    row.querySelector(
                        ".deduction-minutes"
                    ).value
                ) || 0;

        });


        /* Time loss */

        const lossData =
            getTimeLossData();

        const totalLoss =
            lossData.reduce(
                (total, item) =>
                    total + item.minutes,
                0
            );


        /*
         FINAL AVAILABLE MINUTES

         Shift minutes
         - normal deductions
         - time losses
        */

        const finalMinutes =
            Math.max(
                shiftMinutes -
                normalDeductionMinutes -
                totalLoss,
                0
            );


        return {

            totalWorkers,
            absentWorkers,
            presentWorkers,
            presentPercentage,

            shiftHours,
            shiftMinutes,

            normalDeductionMinutes,

            lossData,
            totalLoss,

            finalMinutes

        };

    }


    /* =========================
       UPDATE SCREEN
    ========================= */

    function updateAll() {

        const data =
            calculateMainData();


        document.getElementById(
            "presentWorkers"
        ).textContent =
            data.presentWorkers;


        document.getElementById(
            "presentPercentage"
        ).textContent =
            data.presentPercentage
                .toFixed(1) + "%";


        document.getElementById(
            "shiftMinutes"
        ).textContent =
            Math.round(
                data.shiftMinutes
            );


        document.getElementById(
            "totalDeductions"
        ).textContent =
            Math.round(
                data.normalDeductionMinutes +
                data.totalLoss
            ) + " min";


        document.getElementById(
            "finalMinutes"
        ).textContent =
            Math.round(
                data.finalMinutes
            ) + " min";


        document.getElementById(
            "totalLossMinutes"
        ).textContent =
            Math.round(
                data.totalLoss
            ) + " minutes";


        /* Bike totals */

        const plan =
            getBikeData(
                "planContainer"
            );

        const completed =
            getBikeData(
                "completedContainer"
            );

        const rework =
            getBikeData(
                "reworkContainer"
            );

        const fg =
            getBikeData(
                "fgContainer"
            );


        document.getElementById(
            "totalPlan"
        ).textContent =
            totalBikeQuantity(plan);


        document.getElementById(
            "totalCompleted"
        ).textContent =
            totalBikeQuantity(completed);


        document.getElementById(
            "totalRework"
        ).textContent =
            totalBikeQuantity(rework);


        document.getElementById(
            "totalFG"
        ).textContent =
            totalBikeQuantity(fg);


        /* Cycle capacity */

        for (let i = 1; i <= 3; i++) {

            const cycleTime =
                numberValue(
                    document.getElementById(
                        "cycleTime" + i
                    )
                );


            let capacity = 0;

            if (cycleTime > 0) {

                capacity =
                    Math.floor(
                        data.finalMinutes /
                        cycleTime
                    );

            }


            document.getElementById(
                "capacity" + i
            ).textContent =
                capacity + " bikes";

        }


        generateReport();

    }


    /* =========================
       REPORT FORMAT HELPERS
    ========================= */

    function formatBikeList(data) {

        if (data.length === 0) {

            return "None";

        }


        return data.map(
            function (item) {

                return (
                    "- " +
                    (item.model || "N/A") +
                    " | Color: " +
                    (item.color || "N/A") +
                    " | Qty: " +
                    item.qty
                );

            }
        ).join("\n");

    }


    /* =========================
       FINAL HOD REPORT
    ========================= */

    function generateReport() {

        const data =
            calculateMainData();


        const plan =
            getBikeData(
                "planContainer"
            );

        const completed =
            getBikeData(
                "completedContainer"
            );

        const rework =
            getBikeData(
                "reworkContainer"
            );

        const fg =
            getBikeData(
                "fgContainer"
            );


        const totalPlan =
            totalBikeQuantity(plan);

        const totalCompleted =
            totalBikeQuantity(completed);

        const planBalance =
            Math.max(
                totalPlan -
                totalCompleted,
                0
            );


        let report = "";


        report +=
            "EVEE DAILY REPORT\n";

        report +=
            "==============================\n\n";


        report +=
            "DATE: " +
            (dateInput.value || "N/A") +
            "\n\n";


        /* MANPOWER */

        report +=
            "1. MANPOWER\n";

        report +=
            "Total Workers: " +
            data.totalWorkers +
            "\n";

        report +=
            "Absent Workers: " +
            data.absentWorkers +
            "\n";

        report +=
            "Present Workers: " +
            data.presentWorkers +
            "\n";

        report +=
            "Present Percentage: " +
            data.presentPercentage.toFixed(1) +
            "%\n\n";


        /* SHIFT */

        report +=
            "2. SHIFT TIME\n";

        report +=
            "Shift Hours: " +
            data.shiftHours +
            " hours\n";

        report +=
            "Shift Minutes: " +
            Math.round(
                data.shiftMinutes
            ) +
            " min\n\n";


        /* DEDUCTIONS */

        report +=
            "3. NORMAL TIME DEDUCTIONS\n";


        const deductionRows =
            document.querySelectorAll(
                "#deductionContainer .dynamic-row"
            );


        if (deductionRows.length === 0) {

            report += "None\n";

        } else {

            deductionRows.forEach(
                function (row) {

                    const reason =
                        row.querySelector(
                            ".deduction-reason"
                        ).value.trim();

                    const minutes =
                        parseFloat(
                            row.querySelector(
                                ".deduction-minutes"
                            ).value
                        ) || 0;


                    if (
                        reason ||
                        minutes
                    ) {

                        report +=
                            "- " +
                            (
                                reason ||
                                "Deduction"
                            ) +
                            ": " +
                            minutes +
                            " min\n";

                    }

                }
            );

        }


        report +=
            "Total Normal Deductions: " +
            Math.round(
                data.normalDeductionMinutes
            ) +
            " min\n\n";


        /* TIME LOSS */

        report +=
            "4. TIME LOSS\n";


        if (
            data.lossData.length === 0
        ) {

            report +=
                "No time loss recorded.\n";

        } else {

            data.lossData.forEach(
                function (loss, index) {

                    report +=
                        (index + 1) +
                        ". " +
                        (
                            loss.from ||
                            "--:--"
                        ) +
                        " to " +
                        (
                            loss.to ||
                            "--:--"
                        ) +
                        " | " +
                        (
                            loss.reason ||
                            "No reason"
                        ) +
                        " | Loss: " +
                        loss.minutes +
                        " min\n";

                }
            );

        }


        report +=
            "Total Time Loss: " +
            Math.round(
                data.totalLoss
            ) +
            " min\n\n";


        /* FINAL MINUTES */

        report +=
            "5. FINAL PRODUCTION TIME\n";

        report +=
            "Shift Minutes: " +
            Math.round(
                data.shiftMinutes
            ) +
            " min\n";

        report +=
            "Normal Deductions: " +
            Math.round(
                data.normalDeductionMinutes
            ) +
            " min\n";

        report +=
            "Time Loss: " +
            Math.round(
                data.totalLoss
            ) +
            " min\n";

        report +=
            "FINAL AVAILABLE MINUTES: " +
            Math.round(
                data.finalMinutes
            ) +
            " min\n\n";


        /* PLAN */

        report +=
            "6. BIKE PLAN\n";

        report +=
            formatBikeList(plan) +
            "\n";

        report +=
            "Total Planned: " +
            totalPlan +
            " bikes\n\n";


        /* COMPLETED */

        report +=
            "7. COMPLETED BIKES\n";

        report +=
            formatBikeList(completed) +
            "\n";

        report +=
            "Total Completed: " +
            totalCompleted +
            " bikes\n";

        report +=
            "Balance vs Plan: " +
            planBalance +
            " bikes\n\n";


        /* CAPACITY */

        report +=
            "8. PRODUCTION CAPACITY\n";


        for (
            let i = 1;
            i <= 3;
            i++
        ) {

            const modelName =
                document.getElementById(
                    "modelName" + i
                ).value.trim();


            const cycleTime =
                numberValue(
                    document.getElementById(
                        "cycleTime" + i
                    )
                );


            if (
                modelName ||
                cycleTime
            ) {

                let capacity = 0;

                if (
                    cycleTime > 0
                ) {

                    capacity =
                        Math.floor(
                            data.finalMinutes /
                            cycleTime
                        );

                }


                report +=
                    "- " +
                    (
                        modelName ||
                        "Model " + i
                    ) +
                    ": " +
                    cycleTime +
                    " min/bike → " +
                    capacity +
                    " bikes possible\n";

            }

        }


        report += "\n";


        /* REWORK */

        report +=
            "9. REWORK BIKES\n";

        report +=
            formatBikeList(rework) +
            "\n";

        report +=
            "Total Rework: " +
            totalBikeQuantity(rework) +
            " bikes\n\n";


        /* FG */

        report +=
            "10. FG - FINISHED GOODS\n";

        report +=
            formatBikeList(fg) +
            "\n";

        report +=
            "Total FG: " +
            totalBikeQuantity(fg) +
            " bikes\n\n";


        report +=
            "==============================\n";

        report +=
            "EVEE DAILY REPORT - END\n";


        document.getElementById(
            "finalReport"
        ).value = report;

    }


    /* =========================
       COPY REPORT
    ========================= */

    document
        .getElementById(
            "copyReportBtn"
        )
        .addEventListener(
            "click",
            async function () {

                const report =
                    document.getElementById(
                        "finalReport"
                    );


                try {

                    await navigator.clipboard.writeText(
                        report.value
                    );

                    this.textContent =
                        "Copied!";

                    setTimeout(
                        () => {
                            this.textContent =
                                "Copy Report";
                        },
                        1500
                    );

                } catch (error) {

                    report.focus();

                    report.select();

                    document.execCommand(
                        "copy"
                    );

                    this.textContent =
                        "Copied!";

                    setTimeout(
                        () => {
                            this.textContent =
                                "Copy Report";
                        },
                        1500
                    );

                }

            }
        );


    /* =========================
       BASIC INPUT EVENTS
    ========================= */

    [
        totalWorkersInput,
        absentWorkersInput,
        shiftHoursInput,
        dateInput
    ].forEach(
        input => {

            input.addEventListener(
                "input",
                updateAll
            );

        }
    );


    /* =========================
       INITIAL ROWS
    ========================= */

    addDeduction();

    addTimeLoss();

    addBikeRow("planContainer");

    addBikeRow("completedContainer");

    addBikeRow("reworkContainer");

    addBikeRow("fgContainer");


    /* INITIAL CALCULATION */

    updateAll();

});
