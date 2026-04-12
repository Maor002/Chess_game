package com.chess.domain.model;

import com.chess.config.ChessConfig;

public final class Game {

    private final String id;
    private final Board board;
    private ChessConfig.Color currentPlayer;
    private final ChessConfig.Color winner;
    private final boolean isGameOver;
    private final Player whitePlayer;
    private final Player blackPlayer;

    public Game(String id, Player whitePlayer, Player blackPlayer) {

        this.id = id;
        this.board = new Board();
        this.currentPlayer = ChessConfig.Color.WHITE;
        this.winner = null;
        this.isGameOver = false;
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;

    }

    // Getters
    public String getId() {
        return this.id;
    }

    public Board getBoard() {
        return this.board;
    }

    public ChessConfig.Color getCurrentPlayer() {
        return this.currentPlayer;
    }

    public ChessConfig.Color getWinner() {
        return this.winner;
    }

    public boolean isGameOver() {
        return this.isGameOver;
    }

    public Player getWhitePlayer() {
        return this.whitePlayer;
    }

    public Player getBlackPlayer() {
        return this.blackPlayer;
    }

    public Player getWinnerPlayer() {
        if (winner == null)
            return null;
        return winner == ChessConfig.Color.WHITE ? this.whitePlayer : this.blackPlayer;
    }

    public Player getPlayerByColor(ChessConfig.Color color) {
        return color == ChessConfig.Color.WHITE ? this.whitePlayer : this.blackPlayer;
    }

    // Private helpers
    public void switchTurn() {
        this.currentPlayer = (this.currentPlayer == ChessConfig.Color.WHITE) ? ChessConfig.Color.BLACK : ChessConfig.Color.WHITE;
    }

}