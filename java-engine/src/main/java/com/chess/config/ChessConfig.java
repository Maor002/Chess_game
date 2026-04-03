package com.chess.config;

public class ChessConfig {
    public static final int BOARD_SIZE = 8;


    public enum PieceType {
        KING, QUEEN, ROOK, BISHOP, KNIGHT, PAWN, EMPTY
    }

    
    public enum Color {
        WHITE, BLACK;
    }
}