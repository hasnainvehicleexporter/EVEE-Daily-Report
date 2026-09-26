```javascript
document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       HELPERS
    ========================================================= */

    function getNumber(id) {

        const element = document.getElementById(id);

        if (!element) {
            return 0;
        }

        const value = parseFloat(element.value);

        return isNaN(value) ? 0 : value;
    }


    function formatNumber(number) {

        if (!isFinite(number)) {
            return "0";
        }

        if (Number.isInteger(number)) {
            return number.toString();
        }

        return number.toFixed(2);
    }


    function createRemoveButton() {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "remove-btn";
        button.innerHTML = "×";
        button.title = "Remove";

        button.addEventListener("click", function () {

            const row =
                button.closest(".dynamic-row");

            if (row) {
                row.remove();
                updateAll();
            }

        });

        return button;
    }


    /* =========================================================
       DATE
    ========================================================= */

    const reportDate =
        document.getElementById("reportDate");


    if (reportDate) {

        const today = new Date();

        const year =
            today.getFullYear();

        const month =
            String(today.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(today.getDate())
                .padStart(2, "0");

        reportDate.value =
            `${year}-${month}-${day}`;
    }


    function getFormattedDate() {

        if (!reportDate || !reportDate.value) {
            return "-";
        }

        const date =
            new Date(
                reportDate.value + "T00:00:00"
            );

        if (isNaN(date.getTime())) {
            return reportDate.value;
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    /* =========================================================
       NORMAL DEDUCTIONS
    ========================================================= */

    const deductionContainer =
        document.getElementById(
            "deductionContainer"
        );


    function addDeductionRow(
        reason = "",
        minutes = ""
    ) {

        const row =
            document.createElement("div");

        row.className =
            "dynamic-row deduction-row";


        const reasonInput =
            document.createElement("input");

        reasonInput.type = "text";
        reasonInput.placeholder = "Reason";
        reasonInput.value = reason;


        const minutesInput =
            document.createElement("input");

        minutesInput.type = "number";
        minutesInput.min = "0";
        minutesInput.step = "0.01";
        minutesInput.placeholder = "Minutes";
        minutesInput.value = minutes;


        const removeCell =
            document.createElement("div");

        removeCell.className = "calculated";

        removeCell.appendChild(
            createRemoveButton()
        );


        row.appendChild(reasonInput);
        row.appendChild(minutesInput);
        row.appendChild(removeCell);


        deductionContainer.appendChild(row);


        reasonInput.addEventListener(
            "input",
            updateAll
        );

        minutesInput.addEventListener(
            "input",
            updateAll
        );
    }


    function getDeductionData() {

        const rows =
            deductionContainer.querySelectorAll(
                ".deduction-row"
            );

        const data = [];


        rows.forEach(function (row) {

            const inputs =
                row.querySelectorAll("input");

            const reason =
                inputs[0].value.trim();

            const minutes =
                parseFloat(inputs[1].value) || 0;


            if (reason || minutes > 0) {

                data.push({
                    reason:
                        reason || "Deduction",
                    minutes:
                        minutes
                });

            }

        });


        return data;
    }


    /* =========================================================
       TIME LOSS
    ========================================================= */

    const lossContainer =
        document.getElementById(
            "lossContainer"
        );


    function calculateTimeDifference(
        from,
        to
    ) {

        if (!from || !to) {
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


        if (toMinutes < fromMinutes) {

            toMinutes +=
                24 * 60;

        }


        return toMinutes - fromMinutes;
    }


    function addLossRow(
        from = "",
        to = "",
        reason = ""
    ) {

        const row =
            document.createElement("div");

        row.className =
            "dynamic-row loss-row";


        const fromInput =
            document.createElement("input");

        fromInput.type = "time";
        fromInput.value = from;


        const toInput =
            document.createElement("input");

        toInput.type = "time";
        toInput.value = to;


        const reasonInput =
            document.createElement("input");

        reasonInput.type = "text";
        reasonInput.placeholder = "Reason";
        reasonInput.value = reason;


        const lossCell =
            document.createElement("div");

        lossCell.className =
            "calculated";


        const lossValue =
            document.createElement("span");

        lossValue.textContent =
            "0 min";


        lossCell.appendChild(
            lossValue
        );


        const removeCell =
            document.createElement("div");

        removeCell.className =
            "calculated";

        removeCell.appendChild(
            createRemoveButton()
        );


        row.appendChild(fromInput);
        row.appendChild(toInput);
        row.appendChild(reasonInput);
        row.appendChild(lossCell);
        row.appendChild(removeCell);


        lossContainer.appendChild(row);


        function updateLossRow() {

            const minutes =
                calculateTimeDifference(
                    fromInput.value,
                    toInput.value
                );


            lossValue.textContent =
                formatNumber(minutes) +
                " min";


            updateAll();
        }


        fromInput.addEventListener(
            "change",
            updateLossRow
        );

        toInput.addEventListener(
            "change",
            updateLossRow
        );

        reasonInput.addEventListener(
            "input",
            updateAll
        );


        updateLossRow();
    }


    function getTimeLossData() {

        const rows =
            lossContainer.querySelectorAll(
                ".loss-row"
            );

        const data = [];

        let total = 0;


        rows.forEach(function (row) {

            const inputs =
                row.querySelectorAll("input");

            const from =
                inputs[0].value;

            const to =
                inputs[1].value;

            const reason =
                inputs[2].value.trim();


            const minutes =
                calculateTimeDifference(
                    from,
                    to
                );


            total += minutes;


            if (from || to || reason) {

                data.push({
                    from: from || "-",
                    to: to || "-",
                    reason:
                        reason || "Time Loss",
                    minutes:
                        minutes
                });

            }

        });


        return {
            data: data,
            total: total
        };
    }


    /* =========================================================
       BIKE PLAN
    ========================================================= */

    const planContainer =
        document.getElementById(
            "planContainer"
        );


    function addPlanRow(
        model = "",
        color = "",
        qty = "",
        cycleTime = ""
    ) {

        const row =
            document.createElement("div");

        row.className =
            "dynamic-row plan-row";


        const modelInput =
            document.createElement("input");

        modelInput.type = "text";
        modelInput.placeholder = "Model";
        modelInput.value = model;


        const colorInput =
            document.createElement("input");

        colorInput.type = "text";
        colorInput.placeholder = "Color";
        colorInput.value = color;


        const qtyInput =
            document.createElement("input");

        qtyInput.type = "number";
        qtyInput.min = "0";
        qtyInput.step = "1";
        qtyInput.placeholder = "Qty";
        qtyInput.value = qty;


        const cycleInput =
            document.createElement("input");

        cycleInput.type = "number";
        cycleInput.min = "0";
        cycleInput.step = "0.01";
        cycleInput.placeholder = "Min / bike";
        cycleInput.value = cycleTime;


        const requiredCell =
            document.createElement("div");

        requiredCell.className =
            "calculated";


        const requiredValue =
            document.createElement("span");

        requiredValue.textContent =
            "0 min";


        requiredCell.appendChild(
            requiredValue
        );


        const possibleCell =
            document.createElement("div");

        possibleCell.className =
            "calculated possible";


        const possibleValue =
            document.createElement("span");

        possibleValue.textContent =
            "0";


        possibleCell.appendChild(
            possibleValue
        );


        const balanceCell =
            document.createElement("div");

        balanceCell.className =
            "calculated";


        const balanceValue =
            document.createElement("span");

        balanceValue.textContent =
            "0";


        balanceCell.appendChild(
            balanceValue
        );


        const removeCell =
            document.createElement("div");

        removeCell.className =
            "calculated";


        removeCell.appendChild(
            createRemoveButton()
        );


        row.appendChild(modelInput);
        row.appendChild(colorInput);
        row.appendChild(qtyInput);
        row.appendChild(cycleInput);
        row.appendChild(requiredCell);
        row.appendChild(possibleCell);
        row.appendChild(balanceCell);
        row.appendChild(removeCell);


        planContainer.appendChild(row);


        [
            modelInput,
            colorInput,
            qtyInput,
            cycleInput
        ].forEach(function (input) {

            input.addEventListener(
                "input",
                updateAll
            );

        });


        row._planElements = {

            modelInput,
            colorInput,
            qtyInput,
            cycleInput,

            requiredValue,
            possibleValue,
            balanceValue

        };
    }


    function getPlanData(
        finalProductionMinutes
    ) {

        const rows =
            planContainer.querySelectorAll(
                ".plan-row"
            );


        const data = [];

        let totalPlan = 0;

        let totalRequiredMinutes = 0;

        let remainingMinutes =
            Math.max(
                0,
                finalProductionMinutes
            );


        rows.forEach(function (row) {

            const el =
                row._planElements;


            if (!el) {
                return;
            }


            const model =
                el.modelInput.value.trim();

            const color =
                el.colorInput.value.trim();

            const qty =
                parseInt(
                    el.qtyInput.value
                ) || 0;

            const cycleTime =
                parseFloat(
                    el.cycleInput.value
                ) || 0;


            const requiredMinutes =
                qty * cycleTime;


            let possibleBikes = 0;


            if (
                cycleTime > 0 &&
                remainingMinutes > 0
            ) {

                possibleBikes =
                    Math.min(
                        Math.floor(
                            remainingMinutes /
                            cycleTime
                        ),
                        qty
                    );

            }


            const allocatedMinutes =
                possibleBikes *
                cycleTime;


            remainingMinutes -=
                allocatedMinutes;


            const balance =
                possibleBikes - qty;


            totalPlan += qty;

            totalRequiredMinutes +=
                requiredMinutes;


            el.requiredValue.textContent =
                formatNumber(
                    requiredMinutes
                ) + " min";


            el.possibleValue.textContent =
                formatNumber(
                    possibleBikes
                );


            el.balanceValue.textContent =
                formatNumber(
                    balance
                );


            el.balanceValue.classList.remove(
                "balance-negative",
                "balance-positive"
            );


            if (balance < 0) {

                el.balanceValue.classList.add(
                    "balance-negative"
                );

            } else if (balance > 0) {

                el.balanceValue.classList.add(
                    "balance-positive"
                );

            }


            if (
                model ||
                color ||
                qty > 0 ||
                cycleTime > 0
            ) {

                data.push({

                    model:
                        model || "Unknown Model",

                    color:
                        color || "-",

                    qty:
                        qty,

                    cycleTime:
                        cycleTime,

                    requiredMinutes:
                        requiredMinutes,

                    possibleBikes:
                        possibleBikes,

                    balance:
                        balance

                });

            }

        });


        return {

            data: data,

            totalPlan:
                totalPlan,

            totalRequiredMinutes:
                totalRequiredMinutes,

            remainingMinutes:
                Math.max(
                    0,
                    remainingMinutes
                )

        };
    }


    /* =========================================================
       COMPLETED / REWORK / FG
    ========================================================= */

    function addBikeRow(
        container,
        model = "",
        color = "",
        qty = ""
    ) {

        const row =
            document.createElement("div");

        row.className =
            "dynamic-row bike-row";


        const modelInput =
            document.createElement("input");

        modelInput.type = "text";
        modelInput.placeholder = "Model";
        modelInput.value = model;


        const colorInput =
            document.createElement("input");

        colorInput.type = "text";
        colorInput.placeholder = "Color";
        colorInput.value = color;


        const qtyInput =
            document.createElement("input");

        qtyInput.type = "number";
        qtyInput.min = "0";
        qtyInput.step = "1";
        qtyInput.placeholder = "Qty";
        qtyInput.value = qty;


        const removeCell =
            document.createElement("div");

        removeCell.className =
            "calculated";

        removeCell.appendChild(
            createRemoveButton()
        );


        row.appendChild(modelInput);
        row.appendChild(colorInput);
        row.appendChild(qtyInput);
        row.appendChild(removeCell);


        container.appendChild(row);


        modelInput.addEventListener(
            "input",
            updateAll
        );

        colorInput.addEventListener(
            "input",
            updateAll
        );

        qtyInput.addEventListener(
            "input",
            updateAll
        );
    }


    function getBikeData(container) {

        const rows =
            container.querySelectorAll(
                ".bike-row"
            );

        const data = [];

        let total = 0;


        rows.forEach(function (row) {

            const inputs =
                row.querySelectorAll("input");


            const model =
                inputs[0].value.trim();

            const color =
                inputs[1].value.trim();

            const qty =
                parseInt(
                    inputs[2].value
                ) || 0;


            total += qty;


            if (
                model ||
                color ||
                qty > 0
            ) {

                data.push({

                    model:
                        model || "Unknown Model",

                    color:
                        color || "-",

                    qty:
                        qty

                });

            }

        });


        return {
            data: data,
            total: total
        };
    }


    /* =========================================================
       CALCULATE DATA
    ========================================================= */

    function calculateData() {

        /* MANPOWER */

        const totalWorkers =
            getNumber("totalWorkers");

        const absentWorkers =
            getNumber("absentWorkers");


        const presentWorkers =
            Math.max(
                0,
                totalWorkers -
                absentWorkers
            );


        let presentPercentage = 0;


        if (totalWorkers > 0) {

            presentPercentage =
                (
                    presentWorkers /
                    totalWorkers
                ) * 100;

        }


        document.getElementById(
            "presentWorkers"
        ).value =
            formatNumber(
                presentWorkers
            );


        document.getElementById(
            "presentPercentage"
        ).textContent =
            formatNumber(
                presentPercentage
            ) + "%";


        /* SHIFT */

        const shiftHours =
            getNumber("shiftHours");


        const shiftMinutes =
            shiftHours * 60;


        document.getElementById(
            "shiftMinutes"
        ).value =
            formatNumber(
                shiftMinutes
            );


        /* DEDUCTIONS */

        const deductionData =
            getDeductionData();


        const totalDeductions =
            deductionData.reduce(
                function (sum, item) {
                    return sum + item.minutes;
                },
                0
            );


        document.getElementById(
            "totalDeductions"
        ).textContent =
            formatNumber(
                totalDeductions
            ) + " min";


        /* TIME LOSS */

        const lossResult =
            getTimeLossData();


        document.getElementById(
            "totalLossMinutes"
        ).textContent =
            formatNumber(
                lossResult.total
            ) + " min";


        /* FINAL MINUTES */

        const finalMinutes =
            Math.max(
                0,
                shiftMinutes -
                totalDeductions -
                lossResult.total
            );


        document.getElementById(
            "finalMinutes"
        ).textContent =
            formatNumber(
                finalMinutes
            ) + " min";


        /* PLAN */

        const planResult =
            getPlanData(
                finalMinutes
            );


        document.getElementById(
            "totalPlan"
        ).textContent =
            formatNumber(
                planResult.totalPlan
            );


        document.getElementById(
            "totalPlanMinutes"
        ).textContent =
            formatNumber(
                planResult.totalRequiredMinutes
            ) + " min";


        document.getElementById(
            "planAvailableMinutes"
        ).textContent =
            formatNumber(
                finalMinutes
            ) + " min";


        document.getElementById(
            "planRemainingMinutes"
        ).textContent =
            formatNumber(
                planResult.remainingMinutes
            ) + " min";


        const possibleTotal =
            planResult.data.reduce(
                function (sum, item) {

                    return sum +
                        item.possibleBikes;

                },
                0
            );


        const planStatus =
            document.getElementById(
                "planStatus"
            );


        if (
            planResult.totalPlan === 0
        ) {

            planStatus.textContent =
                "-";

        } else if (
            possibleTotal >=
            planResult.totalPlan
        ) {

            planStatus.textContent =
                "CAN BE COMPLETED";

        } else {

            const shortage =
                planResult.totalPlan -
                possibleTotal;

            planStatus.textContent =
                "SHORT " +
                formatNumber(
                    shortage
                ) +
                " BIKES";
        }


        /* COMPLETED */

        const completedResult =
            getBikeData(
                document.getElementById(
                    "completedContainer"
                )
            );


        document.getElementById(
            "totalCompleted"
        ).textContent =
            formatNumber(
                completedResult.total
            );


        /* REWORK */

        const reworkResult =
            getBikeData(
                document.getElementById(
                    "reworkContainer"
                )
            );


        document.getElementById(
            "totalRework"
        ).textContent =
            formatNumber(
                reworkResult.total
            );


        /* FG */

        const fgResult =
            getBikeData(
                document.getElementById(
                    "fgContainer"
                )
            );


        document.getElementById(
            "totalFG"
        ).textContent =
            formatNumber(
                fgResult.total
            );


        /* QUALITY */

        const sprPercentage =
            getNumber(
                "sprPercentage"
            );

        const qualityFg =
            getNumber(
                "qualityFg"
            );


        document.getElementById(
            "sprDisplay"
        ).textContent =
            formatNumber(
                sprPercentage
            ) + "%";


        document.getElementById(
            "qualityFgDisplay"
        ).textContent =
            formatNumber(
                qualityFg
            );


        /* SUMMARY */

        document.getElementById(
            "summaryWorkers"
        ).textContent =
            formatNumber(
                totalWorkers
            );


        document.getElementById(
            "summaryPresent"
        ).textContent =
            formatNumber(
                presentWorkers
            );


        document.getElementById(
            "summaryMinutes"
        ).textContent =
            formatNumber(
                finalMinutes
            );


        document.getElementById(
            "summaryCompleted"
        ).textContent =
            formatNumber(
                completedResult.total
            );


        return {

            totalWorkers,
            absentWorkers,
            presentWorkers,
            presentPercentage,

            shiftHours,
            shiftMinutes,

            deductions:
                deductionData,

            totalDeductions,

            timeLoss:
                lossResult.data,

            totalLoss:
                lossResult.total,

            finalMinutes,

            plan:
                planResult.data,

            totalPlan:
                planResult.totalPlan,

            totalPlanMinutes:
                planResult.totalRequiredMinutes,

            possiblePlanTotal:
                possibleTotal,

            planRemainingMinutes:
                planResult.remainingMinutes,

            completed:
                completedResult.data,

            totalCompleted:
                completedResult.total,

            rework:
                reworkResult.data,

            totalRework:
                reworkResult.total,

            fg:
                fgResult.data,

            totalFG:
                fgResult.total,

            sprPercentage,

            qualityFg

        };
    }


    /* =========================================================
       REPORT TEXT
    ========================================================= */

    function generateReport() {

        const data =
            calculateData();


        let report = "";


        report +=
            "EVEE DAILY REPORT\n";

        report +=
            "==============================\n\n";


        report +=
            "REPORT DATE\n";

        report +=
            getFormattedDate();

        report +=
            "\n\n";


        /* MANPOWER */

        report +=
            "MANPOWER\n";

        report +=
            "------------------------------\n";

        report +=
            "Total Workers: " +
            formatNumber(
                data.totalWorkers
            ) +
            "\n";

        report +=
            "Absent Workers: " +
            formatNumber(
                data.absentWorkers
            ) +
            "\n";

        report +=
            "Present Workers: " +
            formatNumber(
                data.presentWorkers
            ) +
            "\n";

        report +=
            "Present Worker %: " +
            formatNumber(
                data.presentPercentage
            ) +
            "%\n\n";


        /* SHIFT */

        report +=
            "SHIFT TIME\n";

        report +=
            "------------------------------\n";

        report +=
            "Shift Hours: " +
            formatNumber(
                data.shiftHours
            ) +
            " hours\n";

        report +=
            "Shift Minutes: " +
            formatNumber(
                data.shiftMinutes
            ) +
            " min\n";

        report +=
            "Normal Deductions: " +
            formatNumber(
                data.totalDeductions
            ) +
            " min\n";

        report +=
            "Time Loss: " +
            formatNumber(
                data.totalLoss
            ) +
            " min\n";

        report +=
            "Final Production Minutes: " +
            formatNumber(
                data.finalMinutes
            ) +
            " min\n\n";


        /* DEDUCTIONS */

        if (
            data.deductions.length > 0
        ) {

            report +=
                "NORMAL DEDUCTIONS\n";

            report +=
                "------------------------------\n";


            data.deductions.forEach(
                function (item) {

                    report +=
                        "- " +
                        item.reason +
                        ": " +
                        formatNumber(
                            item.minutes
                        ) +
                        " min\n";

                }
            );


            report += "\n";
        }


        /* TIME LOSS */

        if (
            data.timeLoss.length > 0
        ) {

            report +=
                "TIME LOSS\n";

            report +=
                "------------------------------\n";


            data.timeLoss.forEach(
                function (item) {

                    report +=
                        "- " +
                        item.from +
                        " to " +
                        item.to +
                        " | " +
                        item.reason +
                        " | " +
                        formatNumber(
                            item.minutes
                        ) +
                        " min\n";

                }
            );


            report += "\n";
        }


        /* BIKE PLAN */

        report +=
            "BIKE PLAN\n";

        report +=
            "------------------------------\n";


        if (
            data.plan.length === 0
        ) {

            report +=
                "No planned bikes entered.\n";

        } else {

            data.plan.forEach(
                function (item, index) {

                    report +=
                        (index + 1) +
                        ". " +
                        item.model +
                        " | Color: " +
                        item.color +
                        " | Plan: " +
                        formatNumber(
                            item.qty
                        ) +
                        " | Cycle: " +
                        formatNumber(
                            item.cycleTime
                        ) +
                        " min/bike" +
                        " | Required: " +
                        formatNumber(
                            item.requiredMinutes
                        ) +
                        " min" +
                        " | Possible: " +
                        formatNumber(
                            item.possibleBikes
                        ) +
                        " | Balance: " +
                        formatNumber(
                            item.balance
                        ) +
                        "\n";

                }
            );

        }


        report +=
            "\nTotal Planned Bikes: " +
            formatNumber(
                data.totalPlan
            ) +
            "\n";


        report +=
            "Total Required Minutes: " +
            formatNumber(
                data.totalPlanMinutes
            ) +
            " min\n";


        report +=
            "Available Production Minutes: " +
            formatNumber(
                data.finalMinutes
            ) +
            " min\n";


        report +=
            "Remaining Minutes: " +
            formatNumber(
                data.planRemainingMinutes
            ) +
            " min\n";


        report +=
            "Possible Plan Bikes: " +
            formatNumber(
                data.possiblePlanTotal
            ) +
            "\n\n";


        /* COMPLETED */

        report +=
            "COMPLETED BIKES\n";

        report +=
            "------------------------------\n";


        if (
            data.completed.length === 0
        ) {

            report +=
                "No completed bikes entered.\n";

        } else {

            data.completed.forEach(
                function (item) {

                    report +=
                        "- " +
                        item.model +
                        " | " +
                        item.color +
                        " | Qty: " +
                        formatNumber(
                            item.qty
                        ) +
                        "\n";

                }
            );

        }


        report +=
            "Total Completed: " +
            formatNumber(
                data.totalCompleted
            ) +
            "\n";


        report +=
            "Balance vs Plan: " +
            formatNumber(
                data.totalCompleted -
                data.totalPlan
            ) +
            "\n\n";


        /* QUALITY */

        report +=
            "QUALITY DEPARTMENT\n";

        report +=
            "------------------------------\n";

        report +=
            "Assembly Line SPR: " +
            formatNumber(
                data.sprPercentage
            ) +
            "%\n";

        report +=
            "Quality FG Bikes: " +
            formatNumber(
                data.qualityFg
            ) +
            "\n\n";


        /* REWORK */

        report +=
            "REWORK BIKES\n";

        report +=
            "------------------------------\n";


        if (
            data.rework.length === 0
        ) {

            report +=
                "No rework bikes entered.\n";

        } else {

            data.rework.forEach(
                function (item) {

                    report +=
                        "- " +
                        item.model +
                        " | " +
                        item.color +
                        " | Qty: " +
                        formatNumber(
                            item.qty
                        ) +
                        "\n";

                }
            );

        }


        report +=
            "Total Rework: " +
            formatNumber(
                data.totalRework
            ) +
            "\n\n";


        /* FG */

        report +=
            "FG - FINISHED GOODS\n";

        report +=
            "------------------------------\n";


        if (
            data.fg.length === 0
        ) {

            report +=
                "No FG bikes entered.\n";

        } else {

            data.fg.forEach(
                function (item) {

                    report +=
                        "- " +
                        item.model +
                        " | " +
                        item.color +
                        " | Qty: " +
                        formatNumber(
                            item.qty
                        ) +
                        "\n";

                }
            );

        }


        report +=
            "Total FG: " +
            formatNumber(
                data.totalFG
            ) +
            "\n";


        return report;
    }


    /* =========================================================
       UPDATE
    ========================================================= */

    function updateAll() {

        const report =
            generateReport();


        document.getElementById(
            "finalReport"
        ).textContent =
            report;
    }


    /* =========================================================
       ADD BUTTONS
    ========================================================= */

    document.getElementById(
        "addDeductionBtn"
    ).addEventListener(
        "click",
        function () {

            addDeductionRow();

        }
    );


    document.getElementById(
        "addLossBtn"
    ).addEventListener(
        "click",
        function () {

            addLossRow();

        }
    );


    document.getElementById(
        "addPlanBtn"
    ).addEventListener(
        "click",
        function () {

            addPlanRow();

        }
    );


    document.getElementById(
        "addCompletedBtn"
    ).addEventListener(
        "click",
        function () {

            addBikeRow(
                document.getElementById(
                    "completedContainer"
                )
            );

        }
    );


    document.getElementById(
        "addReworkBtn"
    ).addEventListener(
        "click",
        function () {

            addBikeRow(
                document.getElementById(
                    "reworkContainer"
                )
            );

        }
    );


    document.getElementById(
        "addFgBtn"
    ).addEventListener(
        "click",
        function () {

            addBikeRow(
                document.getElementById(
                    "fgContainer"
                )
            );

        }
    );


    /* =========================================================
       INPUT LISTENERS
    ========================================================= */

    const allInputs =
        document.querySelectorAll(
            "input"
        );


    allInputs.forEach(
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


    /* =========================================================
       COPY REPORT
    ========================================================= */

    document.getElementById(
        "copyReportBtn"
    ).addEventListener(
        "click",
        async function () {

            const report =
                document.getElementById(
                    "finalReport"
                ).textContent;


            try {

                await navigator.clipboard
                    .writeText(report);


                const button = this;

                button.textContent =
                    "COPIED ✓";


                setTimeout(
                    function () {

                        button.textContent =
                            "📋 COPY REPORT";

                    },
                    1500
                );


            } catch (error) {

                const textarea =
                    document.createElement(
                        "textarea"
                    );


                textarea.value =
                    report;


                textarea.style.position =
                    "fixed";

                textarea.style.left =
                    "-9999px";


                document.body.appendChild(
                    textarea
                );


                textarea.select();

                document.execCommand(
                    "copy"
                );


                textarea.remove();


                const button = this;

                button.textContent =
                    "COPIED ✓";


                setTimeout(
                    function () {

                        button.textContent =
                            "📋 COPY REPORT";

                    },
                    1500
                );

            }

        }
    );


    /* =========================================================
       PDF GENERATION
    ========================================================= */

    document.getElementById(
        "downloadPdfBtn"
    ).addEventListener(
        "click",
        function () {

            generatePDF();

        }
    );


    function generatePDF() {

        const status =
            document.getElementById(
                "pdfStatus"
            );


        /* Check jsPDF */

        if (
            typeof window.jspdf ===
            "undefined"
        ) {

            status.textContent =
                "PDF library could not load. Please check your internet connection.";

            status.style.color =
                "#ff7777";

            return;
        }


        const data =
            calculateData();


        const {
            jsPDF
        } = window.jspdf;


        const pdf =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });


        const pageWidth =
            pdf.internal.pageSize.getWidth();

        const pageHeight =
            pdf.internal.pageSize.getHeight();


        const margin = 15;

        const contentWidth =
            pageWidth - margin * 2;


        let y = 15;


        /* ================= HEADER ================= */

        pdf.setFillColor(
            0,
            0,
            0
        );

        pdf.rect(
            0,
            0,
            pageWidth,
            28,
            "F"
        );


        pdf.setTextColor(
            156,
            227,
            125
        );


        pdf.setFont(
            "helvetica",
            "bold"
        );


        pdf.setFontSize(20);


        pdf.text(
            "EVEE DAILY REPORT",
            margin,
            13
        );


        pdf.setFontSize(9);

        pdf.setTextColor(
            255,
            255,
            255
        );


        pdf.text(
            "Daily Production & Performance Report",
            margin,
            20
        );


        pdf.text(
            "Date: " +
            getFormattedDate(),
            pageWidth - margin,
            20,
            {
                align: "right"
            }
        );


        y = 38;


        /* ================= HELPERS ================= */

        function addSectionTitle(title) {

            if (y > pageHeight - 25) {

                pdf.addPage();

                y = 15;
            }


            pdf.setFillColor(
                156,
                227,
                125
            );


            pdf.rect(
                margin,
                y - 5,
                3,
                8,
                "F"
            );


            pdf.setTextColor(
                0,
                0,
                0
            );


            pdf.setFont(
                "helvetica",
                "bold"
            );


            pdf.setFontSize(12);


            pdf.text(
                title,
                margin + 7,
                y
            );


            y += 7;
        }


        function addLine(
            text,
            options = {}
        ) {

            const fontSize =
                options.fontSize || 9;

            const bold =
                options.bold || false;


            pdf.setFont(
                "helvetica",
                bold
                    ? "bold"
                    : "normal"
            );


            pdf.setFontSize(
                fontSize
            );


            pdf.setTextColor(
                30,
                30,
                30
            );


            const lines =
                pdf.splitTextToSize(
                    String(text),
                    contentWidth
                );


            lines.forEach(
                function (line) {

                    if (
                        y >
                        pageHeight - 15
                    ) {

                        pdf.addPage();

                        y = 15;

                    }


                    pdf.text(
                        line,
                        margin,
                        y
                    );


                    y +=
                        fontSize *
                        0.45;

                }
            );


            y += 2;
        }


        function addSmallSpace() {
            y += 3;
        }


        /* ================= MANPOWER ================= */

        addSectionTitle(
            "MANPOWER"
        );


        addLine(
            "Total Workers: " +
            formatNumber(
                data.totalWorkers
            )
        );


        addLine(
            "Absent Workers: " +
            formatNumber(
                data.absentWorkers
            )
        );


        addLine(
            "Present Workers: " +
            formatNumber(
                data.presentWorkers
            )
        );


        addLine(
            "Present Worker Percentage: " +
            formatNumber(
                data.presentPercentage
            ) +
            "%"
        );


        addSmallSpace();


        /* ================= SHIFT ================= */

        addSectionTitle(
            "SHIFT TIME"
        );


        addLine(
            "Shift Hours: " +
            formatNumber(
                data.shiftHours
            ) +
            " hours"
        );


        addLine(
            "Shift Minutes: " +
            formatNumber(
                data.shiftMinutes
            ) +
            " min"
        );


        addLine(
            "Normal Deductions: " +
            formatNumber(
                data.totalDeductions
            ) +
            " min"
        );


        addLine(
            "Time Loss: " +
            formatNumber(
                data.totalLoss
            ) +
            " min"
        );


        addLine(
            "Final Production Minutes: " +
            formatNumber(
                data.finalMinutes
            ) +
            " min",
            {
                bold: true
            }
        );


        addSmallSpace();


        /* ================= DEDUCTIONS ================= */

        if (
            data.deductions.length > 0
        ) {

            addSectionTitle(
                "NORMAL TIME DEDUCTIONS"
            );


            data.deductions.forEach(
                function (item) {

                    addLine(
                        "- " +
                        item.reason +
                        ": " +
                        formatNumber(
                            item.minutes
                        ) +
                        " min"
                    );

                }
            );


            addSmallSpace();
        }


        /* ================= TIME LOSS ================= */

        if (
            data.timeLoss.length > 0
        ) {

            addSectionTitle(
                "TIME LOSS"
            );


            data.timeLoss.forEach(
                function (item) {

                    addLine(
                        "- " +
                        item.from +
                        " to " +
                        item.to +
                        " | " +
                        item.reason +
                        " | " +
                        formatNumber(
                            item.minutes
                        ) +
                        " min"
                    );

                }
            );


            addSmallSpace();
        }


        /* ================= BIKE PLAN ================= */

        addSectionTitle(
            "BIKE PLAN"
        );


        if (
            data.plan.length === 0
        ) {

            addLine(
                "No planned bikes entered."
            );

        } else {

            data.plan.forEach(
                function (item, index) {

                    addLine(
                        (
                            index + 1
                        ) +
                        ". " +
                        item.model +
                        " | " +
                        item.color +
                        " | Plan: " +
                        formatNumber(
                            item.qty
                        ) +
                        " | Cycle: " +
                        formatNumber(
                            item.cycleTime
                        ) +
                        " min/bike" +
                        " | Required: " +
                        formatNumber(
                            item.requiredMinutes
                        ) +
                        " min" +
                        " | Possible: " +
                        formatNumber(
                            item.possibleBikes
                        ) +
                        " | Balance: " +
                        formatNumber(
                            item.balance
                        )
                    );

                }
            );

        }


        addLine(
            "Total Planned Bikes: " +
            formatNumber(
                data.totalPlan
            ),
            {
                bold: true
            }
        );


        addLine(
            "Total Required Minutes: " +
            formatNumber(
                data.totalPlanMinutes
            ) +
            " min"
        );


        addLine(
            "Available Production Minutes: " +
            formatNumber(
                data.finalMinutes
            ) +
            " min"
        );


        addLine(
            "Remaining Minutes: " +
            formatNumber(
                data.planRemainingMinutes
            ) +
            " min"
        );


        addLine(
            "Possible Plan Bikes: " +
            formatNumber(
                data.possiblePlanTotal
            )
        );


        addSmallSpace();


        /* ================= COMPLETED ================= */

        addSectionTitle(
            "COMPLETED BIKES"
        );


        if (
            data.completed.length === 0
        ) {

            addLine(
                "No completed bikes entered."
            );

        } else {

            data.completed.forEach(
                function (item) {

                    addLine(
                        "- " +
                        item.model +
                        " | " +
                        item.color +
                        " | Qty: " +
                        formatNumber(
                            item.qty
                        )
                    );

                }
            );

        }


        addLine(
            "Total Completed: " +
            formatNumber(
                data.totalCompleted
            ),
            {
                bold: true
            }
        );


        addLine(
            "Balance vs Plan: " +
            formatNumber(
                data.totalCompleted -
                data.totalPlan
            )
        );


        addSmallSpace();


        /* ================= QUALITY ================= */

        addSectionTitle(
            "QUALITY DEPARTMENT"
        );


        addLine(
            "Assembly Line SPR: " +
            formatNumber(
                data.sprPercentage
            ) +
            "%"
        );


        addLine(
            "Quality FG Bikes: " +
            formatNumber(
                data.qualityFg
            )
        );


        addSmallSpace();


        /* ================= REWORK ================= */

        addSectionTitle(
            "REWORK BIKES"
        );


        if (
            data.rework.length === 0
        ) {

            addLine(
                "No rework bikes entered."
            );

        } else {

            data.rework.forEach(
                function (item) {

                    addLine(
                        "- " +
                        item.model +
                        " | " +
                        item.color +
                        " | Qty: " +
                        formatNumber(
                            item.qty
                        )
                    );

                }
            );

        }


        addLine(
            "Total Rework: " +
            formatNumber(
                data.totalRework
            ),
            {
                bold: true
            }
        );


        addSmallSpace();


        /* ================= FG ================= */

        addSectionTitle(
            "FG - FINISHED GOODS"
        );


        if (
            data.fg.length === 0
        ) {

            addLine(
                "No FG bikes entered."
            );

        } else {

            data.fg.forEach(
                function (item) {

                    addLine(
                        "- " +
                        item.model +
                        " | " +
                        item.color +
                        " | Qty: " +
                        formatNumber(
                            item.qty
                        )
                    );

                }
            );

        }


        addLine(
            "Total FG: " +
            formatNumber(
                data.totalFG
            ),
            {
                bold: true
            }
        );


        /* ================= FOOTER ON ALL PAGES ================= */

        const totalPages =
            pdf.internal
                .getNumberOfPages();


        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            pdf.setPage(page);

            pdf.setFont(
                "helvetica",
                "normal"
            );

            pdf.setFontSize(8);

            pdf.setTextColor(
                120,
                120,
                120
            );


            pdf.text(
                "EVEE Daily Report",
                margin,
                pageHeight - 8
            );


            pdf.text(
                "Page " +
                page +
                " of " +
                totalPages,
                pageWidth - margin,
                pageHeight - 8,
                {
                    align: "right"
                }
            );

        }


        /* ================= DOWNLOAD ================= */

        const dateForFile =
            reportDate.value ||
            "report";


        const fileName =
            "EVEE_Daily_Report_" +
            dateForFile +
            ".pdf";


        pdf.save(fileName);


        status.textContent =
            "PDF downloaded successfully ✓";

        status.style.color =
            "#9CE37D";


        setTimeout(
            function () {

                status.textContent =
                    "";

            },
            3000
        );
    }


    /* =========================================================
       INITIAL ROWS
    ========================================================= */

    addDeductionRow(
        "Morning Assembly",
        ""
    );


    addLossRow();


    addPlanRow();


    addBikeRow(
        document.getElementById(
            "completedContainer"
        )
    );


    addBikeRow(
        document.getElementById(
            "reworkContainer"
        )
    );


    addBikeRow(
        document.getElementById(
            "fgContainer"
        )
    );


    /* =========================================================
       INITIAL CALCULATION
    ========================================================= */

    updateAll();

});
```
