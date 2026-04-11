package com.chess.domain.model;

public final class Room {
    
    private final String id;
    private final String roomId;
    private final Game game;

    public Room(String roomId) {
        this.id = java.util.UUID.randomUUID().toString();
        this.roomId = roomId;
        this.game = new Game();

    }
}
