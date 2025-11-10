/**
 * ===== מודול הגדרות השחמט =====
 * מכיל את כל הקבועים והגדרות הבסיסיות של המשחק
 */
export const ChessConfig = {
  // סמלי הכלים בשחמט (Unicode)
  pieces: {
    wK: "♔",
    wQ: "♕",
    wR: "♖",
    wB: "♗",
    wN: "♘",
    wP: "♙",
    bK: "♚",
    bQ: "♛",
    bR: "♜",
    bB: "♝",
    bN: "♞",
    bP: "♟",
  },

  // מיקום התחלתי של הכלים על הלוח
  initialBoard: [
    ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
    ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
    ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
  ],

  // קבועים למשחק
  BOARD_SIZE: 8,
  WHITE_PLAYER: "w",
  BLACK_PLAYER: "b",

  grade: {
    K: 1000, // מלך
    Q: 9, // מלכהs
    R: 5, // צריח
    B: 3, // רץ
    N: 3, // פרש
    P: 1, // רגלי
  },
};

export const AlertIcons = {
  info: "ℹ️",           // מידע
  success: "✅",        // הצלחה
  error: "❌",          // שגיאה
  warning: "⚠️",        // אזהרה
  question: "❓",       // שאלה / אישור פעולה
  stop: "🛑",           // עצירה / ביטול
  alert: "🚨",          // התרעה חמורה
  time: "⏰",           // זמן / תזכורת
  loading: "⏳",        // טעינה
  gameOver: "🎮",       // סוף משחק
  connection: "📶",     // תקשורת / רשת
  update: "🔄",         // עדכון / ריענון
  settings: "⚙️",       // הגדרות
  lock: "🔒",           // נעילה
  unlock: "🔓",         // פתיחה
  infoBlue: "💡",       // טיפ / הסבר
  star: "⭐",            // דירוג / הישג
  fire: "🔥",           // הצלחה גדולה / משהו חם
  victory: "👑",          // כתר / ניצחון / מלך
};


// pieces: {
//     'wK': 'images/wK.png',
//     'wQ': 'images/wQ.png',
//     'wR': 'images/wR.png',
//     'wB': 'images/wB.png',
//     'wN': 'images/wN.png',
//     'wP': 'images/wP.png',
//     'bK': 'images/bK.png',
//     'bQ': 'images/bQ.png',
//     'bR': 'images/bR.png',
//     'bB': 'images/bB.png',
//     'bN': 'images/bN.png',
//     'bP': 'images/bP.png'
// }

// const pieceCode = board[row][col]; // לדוגמה 'wK'
// if (pieceCode) {
//     const img = document.createElement('img');
//     img.src = pieces[pieceCode];
//     img.classList.add('chess-piece');
//     square.appendChild(img);
// }

// .chess-piece {
//     width: 100%;
//     height: 100%;
//     object-fit: contain;
// }
