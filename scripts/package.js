const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const RELEASES_DIR = path.join(ROOT_DIR, "releases");
const STAGING_DIR = path.join(DIST_DIR, "notion-ding-next");
const ZIP_OUTPUT = path.join(DIST_DIR, "notion-ding-next.zip");
const CRX_OUTPUT = path.join(DIST_DIR, "notion-ding-next.crx");
// The .crx signing key is kept OUTSIDE dist/ (which is wiped on every build).
// A Chrome extension's ID is derived from its signing key, so reusing one key keeps the
// ID stable: existing .crx installs update in place and keep their stored settings and
// streaks. A rotating key would install as a separate duplicate extension instead.
const PERSISTED_KEY_FILE = path.join(ROOT_DIR, "notion-ding-next.pem");
const GENERATED_KEY_FILE = path.join(DIST_DIR, "notion-ding-next.pem");

console.log("==============================================");
console.log("PACKAGING NOTION DING NEXT EXTENSION (.crx & .zip)");
console.log("==============================================\n");

// 1. Rescue the signing key before dist/ is wiped, so a rebuild never rotates the key
if (fs.existsSync(GENERATED_KEY_FILE) && !fs.existsSync(PERSISTED_KEY_FILE)) {
  fs.copyFileSync(GENERATED_KEY_FILE, PERSISTED_KEY_FILE);
  console.log("  [OK] Rescued extension signing key from dist/ into notion-ding-next.pem");
}

// 2. Clean & recreate staging and release directories
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(STAGING_DIR, { recursive: true });

if (!fs.existsSync(RELEASES_DIR)) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
}

// 3. Files to copy into staging
const filesToCopy = [
  "manifest.json",
  "background.js",
  "content.js",
  "popup.html",
  "popup.css",
  "popup.js",
  "README.md"
];

for (const file of filesToCopy) {
  const src = path.join(ROOT_DIR, file);
  const dest = path.join(STAGING_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// Copy assets directory
const assetsSrc = path.join(ROOT_DIR, "assets");
const assetsDest = path.join(STAGING_DIR, "assets");
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
}

console.log("  [OK] Staged production extension files into dist/notion-ding-next");

// 4. Create .zip file using PowerShell Compress-Archive
console.log("  [..] Creating notion-ding-next.zip...");
try {
  execSync(
    `powershell -Command "Compress-Archive -Path '${STAGING_DIR}\\*' -DestinationPath '${ZIP_OUTPUT}' -Force"`,
    { stdio: "inherit" }
  );
  const zipStats = fs.statSync(ZIP_OUTPUT);
  console.log(`  [OK] Created notion-ding-next.zip (${(zipStats.size / 1024).toFixed(1)} KB)`);

  // Copy to releases directory
  fs.copyFileSync(ZIP_OUTPUT, path.join(RELEASES_DIR, "notion-ding-next.zip"));
  console.log("  [OK] Copied notion-ding-next.zip to releases/ directory");
} catch (e) {
  console.error("  [FAIL] Failed to create .zip archive:", e.message);
  process.exit(1);
}

// 5. Create .crx file using Chromium/Edge pack-extension if available
console.log("  [..] Compiling official .crx Chrome Extension package...");
const tempUserDataDir = path.join(process.env.TEMP || "C:\\temp", "chromium_pack_temp_ding");
const edgeExe = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

if (fs.existsSync(edgeExe)) {
  try {
    let packCmd = `"${edgeExe}" --pack-extension="${STAGING_DIR}" --user-data-dir="${tempUserDataDir}"`;
    if (fs.existsSync(PERSISTED_KEY_FILE)) {
      packCmd += ` --pack-extension-key="${PERSISTED_KEY_FILE}"`;
      console.log("  [OK] Signing with existing notion-ding-next.pem (extension ID unchanged)");
    } else {
      console.log("  [INFO] No signing key found; minting a new one (extension ID will change)");
    }

    execSync(packCmd, { stdio: "ignore" });

    if (fs.existsSync(CRX_OUTPUT)) {
      const crxStats = fs.statSync(CRX_OUTPUT);
      console.log(`  [OK] Created official notion-ding-next.crx (${(crxStats.size / 1024).toFixed(1)} KB)`);

      // Copy to releases directory
      fs.copyFileSync(CRX_OUTPUT, path.join(RELEASES_DIR, "notion-ding-next.crx"));
      console.log("  [OK] Copied notion-ding-next.crx to releases/ directory");
    } else {
      console.warn("  [WARN] .crx file was not generated at expected path.");
    }

    // A freshly minted key must be stored outside dist/ or the next build would rotate it
    if (fs.existsSync(GENERATED_KEY_FILE)) {
      fs.copyFileSync(GENERATED_KEY_FILE, PERSISTED_KEY_FILE);
      console.log("  [OK] Minted new signing key and stored it as notion-ding-next.pem - back this file up!");
    }
  } catch (err) {
    console.warn("  [WARN] Chromium pack-extension command failed:", err.message);
  }
} else {
  console.warn("  [INFO] Chromium binary not found; .zip created successfully.");
}

console.log("\n=========================================");
console.log("PACKAGING COMPLETE! 🔔📦");
console.log("=========================================\n");
