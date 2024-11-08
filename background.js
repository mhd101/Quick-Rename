// Listens for any upcoming download file
chrome.downloads.onDeterminingFilename.addListener((downloadedItem, suggest) => {

  // Pause the download file so that the user give the custom filename
  chrome.downloads.pause(downloadedItem.id, () => {

      // Storing the original filename in the local storage
      chrome.storage.local.set({
        originalFilename: downloadedItem.filename
      }).then(() => {

      // Opening the popup
        chrome.action.openPopup();
      })

      // Taking the user input from the popup using popup.js
      chrome.runtime.onMessage.addListener((message) => {

      // Checking if the customfilename received from popup.js
      if (message.action === "setFilename" && message.filename) {
        console.log("Received filename from popup:", message.filename)
      }

      // Renaming the original filename
      suggest({ filename: message.filename })

      // It necessary to return true bcz we call the suggest aysnchronously
      // See the documentation https://developer.chrome.com/docs/extensions/reference/api/downloads?hl=en#event-onDeterminingFilename
      return true;
    })
  })

    // Resuming the download file after changing the filename
    chrome.downloads.resume(downloadedItem.id)
    
  return true;
})