// targeting elements from popup.html
const originalFilenameElement = document.getElementById("original-filename")
const newFilenameInput = document.getElementById("new-filename")

// store filename and extension separately
let originalFilename = ""
let originalExtension = ""

// function to split the filename into base and extension
const splitFilename = (filename) => {
    const name = filename.split("/").pop() // actual filename
    const dotIndex = name.lastIndexOf(".")

    // if no extension, then return only base name
    if (dotIndex === -1) return { base: name, ext: "" }

    return {
        base: name.substring(0, dotIndex),
        ext: name.substring(dotIndex)
    }
}

// track user renaming 
let userEditing = false;

// set the flag true on event "input"
newFilenameInput.addEventListener("input", () => {
    userEditing = true;
})

// fetching the original filename stored by background.js
chrome.storage.local.get("originalFilename", (data) => {
    if (data.originalFilename) {
        originalFilename = data.originalFilename

        // split base and extension
        const { base, ext } = splitFilename(originalFilename)
        originalExtension = ext;

        // show full original filename in popup
        originalFilenameElement.innerText = originalFilename.split("/").pop();

        // prefill the input with only the base name
        if (!userEditing && !newFilenameInput.value) {
            newFilenameInput.value = base;
            newFilenameInput.focus()
        }

    } else {
        originalFilenameElement.innerText = "No active download found !!"
        newFilenameInput.value = ""
    }
})

// Adding event listener to the download button when clicked
document.getElementById("resume-download").addEventListener("click", () => {

    const customeBaseName = newFilenameInput.value.trim();
    if (!customeBaseName) return; // If empty input, do nothing

    const finalFileName = customeBaseName + originalExtension;

    // Checking if there is any download is in process.
    chrome.downloads.search({ state: "in_progress" }, (results) => {
        if (chrome.runtime.lastError) {
            console.error("Error checking downloads", chrome.runtime.lastError.message)
            return
        }
        if (results.length === 0) {
            originalFilenameElement.innerText = "No files are downloading currently !!"
            newFilenameInput.value = ""
        }
    })

    // Send new filename to background.js
    chrome.runtime.sendMessage({ action: "setFilename", filename: finalFileName }, (response) => {
        if (response && response.success) {
            console.log("filename sent to background script: ", finalFileName)
            window.close()
        } else {
            console.log("failed to send filename")
        }
    })

})

// skip rename button handler
document.getElementById("skip-rename").addEventListener("click", () => {
    // runs this code for skip button
    chrome.storage.local.get("originalFilename", (data) => {
        if (!data.originalFilename) return;

        const skipName = data.originalFilename.split('/').pop()

        chrome.runtime.sendMessage({ action: "setFilename", filename: skipName }, (response) => {
            if (response && response.success) {
                console.log("Skipped renaming, used original filename ", skipName)
                window.close()
            } else {
                console.log("failed to send filename")
            }
        })
    })
})


// Remove the original filename from the local storage
window.addEventListener("unload", () => {
    chrome.storage.local.remove("originalFilename")
})
