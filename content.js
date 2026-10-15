(() => {
  "use strict";

  // Prevent multiple injections on the same page
  if (window.__NOTION_DING_INITIALIZED__) return;
  window.__NOTION_DING_INITIALIZED__ = true;

  const DING_AUDIO_URL = chrome.runtime.getURL("assets/ding.wav");
  const DEBOUNCE_INTERVAL_MS = 200;
  const USER_INTERACTION_WINDOW_MS = 1000;

  let currentVolume = 6;
  let isEnabled = true;
  let lastDingTime = 0;
  let lastUserInteractionTime = 0;
  let interactionCounter = 0;
  let lastDingedInteractionId = 0;
  let candidateBeforeInteraction = null;

  // Exponential volume mapping for natural human hearing perception
  const getVolumeLevel = (volume) => {
    if (!volume || volume <= 0) return 0;
    const clamped = Math.min(Math.max(volume, 0), 10) / 10;
    const EXP_SCALE_FACTOR = 4;
    return Math.exp(EXP_SCALE_FACTOR * clamped) / Math.exp(EXP_SCALE_FACTOR);
  };

  // Sync settings from Chrome storage
  try {
    chrome.storage.sync.get({ volume: 6, enabled: true }, (items) => {
      if (items.volume !== undefined) currentVolume = items.volume;
      if (items.enabled !== undefined) isEnabled = items.enabled;
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync") {
        if (changes.volume !== undefined) currentVolume = changes.volume.newValue;
        if (changes.enabled !== undefined) isEnabled = changes.enabled.newValue;
      }
    });
  } catch (e) {}

  function incrementCompletedCount() {
    try {
      chrome.storage.sync.get({ tasksCompleted: 0 }, (res) => {
        const updated = (res.tasksCompleted || 0) + 1;
        chrome.storage.sync.set({ tasksCompleted: updated });
      });
    } catch (e) {}
  }

  function playSound() {
    if (!isEnabled || currentVolume <= 0) return;
    try {
      const audio = new Audio(DING_AUDIO_URL);
      audio.volume = getVolumeLevel(currentVolume);
      audio.play().catch(() => {});
    } catch (e) {}
  }

  function triggerDing(forInteractionId) {
    const now = Date.now();
    if (forInteractionId && forInteractionId === lastDingedInteractionId) {
      return; // Already triggered for this user interaction
    }
    if (now - lastDingTime < DEBOUNCE_INTERVAL_MS) {
      return; // Global debounce interval
    }

    if (forInteractionId) {
      lastDingedInteractionId = forInteractionId;
    }
    lastDingTime = now;

    // 1. Play the crisp ding sound
    playSound();

    // 2. Increment user completion tally
    incrementCompletedCount();
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
      // Notion to-do block or database checkbox cell
      if (
        node.classList &&
        (node.classList.contains("notion-to_do-block") ||
         node.classList.contains("notion-collection-item"))
      ) {
        const inner = node.querySelector("input[type='checkbox'], [role='checkbox'], [aria-checked]");
        return inner || node;
      }
    }
    return null;
  }

  // Track the start of a user interaction before the DOM state toggles
  function onInteractionStart(event) {
    lastUserInteractionTime = Date.now();
    interactionCounter++;
    const thisId = interactionCounter;

    const target = findCheckboxTarget(event);
    if (target) {
      candidateBeforeInteraction = {
        id: thisId,
        element: target,
        wasChecked: isElementChecked(target),
        time: Date.now()
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
        const cb = activeEl.matches && (
          activeEl.matches("input[type='checkbox']") ||
          activeEl.matches("[role='checkbox']") ||
          activeEl.matches("[aria-checked]")
        ) ? activeEl : activeEl.querySelector("input[type='checkbox'], [role='checkbox'], [aria-checked]");

        if (cb) {
          candidateBeforeInteraction = {
            id: thisId,
            element: cb,
            wasChecked: isElementChecked(cb),
            time: Date.now()
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
        triggerDing(interactionCounter);
      }
    }
  }, { capture: true, passive: true });

  // Method 2: Click event verification
  document.addEventListener("click", (event) => {
    lastUserInteractionTime = Date.now();
    const checkbox = findCheckboxTarget(event);
    const thisInteractionId = interactionCounter;

    if (checkbox) {
      // If we previously recorded that this element was ALREADY checked, this click will uncheck it
      if (candidateBeforeInteraction && candidateBeforeInteraction.element === checkbox && candidateBeforeInteraction.wasChecked) {
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
            triggerDing(thisInteractionId);
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
            triggerDing(thisInteractionId);
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
            const container = node.closest
              ? node.closest("[role='checkbox'], .notion-to_do-block, [data-block-id]")
              : null;
            if (container && isElementChecked(container)) {
              if (candidateBeforeInteraction && candidateBeforeInteraction.element === container && candidateBeforeInteraction.wasChecked) {
                continue;
              }
              triggerDing(thisInteractionId);
              return;
            }
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
