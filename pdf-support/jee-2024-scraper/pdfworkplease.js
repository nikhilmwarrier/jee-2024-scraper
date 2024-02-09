pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.mjs";
function handleFileSelect() {
    const input = document.getElementById("pdfFileInput");
    const file = input.files[0];

    if (file) {
        // You can perform actions with the PDF file here

        // For example, you can read the file content using FileReader
        const reader = new FileReader();
        reader.onload = function (e) {
            // e.target.result contains the file content
            var typedarray = new Uint8Array(e.target.result);
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
            myjson = {};
            data = extractText(typedarray).then(function (result) {
                finaldata = result
                    .split("\n")
                    .filter(str => str !== "" && str !== " ");
                console.log(finaldata);
                j = 0;
                jsondata = {};
                while (j < finaldata.length) {
                    if (finaldata[j].includes("MCQ")) {
                        jsondata[finaldata[j + 2]] = { qnType: "MCQ" };
                        if (finaldata[j + 12] == "Answered") {
                            jsondata[finaldata[j + 2]]["hasAnswered"] = true;
                            jsondata[finaldata[j + 2]]["options"] = [
                                finaldata[j + 4],
                                finaldata[j + 6],
                                finaldata[j + 8],
                                finaldata[j + 10],
                            ];
                            jsondata[finaldata[j + 2]]["ownAnswer"] =
                                jsondata[finaldata[j + 2]]["options"][
                                    finaldata[j + 14] - 1
                                ];
                            // console.log(finaldata[j+2])
                        } else {
                            jsondata[finaldata[j + 2]]["hasAnswered"] = false;
                        }
                    } else if (finaldata[j].includes("SA")) {
                        jsondata[finaldata[j + 2]] = { qnType: "SA" };
                        if (finaldata[j + 4] == "Answered") {
                            jsondata[finaldata[j + 2]]["hasAnswered"] = true;
                            jsondata[finaldata[j + 2]]["ownAnswer"] =
                                finaldata[j - 2];
                            // console.log(finaldata[j+2])
                        } else {
                            jsondata[finaldata[j + 2]]["hasAnswered"] = false;
                        }
                        // console.log(finaldata.slice(j,j+10))
                    }
                    // console.log(finaldata[j])
                    j++;
                }
                console.log(JSON.stringify(jsondata));
            });
        };
        reader.readAsArrayBuffer(file);
    } else {
        console.log("No file selected");
    }
}
