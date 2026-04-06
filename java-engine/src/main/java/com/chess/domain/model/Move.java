package com.chess.domain.model;

import org.springframework.data.annotation.Id;

public final class Move {
    @Id
    private final String id;
    private final int fromRow;
    private final int fromCol;
    private final int toRow;
    private final int toCol;

    public Move(int fromRow, int fromCol, int toRow, int toCol) {
        this.id = java.util.UUID.randomUUID().toString();
        validate(fromRow, fromCol, toRow, toCol);
        this.fromRow = fromRow;
        this.fromCol = fromCol;
        this.toRow = toRow;
        this.toCol = toCol;
    }

    private static void validate(int fromRow, int fromCol, int toRow, int toCol) {
        if (fromRow < 0 || fromRow > 7 || toRow < 0 || toRow > 7 ||
            fromCol < 0 || fromCol > 7 || toCol < 0 || toCol > 7) {
            throw new IllegalArgumentException("Coordinates must be between 0 and 7");
        }
    }

    // getters
    public int getFromRow() { return fromRow; }
    public int getFromCol() { return fromCol; }
    public int getToRow() { return toRow; }
    public int getToCol() { return toCol; }

    @Override
    public String toString() {
        return String.format("Move[from=%d,%d to=%d,%d]", fromRow, fromCol, toRow, toCol);
    }
}