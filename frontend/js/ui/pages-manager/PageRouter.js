/**
 * PageRouter - מנהל ניווט בין דפים
 * מטפל במעברים בין דפים, שמירת היסטוריה וניהול state
 */

import { logger } from "../../logger/logger.js";

class PageRouter {
  constructor() {
    this.currentPage = null;
    this.history = [];
    this.routes = this.defineRoutes();
  }

  /**
   * הגדרת נתיבים זמינים
   */
  defineRoutes() {
    return {
      home: "/index.html",
      menu: "/html/pages/Menu.html",
      board: "/html/pages/Board.html",
      onlineGame: "/html/pages/OnlineGame.html",
      puzzles: "/html/pages/Puzzles.html",
      vsComputer: "/html/pages/VsComputer.html",
    };
  }

  /**
   * ניווט לדף
   * @param {string} pageName - שם הדף
   * @param {object} data - נתונים להעברה לדף
   * @param {number} delay - עיכוב לפני ניווט (ms)
   */
  navigateTo(pageName, data = null, delay = 0) {
    if (!this.routes[pageName]) {
      logger.error(`Route '${pageName}' not found`);
      return;
    }

    // שמור נתונים אם יש
    if (data) {
      this.savePageData(pageName, data);
    }

    // בצע ניווט
    setTimeout(() => {
      logger.info(`Navigating to: ${pageName}`);
      this.addToHistory(pageName);
      window.location.href = this.routes[pageName];
    }, delay);
  }

  /**
   * חזרה לדף הקודם
   */
  goBack() {
    if (this.history.length > 1) {
      this.history.pop(); // הסר דף נוכחי
      const previousPage = this.history[this.history.length - 1];
      this.navigateTo(previousPage);
    } else {
      this.navigateTo("menu");
    }
  }

  /**
   * רענון דף נוכחי
   */
  refresh() {
    window.location.reload();
  }

  /**
   * בדיקת דף נוכחי
   * @returns {string} שם הדף הנוכחי
   */
  getCurrentPage() {
    const path = window.location.pathname;
    
    for (const [name, route] of Object.entries(this.routes)) {
      if (path.includes(route)) {
        return name;
      }
    }
    
    return "unknown";
  }

  /**
   * שמירת נתוני דף
   */
  savePageData(pageName, data) {
    const key = `pageData_${pageName}`;
    sessionStorage.setItem(key, JSON.stringify(data));
    logger.debug(`Page data saved for: ${pageName}`, data);
  }

  /**
   * טעינת נתוני דף
   */
  loadPageData(pageName) {
    const key = `pageData_${pageName}`;
    const data = sessionStorage.getItem(key);
    
    if (data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        logger.error(`Failed to parse page data for: ${pageName}`, error);
        return null;
      }
    }
    
    return null;
  }

  /**
   * ניקוי נתוני דף
   */
  clearPageData(pageName) {
    const key = `pageData_${pageName}`;
    sessionStorage.removeItem(key);
    logger.debug(`Page data cleared for: ${pageName}`);
  }

  /**
   * הוספה להיסטוריה
   */
  addToHistory(pageName) {
    this.history.push(pageName);
    
    // שמור רק 10 דפים אחרונים
    if (this.history.length > 10) {
      this.history.shift();
    }
  }

  /**
   * בדיקה אם יש דף קודם
   */
  canGoBack() {
    return this.history.length > 1;
  }

  /**
   * קבלת נתיב מלא
   */
  getFullPath(pageName) {
    return this.routes[pageName] || null;
  }

  /**
   * ניווט עם query parameters
   */
  navigateWithParams(pageName, params = {}) {
    const route = this.routes[pageName];
    
    if (!route) {
      logger.error(`Route '${pageName}' not found`);
      return;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullPath = queryString ? `${route}?${queryString}` : route;
    
    logger.info(`Navigating to: ${pageName} with params:`, params);
    window.location.href = fullPath;
  }

  /**
   * קריאת query parameters
   */
  getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }

  /**
   * בדיקת מצב התחברות למשחק מקוון
   */
  isOnlineGameActive() {
    const gameData = localStorage.getItem("currentGame");
    
    if (!gameData) return false;
    
    try {
      const game = JSON.parse(gameData);
      return game.mode === "online" && game.status === "active";
    } catch {
      return false;
    }
  }

  /**
   * הפניה למשחק פעיל אם קיים
   */
  redirectToActiveGameIfExists() {
    if (this.isOnlineGameActive()) {
      const currentPage = this.getCurrentPage();
      
      if (currentPage !== "board") {
        logger.info("Active game found, redirecting to board");
        this.navigateTo("board");
        return true;
      }
    }
    
    return false;
  }
}

// יצירת instance גלובלי
const pageRouter = new PageRouter();

// הפוך זמין globally
window.pageRouter = pageRouter;

export default pageRouter;