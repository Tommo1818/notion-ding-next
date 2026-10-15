chrome.runtime.onInstalled.addListener(() => {
  const defaults = {
    volume: 6,
    enabled: true,
    tasksCompleted: 0,
    tasksToday: 0,
    streakDays: 0,
    lastActiveDate: "",
    soundTheme: "ding",
    animStyle: "both",
    pitchModulation: true
  };

  chrome.storage.sync.get(Object.keys(defaults), (result) => {
    const updates = {};
    for (const [key, value] of Object.entries(defaults)) {
      if (result[key] === undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length > 0) {
      chrome.storage.sync.set(updates);
    }
    console.log("[Notion Ding] Initialized default settings.");
  });
});
