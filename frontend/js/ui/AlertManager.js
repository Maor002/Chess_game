import { UIAlert } from "./UIAlert.js";
import { AlertIcons } from "../config/chessConfig.js";

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
        message: this.langManager.translate(this.engine.isWhiteWin ? "white-wins" : "black-wins"),
        icon: AlertIcons.victory,
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
