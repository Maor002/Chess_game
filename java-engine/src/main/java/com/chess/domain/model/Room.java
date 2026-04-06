package com.chess.domain.model;

import org.springframework.data.annotation.Id;

public final class Room {
    @Id
    private final String id;
    private final String roomId;
    private final Game game;

    public Room(String roomId) {
        this.id = java.util.UUID.randomUUID().toString();
        this.roomId = roomId;
        this.game = new Game();

    }
}
