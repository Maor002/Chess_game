/**
 * Night Mode Manager
 * Handles toggling between light and dark theme with localStorage persistence
 */

class NightModeManager {
  constructor() {
    this.STORAGE_KEY = 'chess-game-dark-mode';
    this.nightModeBtn = document.getElementById('nightModeBtn');
    this.themeIcon = this.nightModeBtn?.querySelector('.theme-icon');
    this.init();
  }

  init() {
    if (!this.nightModeBtn) {
      console.warn('Night mode button not found in DOM');
      return;
    }

    this.loadPreference();
    this.nightModeBtn.addEventListener('click', () => this.toggle());
  }

  loadPreference() {
    const isDarkMode = localStorage.getItem(this.STORAGE_KEY) === 'true';
    if (isDarkMode) {
      this.enableDarkMode();
    } else {
      this.enableLightMode();
    }
  }

  toggle() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
      this.enableLightMode();
    } else {
      this.enableDarkMode();
    }
  }

  enableDarkMode() {
    document.body.classList.add('dark-mode');
    this.nightModeBtn.classList.add('active');
    this.updateIcon(true);
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  enableLightMode() {
    document.body.classList.remove('dark-mode');
    this.nightModeBtn.classList.remove('active');
    this.updateIcon(false);
    localStorage.setItem(this.STORAGE_KEY, 'false');
  }

  updateIcon(isDarkMode) {
    if (isDarkMode) {
      this.themeIcon.textContent = '☀️';
    } else {
      this.themeIcon.textContent = '🌙';
    }
  }
}

// Initialize night mode manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NightModeManager();
  });
} else {
  new NightModeManager();
}
