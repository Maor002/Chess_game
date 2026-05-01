package com.chess.application;

import com.chess.domain.engine.ChessEngine;
import com.chess.domain.model.Game;
import com.chess.domain.model.Move;
import com.chess.domain.rules.MoveValidator;
import com.chess.infrastructure.GameRepository;

public final class MoveService {

    private GameRepository repo;
    private MoveValidator validator;
    private ChessEngine engine;

    public boolean makeMove(String gameId, Move move) {

        Game game = repo.getGame(gameId);

        

        return true;
    }
}