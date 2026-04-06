package com.chess.domain.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.chess.config.ChessConfig;
@Document(collection = "pieces")
public abstract class Piece {
    @Id
    private final String id;
    private final ChessConfig.Color color;         
    private final ChessConfig.PieceType type;      
    private int row;                   
    private int col;                   

    public Piece(ChessConfig.Color color, ChessConfig.PieceType type, int row, int col) {
        this.id = java.util.UUID.randomUUID().toString();
        this.color = color;
        this.type = type;
        this.row = row;
        this.col = col;
    }

    // Getters
    public String getId() { return id; }
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

    public abstract Piece clone();
}