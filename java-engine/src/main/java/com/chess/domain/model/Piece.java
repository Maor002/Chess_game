package com.chess.domain.model;

import java.util.List;
import com.chess.config.ChessConfig;

public abstract class Piece {
    private final ChessConfig.Color color;         
    private final ChessConfig.PieceType type;      
    private int row;                   
    private int col;                   

    public Piece(ChessConfig.Color color, ChessConfig.PieceType type, int row, int col) {
        this.color = color;
        this.type = type;
        this.row = row;
        this.col = col;
    }

    // Getters
    public ChessConfig.Color getColor() { return color; }
    public ChessConfig.PieceType getType() { return type; }
    public int getRow() { return row; }
    public int getCol() { return col; }

    // Method to move the piece
    public void moveTo(int newRow, int newCol) {
        this.row = newRow;
        this.col = newCol;
    }

    // Abstract method to implement in subclasses
    public abstract List<Move> getValidMoves(Board board);
}