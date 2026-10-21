# CodeAtmos — LeetCode Theme Lab

> **Milestone 1**: A lightweight, distraction-free Chrome Extension (Manifest V3) providing curated laboratory atmospheres for LeetCode problem solving.

---

## 1. Project Overview & Architecture

CodeAtmos enables developers to toggle between custom laboratory themes while solving algorithmic problems on LeetCode:
- **Midnight Lab**: Nocturnal focus palette featuring deep navy base surfaces (`#080c16`), indigo structural panels (`#0e1628`), and vivid violet accents (`#a855f7`).
- **Warm Paper**: Daylight reading palette featuring gentle warm parchment surfaces (`#f5f2e9`), roasted espresso readable typography (`#2d231a`), and warm amber highlights (`#d97706`).
- **Native LeetCode (Off)**: 100% clean teardown that removes custom styling attributes, restoring default LeetCode appearance without residual artifacts.

### Safety & Design Principles
- **Manifest V3 Compliant**: Built strictly with standard HTML5, CSS3, and JavaScript APIs. Zero external bundlers, frameworks, analytics, or remote network calls.
- **Strict Storage Model**: Relies solely on `chrome.storage.local` under a single key (`activeTheme`) with safe defaults (`off` on first install).
- **Zero Syntax Tampering**: Code editor syntax highlighting tokens (`.mtk*`) and tokenizers are preserved untouched.
- **Latency-Free Typing**: Monaco editor elements are isolated from CSS transitions to ensure zero input lag.
- **Inert Scoping**: All CSS rules require `html[data-code-atmos-theme="..."]`. Disabling the theme completely disarms all extension styles.

---

## 2. File Structure

```
d:\Playground\code-atmos-extension\
├── manifest.json       # Manifest V3 configuration (permissions, content script matches, popup)
├── popup.html          # Extension popup UI (accessible theme cards, swatches, status indicator)
├── popup.css           # Premium dark developer-tool styling for popup (~340px width)
├── popup.js            # Popup controller (chrome.storage.local sync, keyboard navigation)
├── content.js          # Lightweight content script (manages data-code-atmos-theme attribute)
├── themes.css          # CSS tokens, LeetCode surfaces, Monaco canvas, and accessibility rules
└── README.md           # Documentation, selector audit notes, and test checklist
```

---

## 3. Installation Guide (Load Unpacked)

1. Open Google Chrome (or Chromium-based browser such as Brave, Edge, or Arc).
2. Navigate to:
   ```
   chrome://extensions
   ```
3. Enable **Developer mode** using the toggle switch located in the upper-right corner.
4. Click the **Load unpacked** button in the top toolbar.
5. In the file picker dialog, select the workspace folder:
   ```
   d:\Playground\code-atmos-extension
   ```
6. The extension **CodeAtmos — LeetCode Theme Lab (v0.1.0)** will appear in your installed extensions list.
7. *(Recommended)* Click Chrome's puzzle piece icon in the browser toolbar and pin **CodeAtmos** for rapid popup access.

---

## 4. How to Test Both Themes & Turn Them Off

1. Open any problem on LeetCode in your browser, for example:
   - [https://leetcode.com/problems/two-sum/](https://leetcode.com/problems/two-sum/)
   - [https://leetcode.com/problems/reverse-linked-list/](https://leetcode.com/problems/reverse-linked-list/)
2. Click the **CodeAtmos** icon in the Chrome toolbar to open the popup.
3. Select **Midnight Lab**:
   - The popup card border highlights indigo/violet with an "Active" badge.
   - The open LeetCode tab immediately transforms into deep navy and violet tones without refreshing.
4. Select **Warm Paper**:
   - The popup card highlights warm amber.
   - The open LeetCode tab immediately shifts to warm cream parchment tones.
5. Select **Native LeetCode (Off)**:
   - The `data-code-atmos-theme` attribute is removed from `<html>`.
   - LeetCode immediately returns to its native appearance.

---

## 5. Manual Test Checklist

Use this verification checklist to validate Milestone 1:

- [ ] **1. Default State on Fresh Install**:
  - Open popup after first loading extension.
  - Verify that **Native LeetCode (Off)** is selected by default.
  - Verify open LeetCode pages remain in native unstyled state.

- [ ] **2. Live Real-Time Switching (No Reload)**:
  - Keep a LeetCode problem page visible side-by-side with the extension popup.
  - Click **Midnight Lab**: Confirm page background, sidebar, and panels update instantly.
  - Click **Warm Paper**: Confirm instant shift to cream/parchment surfaces.

- [ ] **3. Persistence Across Page Refresh (F5)**:
  - Select **Midnight Lab**.
  - Refresh the LeetCode problem page (`F5` or `Ctrl+R`).
  - Confirm the page re-renders with the Midnight Lab atmosphere intact.

- [ ] **4. Cross-Problem SPA & Direct Navigation**:
  - With a theme active, navigate to another problem (e.g., from Two Sum to Add Two Numbers via LeetCode's in-page links or URL bar).
  - Confirm the theme persists seamlessly across the navigation.

- [ ] **5. Popup State Persistence**:
  - Close the popup and reopen it.
  - Confirm the active card and status bar reflect the currently active theme.

- [ ] **6. Keyboard Accessibility**:
  - In the popup, focus a card using `Tab`.
  - Use `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` to cycle themes.
  - Use `Space` or `Enter` to activate.

- [ ] **7. Safe Restoration (Off Mode)**:
  - Click **Native LeetCode (Off)**.
  - Verify the `data-code-atmos-theme` attribute on `<html>` is removed.
  - Inspect the page to verify zero lingering background tints or broken styles.

- [ ] **8. Editor Usability & Syntax Highlighting**:
  - Type code in the Monaco code editor.
  - Verify typing feels instant with zero transition lag or cursor stutter.
  - Verify code syntax colors (keywords, strings, comments) are clearly readable and untouched.

---

## 6. Documented Selector Assumptions & DOM Notes

> **Status Notice**: The selectors in `themes.css` were designed based on LeetCode's contemporary dynamic UI architecture (Next.js client-side layout with Tailwind semantic utility classes and Microsoft Monaco Editor). Because LeetCode frequently updates internal class hashes and builds, selectors are cleanly partitioned in `themes.css` into documented sections:

| Target Area | Selector Group in `themes.css` | Assumptions & Rationale |
| :--- | :--- | :--- |
| **Shell & Root** | `html[data-code-atmos-theme]`, `body` | Injects page-wide CSS custom properties and handles root background. |
| **Semantic Layers** | `.bg-layer-bg`, `.bg-layer-1`, `.bg-layer-2`, `.bg-layer-3`, `.bg-fill-2` | Modern LeetCode problem layouts utilize Tailwind CSS semantic layer variables for panels and cards. |
| **Text Labels** | `.text-label-1`, `.text-label-2`, `.text-label-3` | Standardized LeetCode typography hierarchy classes for primary, secondary, and muted text. |
| **Description** | `[data-track-load="description_content"]`, `.elfjS`, `pre`, `code` | Targets the problem statement panel, markdown blocks, and example parameter boxes. |
| **Editor Canvas** | `.monaco-editor`, `.monaco-editor-background`, `.margin`, `.current-line` | Monaco Editor container classes. Does **NOT** target `.mtk*` token classes to preserve syntax highlighting. |
| **Console & Testcases** | `[data-key="console-content"]`, `[data-track-load="console_container"]` | Targets the collapsible console drawer at the bottom of the problem view. |

If LeetCode updates its DOM classes in future releases, adjust only the corresponding documented group in `themes.css`.

---

## 7. Known Limitations (Milestone 1)

1. **Syntax Highlight Token Re-Coloring**: Milestone 1 intentionally styles only the editor canvas, gutters, and active line backgrounds. Custom token-level color schemes for language keywords and variables are reserved for future milestones.
2. **Dynamic Canvas/WebGL Elements**: Complex interactive diagrams or third-party embedded visualization canvases rendered inside problem descriptions will maintain their own internal rendering styles.
3. **Third-Party Script Sandboxes**: If a problem embeds an isolated cross-origin `iframe`, content scripts cannot style into the iframe due to browser security boundaries.
