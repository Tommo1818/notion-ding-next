# Notion Ding Next

**A working, maintained version of "Notion Ding" — the browser extension that plays a ding when you tick a task off in Notion — rebuilt for the Notion of today, with a pile of new features on top.**

The original (`lucasdellabella/notion-ding`) described itself as *"Goes ding when you check a notion checkbox. That's it."* Then it stopped working: Notion moved to new domains and rewrote its interface, and the extension was never updated. It has been broken and unmaintained ever since, and is no longer available on the Chrome Web Store.

**Notion Ding Next picks up where it left off.** Same idea, working again — and, unlike the original, it's configurable: five sounds, volume control, completion animations, combo pitch, and productivity stats.

> **Almost all of this project was written by large language models** — the code, tests, build scripts, sound synthesis and documentation. A human directs and reviews it, but the writing is done by LLMs. See [How this was built](#how-this-was-built) below.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](tests/verify.test.js)

---

## What's different from the original

| | Original Notion Ding | Notion Ding Next |
| :--- | :--- | :--- |
| **Status** | Broken and abandoned. Also no longer on the Chrome Web Store. | Maintained, currently **v2.3.0** |
| **Domains** | Only ran on `notion.so` — a domain Notion has moved away from | Works on `notion.com`, `notion.site` and `notion.so` |
| **Today's Notion interface** | Not supported. Its complete-detection targeted markup Notion no longer renders, and it threw an error while handling clicks | Rewritten detection that handles Notion's current markup, ARIA checkboxes and React re-renders |
| **Sound** | One ding, no options | 5 sound themes, 0–10 volume, optional combo pitch that climbs a musical scale |
| **Completion animations** | None | A ripple on the checkbox, or micro confetti, or both |
| **Statistics** | None | All-time total, today's count, and a daily streak |
| **Appearance** | — | Adapts to Notion's light and dark themes, with a high-contrast popup |
| **Settings** | "That's it" — nothing to configure | A settings popup for sound, volume, animations, pitch and stats |

If you're here because the old extension stopped working, jump to [Why the original stopped working](#why-the-original-notion-ding-stopped-working). If you just want it installed, start at [Install Notion Ding Next](#install-notion-ding-next).

---

## Releases & Downloads

**Not sure which file to get? Get the ZIP.** It works in every browser, and it's the file used in the instructions below.

| File | What it is | Download |
| :--- | :--- | :--- |
| **Notion Ding Next ZIP** | The add-on's files in a folder. You unzip it, then add it to your browser. The safest choice. | [**`releases/notion-ding-next.zip`**](releases/notion-ding-next.zip) |
| **Notion Ding Next CRX** | A one-file version you drag into the browser. Quick when it works, but newer versions of Chrome often block it. | [**`releases/notion-ding-next.crx`**](releases/notion-ding-next.crx) |
| **Staged folder** | The same files, already unzipped, for people who work with this project's code. | [**`dist/notion-ding-next/`**](dist/notion-ding-next/) |

The current version is **v2.3.0**. Older versions are listed on the [GitHub Releases page](https://github.com/Tommo1818/notion-ding-next/releases).

---

## Install Notion Ding Next

Notion Ding Next isn't in the Chrome Web Store, so you add it to your browser yourself. It takes about two minutes, and you only have to do it once.

**What you need**

- A computer. This can't be installed on a phone or tablet.
- Chrome, Edge, or Brave. It does **not** work in Firefox or Safari.
- The **Notion Ding Next ZIP** file from the table above.

### Step 1: Turn on Developer mode

1. Open Chrome (or Edge, or Brave).
2. Click the address bar at the top of the window, type `chrome://extensions`, then press Enter.
   - On Edge, type `edge://extensions` instead.
   - On Brave, type `brave://extensions` instead.
3. In the **top-right corner** of that page, find the switch called **Developer mode** and turn it **on**.

> Developer mode only unlocks the buttons that let you add add-ons from outside Google's store. It changes nothing else, and you can switch it back off later.

### Step 2: Download and unzip the ZIP file

1. Click [`releases/notion-ding-next.zip`](releases/notion-ding-next.zip) in the table above. The file saves to your **Downloads** folder.
2. Unzip it:
   - **Windows**: right-click the downloaded file, choose **Extract All...**, then click **Extract**.
   - **Mac**: double-click the downloaded file.
3. A new folder appears next to the downloaded file. Open it and check that it contains a file called `manifest.json`.
4. Leave that folder exactly where it is — there's a note about this at the end of step 4.

### Step 3: Add it to your browser

1. Go back to the `chrome://extensions` tab.
2. Click the **Load unpacked** button in the top-left corner.
3. A file window opens. Choose the folder you unzipped in step 2 — the one containing `manifest.json` — and confirm.
4. **Notion Ding Next** now appears in your list of extensions, switched on. That's it, it's installed.

### Step 4: Check that it works

1. Open a Notion page, or refresh the one you already have open by pressing `F5` (`Cmd` + `R` on a Mac). This lets Notion notice the new add-on.
2. Tick a task. You should hear a ding, and see a small ring or a little burst of confetti around the checkbox.
3. To choose a different sound, change the volume, or turn the animations off, click the puzzle-piece icon in your browser toolbar, click the pin next to **Notion Ding Next**, then click the Notion Ding Next icon.

> **Please keep the unzipped folder where it is.** Your browser loads the add-on from that folder each time it starts. If you move or delete the folder, Notion Ding Next stops working and you'll need to repeat steps 2 and 3. (Once you remove the add-on, you can delete the folder.)

### Upgrading from the original Notion Ding

You don't need to do anything special. This is a separate add-on with its own name, so install it with the steps above, then remove the old "Notion Ding" entry from `chrome://extensions` if it's still listed — leaving both installed means two dings per task.

### If you were given the `.crx` file instead

The CRX is a single-file version of the same add-on. It's quicker when it works, but newer versions of Chrome (127 and later) usually refuse to install it, showing a message like *"This extension is not listed in the Chrome Web Store."* If you see that, don't fight it — just follow steps 1 to 4 above with the ZIP file instead. The add-on is identical either way.

If your browser does accept it:

1. Download [`releases/notion-ding-next.crx`](releases/notion-ding-next.crx).
2. Open your extensions page and turn on **Developer mode**, as in step 1.
3. Drag the downloaded file from your Downloads folder onto the extensions page, then click **Add extension** if you're asked.

### If something doesn't work

| What you see | What to do |
| :--- | :--- |
| You can't find the **Developer mode** switch | It's in the **top-right** corner of the extensions page. Check that the address bar really says `chrome://extensions` (or `edge://extensions` on Edge). |
| **Load unpacked** is greyed out and won't click | **Developer mode** is still off. Turn the switch on, then try again. |
| *"This extension is not listed in the Chrome Web Store"* | You're using the **CRX** file. Newer Chrome versions don't allow that. Use the ZIP file with steps 1 to 4 instead. |
| *"Manifest file is missing or unreadable"* | The wrong folder was picked. The folder you choose must have `manifest.json` directly inside it — open it and check. |
| No sound when you tick a task | Refresh the Notion tab (`F5`). Then click the Notion Ding Next icon and check that the volume isn't at 0 and the add-on isn't switched off. It only works on `notion.so`, `notion.com` and `notion.site` pages. |
| You hear two dings at once | An older copy is still installed — most likely the original "Notion Ding". On the extensions page, remove the extra entry. |
| No icon appears in the toolbar | The add-on is still working. Click the puzzle-piece icon in the toolbar, then click the pin next to **Notion Ding Next** to keep its icon visible. |
| It worked yesterday but not today | If you installed from the ZIP, the unzipped folder has probably been moved or deleted. Repeat steps 2 and 3, and don't move the folder afterwards. |

### Turning it off or removing it

1. Go to `chrome://extensions` (or `edge://extensions`).
2. Find **Notion Ding Next** in the list.
3. To pause it, turn its switch off. To delete it completely, click **Remove**. Once it's removed, you can delete the unzipped folder too.

---

## Features

Everything below is on top of what the original did — it played one sound and had nothing to configure.

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

### Volume Control
A 0–10 slider with natural, non-linear scaling, so low settings really are quiet and high ones really are loud. Level 0 is silent.

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

### Reliable Completion Detection
- **No phantom dings**: only the task you actually ticked sets off a sound. Hovering a task, scrolling past, or showing already-finished tasks stays silent.
- **Accurate animation placement**: the ring and the confetti start on the checkbox itself, even when Notion re-renders the row mid-click.
- **Keyboard friendly**: ticking with `Cmd` / `Ctrl` + `Enter` behaves exactly like clicking.

---

## Why the original Notion Ding stopped working

If you used the original `lucasdellabella/notion-ding` extension, it broke for four reasons:

1. **Notion's Domain Migration**: Transition from `notion.so` to `notion.com` and `notion.site`. The original only ran on `notion.so`, so it stopped loading on most pages.
2. **DOM Architecture Overhaul**: Migration to StyleX CSS modules and ARIA attributes (`[role="checkbox"]`, `aria-checked`), removing the legacy `.check` CSS classes and native `<input>` elements that the original looked for.
3. **Unhandled DOM Exception**: The original script threw `TypeError: element.matches is not a function` during `composedPath()` traversal.
4. **Manifest V3 Web Accessible Resources**: Modern Chrome extensions strictly enforce explicit resource matching in Manifest V3.

None of these were ever fixed, so the extension has been dead since — and it is no longer published on the Chrome Web Store. **Notion Ding Next** resolves all four with a multi-layered event engine, React reconciliation handling, and modern Manifest V3 compliance, and this is where the project continues.

---

## How this was built

Almost every line in this repository was written by large language models, working under human direction. The human maintainer decides what the extension should do, reviews the output, runs the tests and ships it — but the writing is done by LLMs.

Concretely:

- **The extension code**: `content.js`, `background.js`, the popup (`popup.html`, `popup.css`, `popup.js`) and `manifest.json` were generated by LLMs — including the rewrite of completion detection, the animations, the settings UI, the Manifest V3 migration and the bug fixes shipped in v2.2.0.
- **The tests**: `tests/verify.test.js` is LLM-written in full, behavioural scenarios included.
- **The build tooling**: `scripts/package.js` and `scripts/generate_sounds.js` are LLM-written. The five sound themes are not recorded audio — that script synthesises them numerically into WAV files.
- **The release packages**: `releases/notion-ding-next.crx` and `.zip` are assembled by that same LLM-written tooling.
- **The documentation**: this README, and the commit messages in the project's recent history.

What that means in practice: the code has been read by a human and is exercised by the test suite, but it does not carry the assurance of a long-lived, heavily battle-tested codebase. If something misbehaves, [open an issue](https://github.com/Tommo1818/notion-ding-next/issues) — that is the most useful contribution you can make.

What predates the LLM work: the original idea, and the `lucasdellabella/notion-ding` extension this project replaces.

---

## For Developers: Automated Testing

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

## For Developers: Building Release Packages

To recompile fresh `.crx` and `.zip` packages at any time:
```bash
npm run package
```
This updates both [`releases/`](releases/) and [`dist/`](dist/).

### Signing Key

The `.crx` signing key lives in `notion-ding-next.pem` at the repository root and is deliberately **not** committed (see [`.gitignore`](.gitignore)). Keep hold of it: a packaged extension's ID is derived from its signing key, so reusing one key means existing `.crx` installs **update in place** and keep their saved settings and streaks, whereas a new key installs as a separate, duplicate extension instead.

`npm run package` handles this automatically — it reuses `notion-ding-next.pem`, rescues it out of `dist/` before that folder is wiped, and only mints a new key when none exists yet. Back the file up somewhere safe; a lost key cannot be regenerated, only replaced (which resets the extension ID).
