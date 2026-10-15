# Notion Ding 🔔

> **A satisfying sound reward for your Notion to-do lists.**  
> A lightweight Chrome extension that plays a crisp "ding" sound effect every time you complete a task or check a checkbox in Notion.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](tests/verify.test.js)

---

## 📥 Releases & Downloads

Ready-to-use production packages are maintained in the [`releases/`](releases/) directory:

| Package | Format | Description | Direct Download |
| :--- | :--- | :--- | :--- |
| **Notion Ding CRX** | `.crx` | Signed Chrome Extension package (instant drag & drop install) | [📥 **`releases/notion-ding.crx`**](releases/notion-ding.crx) |
| **Notion Ding ZIP** | `.zip` | Clean production archive for one-click extraction or Chrome Web Store | [📦 **`releases/notion-ding.zip`**](releases/notion-ding.zip) |
| **Staged Folder** | Directory | Staged production files ready for "Load unpacked" | [📂 **`dist/notion-ding/`**](dist/notion-ding/) |

---

## 🚀 Installation Guide

You can install Notion Ding on Google Chrome, Microsoft Edge, Brave, Arc, or any Chromium-based browser using either method below:

### Option 1: Install using the `.crx` File (Fastest — Drag & Drop)
1. Open Google Chrome (or Edge/Brave) and go to `chrome://extensions` in the address bar.
2. Toggle **Developer mode** to **ON** (switch in the top-right corner).
3. Drag and drop [`releases/notion-ding.crx`](releases/notion-ding.crx) directly into the `chrome://extensions` window.
4. When Chrome prompts *"Add Notion Ding?"*, click **Add extension**.
5. Pin the Notion Ding icon to your browser toolbar!

---

### Option 2: Install using the Unpacked Folder / ZIP
1. Open Google Chrome and go to `chrome://extensions`.
2. Toggle **Developer mode** to **ON** (top-right corner).
3. Click the **Load unpacked** button (top-left toolbar).
4. Select this project's root folder or the staged [`dist/notion-ding`](dist/notion-ding) directory.
5. The extension will immediately load and activate on all Notion pages.

---

## ✨ Features

- 🔔 **Satisfying Audio Reward**: Plays a crisp, beloved chime whenever you complete a task.
- 🎯 **Accurate State Detection**: Only plays when checking a task from **unchecked to checked** (never when unchecking).
- 🌐 **Full Modern Notion Coverage**: Works seamlessly across `notion.com`, `notion.so`, and published `notion.site` workspaces.
- 📋 **Supports All Notion Task Formats**:
  - Standard to-do blocks (`/to-do` or `[]`)
  - Notion Database checkboxes (Table, Board / Kanban, List, Gallery, Timeline)
- ⌨️ **Keyboard Accessibility**: Triggers on mouse clicks as well as keyboard shortcuts (`Space`, `Enter`, `Cmd+Enter`, `Ctrl+Enter`).
- 📊 **Tasks Completed Counter**: Keeps a live tally of how many tasks you've checked off across workspaces.
- 🎛️ **Audio & Volume Controls**:
  - Non-linear exponential volume scaling across 10 levels for natural human auditory perception.
  - Quick **Enable/Disable** master toggle switch.
  - **Test Sound 🔔** button to preview audio at the current volume level.
- 🌓 **Notion-Native Design**:
  - Beautiful, minimalist UI crafted to blend directly with Notion's interface.
  - Automatic Light & Dark mode support (`prefers-color-scheme`).
  - 100% private: Zero tracking, zero telemetry, no external network requests.

---

## 🔍 Why the Original "Notion Ding" Stopped Working

If you used the original `lucasdellabella/notion-ding` extension, it broke due to several fundamental changes in Notion and Chrome:

1. **Notion's Domain Migration**: Notion transitioned from `notion.so` to `notion.com` and `notion.site`. The original extension only matched `*.notion.so`.
2. **DOM Architecture Overhaul**: Notion transitioned to StyleX CSS modules and ARIA attributes (`[role="checkbox"]`, `aria-checked`), removing legacy `.check` CSS classes and native `<input>` elements in many views.
3. **Unhandled DOM Exception**: The original script threw `TypeError: element.matches is not a function` because `composedPath()` contains non-element nodes (`Window`, `Document`).
4. **Manifest V3 Web Accessible Resources**: Modern Chrome extensions strictly enforce explicit resource matching in Manifest V3.

**Notion Ding 2.0** resolves all of these issues with a multi-layered event engine, React reconciliation handling, and modern Manifest V3 compliance.

---

## 🧪 Automated Testing

Run the automated test suite to verify the extension:
```bash
npm test
```

The test suite validates:
- Manifest V3 compliance, permissions, and domain matching patterns.
- Binary asset integrity (RIFF/WAVE audio header, trimmed silence, PNG icon magic bytes).
- Non-linear exponential volume scaling mathematics across levels 0–10.
- Checkbox detection across native inputs, ARIA elements, and SVG checkmarks.
- Safe `composedPath()` traversal without throwing unhandled TypeErrors.
- Debouncing and state transition logic (unchecked -> checked).
- Release package integrity (CRX3 and ZIP archive headers).

---

## 📦 Building Fresh Release Packages

To recompile fresh `.crx` and `.zip` packages at any time:
```bash
npm run package
```
This updates both [`releases/`](releases/) and [`dist/`](dist/).
