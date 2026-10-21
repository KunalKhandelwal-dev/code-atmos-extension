/**
 * CodeAtmos — LeetCode Theme Lab: Content Script
 * 
 * Applies the selected theme to LeetCode problem pages by managing the
 * `data-code-atmos-theme` attribute on document.documentElement (<html>).
 *
 * Safety guarantees:
 * - Does NOT modify LeetCode's submission logic, editor input, or problem data.
 * - Restores 100% native styling when set to 'off' by deleting the data attribute.
 * - Automatically listens to chrome.storage.onChanged for instant live switching.
 */

(() => {
  'use strict';

  const STORAGE_KEY = 'activeTheme';
  const ATTR_NAME = 'codeAtmosTheme'; // Maps to data-code-atmos-theme on dataset
  const VALID_THEMES = new Set(['midnight', 'paper']);

  /**
   * Applies or clears the theme attribute on the document root element.
   * @param {string|null|undefined} theme - 'midnight' | 'paper' | 'off'
   */
  function applyTheme(theme) {
    try {
      const root = document.documentElement;
      if (!root) return;

      if (theme && VALID_THEMES.has(theme)) {
        root.dataset[ATTR_NAME] = theme;
      } else {
        // For 'off' or undefined/unrecognized themes, remove attribute completely
        delete root.dataset[ATTR_NAME];
      }
    } catch (err) {
      console.warn('[CodeAtmos] Error applying theme attribute:', err);
    }
  }

  /**
   * Reads the active theme from chrome.storage.local.
   */
  function initTheme() {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      return;
    }

    try {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.warn('[CodeAtmos] Could not read active theme:', chrome.runtime.lastError.message);
          return;
        }

        const activeTheme = result ? result[STORAGE_KEY] : 'off';
        applyTheme(activeTheme);
      });
    } catch (err) {
      console.warn('[CodeAtmos] Storage access error during initialization:', err);
    }
  }

  /**
   * Listens for changes to chrome.storage.local for immediate live-theme switching
   * without needing to reload the problem page.
   */
  function listenForThemeChanges() {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.onChanged) {
      return;
    }

    try {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[STORAGE_KEY]) {
          const nextTheme = changes[STORAGE_KEY].newValue || 'off';
          applyTheme(nextTheme);
        }
      });
    } catch (err) {
      console.warn('[CodeAtmos] Error registering storage change listener:', err);
    }
  }

  // Initialize
  initTheme();
  listenForThemeChanges();
})();
