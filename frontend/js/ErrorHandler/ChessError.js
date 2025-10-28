// ===== 1. סוגי שגיאות =====
export const ErrorTypes = {
  GAME_ERROR: 'GAME_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR', 
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  USER_ERROR: 'USER_ERROR'
};

export const ErrorCodes = {
  NO_PIECE: 'NO_PIECE',
  INVALID_MOVE: 'INVALID_MOVE',
  GAME_OVER: 'GAME_OVER',
  OUT_OF_BOUNDS: 'OUT_OF_BOUNDS',
  WRONG_PLAYER: 'WRONG_PLAYER',
  SYSTEM_FAILURE: 'SYSTEM_FAILURE'
};

// ===== 2. מחלקת שגיאה מותאמת =====
export class ChessError extends Error {
  constructor(type, code, message, context = {}) {
    super(message);
    this.type = type;
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.name = 'ChessError';
  }
}

// ===== 3. Error Handler מרכזי =====
export class ErrorHandler {
  constructor(logger) {
    this.logger = logger;
    this.errorConfig = this.getErrorConfig();
    this.errorListeners = [];
  }

  // קובץ קונפיגורציה של שגיאות
  getErrorConfig() {
    return {
      [ErrorCodes.NO_PIECE]: {
        severity: 'warning',
        shouldLog: true,
        shouldNotifyUser: false,
        shouldStopGame: false
      },
      [ErrorCodes.INVALID_MOVE]: {
        severity: 'warning', 
        shouldLog: true,
        shouldNotifyUser: true,
        shouldStopGame: false
      },
      [ErrorCodes.GAME_OVER]: {
        severity: 'info',
        shouldLog: true,
        shouldNotifyUser: true,
        shouldStopGame: true
      },
      [ErrorCodes.SYSTEM_FAILURE]: {
        severity: 'error',
        shouldLog: true,
        shouldNotifyUser: true,
        shouldStopGame: true
      }
    };
  }

  // פונקציה מרכזית לטיפול בשגיאות
  handleError(error, context = {}) {
    const errorResponse = {
      success: false,
      error: null,
      shouldStopGame: false,
      userMessage: null
    };

    try {
      // אם זה לא ChessError, הופך אותו לאחד
      if (!(error instanceof ChessError)) {
        error = new ChessError(
          ErrorTypes.SYSTEM_ERROR,
          ErrorCodes.SYSTEM_FAILURE,
          error.message || 'Unknown error',
          context
        );
      }

      const config = this.errorConfig[error.code] || this.getDefaultErrorConfig();
      
      // לוגים
      if (config.shouldLog) {
        this.logError(error, config.severity);
      }

      // הודעה למשתמש
      if (config.shouldNotifyUser) {
        errorResponse.userMessage = this.getUserMessage(error);
      }

      // האם לעצור את המשחק
      errorResponse.shouldStopGame = config.shouldStopGame;
      
      // שמירת פרטי השגיאה
      errorResponse.error = {
        type: error.type,
        code: error.code,
        message: error.message,
        timestamp: error.timestamp
      };

      // הפעלת listeners
      this.notifyListeners(error, errorResponse);

      return errorResponse;

    } catch (handlingError) {
      // אם יש בעיה בטיפול בשגיאה עצמה
      this.logger.error('Error in error handler:', handlingError);
      return {
        success: false,
        error: { message: 'Critical system error' },
        shouldStopGame: true,
        userMessage: 'משהו השתבש במערכת'
      };
    }
  }

  logError(error, severity) {
    const logData = {
      type: error.type,
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp: error.timestamp
    };

    switch (severity) {
      case 'error':
        this.logger.error('Chess Error:', logData);
        break;
      case 'warning':
        this.logger.warn('Chess Warning:', logData);
        break;
      case 'info':
        this.logger.info('Chess Info:', logData);
        break;
      default:
        this.logger.debug('Chess Debug:', logData);
    }
  }

  getUserMessage(error) {
    const messages = {
      [ErrorCodes.NO_PIECE]: 'אין כלי במיקום זה',
      [ErrorCodes.INVALID_MOVE]: 'מהלך לא חוקי',
      [ErrorCodes.GAME_OVER]: 'המשחק הסתיים',
      [ErrorCodes.OUT_OF_BOUNDS]: 'מהלך מחוץ ללוח',
      [ErrorCodes.WRONG_PLAYER]: 'לא התור שלך',
      [ErrorCodes.SYSTEM_FAILURE]: 'שגיאת מערכת'
    };

    return messages[error.code] || 'שגיאה לא ידועה';
  }

  getDefaultErrorConfig() {
    return {
      severity: 'error',
      shouldLog: true,
      shouldNotifyUser: true,
      shouldStopGame: false
    };
  }

  // רישום listeners לשגיאות
  addErrorListener(callback) {
    this.errorListeners.push(callback);
  }

  notifyListeners(error, response) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error, response);
      } catch (err) {
        this.logger.error('Error in error listener:', err);
      }
    });
  }
}

// ===== 4. Result Wrapper =====
export class Result {
  constructor(success, data = null, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static success(data) {
    return new Result(true, data, null);
  }

  static failure(error) {
    return new Result(false, null, error);
  }

  isSuccess() {
    return this.success;
  }

  isFailure() {
    return !this.success;
  }
}
