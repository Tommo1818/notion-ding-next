document.addEventListener("DOMContentLoaded", () => {
  const enabledToggle = document.getElementById("enabled-toggle");
  const volumeSlider = document.getElementById("volume-slider");
  const volumeBadge = document.getElementById("volume-badge");
  const volumeCaption = document.getElementById("volume-caption");
  const quieterBtn = document.getElementById("quieter-btn");
  const louderBtn = document.getElementById("louder-btn");
  const testSoundBtn = document.getElementById("test-sound-btn");
  const tasksCounter = document.getElementById("tasks-counter");
  const todayCounter = document.getElementById("today-counter");
  const streakCounter = document.getElementById("streak-counter");
  const resetStatsBtn = document.getElementById("reset-stats-btn");
  const soundThemeSelect = document.getElementById("sound-theme-select");
  const animStyleSelect = document.getElementById("anim-style-select");
  const pitchToggle = document.getElementById("pitch-toggle");

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

  // Web Audio Context & Buffer Cache for instantaneous playback
  let audioCtx = null;
  const audioBuffers = {};
  let testComboCount = 0;
  let lastTestClickTime = 0;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  async function loadAudioBuffer(soundTheme) {
    if (audioBuffers[soundTheme]) return audioBuffers[soundTheme];
    const ctx = getAudioContext();
    if (!ctx) return null;

    try {
      const filename = `${soundTheme}.wav`;
      const url = hasChromeRuntime ? chrome.runtime.getURL(`assets/${filename}`) : `assets/${filename}`;
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      audioBuffers[soundTheme] = decoded;
      return decoded;
    } catch (e) {
      return null;
    }
  }

  // Pre-load current sound
  loadAudioBuffer("ding");

  const getVolumeLevel = (volume) => {
    if (!volume || volume <= 0) return 0;
    const clamped = Math.min(Math.max(volume, 0), 10) / 10;
    const EXP_SCALE_FACTOR = 4;
    return Math.exp(EXP_SCALE_FACTOR * clamped) / Math.exp(EXP_SCALE_FACTOR);
  };

  const playPreviewSound = async (volume, soundTheme, useChromatic = false) => {
    if (volume <= 0) return;
    const ctx = getAudioContext();

    // Calculate chromatic semitone shift
    let semitones = 0;
    const now = Date.now();
    if (useChromatic) {
      if (now - lastTestClickTime < 4000) {
        testComboCount = (testComboCount + 1) % 13; // 0 to 12 semitones (1 full octave)
      } else {
        testComboCount = 0;
      }
      lastTestClickTime = now;
      semitones = testComboCount;
    }

    const playbackRate = Math.pow(2, semitones / 12);

    if (ctx) {
      const buffer = await loadAudioBuffer(soundTheme);
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = playbackRate;

        const gainNode = ctx.createGain();
        gainNode.gain.value = getVolumeLevel(volume);

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      }
    }

    // Fallback if Web Audio decoding fails
    try {
      const filename = `${soundTheme}.wav`;
      const url = hasChromeRuntime ? chrome.runtime.getURL(`assets/${filename}`) : `assets/${filename}`;
      const audio = new Audio(url);
      audio.volume = getVolumeLevel(volume);
      audio.playbackRate = playbackRate;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const updateUI = (state) => {
    const { volume, enabled, tasksCompleted, tasksToday, streakDays, soundTheme, animStyle, pitchModulation } = state;

    volumeSlider.value = volume;
    volumeBadge.textContent = `${volume}/10`;
    volumeCaption.textContent = VOLUME_CAPTIONS[volume] || "Standard (60%)";
    enabledToggle.checked = enabled;

    if (tasksCounter) tasksCounter.textContent = tasksCompleted !== undefined ? tasksCompleted : 0;
    if (todayCounter) todayCounter.textContent = tasksToday !== undefined ? tasksToday : 0;
    if (streakCounter) streakCounter.textContent = `${streakDays || 0}-day streak`;

    if (soundThemeSelect && soundTheme) soundThemeSelect.value = soundTheme;
    if (animStyleSelect && animStyle) animStyleSelect.value = animStyle;
    if (pitchToggle) pitchToggle.checked = pitchModulation !== undefined ? pitchModulation : true;

    volumeSlider.disabled = !enabled;
    quieterBtn.disabled = !enabled || volume <= 0;
    louderBtn.disabled = !enabled || volume >= 10;
    testSoundBtn.disabled = !enabled || volume <= 0;
    if (soundThemeSelect) soundThemeSelect.disabled = !enabled;
    if (animStyleSelect) animStyleSelect.disabled = !enabled;
    if (pitchToggle) pitchToggle.disabled = !enabled;
  };

  const saveSettings = (updates) => {
    if (hasChromeStorage) {
      chrome.storage.sync.set(updates);
    } else {
      try {
        Object.entries(updates).forEach(([k, v]) => {
          localStorage.setItem(`notion_ding_${k}`, String(v));
        });
      } catch (e) {}
    }
  };

  const defaultSettings = {
    volume: 6,
    enabled: true,
    tasksCompleted: 0,
    tasksToday: 0,
    streakDays: 0,
    soundTheme: "ding",
    animStyle: "both",
    pitchModulation: true
  };

  // Load saved settings from Chrome Storage
  if (hasChromeStorage) {
    chrome.storage.sync.get(defaultSettings, (items) => {
      updateUI(items);
      loadAudioBuffer(items.soundTheme || "ding");
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync") {
        if (changes.tasksCompleted && tasksCounter) tasksCounter.textContent = changes.tasksCompleted.newValue;
        if (changes.tasksToday && todayCounter) todayCounter.textContent = changes.tasksToday.newValue;
        if (changes.streakDays && streakCounter) streakCounter.textContent = `${changes.streakDays.newValue}-day streak`;
      }
    });
  } else {
    updateUI(defaultSettings);
  }

  const getCurrentSettings = () => ({
    volume: parseInt(volumeSlider.value, 10),
    enabled: enabledToggle.checked,
    tasksCompleted: parseInt(tasksCounter ? tasksCounter.textContent : "0", 10),
    tasksToday: parseInt(todayCounter ? todayCounter.textContent : "0", 10),
    streakDays: parseInt(streakCounter ? streakCounter.textContent : "0", 10),
    soundTheme: soundThemeSelect ? soundThemeSelect.value : "ding",
    animStyle: animStyleSelect ? animStyleSelect.value : "both",
    pitchModulation: pitchToggle ? pitchToggle.checked : true
  });

  // Slider change
  volumeSlider.addEventListener("input", (e) => {
    const vol = parseInt(e.target.value, 10);
    const s = getCurrentSettings();
    s.volume = vol;
    updateUI(s);
  });

  volumeSlider.addEventListener("change", (e) => {
    const vol = parseInt(e.target.value, 10);
    const s = getCurrentSettings();
    saveSettings({ volume: vol });
    playPreviewSound(vol, s.soundTheme, s.pitchModulation);
  });

  // Quieter button (-)
  quieterBtn.addEventListener("click", () => {
    const s = getCurrentSettings();
    const newVol = Math.max(0, s.volume - 1);
    s.volume = newVol;
    updateUI(s);
    saveSettings({ volume: newVol });
    playPreviewSound(newVol, s.soundTheme, s.pitchModulation);
  });

  // Louder button (+)
  louderBtn.addEventListener("click", () => {
    const s = getCurrentSettings();
    const newVol = Math.min(10, s.volume + 1);
    s.volume = newVol;
    updateUI(s);
    saveSettings({ volume: newVol });
    playPreviewSound(newVol, s.soundTheme, s.pitchModulation);
  });

  // Enable/Disable toggle
  enabledToggle.addEventListener("change", (e) => {
    const enabled = e.target.checked;
    const s = getCurrentSettings();
    s.enabled = enabled;
    updateUI(s);
    saveSettings({ enabled });
    if (enabled && s.volume > 0) {
      playPreviewSound(s.volume, s.soundTheme, false);
    }
  });

  // Sound theme select
  if (soundThemeSelect) {
    soundThemeSelect.addEventListener("change", (e) => {
      const theme = e.target.value;
      saveSettings({ soundTheme: theme });
      loadAudioBuffer(theme).then(() => {
        const s = getCurrentSettings();
        playPreviewSound(s.volume, theme, false);
      });
    });
  }

  // Animation style select
  if (animStyleSelect) {
    animStyleSelect.addEventListener("change", (e) => {
      saveSettings({ animStyle: e.target.value });
    });
  }

  // Chromatic pitch modulation toggle
  if (pitchToggle) {
    pitchToggle.addEventListener("change", (e) => {
      saveSettings({ pitchModulation: e.target.checked });
    });
  }

  // Reset statistics button
  if (resetStatsBtn) {
    resetStatsBtn.addEventListener("click", () => {
      if (confirm("Reset task completion counters and streak?")) {
        const updates = { tasksCompleted: 0, tasksToday: 0, streakDays: 0, lastActiveDate: "" };
        saveSettings(updates);
        if (tasksCounter) tasksCounter.textContent = "0";
        if (todayCounter) todayCounter.textContent = "0";
        if (streakCounter) streakCounter.textContent = "0-day streak";
      }
    });
  }

  // Test sound button
  testSoundBtn.addEventListener("click", () => {
    const s = getCurrentSettings();
    playPreviewSound(s.volume, s.soundTheme, s.pitchModulation);
  });
});
