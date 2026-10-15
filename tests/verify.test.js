const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("=========================================");
console.log("RUNNING NOTION DING VERIFICATION TESTS 🔔");
console.log("=========================================\n");

let passedTests = 0;
let totalTests = 0;

function it(description, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         ${err.message}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------
// Test Group 1: Manifest V3 Compliance & Serious Branding
// ----------------------------------------------------
console.log("Test Suite 1: Manifest V3 & Branding Validation");

const manifestPath = path.resolve(__dirname, "../manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

it("manifest.json name is 'Notion Ding' and version is 2.1.0", () => {
  assert.strictEqual(manifest.name, "Notion Ding");
  assert.strictEqual(manifest.version, "2.1.0");
});

it("manifest.json description is professional with no joke terminology", () => {
  const desc = manifest.description.toLowerCase();
  assert(desc.includes("ding") || desc.includes("sound"));
  assert(!desc.includes("poo") && !desc.includes("fart") && !desc.includes("loo") && !desc.includes("plop"),
    "Should not contain humorous toilet terms");
});

it("manifest_version is 3", () => {
  assert.strictEqual(manifest.manifest_version, 3);
});

it("storage permission is declared and unused intrusive permissions are absent", () => {
  assert(Array.isArray(manifest.permissions));
  assert(manifest.permissions.includes("storage"));
  assert(!manifest.permissions.includes("tabs"), "tabs permission is not needed and should be omitted");
});

it("content_scripts matches all modern Notion domains (notion.so, notion.com, notion.site)", () => {
  const contentScript = manifest.content_scripts[0];
  assert(contentScript, "content_scripts array should not be empty");
  assert(Array.isArray(contentScript.matches));

  const expectedPatterns = [
    "https://*.notion.so/*",
    "https://notion.so/*",
    "https://*.notion.com/*",
    "https://notion.com/*",
    "https://*.notion.site/*",
    "https://notion.site/*"
  ];

  for (const pat of expectedPatterns) {
    assert(
      contentScript.matches.includes(pat),
      `content_scripts.matches is missing expected pattern: ${pat}`
    );
  }
});

it("content_scripts references content.js with run_at document_start", () => {
  const contentScript = manifest.content_scripts[0];
  assert(contentScript.js.includes("content.js"));
  assert.strictEqual(contentScript.run_at, "document_start");
});

it("web_accessible_resources covers assets/* for modern Notion domains", () => {
  const war = manifest.web_accessible_resources[0];
  assert(war, "web_accessible_resources must be defined");
  assert(war.resources.includes("assets/*") || war.resources.includes("assets/ding.wav"));
  assert(war.matches.includes("https://*.notion.com/*"));
});

// ----------------------------------------------------
// Test Group 2: Audio Sound Library & Icons Asset Integrity
// ----------------------------------------------------
console.log("\nTest Suite 2: Asset Integrity (All 5 Sound Themes & Icons)");

const soundThemes = ["ding", "marimba", "pop", "click", "zen"];

soundThemes.forEach(theme => {
  it(`assets/${theme}.wav exists and has valid RIFF WAVE header`, () => {
    const wavPath = path.resolve(__dirname, `../assets/${theme}.wav`);
    assert(fs.existsSync(wavPath), `${theme}.wav does not exist`);
    const buffer = fs.readFileSync(wavPath);
    assert(buffer.length > 1000, `${theme}.wav is unexpectedly small`);

    const riff = buffer.toString("utf8", 0, 4);
    const wave = buffer.toString("utf8", 8, 12);
    assert.strictEqual(riff, "RIFF", "File header is not RIFF");
    assert.strictEqual(wave, "WAVE", "File format is not WAVE");
  });
});

it("icons of all standard sizes (16, 32, 48, 128) exist and are valid PNGs", () => {
  [16, 32, 48, 128].forEach(size => {
    const iconPath = path.resolve(__dirname, `../assets/ding-icon.${size}.png`);
    assert(fs.existsSync(iconPath), `Icon not found: ${iconPath}`);
    const buf = fs.readFileSync(iconPath);
    assert(buf.length > 0, `Icon file is empty: ${iconPath}`);
    assert.strictEqual(buf[0], 0x89);
    assert.strictEqual(buf[1], 0x50);
    assert.strictEqual(buf[2], 0x4E);
    assert.strictEqual(buf[3], 0x47);
  });
});

it("checkmark.svg uses fill='currentColor' for adaptive dark mode styling", () => {
  const svgPath = path.resolve(__dirname, "../assets/checkmark.svg");
  assert(fs.existsSync(svgPath), "checkmark.svg does not exist");
  const content = fs.readFileSync(svgPath, "utf8");
  assert(content.includes('fill="currentColor"'), "checkmark.svg should use fill='currentColor'");
});

// ----------------------------------------------------
// Test Group 3: Non-linear Volume & Chromatic Scale Mathematics
// ----------------------------------------------------
console.log("\nTest Suite 3: Audio Mathematics (Volume & Chromatic Scale)");

const getVolumeLevel = (volume) => {
  if (!volume || volume <= 0) return 0;
  const clamped = Math.min(Math.max(volume, 0), 10) / 10;
  const EXP_SCALE_FACTOR = 4;
  return Math.exp(EXP_SCALE_FACTOR * clamped) / Math.exp(EXP_SCALE_FACTOR);
};

it("volume 0 returns 0 (Muted) and volume 10 returns 1.0 (Maximum)", () => {
  assert.strictEqual(getVolumeLevel(0), 0);
  assert.strictEqual(getVolumeLevel(-1), 0);
  const vol10 = getVolumeLevel(10);
  assert(Math.abs(vol10 - 1.0) < 0.0001, `Expected ~1.0, got ${vol10}`);
});

it("volume scales exponentially and monotonically across levels 1 to 10", () => {
  let prev = 0;
  for (let v = 1; v <= 10; v++) {
    const current = getVolumeLevel(v);
    assert(current > prev, `Volume level ${v} should be greater than ${v - 1}`);
    prev = current;
  }
});

it("chromatic scale semitones calculate exact 2^(n/12) pitch intervals", () => {
  // 0 semitones = 1.0 (root)
  assert.strictEqual(Math.pow(2, 0 / 12), 1.0);

  // 12 semitones = 2.0 (one octave)
  assert.strictEqual(Math.pow(2, 12 / 12), 2.0);

  // 1 semitone = ~1.059463
  const semi1 = Math.pow(2, 1 / 12);
  assert(Math.abs(semi1 - 1.059463) < 0.0001);

  // Monotonic increase
  let prevPitch = 0;
  for (let s = 0; s <= 12; s++) {
    const p = Math.pow(2, s / 12);
    assert(p > prevPitch, `Semitone ${s} pitch should exceed ${s - 1}`);
    prevPitch = p;
  }
});

// ----------------------------------------------------
// Test Group 4: Robust Checkbox Detection Simulation
// ----------------------------------------------------
console.log("\nTest Suite 4: DOM Traversal & Checkbox Detection");

class MockElement {
  constructor(tagName, attributes = {}, classes = []) {
    this.tagName = tagName.toUpperCase();
    this.attributes = { ...attributes };
    this.classList = {
      contains: (cls) => classes.includes(cls),
      classes: [...classes]
    };
    this.children = [];
    this.parentElement = null;
    this.isConnected = true;
    this.type = attributes.type || null;
    this.checked = !!attributes.checked;
  }

  getAttribute(attr) {
    return this.attributes[attr] !== undefined ? this.attributes[attr] : null;
  }

  setAttribute(attr, val) {
    this.attributes[attr] = String(val);
  }

  hasAttribute(attr) {
    return this.attributes[attr] !== undefined;
  }

  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
    return child;
  }

  querySelector(selector) {
    if (selector === "input[type='checkbox']") {
      return this._findDescendant(el => el.tagName === "INPUT" && el.type === "checkbox");
    }
    if (selector === "[role='checkbox']") {
      return this._findDescendant(el => el.getAttribute("role") === "checkbox");
    }
    if (selector === "[aria-checked='true']") {
      return this._findDescendant(el => el.getAttribute("aria-checked") === "true");
    }
    if (selector.includes("svg")) {
      return this._findDescendant(el => el.tagName === "SVG");
    }
    return null;
  }

  _findDescendant(predicate) {
    for (const child of this.children) {
      if (predicate(child)) return child;
      const found = child._findDescendant(predicate);
      if (found) return found;
    }
    return null;
  }

  matches(sel) {
    if (sel === "input[type='checkbox']") return this.tagName === "INPUT" && this.type === "checkbox";
    if (sel === "[role='checkbox']") return this.getAttribute("role") === "checkbox";
    if (sel === "[aria-checked]") return this.hasAttribute("aria-checked");
    return false;
  }
}

const isElementChecked = (el) => {
  if (!el || !(el instanceof MockElement)) return false;
  if (el.tagName === "INPUT" && el.type === "checkbox") return el.checked;
  const aria = el.getAttribute("aria-checked");
  if (aria === "true") return true;
  if (aria === "false") return false;
  const childInput = el.querySelector("input[type='checkbox']");
  if (childInput && childInput.checked) return true;
  const childAria = el.querySelector("[aria-checked='true']");
  if (childAria) return true;
  const checkSvg = el.querySelector("svg");
  if (checkSvg) return true;
  return false;
};

it("isElementChecked correctly detects native checked inputs", () => {
  const inpChecked = new MockElement("input", { type: "checkbox", checked: true });
  const inpUnchecked = new MockElement("input", { type: "checkbox", checked: false });
  assert.strictEqual(isElementChecked(inpChecked), true);
  assert.strictEqual(isElementChecked(inpUnchecked), false);
});

it("isElementChecked correctly detects Notion database ARIA checkboxes", () => {
  const ariaChecked = new MockElement("div", { role: "checkbox", "aria-checked": "true" });
  const ariaUnchecked = new MockElement("div", { role: "checkbox", "aria-checked": "false" });
  assert.strictEqual(isElementChecked(ariaChecked), true);
  assert.strictEqual(isElementChecked(ariaUnchecked), false);
});

it("isElementChecked correctly detects checkmark SVGs inside to-do containers", () => {
  const container = new MockElement("div", {}, ["notion-to_do-block"]);
  assert.strictEqual(isElementChecked(container), false);
  const svg = new MockElement("svg");
  container.appendChild(svg);
  assert.strictEqual(isElementChecked(container), true);
});

it("event composedPath traversal handles Window and Document without throwing TypeError", () => {
  const fakeWindow = { name: "window" };
  const fakeDoc = { nodeType: 9 };
  const nativeCheckbox = new MockElement("input", { type: "checkbox", checked: false });
  const path = [nativeCheckbox, fakeDoc, fakeWindow];

  let found = null;
  assert.doesNotThrow(() => {
    for (const node of path) {
      if (!node || !(node instanceof MockElement)) continue;
      if (node.tagName === "INPUT" && node.type === "checkbox") {
        found = node;
        break;
      }
    }
  });
  assert.strictEqual(found, nativeCheckbox);
});

// ----------------------------------------------------
// Test Group 5: Debouncing & State Transition
// ----------------------------------------------------
console.log("\nTest Suite 5: Debounce & State Transitions");

it("debouncer prevents duplicate dings within 200ms", () => {
  let dingPlayCount = 0;
  let lastDing = 0;
  const DEBOUNCE_MS = 200;

  const triggerDing = (fakeNow) => {
    if (fakeNow - lastDing < DEBOUNCE_MS) return;
    lastDing = fakeNow;
    dingPlayCount++;
  };

  triggerDing(1000);
  triggerDing(1050);
  triggerDing(1150);
  assert.strictEqual(dingPlayCount, 1, "Expected exactly 1 ding within debounce window");

  triggerDing(1250);
  assert.strictEqual(dingPlayCount, 2, "Expected 2nd ding after debounce window passed");
});

it("does not play ding when unchecking an already checked item", () => {
  let dingTriggered = false;

  const simulateClick = (candidateBefore, isCheckedAfter) => {
    if (candidateBefore && candidateBefore.wasChecked) {
      return;
    }
    if (isCheckedAfter) {
      dingTriggered = true;
    }
  };

  // Unchecking
  simulateClick({ wasChecked: true }, false);
  assert.strictEqual(dingTriggered, false, "Should not ding on uncheck");

  // Checking
  simulateClick({ wasChecked: false }, true);
  assert.strictEqual(dingTriggered, true, "Should ding when checking");
});

// ----------------------------------------------------
// Test Group 6: Popup Controls & Dark Mode Contrast Styling
// ----------------------------------------------------
console.log("\nTest Suite 6: Popup Controls & Dark Mode CSS Rules");

it("popup.html has sound themes, animation picker, streaks, and pitch controls", () => {
  const popupHtml = fs.readFileSync(path.resolve(__dirname, "../popup.html"), "utf8");
  assert(popupHtml.includes('id="sound-theme-select"'), "Sound theme selector missing");
  assert(popupHtml.includes('id="anim-style-select"'), "Animation style selector missing");
  assert(popupHtml.includes('id="pitch-toggle"'), "Chromatic pitch toggle missing");
  assert(popupHtml.includes('id="tasks-counter"'), "Tasks counter missing");
  assert(popupHtml.includes('id="today-counter"'), "Today counter missing");
  assert(popupHtml.includes('id="streak-counter"'), "Streak counter missing");
  assert(popupHtml.includes('id="volume-slider"'), "Volume slider missing");
});

it("popup.html and popup.js use proper SVG icons and contain no decorative emojis", () => {
  const popupHtml = fs.readFileSync(path.resolve(__dirname, "../popup.html"), "utf8");
  const popupJs = fs.readFileSync(path.resolve(__dirname, "../popup.js"), "utf8");
  const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]/;
  assert(!emojiRegex.test(popupHtml), "popup.html should not contain emojis; use clean SVG icons instead");
  assert(!emojiRegex.test(popupJs), "popup.js should not contain emojis");
  assert(popupHtml.includes("<svg class=\"streak-icon\""), "popup.html must use proper SVG streak icon");
  assert(popupHtml.includes("<span class=\"btn-icon\">"), "popup.html must have btn-icon span");
});

it("popup.css contains high-contrast dark mode filters for icons and badges", () => {
  const popupCss = fs.readFileSync(path.resolve(__dirname, "../popup.css"), "utf8");
  assert(popupCss.includes("@media (prefers-color-scheme: dark)"), "Dark mode media query missing");
  assert(popupCss.includes(".icon-btn img"), "Icon button image selector missing");
  assert(popupCss.includes("filter: invert"), "Inversion filter missing for dark mode contrast");
  assert(popupCss.includes("--slider-track"), "Slider track variable missing");
});

it("content.js contains Web Audio API pre-caching, streak tracking, and animation spawners", () => {
  const contentJs = fs.readFileSync(path.resolve(__dirname, "../content.js"), "utf8");
  assert(contentJs.includes("getAudioContext"), "Web Audio context missing");
  assert(contentJs.includes("decodeAudioData"), "Buffer pre-caching missing");
  assert(contentJs.includes("Math.pow(2, semitones / 12)"), "Chromatic scale math missing");
  assert(contentJs.includes("spawnRipple"), "Ripple spawner missing");
  assert(contentJs.includes("spawnMicroConfetti"), "Confetti spawner missing");
  assert(contentJs.includes("updateCompletionStats"), "Stats update missing");
  assert(contentJs.includes("findActualCheckbox"), "findActualCheckbox function missing");
});

it("animation origin logic pins to the checkbox element rather than the center of the full-width row", () => {
  const contentJs = fs.readFileSync(path.resolve(__dirname, "../content.js"), "utf8");
  assert(contentJs.includes("lastInteractionCoords"), "Should track interaction coordinates for pinpoint accuracy");
  assert(contentJs.includes("rect.width <= 50"), "Should check for small checkbox dimensions");
  assert(contentJs.includes("rect.width > 60"), "Should detect wide row blocks and offset to the left");
});

// ----------------------------------------------------
// Test Group 7: Interaction Scoping & Animation Anchoring
// ----------------------------------------------------
console.log("\nTest Suite 7: Interaction Scoping & Animation Anchoring");

const blockIdOf = (node) => {
  let el = node;
  while (el) {
    const id = el.getAttribute ? el.getAttribute("data-block-id") : null;
    if (id) return id;
    el = el.parentElement;
  }
  return null;
};

const belongsToCandidate = (candidate, node) => {
  if (!candidate || !node) return false;
  const element = candidate.element;
  if (element) {
    if (node === element) return true;
    if (element.children && element.children.includes(node)) return true;
    if (node.children && node.children.includes(element)) return true;
  }
  const nodeBlockId = blockIdOf(node);
  return !!(candidate.blockId && nodeBlockId && candidate.blockId === nodeBlockId);
};

// Builds: row > checkbox > (optional) checkmark svg
const buildRow = (blockId, checked) => {
  const row = new MockElement("div", { "data-block-id": blockId });
  const checkbox = new MockElement("div", { role: "checkbox", "aria-checked": checked ? "true" : "false" });
  row.appendChild(checkbox);
  if (checked) checkbox.appendChild(new MockElement("svg"));
  return { row, checkbox };
};

it("hovering or re-rendering another to-do row cannot fire a ding", () => {
  const a = buildRow("row-a", false);
  const b = buildRow("row-b", true); // an unrelated, already-finished task above

  // The user just clicked the checkbox in row A (unchecked -> checked)
  const candidate = { id: 1, element: a.checkbox, wasChecked: false, blockId: "row-a" };

  assert.strictEqual(belongsToCandidate(candidate, b.checkbox), false,
    "A mutation inside row B (e.g. hover controls appearing) must be ignored");
  assert.strictEqual(belongsToCandidate(candidate, b.row), false,
    "Row B's whole subtree must be ignored");
  assert.strictEqual(belongsToCandidate(candidate, a.checkbox), true,
    "Row A's own toggle must still be honoured");
  assert.strictEqual(belongsToCandidate(candidate, a.row), true,
    "Row A's block-level mutation must still be honoured");
});

it("lazily rendered already-ticked tasks (no checkbox interaction) cannot fire a ding", () => {
  const c = buildRow("row-c", true);
  assert.strictEqual(belongsToCandidate(null, c.checkbox), false,
    "With no recorded checkbox interaction the observer must stay silent");
  assert.strictEqual(belongsToCandidate(null, c.row), false,
    "Page load / scroll-in rendering must not be mistaken for a completion");
});

it("un-checking a task is never treated as a completion", () => {
  const a = buildRow("row-a", true);
  const candidate = { id: 2, element: a.checkbox, wasChecked: true, blockId: "row-a" };

  // Mirrors the guard order used by the click handler and the MutationObserver
  const shouldDing = (cand, node) =>
    belongsToCandidate(cand, node) && !(cand && cand.wasChecked);

  assert.strictEqual(shouldDing(candidate, a.checkbox), false,
    "Unticking an already checked task must stay silent");
});

it("animation origin prefers the checkbox anchor captured before the re-render", () => {
  // Anchor measured on the checkbox at pointerdown; the raw pointer ended on the row text.
  const candidate = { id: 7, anchor: { x: 86, y: 44 }, element: null };
  const staleClickCoords = { x: 372, y: 88 };

  const getAnimationPoint = (forInteractionId) => {
    if (candidate && candidate.anchor && (!forInteractionId || candidate.id === forInteractionId)) {
      return candidate.anchor;
    }
    return staleClickCoords;
  };

  assert.deepStrictEqual(getAnimationPoint(7), { x: 86, y: 44 },
    "Should anchor to the checkbox, not the pointer position");
  assert.deepStrictEqual(getAnimationPoint(9), staleClickCoords,
    "Unrelated interactions still fall back gracefully");
});

it("content.js scopes MutationObserver triggers to the interacted row and records a pre-render anchor", () => {
  const contentJs = fs.readFileSync(path.resolve(__dirname, "../content.js"), "utf8");
  assert(contentJs.includes("function belongsToCandidate"), "Observer must be scoped to the interacted row");
  assert(contentJs.includes("function getBlockId"), "Rows must be compared via a stable data-block-id");
  assert(contentJs.includes("function getCheckboxCenter"), "Checkbox centre helper missing");
  assert(contentJs.includes("anchor: getCheckboxCenter(target)"), "Anchor must be captured at pointer time");
  assert(contentJs.includes("function getAnimationPoint"), "Animation origin resolver missing");
});

// ----------------------------------------------------
// Test Group 8: Releases Section & CRX / ZIP Distribution Packages
// ----------------------------------------------------
console.log("\nTest Suite 8: Releases Section & Distribution Verification");

it("README.md contains the Releases section and links to notion-ding.crx", () => {
  const readme = fs.readFileSync(path.resolve(__dirname, "../README.md"), "utf8");
  assert(readme.includes("## 📥 Releases & Downloads"), "README must contain the Releases & Downloads section");
  assert(readme.includes("releases/notion-ding.crx"), "README must link to releases/notion-ding.crx");
  assert(readme.includes("releases/notion-ding.zip"), "README must link to releases/notion-ding.zip");
});

it("releases/notion-ding.crx exists and has valid CRX3 header (Cr24)", () => {
  const crxPath = path.resolve(__dirname, "../releases/notion-ding.crx");
  assert(fs.existsSync(crxPath), "releases/notion-ding.crx must exist");
  const buf = fs.readFileSync(crxPath);
  assert(buf.length > 50000, "crx file is unexpectedly small");
  const magic = buf.toString("utf8", 0, 4);
  assert.strictEqual(magic, "Cr24", "CRX magic header must be Cr24");
});

it("releases/notion-ding.zip exists and has valid ZIP header (PK..)", () => {
  const zipPath = path.resolve(__dirname, "../releases/notion-ding.zip");
  assert(fs.existsSync(zipPath), "releases/notion-ding.zip must exist");
  const buf = fs.readFileSync(zipPath);
  assert(buf.length > 50000, "zip file is unexpectedly small");
  assert.strictEqual(buf[0], 0x50, "ZIP magic byte 0 should be P (0x50)");
  assert.strictEqual(buf[1], 0x4B, "ZIP magic byte 1 should be K (0x4B)");
});

console.log("\n=========================================");
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed.`);
console.log("=========================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
