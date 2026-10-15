document.addEventListener("DOMContentLoaded", () => {
  const enabledToggle = document.getElementById("enabled-toggle");
  const volumeSlider = document.getElementById("volume-slider");
  const volumeBadge = document.getElementById("volume-badge");
  const volumeCaption = document.getElementById("volume-caption");
  const quieterBtn = document.getElementById("quieter-btn");
  const louderBtn = document.getElementById("louder-btn");
  const testSoundBtn = document.getElementById("test-sound-btn");
  const tasksCounter = document.getElementById("tasks-counter");

  const VOLUME_CAPTIONS = {
    0: "Muted 🔇",
    1: "Subtle (10%)",
    2: "Soft (20%)",
    3: "Low (30%)",
    4: "Moderate (40%)",
    5: "Medium (50%)",
    6: "Standard (60%)",
    7: "Crisp & Clear (70%)",
    8: "Loud (80%)",
    9: "Very Loud (90%)",
    10: "Maximum (100% 🔊)"
  };

  const hasChromeStorage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync;
  const hasChromeRuntime = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL;

  const DING_AUDIO_URL = hasChromeRuntime
    ? chrome.runtime.getURL("assets/ding.wav")
    : "assets/ding.wav";

  const getVolumeLevel = (volume) => {
    if (!volume || volume <= 0) return 0;
    const clamped = Math.min(Math.max(volume, 0), 10) / 10;
    const EXP_SCALE_FACTOR = 4;
    return Math.exp(EXP_SCALE_FACTOR * clamped) / Math.exp(EXP_SCALE_FACTOR);
  };

  const playPreviewSound = (volume) => {
    if (volume <= 0) return;
    try {
      const audio = new Audio(DING_AUDIO_URL);
      audio.volume = getVolumeLevel(volume);
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const updateUI = (volume, enabled, tasksCompleted) => {
    volumeSlider.value = volume;
    volumeBadge.textContent = `${volume}/10`;
    volumeCaption.textContent = VOLUME_CAPTIONS[volume] || "Standard (60%)";
    enabledToggle.checked = enabled;
    if (tasksCounter) tasksCounter.textContent = tasksCompleted !== undefined ? tasksCompleted : 0;

    volumeSlider.disabled = !enabled;
    quieterBtn.disabled = !enabled || volume <= 0;
    louderBtn.disabled = !enabled || volume >= 10;
    testSoundBtn.disabled = !enabled || volume <= 0;
  };

  const saveSettings = (volume, enabled) => {
    if (hasChromeStorage) {
      chrome.storage.sync.set({ volume, enabled });
    } else {
      try {
        localStorage.setItem("notion_ding_volume", String(volume));
        localStorage.setItem("notion_ding_enabled", String(enabled));
      } catch (e) {}
    }
  };

  // Load saved settings
  if (hasChromeStorage) {
    chrome.storage.sync.get({ volume: 6, enabled: true, tasksCompleted: 0 }, (items) => {
      updateUI(
        items.volume !== undefined ? items.volume : 6,
        items.enabled !== undefined ? items.enabled : true,
        items.tasksCompleted || 0
      );
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync") {
        if (changes.tasksCompleted !== undefined && tasksCounter) {
          tasksCounter.textContent = changes.tasksCompleted.newValue;
        }
      }
    });
  } else {
    let savedVol = 6;
    let savedEnabled = true;
    let savedTasks = 0;
    try {
      const v = localStorage.getItem("notion_ding_volume");
      const e = localStorage.getItem("notion_ding_enabled");
      const t = localStorage.getItem("notion_ding_tasks");
      if (v !== null) savedVol = parseInt(v, 10);
      if (e !== null) savedEnabled = e === "true";
      if (t !== null) savedTasks = parseInt(t, 10);
    } catch (e) {}
    updateUI(savedVol, savedEnabled, savedTasks);
  }

  const getCurrentSettings = () => ({
    vol: parseInt(volumeSlider.value, 10),
    enabled: enabledToggle.checked,
    tasks: parseInt(tasksCounter ? tasksCounter.textContent : "0", 10)
  });

  // Slider change
  volumeSlider.addEventListener("input", (e) => {
    const vol = parseInt(e.target.value, 10);
    const s = getCurrentSettings();
    updateUI(vol, s.enabled, s.tasks);
  });

  volumeSlider.addEventListener("change", (e) => {
    const vol = parseInt(e.target.value, 10);
    const s = getCurrentSettings();
    saveSettings(vol, s.enabled);
    playPreviewSound(vol);
  });

  // Quieter button (-)
  quieterBtn.addEventListener("click", () => {
    const s = getCurrentSettings();
    const newVol = Math.max(0, s.vol - 1);
    updateUI(newVol, s.enabled, s.tasks);
    saveSettings(newVol, s.enabled);
    playPreviewSound(newVol);
  });

  // Louder button (+)
  louderBtn.addEventListener("click", () => {
    const s = getCurrentSettings();
    const newVol = Math.min(10, s.vol + 1);
    updateUI(newVol, s.enabled, s.tasks);
    saveSettings(newVol, s.enabled);
    playPreviewSound(newVol);
  });

  // Enable/Disable toggle
  enabledToggle.addEventListener("change", (e) => {
    const enabled = e.target.checked;
    const s = getCurrentSettings();
    updateUI(s.vol, enabled, s.tasks);
    saveSettings(s.vol, enabled);
    if (enabled && s.vol > 0) {
      playPreviewSound(s.vol);
    }
  });

  // Test sound button
  testSoundBtn.addEventListener("click", () => {
    const s = getCurrentSettings();
    playPreviewSound(s.vol);
  });
});
