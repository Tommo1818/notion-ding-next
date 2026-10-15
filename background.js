chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["volume", "enabled", "tasksCompleted"], (result) => {
    const updates = {};
    if (result.volume === undefined) updates.volume = 6;
    if (result.enabled === undefined) updates.enabled = true;
    if (result.tasksCompleted === undefined) updates.tasksCompleted = 0;
    if (Object.keys(updates).length > 0) {
      chrome.storage.sync.set(updates);
    }
    console.log("[Notion Ding] Initialized default settings.");
  });
});
