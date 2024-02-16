/*
By sudo-Mystic (u/Mystic1869)

Works but need logic to handle exceptions
*/

// Function to extract and simplify exam date
function extractAndSimplifyExamDate(pageNumber) {
    const examDateXPath = `/html/body/div[1]/div[2]/div[8]/div[2]/div[${pageNumber}]/div[4]/span[2]`;
    const examDateElement = document.evaluate(examDateXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (examDateElement) {
        const examDateText = examDateElement.textContent.trim();
        const match = examDateText.match(/(\d{2})\.(\d{2})\.(\d{4})/);

        if (match) {
            const simplifiedDate = match.slice(1).join('');
            return simplifiedDate;
        }
    }

    return null;
}

// Function to extract shift information
function extractShift(pageNumber) {
    const shiftXPath = `/html/body/div[1]/div[2]/div[8]/div[2]/div[${pageNumber}]/div[4]/span[8]`;
    const shiftElement = document.evaluate(shiftXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (shiftElement) {
        const shiftText = shiftElement.textContent.trim();
        return shiftText.includes('First') ? '1' : (shiftText.includes('Second') ? '2' : null);
    }

    return null;
}

// Function to extract subject data
function extractSubjectData(subjectXPath, initialX, pageNumber) {
    const subjectData = [];
    let x = initialX;

    for (let i = 0; i < 30; i++) {
        const questionIdXPath = `/html/body/div[1]/div[2]/div[8]/div[2]/div[${pageNumber}]/div[4]/span[${x}]`;
        const correctOptionXPath = `/html/body/div[1]/div[2]/div[8]/div[2]/div[${pageNumber}]/div[4]/span[${x + 2}]`;

        const questionIdElement = document.evaluate(questionIdXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const correctOptionElement = document.evaluate(correctOptionXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (questionIdElement && correctOptionElement) {
            const questionId = questionIdElement.textContent.trim();
            const correctOptionId = correctOptionElement.textContent.trim();

            subjectData.push({
                questionId,
                correctOptionId,
            });

            x += 3;
        } else {
            // If any question ID or option ID is null, skip the entire page
            console.log(`Skipping page ${pageNumber} due to missing data`);
            return null;
        }
    }

    return subjectData;
}

// Main function to output all data in JSON for all pages
function outputAllDataInJSON() {

    const allData = [];
    const pageNumber = 5;
    const subjects = [
        { xpath: `/html/body/div[1]/div[2]/div[8]/div[2]/div[${pageNumber}]/div[4]/span[15]`, initialX: 18 },
        { xpath: `/html/body/div[1]/div[2]/div[8]/div[2]/div[${pageNumber}]/div[4]/span[108]`, initialX: 111 },
        { xpath: `/html/body/div[1]/div[2]/div[8]/div[2]/div[${pageNumber}]/div[4]/span[201]`, initialX: 204 },
    ];

    const simplifiedExamDate = extractAndSimplifyExamDate(pageNumber);
    const shift = extractShift(pageNumber);

    const pageData = subjects.map(subject => {
        const subjectNameElement = document.evaluate(subject.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const subjectName = subjectNameElement ? subjectNameElement.textContent.trim() : null;

        const questionData = extractSubjectData(subject.xpath, subject.initialX, pageNumber);

        if (questionData === null) {
            return null;
        }

        return {
            subjectName,
            questions: questionData,
        };
    });

    if (!pageData.includes(null)) {
        allData.push({ examDate: simplifiedExamDate, shift, subjects: pageData });
    }



    console.log(JSON.stringify(allData, null, 2));
}

// Run the main function
outputAllDataInJSON();
