let branch = "main";
if (window.location.hostname.includes("--")) {
    branch = window.location.hostname.split("--")[0];
}
document.getElementById(
    "scraper-link"
).href = `https://github.com/nikhilmwarrier/jee-2024-scraper/blob/${branch}/scraper.js`;

const form = document.getElementById("main-form");
form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const shift = formData.get("shift");
    const fetchedResponse = await fetch("./keys/" + shift + ".json");
    const ntaAnswers = await fetchedResponse.json();
    console.log(1);
    console.log(ntaAnswers);
    try {
        const responses = JSON.parse(formData.get("responses"));
        console.log(responses);
        compareAnswers(ntaAnswers, responses, shift);
    } catch (err) {
        console.error("JSONError:", err);
        alert("Error while parsing JSON. See console for more details.");
    }
});

function compareAnswers(nta, user, shift) {
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    let errorInKeys = [];
    let incorrectArray = [];
    for (const key in nta) {
        const ntaAns = Number(`${nta[key]}`.trim());
        if (user.hasOwnProperty(key)) {
            if (user[key]["hasAnswered"]) {
                const ownAns = Number(`${user[key].ownAnswer}`.trim());
                if (ntaAns === ownAns) {
                    correct += 1;
                } else {
                    incorrect += 1;
                    incorrectArray.push({
                        qnID: key,
                        ownAns,
                        ntaAns,
                    });
                }
            } else {
                skipped += 1;
            }
        } else errorInKeys.push(key);
    }
    if (errorInKeys.length > 0) {
        alert("Error in keys:\n" + errorInKeys.toString());
        errorInKeys = [];
    }
    generateScorecard(correct, incorrect, incorrectArray, shift);
}

function generateScorecard(correct, incorrect, incorrectArray, shift) {
    console.log(1);
    const resultDiv = document.getElementById("result");
    const shiftEl = resultDiv.querySelector(".shift span");
    const scoreEl = resultDiv.querySelector(".score span");
    const attemptedEl = resultDiv.querySelector("#stats .attempted");
    const correctEl = resultDiv.querySelector("#stats .correct");
    const incorrectEl = resultDiv.querySelector("#stats .incorrect");

    shiftEl.innerText = shift;
    scoreEl.innerText = calculateScore(correct, incorrect);
    attemptedEl.innerText = correct + incorrect;
    correctEl.innerText = correct;
    incorrectEl.innerText = incorrect;

    const incorrectQnsTable = resultDiv.querySelector("#incorrectQns");
    incorrectArray.forEach(qn => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${qn.qnID}</td>
        <td>${qn.ownAns}</td>
        <td>${qn.ntaAns}</td>`;
        incorrectQnsTable.appendChild(row);
    });
}

function calculateScore(correct, incorrect) {
    return correct * 4 - incorrect;
}

function copyScript() {
    const scriptArea = document.getElementById("scriptarea");
    navigator.clipboard.writeText(scriptArea.value);
    alert("Copied!");
}
