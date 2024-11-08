// creating variable to target the p tag of original filename from popup.html
const originalFilenameElement = document.getElementById("original-filename")

// Getting the original filename from background.js
chrome.storage.local.get("originalFilename", (data) => {
    if (data.originalFilename) {
        originalFilenameElement.innerText = data.originalFilename
    } else {
        originalFilenameElement.innerText = "No files"
    }
})

// Adding event listener to the download button when clicked
document.getElementById("resume-download").addEventListener("click", () => {

    // creating a variable for custom filename to store the user input
    const customFilename = document.getElementById("new-filename").value;

    // Checking if there is any download is in process.
    chrome.downloads.search({ state: "in_progress" }, (results) => {
        if (chrome.runtime.lastError) {
            console.error("Error checking downloads", chrome.runtime.lastError.message)
            return
        }
        if (results.length === 0) {
            originalFilenameElement.innerText = "No files are downloading currently !!"
        }
    })

    // Checking if the user input something or not in the input field
    if (customFilename) {

        // Sending the user input data to the background.js
        chrome.runtime.sendMessage({ action: "setFilename", filename: customFilename }, (response) => {
            if (response && response.success) {
                console.log("filename sent to background script: ", customFilename)
            } else {
                console.log("failed to send filename")
            }
        })
    }

})

document.getElementById("skip-rename").addEventListener("click", () => {
    // runs this code for skip button
    chrome.storage.local.get("originalFilename", (data) => {
        chrome.runtime.sendMessage({ action: "setFilename", filename: data.filename }, (response) => {
            if (response && response.success) {
                console.log("filename sent to background script: ", data.filename)
            } else {
                console.log("failed to send filename")
            }
        })
    })
})


// Remove the original filename from the local storage
chrome.storage.local.remove("originalFilename")
