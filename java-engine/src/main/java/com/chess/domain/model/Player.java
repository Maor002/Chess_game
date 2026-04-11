package com.chess.domain.model;

public final class Player {

    private final String id;
    private final String username;
    private int rating;

    public Player(String id, String username) {
        this.id = id;
        this.username = username;
        this.rating = 0; // Default rating, can be updated later
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public int getRating() { return rating; }

    public void updateRating(int newRating) {
        this.rating = newRating;
    }
}