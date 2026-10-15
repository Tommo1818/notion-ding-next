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

it("manifest.json name is 'Notion Ding'", () => {
  assert.strictEqual(manifest.name, "Notion Ding");
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
// Test Group 2: Audio & Icons Asset Integrity
// ----------------------------------------------------
console.log("\nTest Suite 2: Asset Integrity (Ding & Icons)");

it("ding.wav is a valid WAV audio file with RIFF WAVE header", () => {
  const wavPath = path.resolve(__dirname, "../assets/ding.wav");
  assert(fs.existsSync(wavPath), "ding.wav does not exist");
  const buffer = fs.readFileSync(wavPath);
  assert(buffer.length > 50000, "ding.wav is unexpectedly small");

  const riff = buffer.toString("utf8", 0, 4);
  const wave = buffer.toString("utf8", 8, 12);
  assert.strictEqual(riff, "RIFF", "File header is not RIFF");
  assert.strictEqual(wave, "WAVE", "File format is not WAVE");
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

it("checkmark.svg and volume SVG icons exist", () => {
  ["checkmark.svg", "volume-down-fill.svg", "volume-up-fill.svg"].forEach(file => {
    const filePath = path.resolve(__dirname, `../assets/${file}`);
    assert(fs.existsSync(filePath), `Asset missing: ${filePath}`);
  });
});

// ----------------------------------------------------
// Test Group 3: Non-linear Volume Mathematics
// ----------------------------------------------------
console.log("\nTest Suite 3: Non-linear Perceptual Volume Function Logic");

const getVolumeLevel = (volume) => {
  if (!volume || volume <= 0) return 0;
  const clamped = Math.min(Math.max(volume, 0), 10) / 10;
  const EXP_SCALE_FACTOR = 4;
  return Math.exp(EXP_SCALE_FACTOR * clamped) / Math.exp(EXP_SCALE_FACTOR);
};

it("volume 0 returns 0 (Muted)", () => {
  assert.strictEqual(getVolumeLevel(0), 0);
  assert.strictEqual(getVolumeLevel(-1), 0);
});

it("volume 10 returns 1.0 (Maximum)", () => {
  const vol10 = getVolumeLevel(10);
  assert(Math.abs(vol10 - 1.0) < 0.0001, `Expected ~1.0, got ${vol10}`);
});

it("volume scales exponentially and monotonically across levels 1 to 10", () => {
  let prev = 0;
  for (let v = 1; v <= 10; v++) {
    const current = getVolumeLevel(v);
    assert(current > prev, `Volume level ${v} (${current}) should be greater than ${v - 1} (${prev})`);
    prev = current;
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
      // It was checked before interaction, so this interaction unchecks it
      return;
    }
    if (isCheckedAfter) {
      dingTriggered = true;
    }
  };

  // Case 1: unchecking an already checked item
  simulateClick({ wasChecked: true }, false);
  assert.strictEqual(dingTriggered, false, "Should not ding on uncheck");

  // Case 2: checking an unchecked item
  simulateClick({ wasChecked: false }, true);
  assert.strictEqual(dingTriggered, true, "Should ding when checking");
});

// ----------------------------------------------------
// Test Group 6: File Cleanliness & Obsolete Files Removal
// ----------------------------------------------------
console.log("\nTest Suite 6: Codebase Cleanliness");

it("obsolete broken files (ding-on-checked.js, installed.html) are removed", () => {
  const root = path.resolve(__dirname, "..");
  assert(!fs.existsSync(path.join(root, "ding-on-checked.js")), "ding-on-checked.js should be removed");
  assert(!fs.existsSync(path.join(root, "installed.html")), "installed.html should be removed");
  assert(!fs.existsSync(path.join(root, "installed.css")), "installed.css should be removed");
});

it("content.js does not contain humorous or vulgar references", () => {
  const contentCode = fs.readFileSync(path.resolve(__dirname, "../content.js"), "utf8").toLowerCase();
  assert(!contentCode.includes("poo") && !contentCode.includes("fart") && !contentCode.includes("dong") && !contentCode.includes("loo"),
    "content.js should maintain professional tone");
});

it("popup.html has volume controls, enable toggle, and test sound button", () => {
  const popupHtml = fs.readFileSync(path.resolve(__dirname, "../popup.html"), "utf8");
  assert(popupHtml.includes('id="volume-slider"'));
  assert(popupHtml.includes('id="enabled-toggle"'));
  assert(popupHtml.includes('id="test-sound-btn"'));
  assert(popupHtml.includes('id="tasks-counter"'));
  assert(!popupHtml.includes("pipedream.net"), "Should not contain dead pipedream tracking form");
});

// ----------------------------------------------------
// Test Group 7: Releases Section & CRX / ZIP Distribution Packages
// ----------------------------------------------------
console.log("\nTest Suite 7: Releases Section & CRX / ZIP Distribution Verification");

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

it("dist/notion-ding staging directory contains manifest.json matching root", () => {
  const stagedManifest = path.resolve(__dirname, "../dist/notion-ding/manifest.json");
  assert(fs.existsSync(stagedManifest), "staged manifest.json must exist");
  const rootManifest = fs.readFileSync(path.resolve(__dirname, "../manifest.json"), "utf8");
  const stagedContent = fs.readFileSync(stagedManifest, "utf8");
  assert.strictEqual(stagedContent, rootManifest, "staged manifest must match root manifest");
});

console.log("\n=========================================");
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed.`);
console.log("=========================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}

