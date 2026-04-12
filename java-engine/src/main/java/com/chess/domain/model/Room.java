package com.chess.domain.model;

public final class Room {

    private final String id;
    private final Player whitePlayer;
    private final Player blackPlayer;
    private Game game;

    public Room(Player whitePlayer, Player blackPlayer, String id) {
        this.id = id;
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;
        this.game = new Game(this.id, whitePlayer, blackPlayer);
    }

    public String getId()           { return id; }
    public Player getWhitePlayer()  { return whitePlayer; }
    public Player getBlackPlayer()  { return blackPlayer; }
    public Game getGame()           { return game; }

    public void restartGame() {
        this.game = new Game(this.id, whitePlayer, blackPlayer);
    }
}