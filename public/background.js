/* global chrome */

// Track current active tab and timing
let activeTab = {
  domain: null,
  startTime: null
};

// Initialize data on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ tabData: {} });
});

// Helper function to get domain from URL
const getDomain = (url) => {
  try {
      return new URL(url).hostname;
  } catch (e) {
      return null;
  }
};

// Helper function to update time spent for a domain
const updateTimeSpent = async (domain, startTime) => {
  if (!domain || !startTime) return;

  const result = await chrome.storage.local.get("tabData");
  const tabData = result.tabData || {};
  
  if (!tabData[domain]) {
      tabData[domain] = { domain, timeSpent: 0, lastVisited: Date.now() };
  }
  
  const timeSpent = Date.now() - startTime;
  tabData[domain].timeSpent += timeSpent;
  tabData[domain].lastVisited = Date.now();
  
  await chrome.storage.local.set({ tabData });
};

// Handle tab activation (switching between tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Update time for previous domain
  if (activeTab.domain) {
      await updateTimeSpent(activeTab.domain, activeTab.startTime);
  }

  // Set up new active tab
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
      activeTab = {
          domain: getDomain(tab.url),
          startTime: Date.now()
      };
  }
});

// Handle URL changes within the same tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
      const currentDomain = getDomain(changeInfo.url);
      
      // Only update if this is the active tab
      const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTabs[0]?.id === tabId) {
          // Update time for previous domain
          if (activeTab.domain) {
              await updateTimeSpent(activeTab.domain, activeTab.startTime);
          }
          
          // Set new domain and start time
          activeTab = {
              domain: currentDomain,
              startTime: Date.now()
          };
      }
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
      // Browser lost focus, update time
      if (activeTab.domain) {
          await updateTimeSpent(activeTab.domain, activeTab.startTime);
          activeTab.startTime = null;
      }
  } else {
      // Browser regained focus, start new timer
      const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTabs[0]?.url) {
          activeTab = {
              domain: getDomain(activeTabs[0].url),
              startTime: Date.now()
          };
      }
  }
});

// Handle tab closure
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  // Update final time for the closed tab if it was active
  if (activeTab.domain) {
      await updateTimeSpent(activeTab.domain, activeTab.startTime);
      
      // Reset active tab if the closed tab was active
      const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTabs[0]?.url) {
          activeTab = {
              domain: getDomain(activeTabs[0].url),
              startTime: Date.now()
          };
      }
  }
});

// Periodic update every minute for active tab
setInterval(async () => {
  if (activeTab.domain && activeTab.startTime) {
      await updateTimeSpent(activeTab.domain, activeTab.startTime);
      activeTab.startTime = Date.now(); // Reset start time for next interval
  }
}, 60000); // Update every minute

// Optional: Data cleanup (runs daily)
const cleanupOldData = async () => {
  const result = await chrome.storage.local.get("tabData");
  const tabData = result.tabData || {};
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  // Remove entries older than 30 days
  const updatedData = Object.fromEntries(
      Object.entries(tabData).filter(([_, data]) => data.lastVisited > thirtyDaysAgo)
  );
  
  await chrome.storage.local.set({ tabData: updatedData });
};

// Run cleanup daily
setInterval(cleanupOldData, 24 * 60 * 60 * 1000);