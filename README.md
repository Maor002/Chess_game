# Chess_game
```
└── 📁src
    └── 📁config
        ├── db.js
    └── 📁Controller
        ├── gameFunc.js
        ├── roomFunc.js
        ├── userFunc.js
    └── 📁models
        ├── behaviors.js
        ├── generateSchemas.js
    └── 📁routes
        ├── gameRoutes.js
        ├── roomroutes.js
        ├── userRoutes.js
    └── 📁schemas
        ├── detail.json
        ├── Game.json
        ├── Room.json
        ├── User.json
    └── 📁sockets
        ├── gameSocket.js
    ├── app.js
    └── server.js
```
```
└── 📁frontend
    └── 📁assets
    └── 📁css
        ├── styles.css
    └── 📁js
        └── 📁api
            ├── apiClient.js
        └── 📁config
            ├── chessConfig.js
            ├── Language.js
            ├── translationsConfig.js
        └── 📁engine
            ├── BoardBuilder.js
            ├── chessEngine.js
            ├── LogicBoardManager.js
            ├── MoveManager.js
            ├── piece.js
            ├── pieces.js
        └── 📁ErrorHandler
            ├── ChessError.js
        └── 📁Logger
            ├── logger.js
        └── 📁socket
            ├── socketClient.js
        └── 📁ui
            ├── BoardRenderer.js
            ├── ChessNotationHelper.js
            ├── ChessUI.js
            ├── GameActionHandler.js
            ├── GameStatusManager.js
            ├── MovesHighlighter.js
            ├── MovesListManager.js
            ├── SelectionManager.js
        ├── main.js
    └── index.html
```



# Project Commands Summary

## Frontend Only
npm run dev:front

## Backend Only
npm run dev:back

## Both Together (Development)
npm run dev:all
# or
npm start

## Production (build + run)
npm run prod

## Build Only (no run)
npm run build

## Preview Build
npm run preview
