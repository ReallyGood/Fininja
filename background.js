// get current tab and execute script
async function executeScript() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);

  chrome.scripting.executeScript({
    files: ["scripts/malam.js"],
    target: { tabId: tab.id },
  });
}

// update on page reload
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    console.log("update");
    executeScript();
  }
});

// update on tab change
chrome.tabs.onActivated.addListener(() => {
  console.log("activate");
  executeScript();
});
