// ===== מודול לניהול בחירת ריבועים בלוח השחמט =====
// זוכרת איזה כלי השחקן בחר
// מדגישה את הכלי הנבחר
// מנקה בחירות קודמות

export class SelectionManager {
  constructor(boardRenderer) {
    this.boardRenderer = boardRenderer;
    this.selectedSquare = null;
    this.selectedElement = null;
  }
  // פונקציה לבחירת אריח
  select(row, col) {
    this.clear(); // נקה בחירה קודמת
    
    this.selectedSquare = [row, col];
    this.selectedElement = this.boardRenderer.getSquare(row, col);
    
    if (this.selectedElement) {
      this.selectedElement.classList.add("selected");
    }
  }
  // פונקציה לניקוי הבחירה
  clear() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove("selected");
    }
    
    // נקה את כל ההדגשות
    document.querySelectorAll(".possible-move").forEach(square => {
      square.classList.remove("possible-move");
    });
    
    this.selectedSquare = null;
    this.selectedElement = null;
  }
  // פונקציה לקבלת הריבוע הנבחר
  getSelected() {
    return this.selectedSquare;
  }
  // פונקציה לבדוק אם ריבוע נבחר    
  isSelected(row, col) {
    return this.selectedSquare && 
           this.selectedSquare[0] === row && 
           this.selectedSquare[1] === col;
  }
}
