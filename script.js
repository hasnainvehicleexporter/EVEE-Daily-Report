document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       BASIC ELEMENTS
    ===================================================== */

    const reportDate =
        document.getElementById("reportDate");

    const totalWorkers =
        document.getElementById("totalWorkers");

    const absentWorkers =
        document.getElementById("absentWorkers");

    const shiftHours =
        document.getElementById("shiftHours");


    /* =====================================================
       DEFAULT DATE
    ===================================================== */

    const today = new Date();

    const todayString =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

    reportDate.value = todayString;


    /* =====================================================
       HELPER
    ===================================================== */

    function getNumber(element) {

        const value =
            parseFloat(element.value);

        if (
            isNaN(value) ||
            value < 0
        ) {
            return 0;
        }

        return value;
    }


    function createRemoveButton() {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "btn remove-btn";

        button.textContent =
            "Remove";

        return button;
    }


    /* =====================================================
       TIME CALCULATOR
    ===================================================== */

    function calculateTimeDifference(
        from,
        to
    ) {

        if (
            !from ||
            !to
        ) {
            return 0;
        }


        const fromParts =
            from.split(":");

        const toParts =
            to.split(":");


        let fromMinutes =
            parseInt(fromParts[0]) * 60 +
            parseInt(fromParts[1]);


        let toMinutes =
            parseInt(toParts[0]) * 60 +
            parseInt(toParts[1]);


        /*
            If To is earlier than From,
            assume the loss crossed midnight.
        */

        if (
            toMinutes < fromMinutes
        ) {

            toMinutes += 1440;

        }


        return (
            toMinutes -
            fromMinutes
        );

    }


    /* =====================================================
       NORMAL DEDUCTIONS
    ===================================================== */

    const deductionContainer =
        document.getElementById(
            "deductionContainer"
        );


    document
        .getElementById(
            "addDeductionBtn"
        )
        .addEventListener(
            "click",
            addDeduction
        );


    function addDeduction() {

        const row =
            document.createElement("div");

        row.className =
            "dynamic-row";


        row.innerHTML = `

            <div class="input-group">

                <label>
                    Reason
                </label>

                <input
                    type="text"
                    class="deduction-reason"
                    placeholder="Morning Assembly"
                >

            </div>


            <div class="input-group">

                <label>
                    Minutes
                </label>

                <input
                    type="number"
                    min="0"
                    class="deduction-minutes"
                    placeholder="15"
                >

            </div>

        `;


        const remove =
            createRemoveButton();


        row.appendChild(remove);


        deductionContainer.appendChild(row);


        row.querySelectorAll("input")
            .forEach(input => {

                input.addEventListener(
                    "input",
                    updateAll
                );

            });


        remove.addEventListener(
            "click",
            function () {

                row.remove();

                updateAll();

            }
        );


        updateAll();

    }


    /* =====================================================
       TIME LOSS
    ===================================================== */

    const lossContainer =
        document.getElementById(
            "lossContainer"
        );


    document
        .getElementById(
            "addLossBtn"
        )
        .addEventListener(
            "click",
            addTimeLoss
        );


    function addTimeLoss() {

        const row =
            document.createElement("div");

        row.className =
            "loss-row";


        row.innerHTML = `

            <div class="input-group">

                <label>
                    From Time
                </label>

                <input
                    type="time"
                    class="loss-from"
                >

            </div>


            <div class="input-group">

                <label>
                    To Time
                </label>

                <input
                    type="time"
                    class="loss-to"
                >

            </div>


            <div class="input-group loss-reason">

                <label>
                    Reason
                </label>

                <input
                    type="text"
                    class="loss-reason-input"
                    placeholder="Machine breakdown"
                >

            </div>


            <div class="input-group">

                <label>
                    Time Lost
                </label>

                <div class="loss-result">
                    0 min
                </div>

            </div>

        `;


        const remove =
            createRemoveButton();


        row.appendChild(remove);


        lossContainer.appendChild(row);


        row.querySelectorAll("input")
            .forEach(input => {

                input.addEventListener(
                    "input",
                    updateAll
                );

            });


        remove.addEventListener(
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
                reason
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


    /* =====================================================
       BIKE ROWS
    ===================================================== */

    function addBikeRow(
        containerId
    ) {

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

                <label>
                    Model
                </label>

                <input
                    type="text"
                    class="bike-model"
                    placeholder="Model"
                >

            </div>


            <div class="input-group">

                <label>
                    Color
                </label>

                <input
                    type="text"
                    class="bike-color"
                    placeholder="Color"
                >

            </div>


            <div class="input-group">

                <label>
                    Quantity
                </label>

                <input
                    type="number"
                    min="0"
                    class="bike-qty"
                    placeholder="Qty"
                >

            </div>

        `;


        const remove =
            createRemoveButton();


        row.appendChild(remove);


        container.appendChild(row);


        row.querySelectorAll("input")
            .forEach(input => {

                input.addEventListener(
                    "input",
                    updateAll
                );

            });


        remove.addEventListener(
            "click",
            function () {

                row.remove();

                updateAll();

            }
        );


        updateAll();

    }


    function getBikeData(
        containerId
    ) {

        const rows =
            document.querySelectorAll(
                "#" +
                containerId +
                " .dynamic-row"
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


    function getTotalQuantity(
        data
    ) {

        return data.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    item.qty
                );

            },
            0
        );

    }


    /* =====================================================
       ADD BIKE BUTTONS
    ===================================================== */

    document
        .getElementById(
            "addPlanBtn"
        )
        .addEventListener(
            "click",
            function () {

                addBikeRow(
                    "planContainer"
                );

            }
        );


    document
        .getElementById(
            "addCompletedBtn"
        )
        .addEventListener(
            "click",
            function () {

                addBikeRow(
                    "completedContainer"
                );

            }
        );


    document
        .getElementById(
            "addReworkBtn"
        )
        .addEventListener(
            "click",
            function () {

                addBikeRow(
                    "reworkContainer"
                );

            }
        );


    document
        .getElementById(
            "addFgBtn"
        )
        .addEventListener(
            "click",
            function () {

                addBikeRow(
                    "fgContainer"
                );

            }
        );


    /* =====================================================
       QUALITY DEPARTMENT
    ===================================================== */

    const sprPercentage =
        document.getElementById(
            "sprPercentage"
        );


    const qualityFg =
        document.getElementById(
            "qualityFg"
        );


    sprPercentage.addEventListener(
        "input",
        updateAll
    );


    qualityFg.addEventListener(
        "input",
        updateAll
    );


    /* =====================================================
       CYCLE TIME
    ===================================================== */

    for (
        let i = 1;
        i <= 3;
        i++
    ) {

        document
            .getElementById(
                "modelName" + i
            )
            .addEventListener(
                "input",
                updateAll
            );


        document
            .getElementById(
                "cycleTime" + i
            )
            .addEventListener(
                "input",
                updateAll
            );

    }


    /* =====================================================
       MAIN CALCULATION
    ===================================================== */

    function calculateData() {

        const workers =
            getNumber(
                totalWorkers
            );


        const absent =
            getNumber(
                absentWorkers
            );


        const present =
            Math.max(
                workers -
                absent,
                0
            );


        let presentPercentage =
            0;


        if (
            workers > 0
        ) {

            presentPercentage =
                (
                    present /
                    workers
                ) *
                100;

        }


        const hours =
            getNumber(
                shiftHours
            );


        const shiftMinutes =
            hours * 60;


        /* Normal deductions */

        const deductionRows =
            document.querySelectorAll(
                "#deductionContainer .dynamic-row"
            );


        let normalDeductions = 0;


        deductionRows.forEach(
            function (row) {

                normalDeductions +=
                    parseFloat(
                        row.querySelector(
                            ".deduction-minutes"
                        ).value
                    ) || 0;

            }
        );


        /* Time loss */

        const lossData =
            getTimeLossData();


        const totalLoss =
            lossData.reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        item.minutes
                    );

                },
                0
            );


        const finalMinutes =
            Math.max(
                shiftMinutes -
                normalDeductions -
                totalLoss,
                0
            );


        return {

            workers,
            absent,
            present,
            presentPercentage,

            hours,
            shiftMinutes,

            normalDeductions,

            lossData,
            totalLoss,

            finalMinutes

        };

    }


    /* =====================================================
       UPDATE DASHBOARD
    ===================================================== */

    function updateAll() {

        const data =
            calculateData();


        /* Manpower */

        document.getElementById(
            "presentWorkers"
        ).textContent =
            data.present;


        document.getElementById(
            "presentPercentage"
        ).textContent =
            data.presentPercentage.toFixed(1) +
            "%";


        /* Shift */

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
                data.normalDeductions +
                data.totalLoss
            ) +
            " min";


        document.getElementById(
            "finalMinutes"
        ).textContent =
            Math.round(
                data.finalMinutes
            ) +
            " min";


        document.getElementById(
            "totalLossMinutes"
        ).textContent =
            Math.round(
                data.totalLoss
            ) +
            " minutes";


        /* Bike data */

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


        const planTotal =
            getTotalQuantity(plan);


        const completedTotal =
            getTotalQuantity(completed);


        /* Dashboard */

        document.getElementById(
            "summaryWorkers"
        ).textContent =
            data.workers;


        document.getElementById(
            "summaryPresent"
        ).textContent =
            data.present;


        document.getElementById(
            "summaryMinutes"
        ).textContent =
            Math.round(
                data.finalMinutes
            );


        document.getElementById(
            "summaryCompleted"
        ).textContent =
            completedTotal;


        /* Totals */

        document.getElementById(
            "totalPlan"
        ).textContent =
            planTotal +
            " bikes";


        document.getElementById(
            "totalCompleted"
        ).textContent =
            completedTotal +
            " bikes";


        document.getElementById(
            "totalRework"
        ).textContent =
            getTotalQuantity(
                rework
            ) +
            " bikes";


        document.getElementById(
            "totalFG"
        ).textContent =
            getTotalQuantity(
                fg
            ) +
            " bikes";


        /* Quality */

        let spr =
            getNumber(
                sprPercentage
            );


        if (
            spr > 100
        ) {

            spr = 100;

        }


        document.getElementById(
            "sprDisplay"
        ).textContent =
            spr.toFixed(2) +
            "%";


        document.getElementById(
            "qualityFgDisplay"
        ).textContent =
            getNumber(
                qualityFg
            );


        /* Capacity */

        for (
            let i = 1;
            i <= 3;
            i++
        ) {

            const cycle =
                getNumber(
                    document.getElementById(
                        "cycleTime" + i
                    )
                );


            let capacity = 0;


            if (
                cycle > 0
            ) {

                capacity =
                    Math.floor(
                        data.finalMinutes /
                        cycle
                    );

            }


            document.getElementById(
                "capacity" + i
            ).textContent =
                capacity +
                " bikes";

        }


        generateReport();

    }


    /* =====================================================
       REPORT LIST
    ===================================================== */

    function formatBikeList(
        data
    ) {

        if (
            data.length === 0
        ) {

            return "None";

        }


        return data.map(
            function (item) {

                return (
                    "- " +
                    (
                        item.model ||
                        "N/A"
                    ) +
                    " | Color: " +
                    (
                        item.color ||
                        "N/A"
                    ) +
                    " | Qty: " +
                    item.qty
                );

            }
        ).join("\n");

    }


    /* =====================================================
       GENERATE FINAL REPORT
    ===================================================== */

    function generateReport() {

        const data =
            calculateData();


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
            getTotalQuantity(
                plan
            );


        const totalCompleted =
            getTotalQuantity(
                completed
            );


        const planBalance =
            Math.max(
                totalPlan -
                totalCompleted,
                0
            );


        const qualityFG =
            getNumber(
                qualityFg
            );


        const spr =
            Math.min(
                getNumber(
                    sprPercentage
                ),
                100
            );


        let report = "";


        report +=
            "EVEE DAILY REPORT\n";

        report +=
            "========================================\n\n";


        report +=
            "DATE: " +
            (
                reportDate.value ||
                "N/A"
            ) +
            "\n\n";


        /* MANPOWER */

        report +=
            "1. MANPOWER\n";

        report +=
            "----------------------------------------\n";

        report +=
            "Total Workers: " +
            data.workers +
            "\n";

        report +=
            "Absent Workers: " +
            data.absent +
            "\n";

        report +=
            "Present Workers: " +
            data.present +
            "\n";

        report +=
            "Present Percentage: " +
            data.presentPercentage.toFixed(1) +
            "%\n\n";


        /* SHIFT */

        report +=
            "2. SHIFT TIME\n";

        report +=
            "----------------------------------------\n";

        report +=
            "Shift Hours: " +
            data.hours +
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

        report +=
            "----------------------------------------\n";


        const deductionRows =
            document.querySelectorAll(
                "#deductionContainer .dynamic-row"
            );


        let hasDeduction = false;


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

                    hasDeduction = true;


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


        if (!hasDeduction) {

            report +=
                "None\n";

        }


        report +=
            "Total Normal Deductions: " +
            Math.round(
                data.normalDeductions
            ) +
            " min\n\n";


        /* TIME LOSS */

        report +=
            "4. TIME LOSS\n";

        report +=
            "----------------------------------------\n";


        if (
            data.lossData.length === 0
        ) {

            report +=
                "No time loss recorded.\n";

        } else {

            data.lossData.forEach(
                function (
                    loss,
                    index
                ) {

                    report +=
                        (
                            index + 1
                        ) +
                        ". " +
                        (
                            loss.from ||
                            "--:--"
                        ) +
                        " - " +
                        (
                            loss.to ||
                            "--:--"
                        ) +
                        " | Reason: " +
                        (
                            loss.reason ||
                            "Not specified"
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


        /* PRODUCTION TIME */

        report +=
            "5. FINAL PRODUCTION TIME\n";

        report +=
            "----------------------------------------\n";

        report +=
            "Shift Minutes: " +
            Math.round(
                data.shiftMinutes
            ) +
            " min\n";

        report +=
            "Normal Deductions: " +
            Math.round(
                data.normalDeductions
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
            "----------------------------------------\n";

        report +=
            formatBikeList(
                plan
            ) +
            "\n";

        report +=
            "Total Planned: " +
            totalPlan +
            " bikes\n\n";


        /* COMPLETED */

        report +=
            "7. COMPLETED BIKES\n";

        report +=
            "----------------------------------------\n";

        report +=
            formatBikeList(
                completed
            ) +
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

        report +=
            "----------------------------------------\n";


        for (
            let i = 1;
            i <= 3;
            i++
        ) {

            const name =
                document.getElementById(
                    "modelName" + i
                ).value.trim();


            const cycle =
                getNumber(
                    document.getElementById(
                        "cycleTime" + i
                    )
                );


            if (
                name ||
                cycle
            ) {

                const capacity =
                    cycle > 0
                        ? Math.floor(
                            data.finalMinutes /
                            cycle
                        )
                        : 0;


                report +=
                    "- " +
                    (
                        name ||
                        "Model " + i
                    ) +
                    ": " +
                    cycle +
                    " min/bike → " +
                    capacity +
                    " bikes possible\n";

            }

        }


        report += "\n";


        /* QUALITY */

        report +=
            "9. QUALITY DEPARTMENT\n";

        report +=
            "----------------------------------------\n";

        report +=
            "Assembly Line SPR: " +
            spr.toFixed(2) +
            "%\n";

        report +=
            "Total FG Bikes: " +
            qualityFG +
            " bikes\n\n";


        /* REWORK */

        report +=
            "10. REWORK BIKES\n";

        report +=
            "----------------------------------------\n";

        report +=
            formatBikeList(
                rework
            ) +
            "\n";

        report +=
            "Total Rework: " +
            getTotalQuantity(
                rework
            ) +
            " bikes\n\n";


        /* FG */

        report +=
            "11. FG - FINISHED GOODS\n";

        report +=
            "----------------------------------------\n";

        report +=
            formatBikeList(
                fg
            ) +
            "\n";

        report +=
            "Total FG Entries: " +
            getTotalQuantity(
                fg
            ) +
            " bikes\n\n";


        /* END */

        report +=
            "========================================\n";

        report +=
            "EVEE DAILY REPORT - END\n";


        document.getElementById(
            "finalReport"
        ).value =
            report;


        document.getElementById(
            "reportDatePreview"
        ).textContent =
            reportDate.value ||
            "-";

    }


    /* =====================================================
       COPY REPORT
    ===================================================== */

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
                        "COPIED ✓";


                    setTimeout(
                        () => {

                            this.textContent =
                                "COPY REPORT";

                        },
                        1600
                    );


                } catch (error) {

                    report.focus();

                    report.select();

                    document.execCommand(
                        "copy"
                    );


                    this.textContent =
                        "COPIED ✓";


                    setTimeout(
                        () => {

                            this.textContent =
                                "COPY REPORT";

                        },
                        1600
                    );

                }

            }
        );


    /* =====================================================
       BASIC INPUT EVENTS
    ===================================================== */

    [
        totalWorkers,
        absentWorkers,
        shiftHours,
        reportDate
    ].forEach(
        function (input) {

            input.addEventListener(
                "input",
                updateAll
            );

            input.addEventListener(
                "change",
                updateAll
            );

        }
    );


    /* =====================================================
       INITIAL ROWS
    ===================================================== */

    addDeduction();

    addTimeLoss();

    addBikeRow(
        "planContainer"
    );

    addBikeRow(
        "completedContainer"
    );

    addBikeRow(
        "reworkContainer"
    );

    addBikeRow(
        "fgContainer"
    );


    /* =====================================================
       INITIAL UPDATE
    ===================================================== */

    updateAll();

});
