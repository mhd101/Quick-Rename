let pendingDownloadingId = null;
let pendingSuggest = null;

// listens for any upcoming download file
chrome.downloads.onDeterminingFilename.addListener((downloadedItem, suggest) => {

  // pause the download file so that the user give the custom filename
  chrome.downloads.pause(downloadedItem.id, () => {

    pendingDownloadingId = downloadedItem.id;
    pendingSuggest = suggest;

    // storing the original filename in the local storage
    chrome.storage.local.set({
      originalFilename: downloadedItem.filename
    }).then(() => {
      // opening the popup 
      chrome.action.openPopup();
    })
  })
  // It necessary to return true bcz we call the suggest aysnchronously
  // See the documentation https://developer.chrome.com/docs/extensions/reference/api/downloads?hl=en#event-onDeterminingFilename
  return true;
})

// taking the user input from the popup using popup.js
chrome.runtime.onMessage.addListener((message) => {

  // Checking if the customfilename received from popup.js
  if (message.action === "setFilename" && message.filename && pendingSuggest && pendingDownloadingId) {
    console.log("Received filename from popup:", message.filename)
  } else{ 
    return; // nothing to rename
  }

  // Renaming the original filename
  pendingSuggest({ filename: message.filename })

  chrome.downloads.resume(pendingDownloadingId, () => {
    chrome.storage.local.remove("originalFilename", () => {
      pendingDownloadingId = null
      pendingSuggest = null
    })
  })

  return true;
})