(() => {
  "use strict";

  // Prevent multiple injections on the same page
  if (window.__NOTION_DING_INITIALIZED__) return;
  window.__NOTION_DING_INITIALIZED__ = true;

  const DEBOUNCE_INTERVAL_MS = 200;
  const COMBO_WINDOW_MS = 5000; // 5-second combo window for chromatic pitch scale
  const USER_INTERACTION_WINDOW_MS = 1000;

  let currentVolume = 6;
  let isEnabled = true;
  let currentSoundTheme = "ding";
  let currentAnimStyle = "both";
  let usePitchModulation = true;

  let lastDingTime = 0;
  let comboCount = 0;
  let lastUserInteractionTime = 0;
  let lastInteractionCoords = null;
  let interactionCounter = 0;
  let lastDingedInteractionId = 0;
  let candidateBeforeInteraction = null;

  // Web Audio Context & Pre-cached Audio Buffers
  let audioCtx = null;
  const audioBuffers = {};

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

  async function loadAudioBuffer(theme) {
    if (audioBuffers[theme]) return audioBuffers[theme];
    const ctx = getAudioContext();
    if (!ctx) return null;

    try {
      const url = chrome.runtime.getURL(`assets/${theme}.wav`);
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      audioBuffers[theme] = decoded;
      return decoded;
    } catch (e) {
      return null;
    }
  }

  // Pre-load default sound
  loadAudioBuffer("ding");

  // Exponential volume mapping for natural human hearing perception
  const getVolumeLevel = (volume) => {
    if (!volume || volume <= 0) return 0;
    const clamped = Math.min(Math.max(volume, 0), 10) / 10;
    const EXP_SCALE_FACTOR = 4;
    return Math.exp(EXP_SCALE_FACTOR * clamped) / Math.exp(EXP_SCALE_FACTOR);
  };

  // Sync settings from Chrome storage
  try {
    chrome.storage.sync.get(
      {
        volume: 6,
        enabled: true,
        soundTheme: "ding",
        animStyle: "both",
        pitchModulation: true
      },
      (items) => {
        if (items.volume !== undefined) currentVolume = items.volume;
        if (items.enabled !== undefined) isEnabled = items.enabled;
        if (items.soundTheme !== undefined) {
          currentSoundTheme = items.soundTheme;
          loadAudioBuffer(items.soundTheme);
        }
        if (items.animStyle !== undefined) currentAnimStyle = items.animStyle;
        if (items.pitchModulation !== undefined) usePitchModulation = items.pitchModulation;
      }
    );

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync") {
        if (changes.volume !== undefined) currentVolume = changes.volume.newValue;
        if (changes.enabled !== undefined) isEnabled = changes.enabled.newValue;
        if (changes.soundTheme !== undefined) {
          currentSoundTheme = changes.soundTheme.newValue;
          loadAudioBuffer(changes.soundTheme.newValue);
        }
        if (changes.animStyle !== undefined) currentAnimStyle = changes.animStyle.newValue;
        if (changes.pitchModulation !== undefined) usePitchModulation = changes.pitchModulation.newValue;
      }
    });
  } catch (e) {}

  // Update daily completion stats and streak
  function updateCompletionStats() {
    try {
      chrome.storage.sync.get(
        { tasksCompleted: 0, tasksToday: 0, streakDays: 0, lastActiveDate: "" },
        (res) => {
          const todayStr = new Date().toISOString().split("T")[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          let tasksToday = (res.tasksToday || 0) + 1;
          let streakDays = res.streakDays || 1;

          if (res.lastActiveDate === todayStr) {
            // Already checked a task today
            streakDays = res.streakDays || 1;
          } else if (res.lastActiveDate === yesterdayStr) {
            // Continued streak from yesterday
            streakDays = (res.streakDays || 0) + 1;
            tasksToday = 1;
          } else {
            // New streak
            streakDays = 1;
            tasksToday = 1;
          }

          chrome.storage.sync.set({
            tasksCompleted: (res.tasksCompleted || 0) + 1,
            tasksToday,
            streakDays,
            lastActiveDate: todayStr
          });
        }
      );
    } catch (e) {}
  }

  // Play audio with pre-cached Web Audio API and chromatic pitch modulation
  async function playSound(semitones = 0) {
    if (!isEnabled || currentVolume <= 0) return;

    const playbackRate = Math.pow(2, semitones / 12); // Chromatic semitone: 2^(n/12)
    const ctx = getAudioContext();

    if (ctx) {
      const buffer = await loadAudioBuffer(currentSoundTheme);
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = playbackRate;

        const gainNode = ctx.createGain();
        gainNode.gain.value = getVolumeLevel(currentVolume);

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      }
    }

    // Direct Audio fallback
    try {
      const url = chrome.runtime.getURL(`assets/${currentSoundTheme}.wav`);
      const audio = new Audio(url);
      audio.volume = getVolumeLevel(currentVolume);
      audio.playbackRate = playbackRate;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  // Locates the actual small checkbox element (width <= 48px) inside or around a target
  function findActualCheckbox(el) {
    if (!el || !(el instanceof Element)) return null;

    // Check if el itself is small like a checkbox
    if (el.getBoundingClientRect) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.width <= 48 && r.height > 0 && r.height <= 48) {
        return el;
      }
    }

    // Try finding specific checkbox or SVG elements inside el
    const candidates = [
      "[role='checkbox']",
      "input[type='checkbox']",
      "[aria-checked]",
      "svg.check",
      "svg[class*='check']",
      "svg",
      ".notion-record-icon",
      "[data-property-id*='checkbox']"
    ];

    for (const sel of candidates) {
      const found = el.querySelector(sel);
      if (found && found.getBoundingClientRect) {
        const fr = found.getBoundingClientRect();
        if (fr.width > 0 && fr.width <= 48) {
          if (found.tagName && found.tagName.toLowerCase() === "svg" && found.parentElement) {
            const pr = found.parentElement.getBoundingClientRect();
            if (pr.width > 0 && pr.width <= 48) return found.parentElement;
          }
          return found;
        }
      }
    }

    // Check first children on the left side of the block
    if (el.children && el.children.length > 0) {
      let current = el.firstElementChild;
      while (current) {
        const cr = current.getBoundingClientRect ? current.getBoundingClientRect() : null;
        if (cr && cr.width > 0 && cr.width <= 48) {
          return current;
        }
        current = current.firstElementChild;
      }
    }

    return null;
  }

  // Center point of the small checkbox that belongs to an element (null when unresolvable)
  function getCheckboxCenter(el) {
    const checkbox = findActualCheckbox(el);
    if (checkbox && checkbox.getBoundingClientRect) {
      const rect = checkbox.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
    }
    return null;
  }

  // Stable identity of the to-do row/block a node lives in.
  // Notion keeps [data-block-id] on the row root, so this identity survives React
  // replacing the row's inner nodes while re-rendering.
  function getBlockId(el) {
    if (!el || !(el instanceof Element) || !el.closest) return null;
    const block = el.closest("[data-block-id]");
    const id = block && block.getAttribute ? block.getAttribute("data-block-id") : null;
    return id || null;
  }

  // True only when a mutated node sits inside the exact row the user just interacted with.
  // This is what keeps the MutationObserver quiet for unrelated DOM churn: Notion's hover
  // controls and lazily rendered / re-rendered rows (which are frequently already finished).
  function belongsToCandidate(node) {
    const candidate = candidateBeforeInteraction;
    if (!candidate || !(node instanceof Element)) return false;

    const element = candidate.element;
    if (element instanceof Element) {
      if (node === element || node.contains(element) || element.contains(node)) {
        return true;
      }
    }

    const nodeBlockId = getBlockId(node);
    return !!(candidate.blockId && nodeBlockId && candidate.blockId === nodeBlockId);
  }

  // Get center coordinates of target checkbox
  function getElementCenter(el) {
    const now = Date.now();
    const hasRecentClick =
      lastInteractionCoords &&
      now - lastUserInteractionTime < USER_INTERACTION_WINDOW_MS;

    // 1. Locate the actual small checkbox element
    const checkboxCenter = getCheckboxCenter(el);
    if (checkboxCenter) return checkboxCenter;

    if (el && el.getBoundingClientRect) {
      const rect = el.getBoundingClientRect();

      // 2. The target itself is already tight around the checkbox
      if (rect.width > 0 && rect.height > 0 && rect.width <= 50) {
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }

      // 3. Fallback for keyboard toggles on a full to-do block/row:
      // Notion checkboxes are positioned on the far-left of the to-do block (14px from rect.left)
      if (rect.width > 0 && rect.height > 0) {
        const leftOffset = rect.width > 60 ? Math.min(rect.height / 2, 14) : rect.width / 2;
        return {
          x: rect.left + leftOffset,
          y: rect.top + rect.height / 2
        };
      }
    }

    // 4. Only if the pointer landed inside this element, trust the pointer position
    if (hasRecentClick && el && el.getBoundingClientRect) {
      const blockRect = el.getBoundingClientRect();
      if (
        lastInteractionCoords.y >= blockRect.top - 15 &&
        lastInteractionCoords.y <= blockRect.bottom + 15 &&
        lastInteractionCoords.x >= blockRect.left - 20 &&
        lastInteractionCoords.x <= blockRect.right + 20
      ) {
        return {
          x: lastInteractionCoords.x,
          y: lastInteractionCoords.y
        };
      }
    }

    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  // Subtle clean ripple animation expanding from a resolved on-screen point
  function spawnRipple(point) {
    if (!document.body || !point) return;
    const { x, y } = point;

    const ripple = document.createElement("div");
    ripple.className = "notion-ding-ripple";
    Object.assign(ripple.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      border: "2px solid #2eaadc",
      background: "radial-gradient(circle, rgba(46, 170, 220, 0.3) 0%, rgba(46, 170, 220, 0) 70%)",
      transform: "translate(-50%, -50%) scale(0.4)",
      opacity: "0.95",
      pointerEvents: "none",
      zIndex: "2147483647",
      transition: "transform 0.65s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 0.65s ease-out"
    });

    document.body.appendChild(ripple);

    requestAnimationFrame(() => {
      ripple.style.transform = "translate(-50%, -50%) scale(2.4)";
      ripple.style.opacity = "0";
    });

    setTimeout(() => {
      if (ripple.parentElement) ripple.remove();
    }, 700);
  }

  // Micro confetti burst around a resolved on-screen point
  function spawnMicroConfetti(point) {
    if (!document.body || !point) return;
    const { x, y } = point;

    const colors = ["#2383e2", "#0f8558", "#d9730d", "#9065b0", "#e03e3e", "#2eaadc"];
    const particleCount = 12;
    const container = document.createElement("div");
    container.className = "notion-ding-confetti-container";
    Object.assign(container.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      pointerEvents: "none",
      zIndex: "2147483647"
    });

    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement("div");
      const isCircle = i % 2 === 0;
      const size = 3 + Math.random() * 2.5;
      const color = colors[i % colors.length];

      Object.assign(p.style, {
        position: "absolute",
        left: "0px",
        top: "0px",
        width: `${size}px`,
        height: isCircle ? `${size}px` : `${size * 1.4}px`,
        borderRadius: isCircle ? "50%" : "1px",
        backgroundColor: color,
        transform: "translate(-50%, -50%) scale(0)",
        opacity: "1",
        transition: "transform 0.6s cubic-bezier(0.12, 0.9, 0.35, 1), opacity 0.6s ease-out"
      });

      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const distance = 14 + Math.random() * 22;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance - 6;
      const rotation = (Math.random() - 0.5) * 360;

      container.appendChild(p);
      particles.push({ el: p, destX, destY, rotation });
    }

    document.body.appendChild(container);

    requestAnimationFrame(() => {
      particles.forEach(({ el, destX, destY, rotation }) => {
        el.style.transform = `translate(${destX}px, ${destY}px) scale(1) rotate(${rotation}deg)`;
        el.style.opacity = "0";
      });
    });

    setTimeout(() => {
      if (container.parentElement) container.remove();
    }, 700);
  }

  // Resolve the exact on-screen point a completion animation should originate from.
  // The anchor captured at interaction time wins: it was measured on the real checkbox
  // *before* Notion re-rendered the row, so the burst never drifts onto the row's text.
  function getAnimationPoint(forInteractionId, triggerElement) {
    const candidate = candidateBeforeInteraction;
    if (candidate && candidate.anchor && (!forInteractionId || candidate.id === forInteractionId)) {
      return candidate.anchor;
    }

    const target = triggerElement || (candidate ? candidate.element : null);
    return getCheckboxCenter(target) || getElementCenter(target);
  }

  // Trigger sound, stats update, and animations
  function triggerDing(forInteractionId, triggerElement) {
    const now = Date.now();
    if (forInteractionId && forInteractionId === lastDingedInteractionId) {
      return; // Already triggered for this user interaction
    }
    if (now - lastDingTime < DEBOUNCE_INTERVAL_MS) {
      return; // Global debounce interval
    }

    // Chromatic pitch modulation: advance semitone if within combo window
    let semitones = 0;
    if (usePitchModulation) {
      if (now - lastDingTime < COMBO_WINDOW_MS) {
        comboCount = (comboCount + 1) % 13; // 0 to 12 semitones
      } else {
        comboCount = 0;
      }
      semitones = comboCount;
    }

    if (forInteractionId) {
      lastDingedInteractionId = forInteractionId;
    }
    lastDingTime = now;

    // 1. Play audio at calculated pitch
    playSound(semitones);

    // 2. Increment stats & streak
    updateCompletionStats();

    // 3. Trigger visual completion animations
    const point = getAnimationPoint(forInteractionId, triggerElement);
    if (currentAnimStyle === "both" || currentAnimStyle === "ripple") {
      spawnRipple(point);
    }
    if (currentAnimStyle === "both" || currentAnimStyle === "confetti") {
      spawnMicroConfetti(point);
    }
  }

  // Determines whether a given DOM element represents a checked checkbox
  function isElementChecked(el) {
    if (!el || !(el instanceof Element)) return false;

    // 1. Native HTML checkbox input
    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      return el.checked;
    }

    // 2. ARIA checkbox state
    const aria = el.getAttribute("aria-checked");
    if (aria === "true") return true;
    if (aria === "false") return false;

    // 3. Child input checkbox
    const childInput = el.querySelector("input[type='checkbox']");
    if (childInput && childInput.checked) return true;

    // 4. Child with aria-checked
    const childAria = el.querySelector("[aria-checked='true']");
    if (childAria) return true;

    // 5. SVG checkmark or check icon inside container
    const checkSvg = el.querySelector("svg.check, svg[class*='check'], svg path[d*='M12.231'], svg path[d*='M5.5']");
    if (checkSvg) return true;

    return false;
  }

  // Safely find the relevant checkbox target from an event's composed path
  function findCheckboxTarget(event) {
    const path = event.composedPath ? event.composedPath() : [];
    for (const node of path) {
      if (!node || !(node instanceof Element)) continue;

      if (node instanceof HTMLInputElement && node.type === "checkbox") {
        return node;
      }
      if (node.getAttribute("role") === "checkbox" || node.hasAttribute("aria-checked")) {
        return node;
      }
      if (node.tagName && node.tagName.toLowerCase() === "svg") {
        return node;
      }
      // Notion to-do block or database checkbox cell
      if (
        node.classList &&
        (node.classList.contains("notion-to_do-block") ||
         node.classList.contains("notion-collection-item"))
      ) {
        const inner = node.querySelector("input[type='checkbox'], [role='checkbox'], [aria-checked], svg");
        return inner || node;
      }
    }
    return null;
  }

  // Track the start of a user interaction before the DOM state toggles
  function onInteractionStart(event) {
    lastUserInteractionTime = Date.now();
    if (event.clientX !== undefined && event.clientY !== undefined && (event.clientX > 0 || event.clientY > 0)) {
      lastInteractionCoords = { x: event.clientX, y: event.clientY };
    }
    interactionCounter++;
    const thisId = interactionCounter;

    const target = findCheckboxTarget(event);
    if (target) {
      candidateBeforeInteraction = {
        id: thisId,
        element: target,
        wasChecked: isElementChecked(target),
        time: Date.now(),
        // Measured now, while the checkbox is still on screen untouched by React's
        // re-render — this is the point the completion animation must originate from.
        anchor: getCheckboxCenter(target),
        blockId: getBlockId(target)
      };
    } else {
      candidateBeforeInteraction = null;
    }
  }

  // Register pointer/mouse interactions
  document.addEventListener("pointerdown", onInteractionStart, { capture: true, passive: true });
  document.addEventListener("mousedown", onInteractionStart, { capture: true, passive: true });

  // Handle keyboard toggles (Space, Enter, Cmd+Enter, Ctrl+Enter)
  document.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      lastUserInteractionTime = Date.now();
      interactionCounter++;
      const thisId = interactionCounter;

      const activeEl = document.activeElement;
      if (activeEl && activeEl instanceof Element) {
        let cb = activeEl.matches && (
          activeEl.matches("input[type='checkbox']") ||
          activeEl.matches("[role='checkbox']") ||
          activeEl.matches("[aria-checked]")
        ) ? activeEl : activeEl.querySelector("input[type='checkbox'], [role='checkbox'], [aria-checked]");

        // Notion focuses the editable text, whose checkbox is a *sibling* — climb to the
        // enclosing row so keyboard toggles are tracked like pointer ones.
        if (!cb) {
          const row = activeEl.closest("[data-block-id], .notion-to_do-block, [role='checkbox']");
          if (row) {
            cb = findActualCheckbox(row) || row.querySelector("input[type='checkbox'], [role='checkbox'], [aria-checked]");
          }
        }

        if (cb) {
          candidateBeforeInteraction = {
            id: thisId,
            element: cb,
            wasChecked: isElementChecked(cb),
            time: Date.now(),
            anchor: getCheckboxCenter(cb),
            blockId: getBlockId(cb)
          };
        }
      }
    }
  }, { capture: true, passive: true });

  // Method 1: Native change events (fires on native input elements when toggled)
  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target && target instanceof HTMLInputElement && target.type === "checkbox") {
      if (target.checked) {
        triggerDing(interactionCounter, target);
      }
    }
  }, { capture: true, passive: true });

  // Method 2: Click event verification
  document.addEventListener("click", (event) => {
    lastUserInteractionTime = Date.now();
    if (event.clientX !== undefined && event.clientY !== undefined && (event.clientX > 0 || event.clientY > 0)) {
      lastInteractionCoords = { x: event.clientX, y: event.clientY };
    }
    const checkbox = findCheckboxTarget(event);
    const thisInteractionId = interactionCounter;

    if (checkbox) {
      // If the user's pointer went down on something that was ALREADY checked in this same
      // row, this click can only be un-checking it — never a completion.
      if (candidateBeforeInteraction && candidateBeforeInteraction.wasChecked && belongsToCandidate(checkbox)) {
        return;
      }

      // Check immediately and over the next animation frames as React reconciles
      const checkDelays = [0, 20, 60, 120];
      for (const delay of checkDelays) {
        setTimeout(() => {
          if (thisInteractionId === lastDingedInteractionId) return;

          let current = checkbox;
          // If React replaced the node during re-render, locate its current block
          if (!current.isConnected) {
            const block = checkbox.closest ? checkbox.closest("[data-block-id]") : null;
            if (block) {
              const id = block.getAttribute("data-block-id");
              const freshBlock = document.querySelector(`[data-block-id="${id}"]`);
              if (freshBlock) {
                current = freshBlock.querySelector("input[type='checkbox'], [role='checkbox'], [aria-checked]") || freshBlock;
              }
            }
          }
          if (isElementChecked(current)) {
            const specific = findActualCheckbox(current) || current;
            triggerDing(thisInteractionId, specific);
          }
        }, delay);
      }
    }
  }, { capture: true, passive: true });

  // Method 3: MutationObserver for custom ARIA attributes and checkmark SVG additions
  const observer = new MutationObserver((mutations) => {
    const timeSinceInteraction = Date.now() - lastUserInteractionTime;
    if (timeSinceInteraction > USER_INTERACTION_WINDOW_MS) return;
    const thisInteractionId = interactionCounter;
    if (thisInteractionId === lastDingedInteractionId) return;

    for (const mutation of mutations) {
      // Attribute change: aria-checked became true
      if (mutation.type === "attributes" && mutation.attributeName === "aria-checked") {
        const target = mutation.target;
        if (target instanceof Element && target.getAttribute("aria-checked") === "true") {
          if (mutation.oldValue !== "true") {
            // Ignore aria flips on rows the user never touched (lazy rendering of
            // already-finished tasks, collaborators, hover-driven re-renders, etc.)
            if (!belongsToCandidate(target)) continue;
            if (candidateBeforeInteraction && candidateBeforeInteraction.wasChecked) continue;

            const specific = findActualCheckbox(target) || target;
            triggerDing(thisInteractionId, specific);
            return;
          }
        }
      }

      // ChildList change: SVG checkmark added to a checkbox container
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;

          const isSvg = node.tagName.toLowerCase() === "svg";
          const hasSvg = isSvg || (node.querySelector && node.querySelector("svg"));
          if (hasSvg) {
            const svgEl = isSvg ? node : (node.querySelector ? node.querySelector("svg") : node);
            const container = node.closest
              ? node.closest("[role='checkbox'], .notion-to_do-block, [data-block-id]")
              : null;
            if (!container || !isElementChecked(container)) continue;

            // Only a completion inside the row the user actually toggled may ding.
            // Hovering a task (which re-renders its controls and checkmark) must not.
            if (!belongsToCandidate(container) && !belongsToCandidate(node)) continue;
            if (candidateBeforeInteraction && candidateBeforeInteraction.wasChecked) continue;

            triggerDing(thisInteractionId, svgEl || container);
            return;
          }
        }
      }
    }
  });

  try {
    const root = document.documentElement || document.body;
    if (root) {
      observer.observe(root, {
        attributes: true,
        attributeFilter: ["aria-checked"],
        attributeOldValue: true,
        childList: true,
        subtree: true
      });
    }
  } catch (e) {}
})();
