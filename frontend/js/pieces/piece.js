//  * ===== מודול כלי השחמט =====
//  * מגדיר את מבנה כלי השחמט
//  * כולל סוג, צבע, מיקום ודרגה
//  * כולל פונקציות בסיסיות לכלי
export class Piece {
  constructor(color,type, row, col, grade = 0) {
    this.color = color; // 'w' או 'b'
    this.type = type; // סוג הכלי (P, R, N, B, Q, K)
    this.row = row; // מיקום השורה של הכלי בלוח
    this.col = col; // מיקום העמודה של הכלי בלוח
    this.grade = grade; // דרגה של הכלי, 0 אם לא מוגדר
  }

  getValidMoves() {
    return [];
  }
    //  פונקציה שמחזירה מיקום כתיאור טקסטואלי
  get positionText() {
    return `row: ${this.row}, col: ${this.col}`;
  }
}
