package com.chess.domain.model;

import com.chess.config.ChessConfig;
public final class Game {

    private final String id;
    private  final Board board;
    private ChessConfig.Color currentPlayer;
    private boolean isGameOver;
    private ChessConfig.Color winner;
    private Player whitePlayer;
    private Player blackPlayer;
     
    public Game() {
        this.id = java.util.UUID.randomUUID().toString();
        this.board = new Board();
        this.currentPlayer = ChessConfig.Color.WHITE; // White starts first
        this.isGameOver = false;
        this.winner = null;
    }
}