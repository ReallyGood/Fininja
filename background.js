let tabId;

// get current tab and execute script
async function executeScript() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);

  if (tab) {
    tabId = tab.id;
  }

  if (tabId) {
    chrome.scripting.executeScript({
      files: ["scripts/malam.js"],
      target: { tabId, allFrames: true },
    });
  }
}

// update on page reload
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    executeScript();
  }
});

// update on tab change
chrome.tabs.onActivated.addListener(executeScript);
