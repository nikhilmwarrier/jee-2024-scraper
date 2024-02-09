import "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/+esm";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.mjs";

function extractText(pdfUrl) {
    var pdf = pdfjsLib.getDocument(pdfUrl);
    return pdf.promise.then(function (pdf) {
        var totalPageCount = pdf.numPages;
        var countPromises = [];
        for (
            var currentPage = 1;
            currentPage <= totalPageCount;
            currentPage++
        ) {
            var page = pdf.getPage(currentPage);
            countPromises.push(
                page.then(function (page) {
                    var textContent = page.getTextContent();
                    return textContent.then(function (text) {
                        return text.items
                            .map(function (s) {
                                return s.str;
                            })
                            .join("\n");
                    });
                })
            );
        }

        return Promise.all(countPromises).then(function (texts) {
            return texts.join("\n");
        });
    });
}

export default async function parsePDF() {
    const input = document.getElementById("pdfFileInput");
    const file = input.files[0];
    let output = {};

    return new Promise((resolve, reject) => {
        if (file) {
            // You can perform actions with the PDF file here
            // For example, you can read the file content using FileReader
            const reader = new FileReader();

            reader.readAsArrayBuffer(file);
            reader.onload = async e => {
                // e.target.result contains the file content
                const typedarray = new Uint8Array(e.target.result);

                const text = await extractText(typedarray);
                output = generateJSON(text);
                resolve(output);
            };
        } else {
            console.error("No file selected");
        }
    });
}

function generateJSON(pdfOutput) {
    const data = {};

    // console.log(pdfOutput);
    const lines = pdfOutput.split("\n");
    lines.forEach((line, i) => {
        if (line === "MCQ") {
            const currentSlice = lines.slice(i, i + 30);
            /*
            currentSlice[i], where each i corresponds to:
            4:  Question ID
            8:  Option 1
            12: Option 2
            16: Option 3
            20: Option 4
            24: Status
            (the following quirk is due to line wrapping in the pdf)
            28: OwnAnswer, if status != Not Attempted and Marked For Review
            29: OwnAnswer, if status == Not Attempted and Marked For Review
             */
            const questionID = currentSlice[4];
            const status = currentSlice[24].trim();

            let ownAnswerIndex;
            if (status === "Not Attempted and") {
                ownAnswerIndex = currentSlice[29];
            } else {
                ownAnswerIndex = currentSlice[28];
            }

            if (!!ownAnswerIndex && ownAnswerIndex !== "--") {
                let options = [
                    currentSlice[8],
                    currentSlice[12],
                    currentSlice[16],
                    currentSlice[20],
                ];

                options = options.map(el => Number(el));

                const ownAnswer = options[ownAnswerIndex - 1];
                data[questionID] = {
                    qnType: "MCQ",
                    hasAnswered: true,
                    options,
                    ownAnswer,
                };
            } else {
                data[questionID] = { qnType: "MCQ", hasAnswered: false };
            }
        } else if (line === "SA") {
            const currentSlice = lines.slice(i - 4, i + 9);
            /* currentSlice[i], where each i corresponds to:
            0: OwnAnswer
            8: Question ID
            12: Status 
            */
            const questionID = currentSlice[8];
            const ownAnswer = currentSlice[0].trim();
            if (!!ownAnswer && ownAnswer !== "--") {
                // console.log(ownAnswer);
                data[questionID] = {
                    qnType: "SA",
                    hasAnswered: true,
                    ownAnswer: Number(ownAnswer),
                };
            } else {
                data[questionID] = { qnType: "SA", hasAnswered: false };
            }
        }
    });

    // console.log(JSON.stringify(data, null, 2));
    // console.log(data);
    return data;
}

document.querySelector("input").addEventListener("change", parsePDF);
