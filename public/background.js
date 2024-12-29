/* global chrome */

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ tabData: {} });
  });
  
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      const domain = new URL(tab.url).hostname;
      const startTime = Date.now();
  
      chrome.storage.local.get("tabData", (result) => {
        const tabData = result.tabData || {};
        if (!tabData[domain]) {
          tabData[domain] = { domain, timeSpent: 0, startTime };
        }
        tabData[domain].startTime = startTime;
        chrome.storage.local.set({ tabData });
      });
    }
  });
  
  chrome.tabs.onRemoved.addListener(() => {
    chrome.storage.local.set({ tabData: {} });
  });
  