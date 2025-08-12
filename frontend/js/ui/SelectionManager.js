// ===== מודול לניהול בחירת ריבועים בלוח השחמט =====
// מודול זה אחראי על ניהול בחירת ריבועים בלוח השחמט
// הוא מספק פונקציות לבחירת ריבוע, ניקוי הבחירה, קבלת הריבוע הנבחר ובדיקת אם ריבוע נבחר
// הוא גם מספק פונקציה לקבלת אלמנט הריבוע לפי מיקום השורה והעמודה

export class SelectionManager {
  constructor(boardRenderer) {
    this.boardRenderer = boardRenderer;
    this.selectedSquare = null;
    this.selectedElement = null;
  }
  
  select(row, col) {
    this.clear(); // נקה בחירה קודמת
    
    this.selectedSquare = [row, col];
    this.selectedElement = this.boardRenderer.getSquare(row, col);
    
    if (this.selectedElement) {
      this.selectedElement.classList.add("selected");
    }
  }
  
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
  
  getSelected() {
    return this.selectedSquare;
  }
  
  isSelected(row, col) {
    return this.selectedSquare && 
           this.selectedSquare[0] === row && 
           this.selectedSquare[1] === col;
  }
}
