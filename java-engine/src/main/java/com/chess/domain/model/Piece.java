package com.chess.domain.model;

import java.util.List;

public abstract class Piece {

    private final Color color;         
    private final PieceType type;      
    private int row;                   
    private int col;     

    public enum Color {
        WHITE, BLACK;
    }

    public enum PieceType {
        PAWN, ROOK, KNIGHT, BISHOP, QUEEN, KING
    }

    public Piece(Color color, PieceType type, int row, int col) {
        this.color = color;
        this.type = type;
        this.row = row;
        this.col = col;
    }

    // Getters
    public Color getColor() { return color; }
    public PieceType getType() { return type; }
    public int getRow() { return row; }
    public int getCol() { return col; }

    // Method to move the piece
    public void moveTo(int newRow, int newCol) {
        this.row = newRow;
        this.col = newCol;
    }

    // Abstract method: subclasses must implement their valid moves
    public abstract List<Move> getValidMoves(Board board);
}