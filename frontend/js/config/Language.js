import { translations } from "./translationsConfig.js";
// Language Management
export class LanguageManager {
  constructor(chessUI) {
    this.chessUI = chessUI;
    this.currentLanguage = this.detectLanguage();
    this.init();
  }

  detectLanguage() {
    // Check localStorage first
    const savedLang = localStorage.getItem("chess-language");
    if (savedLang && translations[savedLang]) {
      return savedLang;
    }

    // Detect browser language
    const browserLang = navigator.language.slice(0, 2);
    return translations[browserLang] ? browserLang : "he";
  }

  init() {
    this.bindEvents();
    this.applyLanguage(this.currentLanguage);
  }

  bindEvents() {
    const langButtons = document.querySelectorAll(".lang-btn");
    langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        this.setLanguage(lang);
      });
    });
  }

  setLanguage(lang) {
    if (!translations[lang]) return;

    this.currentLanguage = lang;
    localStorage.setItem("chess-language", lang);
    this.applyLanguage(lang);
    this.updateActiveButton(lang);
  }

  applyLanguage(lang) {
    const html = document.documentElement;
    const body = document.body;

    // Set HTML attributes
    html.lang = lang;
    html.dir = lang === "he" ? "rtl" : "ltr";

    // Add/remove RTL/LTR classes
    body.classList.toggle("ltr", lang !== "he");

    // Update page title
    document.title = translations[lang]["page-title"];

    // Update all elements with data-translate
    const elements = document.querySelectorAll("[data-translate]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-translate");
      if (translations[lang][key]) {
        element.textContent = translations[lang][key];
      }
    });
  }

  updateActiveButton(lang) {
    const langButtons = document.querySelectorAll(".lang-btn");
    langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }

  translate(key) {
    return translations[this.currentLanguage][key] || key;
  }
}

// Initialize Language Manager
