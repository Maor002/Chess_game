// ===== מחלקה לתצוגת היסטוריית המהלכים ======
// מציגה את כל המהלכים שהיו במשחק
// מארגנת אותם בזוגות (לבן-שחור)
// מאפשרת הדגשה של מהלך נוכחי
// מעצבת את התצוגה (מספור, צבעים)
import  ChessNotationHelper  from "./ChessNotationHelper.js";

export class MovesListManager {
  constructor(ListElement) {
    this.ListElement = ListElement;
    this.moveElements = [];
  }
// פונקציה ליצירת אלמנט מהלך
  createMoveElement(move, className, isActive = false) {
    const moveElement = document.createElement("div");
    moveElement.className = className;
    moveElement.textContent = ChessNotationHelper.formatMove(move);

    if (isActive) {
      moveElement.classList.add("move-active");
    }

    return moveElement;
  }
// עדכן את התצוגה של כל המהלכים
  update(historyMoves, currentMoveIndex = -1) {
    const fragment = document.createDocumentFragment();
    this.moveElements = [];

    for (let i = 0; i < historyMoves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const movePair = this.createMovePair(
        historyMoves,
        i,
        moveNumber,
        currentMoveIndex
      );
      fragment.appendChild(movePair);
    }

    this.ListElement.innerHTML = "";
    this.ListElement.appendChild(fragment);
  }

  createMovePair(historyMoves, index, moveNumber, currentMoveIndex) {
    const whiteMove = historyMoves[index];
    const blackMove = historyMoves[index + 1];

    const movePair = document.createElement("div");
    movePair.className = "move-pair";

    // מספר המהלך
    const moveNumberElement = document.createElement("div");
    moveNumberElement.className = "move-number";
    moveNumberElement.textContent = `${moveNumber}.`;
    movePair.appendChild(moveNumberElement);

    // מהלך לבן
    const whiteMoveElement = this.createMoveElement(
      whiteMove,
      "move-white",
      index === currentMoveIndex
    );
    movePair.appendChild(whiteMoveElement);
    this.moveElements.push(whiteMoveElement);

    // מהלך שחור (אם קיים)
    if (blackMove) {
      const blackMoveElement = this.createMoveElement(
        blackMove,
        "move-black",
        index + 1 === currentMoveIndex
      );
      movePair.appendChild(blackMoveElement);
      this.moveElements.push(blackMoveElement);
    }

    return movePair;
  }
// פונקציה להדגשת מהלך ספציפי
  highlightMove(moveIndex) {
    // הסר הדגשה קודמת
    this.moveElements.forEach((el) => el.classList.remove("move-active"));

    // הדגש מהלך נוכחי
    if (this.moveElements[moveIndex]) {
      this.moveElements[moveIndex].classList.add("move-active");
    }
  }

  clearMovesList() {
    this.ListElement.innerHTML = "";
    this.moveElements = [];
  }
}

