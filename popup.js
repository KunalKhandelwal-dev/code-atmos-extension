/**
 * CodeAtmos — LeetCode Theme Lab: Popup Controller
 * Manages theme selection, accessible radio state, and chrome.storage.local synchronization.
 */

(() => {
  'use strict';

  // Allowed theme identifiers
  const VALID_THEMES = Object.freeze(['midnight', 'paper', 'off']);
  const DEFAULT_THEME = 'off';

  // Theme metadata for accessible announcements and status labels
  const THEME_LABELS = {
    midnight: 'Midnight Lab (Deep Navy & Violet)',
    paper: 'Warm Paper (Warm Cream & Amber)',
    off: 'Native LeetCode (Off)'
  };

  // DOM Elements
  const cards = Array.from(document.querySelectorAll('.theme-card'));
  const statusBar = document.getElementById('statusBar');
  const statusText = document.getElementById('statusText');

  /**
   * Updates the UI elements to reflect the active theme.
   * @param {string} theme - 'midnight' | 'paper' | 'off'
   */
  function renderActiveTheme(theme) {
    const safeTheme = VALID_THEMES.includes(theme) ? theme : DEFAULT_THEME;

    // Update radio buttons state
    cards.forEach((card) => {
      const isSelected = card.dataset.theme === safeTheme;
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      card.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    // Update status bar
    if (statusBar) {
      statusBar.setAttribute('data-active', safeTheme);
    }
    if (statusText) {
      statusText.textContent = `Active: ${THEME_LABELS[safeTheme] || safeTheme}`;
    }
  }

  /**
   * Persists the selected theme into chrome.storage.local and updates the UI.
   * @param {string} theme - 'midnight' | 'paper' | 'off'
   */
  function selectTheme(theme) {
    if (!VALID_THEMES.includes(theme)) return;

    // Optimistically update popup UI
    renderActiveTheme(theme);

    // Save directly to chrome.storage.local
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ activeTheme: theme }, () => {
        if (chrome.runtime.lastError) {
          console.error('[CodeAtmos] Storage write error:', chrome.runtime.lastError.message);
        }
      });
    } else {
      console.warn('[CodeAtmos] chrome.storage.local is unavailable in this environment.');
    }
  }

  /**
   * Keyboard navigation for WAI-ARIA Radio Group pattern.
   * Allows using Arrow keys to cycle between options.
   */
  function handleKeyDown(event) {
    const targetCard = event.currentTarget;
    const currentIndex = cards.indexOf(targetCard);
    if (currentIndex === -1) return;

    let nextIndex = null;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % cards.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + cards.length) % cards.length;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        selectTheme(targetCard.dataset.theme);
        return;
      default:
        return;
    }

    if (nextIndex !== null) {
      const nextCard = cards[nextIndex];
      nextCard.focus();
      selectTheme(nextCard.dataset.theme);
    }
  }

  /**
   * Initialize popup on DOM load.
   */
  function init() {
    // Attach click and keyboard listeners to cards
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const theme = card.dataset.theme;
        selectTheme(theme);
      });

      card.addEventListener('keydown', handleKeyDown);
    });

    // Read initial theme from chrome.storage.local
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['activeTheme'], (result) => {
        if (chrome.runtime.lastError) {
          console.warn('[CodeAtmos] Failed reading activeTheme:', chrome.runtime.lastError.message);
          renderActiveTheme(DEFAULT_THEME);
          return;
        }

        const currentTheme = result && result.activeTheme ? result.activeTheme : DEFAULT_THEME;
        renderActiveTheme(currentTheme);
      });

      // Synchronize popup if storage changes in the background
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.activeTheme) {
          renderActiveTheme(changes.activeTheme.newValue || DEFAULT_THEME);
        }
      });
    } else {
      // Fallback for non-extension preview
      renderActiveTheme(DEFAULT_THEME);
    }
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
