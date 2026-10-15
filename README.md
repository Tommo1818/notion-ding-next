# Notion Ding

> **A satisfying sound reward for your Notion to-do lists.**  
> A lightweight Chrome extension that plays a crisp "ding" sound effect every time you complete a task or check a checkbox in Notion.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](tests/verify.test.js)

---

## Releases & Downloads

Ready-to-use production packages are maintained in the [`releases/`](releases/) directory:

| Package | Format | Description | Direct Download |
| :--- | :--- | :--- | :--- |
| **Notion Ding CRX** | `.crx` | Signed Chrome Extension package (instant drag & drop install) | [**`releases/notion-ding.crx`**](releases/notion-ding.crx) |
| **Notion Ding ZIP** | `.zip` | Clean production archive for one-click extraction or Chrome Web Store | [**`releases/notion-ding.zip`**](releases/notion-ding.zip) |
| **Staged Folder** | Directory | Staged production files ready for "Load unpacked" | [**`dist/notion-ding/`**](dist/notion-ding/) |

Versioned, documented releases are published on the [GitHub Releases page](https://github.com/Tommo1818/notion-ding/releases) (current: **v2.2.0**).

---

## Installation Guide

You can install Notion Ding on Google Chrome, Microsoft Edge, Brave, Arc, or any Chromium-based browser using either method below:

### Option 1: Load Unpacked (Recommended & Fastest)
1. Open Google Chrome and go to `chrome://extensions` in the address bar.
2. Toggle **Developer mode** to **ON** (top-right corner).
3. Click the **Load unpacked** button (top-left toolbar).
4. Select this project's folder (or [`dist/notion-ding`](dist/notion-ding)).
5. The extension will immediately load and activate on all Notion pages!

---

### Option 2: Install using the `.crx` File (Drag & Drop)
1. Open Google Chrome and go to `chrome://extensions` in the address bar.
2. Toggle **Developer mode** to **ON** (switch in the top-right corner).
3. Drag and drop [`releases/notion-ding.crx`](releases/notion-ding.crx) directly from your file manager into the `chrome://extensions` window.
4. When Chrome prompts *"Add Notion Ding?"*, click **Add extension**.

---

## Features

### Sound Themes & Library
Choose from 5 clean, distinct audio rewards in the popup:
- **Classic Ding**: The original satisfying bell chime.
- **Marimba Chime**: Warm, organic acoustic wooden chime.
- **Subtle Pop**: Crisp, minimal iOS-style interface pop.
- **Mechanical Switch**: Tactile click inspired by mechanical keyboard switches.
- **Zen Singing Bowl**: Calming, resonant meditation bell.

### Chromatic Scale Pitch Modulation (Combo Tasks)
Completing tasks in rapid succession within 5 seconds steps the pitch up by **+1 semitone** ($2^{n/12}$) on a musical chromatic scale across a full octave (12 semitones). Checking off checklists feels like playing a melodic victory tune! (Can be toggled on/off in settings).

### Completion Animations (Ripple & Micro Confetti)
Celebrate completing tasks directly on your Notion page:
- **Subtle Ripple**: A sleek, translucent expanding ring centered directly on the checkbox.
- **Micro Confetti**: A minimal, elegant burst of 12 colorful particles that gently drift and disperse.
- **Customizable**: Choose between *Both*, *Ripple Only*, *Confetti Only*, or *Audio Only* in the popup settings.

### Daily Streaks & Productivity Statistics
- **All-Time Total**: Tracks every task you've completed.
- **Today's Count**: Keeps count of tasks completed today.
- **Daily Streak**: Automatically counts consecutive days of productivity.
- **Reset Option**: Clear stats at any time with one click.

### Zero-Latency Web Audio API
Pre-caches decoded audio buffers into memory using the browser's Web Audio API (`AudioContext`), ensuring zero-latency, instantaneous audio feedback with exponential auditory volume scaling.

### High-Contrast Notion-Native Theme
- Automatically adapts to your system/Notion theme.
- **High-contrast Dark Mode**: Custom styled SVG icons, slider tracks, badges, and cards engineered for crystal-clear readability against dark backgrounds.

---

## Why the Original "Notion Ding" Stopped Working

If you used the original `lucasdellabella/notion-ding` extension, it broke due to:
1. **Notion's Domain Migration**: Transition from `notion.so` to `notion.com` and `notion.site`.
2. **DOM Architecture Overhaul**: Migration to StyleX CSS modules and ARIA attributes (`[role="checkbox"]`, `aria-checked`), removing legacy `.check` CSS classes and native `<input>` elements in many views.
3. **Unhandled DOM Exception**: The original script threw `TypeError: element.matches is not a function` during `composedPath()` traversal.
4. **Manifest V3 Web Accessible Resources**: Modern Chrome extensions strictly enforce explicit resource matching in Manifest V3.

**Notion Ding 2.2** resolves all of these issues with a multi-layered event engine, React reconciliation handling, and modern Manifest V3 compliance.

---

## Automated Testing

Run the automated test suite to verify the extension:
```bash
npm test
```

The test suite validates:
- Manifest V3 compliance, permissions, and domain matching patterns.
- Binary asset integrity (RIFF/WAVE headers across all sound themes and PNG icons).
- Non-linear exponential volume scaling mathematics across levels 0–10.
- Chromatic scale pitch ratios ($2^{n/12}$).
- Checkbox detection across native inputs, ARIA elements, and SVG checkmarks.
- Safe `composedPath()` traversal without throwing unhandled TypeErrors.
- Debouncing and state transition logic (unchecked -> checked).
- Interaction scoping: hover controls, lazy rendering, and re-renders of other rows never fire a false ding.
- Animation anchoring to the checkbox centre measured before React re-renders the row.
- Release package integrity (CRX3 and ZIP archive headers).

---

## Building Fresh Release Packages

To recompile fresh `.crx` and `.zip` packages at any time:
```bash
npm run package
```
This updates both [`releases/`](releases/) and [`dist/`](dist/).
