package com.chess.domain.model;


import com.chess.config.ChessConfig;

public final class Board {


    private final String id;

    private Piece[][] board;
    private ChessConfig.Color currentTurn;
    private boolean whiteKingInCheck = false;
    private boolean blackKingInCheck = false;

    public Board() {
        this.id = java.util.UUID.randomUUID().toString();
        board = new Piece[ChessConfig.BOARD_SIZE][ChessConfig.BOARD_SIZE];
        this.currentTurn = ChessConfig.Color.WHITE; // White starts first
    }

    public Piece getPiece(int row, int col) {
        return board[row][col];
    }

    public boolean isEmpty(int row, int col) {
        return board[row][col] == null;
    }

    public void setPiece(int row, int col, Piece piece) {
        board[row][col] = piece;
    }

    public void movePiece(Move move) {
        Piece piece = getPiece(move.getFromRow(), move.getFromCol());
        if (piece == null) {
            throw new IllegalStateException("No piece at source position");
        }
        if (board[move.getToRow()][move.getToCol()] != null) {
            handleCapture(board[move.getToRow()][move.getToCol()]);
        }
        setPiece(move.getToRow(), move.getToCol(), piece);
        setPiece(move.getFromRow(), move.getFromCol(), null);

        // החלפת תור אחרי כל מהלך
        currentTurn = (currentTurn == ChessConfig.Color.WHITE) ? ChessConfig.Color.BLACK : ChessConfig.Color.WHITE;
    }

    private void handleCapture(Piece capturedPiece) {
        // Handle piece capture logic (e.g., remove from game, update score, etc.)
    }

    public void cloneBoard(Board source) {
        for (int row = 0; row < ChessConfig.BOARD_SIZE; row++) {
            for (int col = 0; col < ChessConfig.BOARD_SIZE; col++) {
                Piece sourcePiece = source.board[row][col];
                this.board[row][col] = (sourcePiece != null) ? sourcePiece.clone() : null;
            }
        }
        this.currentTurn = source.currentTurn;
        this.whiteKingInCheck = source.whiteKingInCheck;
        this.blackKingInCheck = source.blackKingInCheck;
    }

    // ---- Getters & Setters ----

    public String getId() {
        return id;
    }

    public Piece[][] getBoard() {
        return board;
    }

    public void setBoard(Piece[][] board) {
        this.board = board;
    }

    public ChessConfig.Color getCurrentTurn() {
        return currentTurn;
    }

    public void setCurrentTurn(ChessConfig.Color currentTurn) {
        this.currentTurn = currentTurn;
    }

    public boolean isWhiteKingInCheck() {
        return whiteKingInCheck;
    }

    public void setWhiteKingInCheck(boolean whiteKingInCheck) {
        this.whiteKingInCheck = whiteKingInCheck;
    }

    public boolean isBlackKingInCheck() {
        return blackKingInCheck;
    }

    public void setBlackKingInCheck(boolean blackKingInCheck) {
        this.blackKingInCheck = blackKingInCheck;
    }
}