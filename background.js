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

      // taking the user input from the popup using popup.js
      chrome.runtime.onMessage.addListener((message) => {

      // checking if the custom filename received from popup.js
      if (message.action === "setFilename" && message.filename && pendingSuggest && pendingDownloadingId) {
        console.log("Received filename from popup:", message.filename)
      }

      // renaming the original filename
      pendingSuggest({ filename: message.filename })

      // It is necessary to return true bcz we call the suggest aysnchronously
      // see the documentation https://developer.chrome.com/docs/extensions/reference/api/downloads?hl=en#event-onDeterminingFilename
      return true;
    })
  })
    // resuming the download file after changing the filename
    chrome.downloads.resume(downloadedItem.id)

    pendingDownloadingId = null;
    pendingSuggest = null;
    
  return true;
})