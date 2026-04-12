package com.chess.application;

import com.chess.domain.engine.ChessEngine;
import com.chess.domain.rules.MoveValidator;
import com.chess.infrastructure.GameRepository;
import com.chess.domain.model.Game;
import com.chess.domain.model.Move;

public final class MoveService {

    private GameRepository repo;
    private MoveValidator validator;
    private ChessEngine engine;

    public boolean makeMove(String gameId, Move move) {

        Game game = repo.getGame(gameId);

        if (!validator.isValidMove(move, game.getBoard())) {
            return false;
        }

        engine.applyMove(game.getBoard(), move);

        repo.saveGame(game);

        return true;
    }
}