import { logger } from "../../Logger/logger";
// מחלקת UIAlert - לניהול התראות ופופאפים

export class UIAlert {
  constructor(languageManager) {
    this.createOverlay();
    this.langManager = languageManager;

  }

  createOverlay() {
    try {
      // יצירת האלמנטים של ההתראה
      this.overlay = document.createElement("div");
      this.overlay.className = "alert-overlay";

      this.alertBox = document.createElement("div");
      this.alertBox.className = "alert-box";

      this.overlay.appendChild(this.alertBox);
      document.body.appendChild(this.overlay);

      // סגירה בלחיצה על הרקע
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });

      // מניעת סגירה בלחיצה על ה-alertBox עצמו
      this.alertBox.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // סגירה בלחיצה על ESC
      this.escapeHandler = (e) => {
        if (e.key === "Escape" && this.overlay.classList.contains("active")) {
          this.close();
        }
      };
      document.addEventListener("keydown", this.escapeHandler);
    } catch (error) {
      logger.error(" Error creating UIAlert overlay:", error);
    }
  }
  /**
   * הצגת התראה עם אפשרויות מלאות
   * @param {Object} options - אובייקט הגדרות
   * @param {string} options.title - כותרת ההתראה
   * @param {string} options.message - תוכן ההודעה
   * @param {string} options.icon - אייקון (אימוג'י או HTML)
   * @param {Array} options.buttons - מערך של כפתורים
   * @param {Function} options.onClose - פונקציה שתופעל בסגירה
   */
  show({
    title = "",
    message = "",
    icon = "❗",
    buttons = [],
    onClose = null,
  }) {
    try {
      // ניקוי תוכן קודם
      this.alertBox.innerHTML = "";

      // הוספת אייקון
      if (icon) {
        const iconElement = document.createElement("div");
        iconElement.className = "alert-icon";
        iconElement.innerHTML = icon;
        this.alertBox.appendChild(iconElement);
        logger.debug("UIAlert icon added.");
      }

      // הוספת כותרת
      if (title) {
        const titleElement = document.createElement("div");
        titleElement.className = "alert-title";
        titleElement.textContent = title;
        this.alertBox.appendChild(titleElement);
        logger.debug("UIAlert title added.");
      }

      // הוספת הודעה
      if (message) {
        const messageElement = document.createElement("div");
        messageElement.className = "alert-message";
        messageElement.textContent = message;
        this.alertBox.appendChild(messageElement);
        logger.debug("UIAlert message added.");
      }

      // הוספת כפתורים
      if (buttons.length > 0) {
        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "alert-buttons";

        buttons.forEach((buttonConfig) => {
          const button = document.createElement("button");
          button.className = `alert-btn alert-btn-${
            buttonConfig.type || "primary"
          }`;
          button.textContent = buttonConfig.text;
          button.addEventListener("click", () => {
            if (buttonConfig.onClick) {
              buttonConfig.onClick();
            }
            this.close();
          });
          buttonsContainer.appendChild(button);
        });

        this.alertBox.appendChild(buttonsContainer);
        logger.debug("UIAlert buttons added.");
      }

      // שמירת הפונקציה לסגירה
      this.onCloseCallback = onClose;

      // הצגת ההתראה
      setTimeout(() => {
        this.overlay.classList.add("active");
      }, 10);
    } catch (error) {
      logger.error(" Error displaying UIAlert:", error);
    }
  }

  /**
   * התראה פשוטה עם כפתור אחד
   */
  info(title, message, icon = "ℹ️") {
    try {
      this.show({
        title,
        message,
        icon,
        buttons: [{ text: this.langManager.translate('ok'), type: "primary" }],
      });
    } catch (error) {
      logger.error("Error displaying UIAlert info:", error);
    }
    logger.debug("UIAlert info displayed.");
  }

  /**
   * התראת הצלחה
   */
  success(title, message, icon = "✅") {
    try {
      this.show({
        title,
        message,
        icon,
        buttons: [{ text: this.langManager.translate('great'), type: "success" }],
      });
    } catch (error) {
      logger.error("Error displaying UIAlert success:", error);
    }
    logger.debug("UIAlert success displayed.");
  }

  /**
   * התראת שגיאה
   */
  error(title, message, icon = "❌") {
    this.show({
      title,
      message,
      icon,
      buttons: [{ text: this.langManager.translate('great'), type: "success" }],
    });
    logger.debug("UIAlert success displayed.");
  }

  /**
   * התראת שגיאה
   */
  error(title, message, icon = "❌") {
    this.show({
      title,
      message,
      icon,
      buttons: [{ text: this.langManager.translate('understood'), type: "danger" }],
    });
    logger.debug("UIAlert error displayed.");
  }

  /**
   * התראת אזהרה
   */
  warning(title, message, icon = "⚠️") {
    this.show({
      title,
      message,
      icon,
      buttons: [{ text: this.langManager.translate('understood'), type: "secondary", onClick: null }],
    });
    logger.debug("UIAlert warning displayed.");
  }

  /**
   * דיאלוג אישור (confirm)
   */
  confirm(title, message, onConfirm, onCancel = null, icon = "❓") {
    this.show({
      title,
      message,
      icon,
      buttons: [
        {
          text: this.langManager.translate('cancel'),
          type: "secondary",
          onClick: onCancel,
        },
        {
          text: this.langManager.translate('ok'),
          type: "primary",
          onClick: onConfirm,
        },
      ],
    });
    logger.debug("UIAlert confirm dialog displayed.");
  }

  /**
   * סגירת ההתראה
   */
  close() {
    try {
      this.overlay.classList.remove("active");
      if (this.onCloseCallback) {
        this.onCloseCallback();
        this.onCloseCallback = null;
      }
    } catch (error) {
      logger.error("Error closing UIAlert:", error);
    }
  }
}
