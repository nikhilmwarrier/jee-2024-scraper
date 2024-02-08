const tables = document.querySelectorAll(".menu-tbl");
const data = {};

tables.forEach((table, i) => {
    const qnType = table.querySelectorAll("tr td.bold")[0].innerText.trim(); // "MCQ || "SA"
    const qnID = table.querySelectorAll("tr td.bold")[1].innerText.trim();

    if (qnType === "MCQ") {
        let hasAnswered = false;
        const status2 = table
            .querySelectorAll("tr td.bold")[7]
            .innerText.trim();
        
        if(status2 !== "--") {
            hasAnswered = true;
        }
                            
        if (hasAnswered) {
            let options = [0, 0, 0, 0];
            for (let j = 0; j < 4; j++) {
                options[j] = Number(
                    table.querySelectorAll("tr td.bold")[2 + j].innerText
                );
            }

            const ownAnswerIndex =
                Number(
                    table.querySelectorAll("tr td.bold")[7].innerText.trim()
                ) - 1;
            const ownAnswerID = options[ownAnswerIndex];

            options.sort(); // doing the stuff NTA should've done

            const ownAnswer = options.indexOf(ownAnswerID) + 1;

            data[qnID] = {
                qnType,
                hasAnswered,
                options,
                ownAnswer,
                ownAnswerID,
            };
        } else {
            data[qnID] = { qnType, hasAnswered };
        }
    } else if (qnType === "SA") {
        let hasAnswered = false;
        const ownAnswer = document.querySelectorAll(".questionRowTbl")
                [i].querySelector("tr:nth-of-type(5) td.bold").innerText
        
        if (ownAnswer !== "--") {
            hasAnswered = true;
        }

        if (hasAnswered) {

            data[qnID] = {
                qnType,
                hasAnswered,
                ownAnswer,
            };
        } else {
            data[qnID] = { qnType, hasAnswered };
        }
    }
});

const generatedJSON = JSON.stringify(data, null, 2);
console.log(generatedJSON);
