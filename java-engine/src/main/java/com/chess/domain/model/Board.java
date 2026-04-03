package com.chess.domain.model;

import com.chess.config.ChessConfig;
public final class Board {
    
    private Piece[][] grid;

    public Board() {
        grid = new Piece[ChessConfig.BOARD_SIZE][ChessConfig.BOARD_SIZE];
        // Initialize the board with pieces in their starting positions
    }
}