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

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: "https://www.malam-payroll.com/%D7%9E%D7%97%D7%A9%D7%91%D7%95%D7%9F-%D7%A9%D7%9B%D7%A8",
  });
});
