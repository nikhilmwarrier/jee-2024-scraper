const form = document.getElementById("main-form");
form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const shift = formData.get("shift");
    const fetchedResponse = await fetch("./keys/" + shift + ".json");
    const ntaAnswers = await fetchedResponse.json();
    // console.log(1);
    // console.log(ntaAnswers);
    try {
        const responses = JSON.parse(formData.get("responses"));
        // console.log(responses);
        compareAnswers(ntaAnswers, responses, shift);
    } catch (err) {
        console.error("JSONError:", err);
        alert("Error while parsing JSON. See console for more details.");
    }
});

function compareAnswers(nta, user, shift) {
    let overallCorrect = 0;
    let overallIncorrect = 0;
    let overallSkipped = 0;
    let errorInKeys = [];
    let correct = {
        0: 0, // 0 = Maths
        1: 0, // 1 = Physics
        2: 0, // 2 = Chem
    }
    let incorrect = {
        0: 0, // 0 = Maths
        1: 0, // 1 = Physics
        2: 0, // 2 = Chem
    }

    const firstKey = Object.keys(nta).sort((a, b) => a - b)[0]
    for (const key in nta) {
        const ntaAns = Number(`${nta[key]}`.trim());
        const subject = Math.floor((key % firstKey) / 30);
        // console.log(subject)
        if (user.hasOwnProperty(key)) {
            if (user[key]['hasAnswered']) {
                const ownAns = Number(`${user[key].ownAnswer}`.trim());
                if (ntaAns === ownAns) {
                    overallCorrect += 1;
                    correct[subject] += 1;
                } else {
                    overallIncorrect += 1;
                    incorrect[subject] += 1;
                }
            } else {
                overallSkipped += 1;
            }
        } else errorInKeys.push(key);
    }
    if (errorInKeys.length > 0) {
        alert("Error in keys:\n" + errorInKeys.toString());
        errorInKeys = [];
    }
    generateScorecard(overallCorrect, overallIncorrect, shift, [correct, incorrect]);
}

function generateScorecard(overallCorrect, overallIncorrect, shift, allData) {
    // console.log(1);
    const resultDiv = document.getElementById("result");
    const shiftEl = resultDiv.querySelector(".shift span");
    const scoreEl = resultDiv.querySelector(".score span");
    const attemptedEl = resultDiv.querySelector("table .attempted");
    const correctEl = resultDiv.querySelector("table .correct");
    const incorrectEl = resultDiv.querySelector("table .incorrect");
    const tableScoreEl = resultDiv.querySelector("table .score")
    const subjects = {
        "maths": 0,
        "phy": 1,
        "chem": 2
    }
    for (const key in subjects) {
        resultDiv.querySelector(`table .attempted-${key}`).innerText = allData[0][subjects[key]] + allData[1][subjects[key]]
        resultDiv.querySelector(`table .correct-${key}`).innerText = allData[0][subjects[key]]
        resultDiv.querySelector(`table .incorrect-${key}`).innerText = allData[1][subjects[key]]
        resultDiv.querySelector(`table .score-${key}`).innerText = calculateScore(allData[0][subjects[key]], allData[1][subjects[key]])
    }

    shiftEl.innerText = shift;
    scoreEl.innerText = calculateScore(overallCorrect, overallIncorrect);
    attemptedEl.innerText = overallCorrect + overallIncorrect;
    correctEl.innerText = overallCorrect;
    incorrectEl.innerText = overallIncorrect;
    tableScoreEl.innerText = calculateScore(overallCorrect, overallIncorrect);
}

function calculateScore(correct, incorrect) {
    return correct * 4 - incorrect;
}

function copyScript() {
    const scriptArea = document.getElementById("scriptarea");
    navigator.clipboard.writeText(scriptArea.value);
    alert("Copied!");
}
