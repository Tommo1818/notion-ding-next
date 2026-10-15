# Notion Ding Next

Plays a satisfying ding when you tick a task off in Notion. It's a fixed, still-maintained version of the original **Notion Ding** — which is broken and abandoned — with sound themes, animations and stats on top.

> Almost all of this project was written by large language models, under human direction. [Details below](#how-it-was-built).

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](tests/verify.test.js)

---

## Install

About two minutes, once. You need a computer with Chrome, Edge or Brave — **not** Firefox or Safari, and not a phone.

1. **Download the ZIP**: [`releases/notion-ding-next.zip`](releases/notion-ding-next.zip). It saves to your Downloads folder.
2. **Unzip it.** Windows: right-click the file → **Extract All...** → **Extract**. Mac: double-click it. You now have a folder containing `manifest.json`.
3. **Open the extensions page.** Type `chrome://extensions` in the address bar and press Enter. On Edge use `edge://extensions`, on Brave `brave://extensions`.
4. **Turn on Developer mode** — the switch in the top-right corner of that page.
5. **Click Load unpacked** (top-left) and pick the folder from step 2.
6. **Refresh Notion** (`F5`, or `Cmd`+`R`) and tick a task. You should hear a ding, with a ring or a little confetti on the checkbox.

To change the sound, volume or animation: click the puzzle-piece icon in your toolbar, pin **Notion Ding Next**, then click its icon.

> **Don't move the unzipped folder.** Your browser loads the add-on from that folder every time it starts. Move or delete it and the add-on stops working — you'd repeat step 2 and step 5.

**Not working?**

| What you see | Fix |
| :--- | :--- |
| Can't find **Developer mode** | It's in the top-right corner of the extensions page. Check the address bar says `chrome://extensions` (or `edge://extensions`). |
| **Load unpacked** is greyed out | Developer mode isn't switched on yet. |
| *"This extension is not listed in the Chrome Web Store"* | You used the CRX file. Use the ZIP and the steps above instead. |
| *"Manifest file is missing or unreadable"* | Wrong folder — pick the one with `manifest.json` directly inside it. |
| No sound | Refresh the Notion tab, then click the extension icon and check the volume isn't 0. It only works on `notion.so`, `notion.com` and `notion.site`. |
| Two dings at once | The original Notion Ding is still installed. Remove it. |
| No icon in the toolbar | It's working anyway — click the puzzle-piece icon and pin **Notion Ding Next**. |

**Upgrading from the original?** Install as above, then remove the old "Notion Ding" from the extensions page — otherwise every task dings twice.

**To remove it:** click **Remove** on Notion Ding Next on the extensions page. You can then delete the unzipped folder.

---

## Releases & Downloads

| File | What it is |
| :--- | :--- |
| [`releases/notion-ding-next.zip`](releases/notion-ding-next.zip) | **Get this one.** Unzip it, then "Load unpacked" as above. Works in every browser. |
| [`releases/notion-ding-next.crx`](releases/notion-ding-next.crx) | A single file you drag onto the extensions page. Quick when it works, but Chrome 127 and later usually blocks it. |
| [`dist/notion-ding-next/`](dist/notion-ding-next/) | The same files, already unzipped, for people working on this project's code. |

Current version **v2.3.0**. Older versions are on the [releases page](https://github.com/Tommo1818/notion-ding-next/releases).

---

## What's new vs the original

| | Original Notion Ding | Notion Ding Next |
| :--- | :--- | :--- |
| **Status** | Broken, abandoned, no longer on the Chrome Web Store | Maintained (v2.3.0) |
| **Domains** | `notion.so` only | `notion.so`, `notion.com`, `notion.site` |
| **Today's Notion** | Unsupported — it looked for markup Notion no longer renders | Rewritten detection for the current markup, ARIA checkboxes and React re-renders |
| **Sound** | One ding, no options | 5 themes, 0–10 volume, combo pitch |
| **Extras** | None | Ripple/confetti animations, daily streak and stats, light/dark aware popup |

---

## Features

- **5 sound themes** — Classic Ding, Marimba, Subtle Pop, Mechanical Switch, Zen Singing Bowl.
- **Volume 0–10** — silent at 0, with natural non-linear scaling.
- **Combo pitch** — quick completions climb a musical scale, +1 semitone each within 5 seconds.
- **Completion animations** — ripple, micro confetti, both, or neither.
- **Stats** — all-time total, today's count, daily streak, and a reset button.
- **Light and dark** — follows your Notion/system theme.
- **Reliable detection** — only the task you ticked sets off a sound (hovering and scrolling stay silent), the animation lands on the checkbox even when Notion re-renders the row, and `Cmd`/`Ctrl` + `Enter` works like a click.
- **Zero latency** — sounds are pre-decoded with the Web Audio API.

---

## Why the original broke

The original `lucasdellabella/notion-ding` — *"Goes ding when you check a notion checkbox. That's it."* — stopped working and was never fixed:

1. **Domains** — Notion moved to `notion.com` and `notion.site`; the original only ran on `notion.so`.
2. **New markup** — Notion migrated to StyleX and ARIA attributes, dropping the `.check` classes and native inputs the original looked for.
3. **A crash** — it threw `TypeError: element.matches is not a function` while walking `composedPath()`.
4. **Manifest V3** — modern Chrome enforces explicit web-accessible resource matching.

Notion Ding Next fixes all four, and is where the project continues.

---

## How it was built

Almost every line here was written by large language models, under human direction — the maintainer decides, reviews and ships; the LLMs write.

- **Code, tests and tooling** — `content.js`, `background.js`, the popup, `manifest.json`, `tests/verify.test.js` and `scripts/*.js`.
- **Sounds** — not recorded: `scripts/generate_sounds.js` synthesises the WAV files numerically.
- **Docs** — this README, and recent commit messages.

So it's human-reviewed and covered by tests, but it isn't a long-lived, heavily battle-tested codebase. If something misbehaves, [open an issue](https://github.com/Tommo1818/notion-ding-next/issues) — that's the most useful contribution.

What predates the LLM work: the original idea, and the extension this replaces.

---

## For developers

```bash
npm test        # 36 checks: manifest, assets, completion detection, packaging
npm run package # rebuild releases/ and dist/
```

Keep `notion-ding-next.pem` (repo root, deliberately not committed): the extension ID is derived from it, so reusing it means existing `.crx` installs **update in place** and keep their settings and streaks. `npm run package` reuses it automatically, rescues it out of `dist/` before wiping that folder, and only mints a new key when none exists. Back the file up — a lost key can't be regenerated, only replaced, which resets the ID.
