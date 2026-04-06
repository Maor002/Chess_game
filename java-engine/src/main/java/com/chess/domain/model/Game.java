package com.chess.domain.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.chess.config.ChessConfig;
@Document(collection = "games")
public final class Game {
    @Id
    private final String id;
    private  final Board board;
    private ChessConfig.Color currentPlayer;
    private boolean isGameOver;
    private ChessConfig.Color winner;
     
    public Game() {
        this.id = java.util.UUID.randomUUID().toString();
        this.board = new Board();
        this.currentPlayer = ChessConfig.Color.WHITE; // White starts first
        this.isGameOver = false;
        this.winner = null;
    }
}