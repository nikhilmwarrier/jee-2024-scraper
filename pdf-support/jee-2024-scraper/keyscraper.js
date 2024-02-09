// by u/Mystic1869 || updated by u/nikhilmwarrier
const tableScrollDiv = document.getElementById("table-scroll");
const lines = tableScrollDiv.innerText.split("\n");
const extractedData = {};
for (const line of lines) {
    const match = line.match(/^(\d+)\.\s(\d+)\s+(\d+|\d+\.\s+\d+)/);
    if (match) {
        const srNo = match[1];
        const questionNumber = match[2];
        const answerOption = match[3].replace(/^\d+\.\s+/, "");
        // Remove leading numbers and dots
        extractedData[questionNumber] = answerOption;
    }
}

// Convert the extracted data array to JSON format
const jsonData = JSON.stringify(extractedData, null, 2); // Display the JSON data
console.log(jsonData);
