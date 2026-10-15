const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const RELEASES_DIR = path.join(ROOT_DIR, "releases");
const STAGING_DIR = path.join(DIST_DIR, "notion-ding");
const ZIP_OUTPUT = path.join(DIST_DIR, "notion-ding.zip");
const CRX_OUTPUT = path.join(DIST_DIR, "notion-ding.crx");
const KEY_FILE = path.join(DIST_DIR, "notion-ding.pem");

console.log("=========================================");
console.log("PACKAGING NOTION DING EXTENSION (.crx & .zip)");
console.log("=========================================\n");

// 1. Clean & recreate staging and release directories
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(STAGING_DIR, { recursive: true });

if (!fs.existsSync(RELEASES_DIR)) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
}

// 2. Files to copy into staging
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

console.log("  [OK] Staged production extension files into dist/notion-ding");

// 3. Create .zip file using PowerShell Compress-Archive
console.log("  [..] Creating notion-ding.zip...");
try {
  execSync(
    `powershell -Command "Compress-Archive -Path '${STAGING_DIR}\\*' -DestinationPath '${ZIP_OUTPUT}' -Force"`,
    { stdio: "inherit" }
  );
  const zipStats = fs.statSync(ZIP_OUTPUT);
  console.log(`  [OK] Created notion-ding.zip (${(zipStats.size / 1024).toFixed(1)} KB)`);

  // Copy to releases directory
  fs.copyFileSync(ZIP_OUTPUT, path.join(RELEASES_DIR, "notion-ding.zip"));
  console.log("  [OK] Copied notion-ding.zip to releases/ directory");
} catch (e) {
  console.error("  [FAIL] Failed to create .zip archive:", e.message);
  process.exit(1);
}

// 4. Create .crx file using Chromium/Edge pack-extension if available
console.log("  [..] Compiling official .crx Chrome Extension package...");
const tempUserDataDir = path.join(process.env.TEMP || "C:\\temp", "chromium_pack_temp_ding");
const edgeExe = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

if (fs.existsSync(edgeExe)) {
  try {
    const existingKey = path.join(ROOT_DIR, "notion-ding.pem");
    let packCmd = `"${edgeExe}" --pack-extension="${STAGING_DIR}" --user-data-dir="${tempUserDataDir}"`;
    if (fs.existsSync(existingKey)) {
      packCmd += ` --pack-extension-key="${existingKey}"`;
    }

    execSync(packCmd, { stdio: "ignore" });

    const generatedCrx = path.join(DIST_DIR, "notion-ding.crx");
    const generatedPem = path.join(DIST_DIR, "notion-ding.pem");

    if (fs.existsSync(generatedCrx)) {
      const crxStats = fs.statSync(generatedCrx);
      console.log(`  [OK] Created official notion-ding.crx (${(crxStats.size / 1024).toFixed(1)} KB)`);

      // Copy to releases directory
      fs.copyFileSync(generatedCrx, path.join(RELEASES_DIR, "notion-ding.crx"));
      console.log("  [OK] Copied notion-ding.crx to releases/ directory");
    } else {
      console.warn("  [WARN] .crx file was not generated at expected path.");
    }

    if (fs.existsSync(generatedPem)) {
      console.log("  [OK] Generated extension private key (notion-ding.pem)");
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
