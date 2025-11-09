import { UIAlert } from "./UIAlert.js";

export class AlertManager {
  constructor(uiManager) {
    this.uiManager = uiManager;
    this.alert = uiManager.alert;
    this.langManager = uiManager.langManager;
    this.engine = uiManager.engine;
    this.alert = new UIAlert(); // מנהל התראות ופופאפים
  }
  alertGameOver() {
    if (!this.engine.gameActive) {
      this.alert.show({
        title: this.langManager.translate("game-over"),
        message: this.langManager.translate("exceptionOccurred"),
        icon: "⚠️",
        buttons: [
          {
            text: this.langManager.translate("start-new-game"),
            type: "primary",
            onClick: () => {
              this.uiManager.startNewGame();
            },
          },
          {
            text: this.langManager.translate("cancel"),
            type: "secondary",
            onClick: () => {},
          },
        ],
      });
    }
  }
}
